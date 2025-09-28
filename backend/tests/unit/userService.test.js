const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock dependencies before importing the service
jest.mock('../../src/config/database');
jest.mock('../../src/config/firebase');
jest.mock('../../src/utils/auth');

const { dbHelpers, collections, resetMocks } = require('../mocks/database');
const userService = require('../../src/services/userService');

// Mock auth utilities
const mockAuthUtils = {
  generateToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateUniqueId: jest.fn()
};

// Setup mocks
jest.doMock('../../src/config/database', () => ({
  dbHelpers: require('../mocks/database').dbHelpers,
  collections: require('../mocks/database').collections
}));

jest.doMock('../../src/config/firebase', () => ({
  getAuth: () => require('../mocks/database').mockAuth
}));

jest.doMock('../../src/utils/auth', () => mockAuthUtils);

describe('UserService', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();

    // Setup default mock returns
    mockAuthUtils.generateToken.mockReturnValue('mock-jwt-token');
    mockAuthUtils.hashPassword.mockResolvedValue('hashed-password');
    mockAuthUtils.comparePassword.mockResolvedValue(true);
    mockAuthUtils.generateUniqueId.mockReturnValue('USER123');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    test('should successfully register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'student',
        profile: { department: 'CS' }
      };

      const mockUser = {
        uid: 'USER123',
        email: userData.email,
        password: 'hashed-password',
        name: userData.name,
        role: userData.role,
        isActive: true,
        profile: userData.profile,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      // Mock no existing user
      dbHelpers.getDocuments.mockResolvedValue([]);

      // Mock successful document creation
      dbHelpers.setDocument.mockResolvedValue(mockUser);

      const result = await userService.registerUser(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBe('mock-jwt-token');

      // Verify database operations
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(collections.USERS, [
        { field: 'email', operator: '==', value: userData.email }
      ]);
      expect(dbHelpers.setDocument).toHaveBeenCalledWith(
        collections.USERS,
        'USER123',
        expect.objectContaining({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          password: 'hashed-password'
        })
      );
    });

    test('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        role: 'student'
      };

      // Mock existing user
      dbHelpers.getDocuments.mockResolvedValue([{ email: userData.email }]);

      await expect(userService.registerUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(dbHelpers.setDocument).not.toHaveBeenCalled();
    });

    test('should handle database errors during registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      };

      dbHelpers.getDocuments.mockRejectedValue(new Error('Database error'));

      await expect(userService.registerUser(userData)).rejects.toThrow(
        'Registration failed: Database error'
      );
    });
  });

  describe('loginUser', () => {
    test('should successfully login with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockUser = {
        id: 'user123',
        email,
        password: 'hashed-password',
        name: 'Test User',
        role: 'student',
        isActive: true
      };

      dbHelpers.getDocuments.mockResolvedValue([mockUser]);
      mockAuthUtils.comparePassword.mockResolvedValue(true);

      const result = await userService.loginUser(email, password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(email);
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBe('mock-jwt-token');

      expect(mockAuthUtils.comparePassword).toHaveBeenCalledWith(password, 'hashed-password');
    });

    test('should throw error for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      dbHelpers.getDocuments.mockResolvedValue([]);

      await expect(userService.loginUser(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    test('should throw error for inactive user', async () => {
      const email = 'inactive@example.com';
      const password = 'password123';

      const mockUser = {
        id: 'user123',
        email,
        password: 'hashed-password',
        name: 'Inactive User',
        role: 'student',
        isActive: false
      };

      dbHelpers.getDocuments.mockResolvedValue([mockUser]);

      await expect(userService.loginUser(email, password)).rejects.toThrow(
        'Account is deactivated'
      );
    });

    test('should throw error for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const mockUser = {
        id: 'user123',
        email,
        password: 'hashed-password',
        name: 'Test User',
        role: 'student',
        isActive: true
      };

      dbHelpers.getDocuments.mockResolvedValue([mockUser]);
      mockAuthUtils.comparePassword.mockResolvedValue(false);

      await expect(userService.loginUser(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('getUserProfile', () => {
    test('should successfully get user profile', async () => {
      const userId = 'user123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        password: 'hashed-password',
        isActive: true
      };

      dbHelpers.getDocument.mockResolvedValue(mockUser);

      const result = await userService.getUserProfile(userId);

      expect(result).toEqual(expect.objectContaining({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        isActive: true
      }));
      expect(result).not.toHaveProperty('password');
    });

    test('should throw error if user not found', async () => {
      const userId = 'nonexistent';

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(userService.getUserProfile(userId)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updateUserProfile', () => {
    test('should successfully update user profile', async () => {
      const userId = 'user123';
      const updateData = {
        name: 'Updated Name',
        profile: { department: 'Updated Dept' },
        password: 'should-not-update',
        role: 'should-not-update'
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        isActive: true
      };

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        profile: { department: 'Updated Dept' }
      };

      dbHelpers.getDocument.mockResolvedValue(mockUser);
      dbHelpers.updateDocument.mockResolvedValue(updatedUser);

      const result = await userService.updateUserProfile(userId, updateData);

      expect(result.name).toBe('Updated Name');
      expect(result.profile.department).toBe('Updated Dept');
      expect(result).not.toHaveProperty('password');

      // Verify sensitive fields were excluded
      expect(dbHelpers.updateDocument).toHaveBeenCalledWith(
        collections.USERS,
        userId,
        expect.not.objectContaining({
          password: expect.anything(),
          role: expect.anything(),
          uid: expect.anything(),
          email: expect.anything()
        })
      );
    });

    test('should throw error if user not found', async () => {
      const userId = 'nonexistent';
      const updateData = { name: 'Updated Name' };

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(userService.updateUserProfile(userId, updateData)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getAllUsers', () => {
    test('should get all users with no filters', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', name: 'User 1', role: 'student', password: 'hash1' },
        { id: '2', email: 'user2@test.com', name: 'User 2', role: 'admin', password: 'hash2' }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');

      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.USERS,
        [],
        { field: 'createdAt', direction: 'desc' }
      );
    });

    test('should get users with role filter', async () => {
      const mockUsers = [
        { id: '1', email: 'student@test.com', name: 'Student', role: 'student', password: 'hash1' }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers({ role: 'student' });

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('student');

      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.USERS,
        [{ field: 'role', operator: '==', value: 'student' }],
        { field: 'createdAt', direction: 'desc' }
      );
    });

    test('should get users with active status filter', async () => {
      const filters = { isActive: true };
      dbHelpers.getDocuments.mockResolvedValue([]);

      await userService.getAllUsers(filters);

      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.USERS,
        [{ field: 'isActive', operator: '==', value: true }],
        { field: 'createdAt', direction: 'desc' }
      );
    });
  });

  describe('changePassword', () => {
    test('should successfully change password', async () => {
      const userId = 'user123';
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: userId,
        uid: 'firebase-uid',
        email: 'test@example.com',
        password: 'old-hashed-password'
      };

      dbHelpers.getDocument.mockResolvedValue(mockUser);
      mockAuthUtils.comparePassword.mockResolvedValue(true);
      mockAuthUtils.hashPassword.mockResolvedValue('new-hashed-password');

      const result = await userService.changePassword(userId, currentPassword, newPassword);

      expect(result.message).toBe('Password changed successfully');

      expect(mockAuthUtils.comparePassword).toHaveBeenCalledWith(currentPassword, 'old-hashed-password');
      expect(mockAuthUtils.hashPassword).toHaveBeenCalledWith(newPassword);
      expect(dbHelpers.updateDocument).toHaveBeenCalledWith(
        collections.USERS,
        userId,
        { password: 'new-hashed-password' }
      );
    });

    test('should throw error for incorrect current password', async () => {
      const userId = 'user123';
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed-password'
      };

      dbHelpers.getDocument.mockResolvedValue(mockUser);
      mockAuthUtils.comparePassword.mockResolvedValue(false);

      await expect(userService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'Current password is incorrect'
      );
    });

    test('should throw error if user not found', async () => {
      const userId = 'nonexistent';
      const currentPassword = 'password';
      const newPassword = 'newpassword';

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(userService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'User not found'
      );
    });
  });
});