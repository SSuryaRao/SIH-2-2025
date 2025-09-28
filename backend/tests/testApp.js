const express = require('express');
const cors = require('cors');

// Mock the database and Firebase before requiring routes
jest.mock('../src/config/database');
jest.mock('../src/config/firebase');
jest.mock('../src/services/userService');
jest.mock('../src/services/studentService');
jest.mock('../src/services/examService');
jest.mock('../src/services/feeService');

// Mock middleware
jest.mock('../src/middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { userId: 'test-user', role: 'admin' };
    next();
  }),
  authorize: jest.fn((roles) => (req, res, next) => next()),
  authorizeStudentAccess: jest.fn((req, res, next) => next())
}));

jest.mock('../src/middleware/validation', () => ({
  validate: jest.fn((schema) => (req, res, next) => {
    req.validatedData = req.body;
    next();
  }),
  validateObjectId: jest.fn((param) => (req, res, next) => next()),
  schemas: {}
}));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/students', require('../src/routes/studentRoutes'));
app.use('/api/exams', require('../src/routes/examRoutes'));
app.use('/api/fees', require('../src/routes/feeRoutes'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Test app error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'test' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = app;