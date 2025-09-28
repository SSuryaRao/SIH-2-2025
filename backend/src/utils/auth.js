const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// User roles
const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  WARDEN: 'warden',
  STUDENT: 'student'
};

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  [ROLES.STUDENT]: 1,
  [ROLES.WARDEN]: 2,
  [ROLES.STAFF]: 3,
  [ROLES.ADMIN]: 4
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Check if user has required role or higher
const hasRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Check if user can access resource (role-based access control)
const canAccess = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.some(role => hasRole(userRole, role));
};

// Generate unique ID
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${randomStr}`.toUpperCase();
};

// Generate student ID
const generateStudentId = () => {
  const currentYear = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4 digit random number
  return `STU${currentYear}${randomNum}`;
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  hasRole,
  canAccess,
  generateUniqueId,
  generateStudentId
};