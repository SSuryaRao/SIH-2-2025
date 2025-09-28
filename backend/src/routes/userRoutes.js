const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas, validateObjectId } = require('../middleware/validation');
const { ROLES } = require('../utils/auth');

// Public routes (no authentication required)
router.post('/register', validate(schemas.userRegistration), userController.register);
router.post('/login', validate(schemas.userLogin), userController.login);
router.post('/logout', userController.logout);

// Protected routes (authentication required)
router.use(authenticate); // All routes below this line require authentication

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// Admin/Staff only routes
router.get('/',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  userController.getAllUsers
);

router.get('/:userId',
  validateObjectId('userId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  userController.getUserById
);

// Admin only routes
router.put('/:userId/status',
  validateObjectId('userId'),
  authorize([ROLES.ADMIN]),
  userController.updateUserStatus
);

router.delete('/:userId',
  validateObjectId('userId'),
  authorize([ROLES.ADMIN]),
  userController.deleteUser
);

module.exports = router;