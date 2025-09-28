const express = require('express');
const router = express.Router();

const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate, schemas } = require('../middleware/validation');

// Auth alias routes with frontend-compatible response structure

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  // Transform frontend data to match backend validation schema
  const { name, email, password, role, rollNumber, department, semester, ...otherFields } = req.body;

  // Build profile object for additional fields
  const profile = {};
  if (department) profile.department = department;
  if (rollNumber) profile.rollNumber = rollNumber;
  if (semester) profile.semester = semester;

  // Prepare data for backend validation
  const transformedData = {
    name,
    email,
    password,
    role,
    ...(Object.keys(profile).length > 0 && { profile })
  };

  // Validate the transformed data
  const { error, value } = schemas.userRegistration.validate(transformedData, { abortEarly: false });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const result = await userService.registerUser(value);

  res.status(201).json({
    success: true,
    token: result.token,
    user: {
      id: result.user.id || result.user.uid,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role
    }
  });
}));

// POST /api/auth/login
router.post('/login', validate(schemas.userLogin), asyncHandler(async (req, res) => {
  const { email, password } = req.validatedData;
  const result = await userService.loginUser(email, password);

  res.status(200).json({
    success: true,
    token: result.token,
    user: {
      id: result.user.id || result.user.uid,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role
    }
  });
}));

module.exports = router;