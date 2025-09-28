const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');

// Register new user
const register = asyncHandler(async (req, res) => {
  const result = await userService.registerUser(req.validatedData);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedData;
  const result = await userService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.userId);

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: user
  });
});

// Update current user profile
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserProfile(req.userId, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const filters = {
    role: req.query.role,
    isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
  };

  const users = await userService.getAllUsers(filters);

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users
  });
});

// Get user by ID (admin/staff only)
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.params.userId);

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user
  });
});

// Update user status (admin only)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const updatedUser = await userService.updateUserStatus(req.params.userId, isActive);

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: updatedUser
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await userService.changePassword(req.userId, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  // For JWT-based auth, we don't need to do anything server-side
  // The client will remove the token from storage
  // In a more complex system, you might want to blacklist the token

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.userId);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserStatus,
  changePassword,
  deleteUser
};