// Test setup file

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Mock console methods to reduce noise in tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  createMockStudent: () => ({
    studentId: 'STU001',
    userId: 'test-user-id',
    personalInfo: {
      name: 'Test Student',
      email: 'student@test.com',
      phone: '1234567890',
      dateOfBirth: '2000-01-01',
      gender: 'male',
      address: {
        permanent: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          country: 'India'
        },
        correspondence: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          country: 'India',
          sameAsPermanent: true
        }
      }
    },
    academicInfo: {
      rollNumber: 'CS2024001',
      course: 'Computer Science Engineering',
      branch: 'Computer Science',
      semester: 1,
      year: 1,
      admissionYear: 2024,
      status: 'active'
    },
    documents: {},
    createdAt: new Date(),
    updatedAt: new Date()
  })
};

// Setup and teardown
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});