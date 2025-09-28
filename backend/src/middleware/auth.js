const { verifyToken, canAccess, ROLES } = require('../utils/auth');
const { dbHelpers, collections } = require('../config/database');

// Authenticate user middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Get user details from database
    const user = await dbHelpers.getDocument(collections.USERS, decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user info to request object
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Role-based authorization middleware
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user || !req.userRole) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has required role
      if (!canAccess(req.userRole, allowedRoles)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  };
};

// Check if user can access specific student data
const authorizeStudentAccess = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.body.studentId;
    const userRole = req.userRole;
    const userId = req.userId;

    // Admin and staff can access all student data
    if (canAccess(userRole, [ROLES.ADMIN, ROLES.STAFF])) {
      return next();
    }

    // Student can only access their own data
    if (userRole === ROLES.STUDENT) {
      // Get student record to check if it belongs to the authenticated user
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student || student.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own data.'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Student access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

// Check if user can access specific hostel data (warden specific)
const authorizeHostelAccess = async (req, res, next) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    // Admin can access all hostel data
    if (canAccess(userRole, [ROLES.ADMIN])) {
      return next();
    }

    // Warden can only access their assigned hostel data
    if (userRole === ROLES.WARDEN) {
      const hostelId = req.params.hostelId || req.body.hostelId;
      if (hostelId) {
        const hostel = await dbHelpers.getDocument(collections.HOSTELS, hostelId);
        if (!hostel || hostel.warden.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only manage your assigned hostel.'
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Hostel access authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeStudentAccess,
  authorizeHostelAccess
};