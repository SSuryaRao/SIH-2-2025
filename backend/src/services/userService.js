const { dbHelpers, collections } = require('../config/database');
const { getAuth } = require('../config/firebase');
const { generateToken, hashPassword, comparePassword, generateUniqueId } = require('../utils/auth');

class UserService {
  constructor() {
    try {
      this.auth = getAuth();
    } catch (error) {
      console.log('⚠️  Firebase Auth initialization failed, using Firestore-only mode');
      this.auth = null;
    }
  }

  // Register new user
  async registerUser(userData) {
    const { email, password, name, role, profile = {} } = userData;

    try {
      // Check if user already exists
      const existingUsers = await dbHelpers.getDocuments(collections.USERS, [
        { field: 'email', operator: '==', value: email }
      ]);

      if (existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password for our database
      const hashedPassword = await hashPassword(password);

      // Generate unique user ID
      const userId = generateUniqueId('USER');

      // Try to create Firebase Auth user (if available)
      let firebaseUID = userId; // Fallback to our generated ID
      if (this.auth) {
        try {
          const firebaseUser = await this.auth.createUser({
            email,
            password,
            displayName: name
          });
          firebaseUID = firebaseUser.uid;
          console.log('✅ Created Firebase Auth user');
        } catch (firebaseError) {
          console.log('⚠️  Firebase Auth creation failed, using Firestore-only authentication');
          console.log('Firebase Error:', firebaseError.message);
        }
      } else {
        console.log('ℹ️  Using Firestore-only authentication (Firebase Auth not available)');
      }

      // Create user document in Firestore
      const userDoc = {
        uid: firebaseUID,
        email,
        password: hashedPassword,
        name,
        role,
        isActive: true,
        profile,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await dbHelpers.setDocument(collections.USERS, firebaseUID, userDoc);

      // Generate JWT token
      const token = generateToken({
        userId: firebaseUID,
        email,
        role
      });

      // Return user data without password
      const { password: _, ...userResponse } = userDoc;
      return {
        user: { id: firebaseUID, ...userResponse },
        token
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Login user
  async loginUser(email, password) {
    try {
      // Get user from database
      const users = await dbHelpers.getDocuments(collections.USERS, [
        { field: 'email', operator: '==', value: email }
      ]);

      if (users.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = users[0];

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Return user data without password
      const { password: _, ...userResponse } = user;
      return {
        user: userResponse,
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const user = await dbHelpers.getDocument(collections.USERS, userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Return user data without password
      const { password: _, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      const user = await dbHelpers.getDocument(collections.USERS, userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive fields from update
      const { password, uid, email, role, ...allowedUpdates } = updateData;

      const updatedUser = await dbHelpers.updateDocument(collections.USERS, userId, allowedUpdates);

      // Return updated user without password
      const { password: _, ...userResponse } = updatedUser;
      return userResponse;
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  // Get all users (admin only)
  async getAllUsers(filters = {}) {
    try {
      const queryFilters = [];

      // Add role filter if specified
      if (filters.role) {
        queryFilters.push({ field: 'role', operator: '==', value: filters.role });
      }

      // Add active status filter if specified
      if (filters.isActive !== undefined) {
        queryFilters.push({ field: 'isActive', operator: '==', value: filters.isActive });
      }

      const users = await dbHelpers.getDocuments(
        collections.USERS,
        queryFilters,
        { field: 'createdAt', direction: 'desc' }
      );

      // Return users without passwords
      return users.map(user => {
        const { password: _, ...userResponse } = user;
        return userResponse;
      });
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Update user status (activate/deactivate)
  async updateUserStatus(userId, isActive) {
    try {
      const user = await dbHelpers.getDocument(collections.USERS, userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update Firebase Auth user status
      await this.auth.updateUser(user.uid, { disabled: !isActive });

      // Update user document
      const updatedUser = await dbHelpers.updateDocument(collections.USERS, userId, { isActive });

      const { password: _, ...userResponse } = updatedUser;
      return userResponse;
    } catch (error) {
      throw new Error(`Failed to update user status: ${error.message}`);
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await dbHelpers.getDocument(collections.USERS, userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password in Firebase Auth
      await this.auth.updateUser(user.uid, { password: newPassword });

      // Update password in our database
      await dbHelpers.updateDocument(collections.USERS, userId, {
        password: hashedNewPassword
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const user = await dbHelpers.getDocument(collections.USERS, userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Delete from Firebase Auth
      await this.auth.deleteUser(user.uid);

      // Delete from our database
      await dbHelpers.deleteDocument(collections.USERS, userId);

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

module.exports = new UserService();