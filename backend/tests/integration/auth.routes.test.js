const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');

// Mock services before importing the app
const mockUserService = {
  registerUser: jest.fn(),
  loginUser: jest.fn()
};

const mockValidationSchemas = {
  userRegistration: {
    validate: jest.fn()
  },
  userLogin: {
    validate: jest.fn()
  }
};

// Mock modules
jest.doMock('../../src/services/userService', () => mockUserService);
jest.doMock('../../src/middleware/validation', () => ({
  validate: (schema) => (req, res, next) => {
    req.validatedData = req.body;
    next();
  },
  schemas: mockValidationSchemas
}));

const app = require('../testApp');

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should successfully register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS2024001',
        semester: 1
      };

      const mockResult = {
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student'
        },
        token: 'mock-jwt-token'
      };

      // Mock validation success
      mockValidationSchemas.userRegistration.validate.mockReturnValue({
        error: null,
        value: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          profile: {
            department: userData.department,
            rollNumber: userData.rollNumber,
            semester: userData.semester
          }
        }
      });

      mockUserService.registerUser.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student'
        }
      });

      expect(mockUserService.registerUser).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        profile: {
          department: userData.department,
          rollNumber: userData.rollNumber,
          semester: userData.semester
        }
      });
    });

    test('should return 400 for validation errors', async () => {
      const invalidUserData = {
        name: '', // Invalid - too short
        email: 'invalid-email', // Invalid email format
        password: '123', // Invalid - too short
        role: 'invalid-role' // Invalid role
      };

      // Mock validation failure
      mockValidationSchemas.userRegistration.validate.mockReturnValue({
        error: {
          details: [
            { path: ['name'], message: 'Name must be at least 2 characters' },
            { path: ['email'], message: 'Please enter a valid email address' },
            { path: ['password'], message: 'Password must be at least 6 characters' },
            { path: ['role'], message: 'Role must be one of: student, staff, warden, admin' }
          ]
        }
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name must be at least 2 characters' },
          { field: 'email', message: 'Please enter a valid email address' },
          { field: 'password', message: 'Password must be at least 6 characters' },
          { field: 'role', message: 'Role must be one of: student, staff, warden, admin' }
        ]
      });

      expect(mockUserService.registerUser).not.toHaveBeenCalled();
    });

    test('should return 500 for service errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
      };

      // Mock validation success
      mockValidationSchemas.userRegistration.validate.mockReturnValue({
        error: null,
        value: userData
      });

      // Mock service error
      mockUserService.registerUser.mockRejectedValue(new Error('User with this email already exists'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'User with this email already exists'
      });
    });

    test('should handle registration without optional profile fields', async () => {
      const minimalUserData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'admin'
      };

      const mockResult = {
        user: {
          id: 'user124',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'admin'
        },
        token: 'mock-jwt-token-2'
      };

      // Mock validation success
      mockValidationSchemas.userRegistration.validate.mockReturnValue({
        error: null,
        value: minimalUserData
      });

      mockUserService.registerUser.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send(minimalUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('admin');

      // Should call registerUser without profile object since no additional fields
      expect(mockUserService.registerUser).toHaveBeenCalledWith(minimalUserData);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const mockResult = {
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student'
        },
        token: 'mock-jwt-token'
      };

      mockUserService.loginUser.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student'
        }
      });

      expect(mockUserService.loginUser).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );
    });

    test('should return 500 for invalid credentials', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      mockUserService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid credentials'
      });
    });

    test('should return 500 for deactivated account', async () => {
      const loginData = {
        email: 'deactivated@example.com',
        password: 'password123'
      };

      mockUserService.loginUser.mockRejectedValue(new Error('Account is deactivated'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Account is deactivated'
      });
    });

    test('should handle missing required fields', async () => {
      const incompleteLoginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteLoginData);

      // The request should still reach the service since we're mocking validation
      // In real scenario, validation middleware would catch this
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('should handle service timeout/network errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockUserService.loginUser.mockRejectedValue(new Error('Database connection timeout'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Database connection timeout'
      });
    });
  });
});