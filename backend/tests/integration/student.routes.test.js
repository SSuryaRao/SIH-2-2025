const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');

// Mock services before importing the app
const mockStudentService = {
  addStudent: jest.fn(),
  getAllStudents: jest.fn(),
  getStudentById: jest.fn(),
  getStudentByUserId: jest.fn(),
  updateStudent: jest.fn(),
  updateStudentStatus: jest.fn(),
  deleteStudent: jest.fn(),
  searchStudents: jest.fn(),
  getStudentStatistics: jest.fn()
};

const mockAuth = {
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { userId: 'user123', role: 'admin' };
    next();
  }),
  requireRole: jest.fn((roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
  })
};

// Mock modules
jest.doMock('../../src/services/studentService', () => mockStudentService);
jest.doMock('../../src/middleware/auth', () => mockAuth);

const app = require('../testApp');

describe('Student Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default auth behavior
    mockAuth.authenticateToken.mockImplementation((req, res, next) => {
      req.user = { userId: 'user123', role: 'admin' };
      next();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/students', () => {
    test('should successfully create a new student (admin)', async () => {
      const studentData = {
        userId: 'user123',
        personalInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          dateOfBirth: '2000-01-01',
          gender: 'male',
          address: {
            permanent: {
              street: '123 Main St',
              city: 'City',
              state: 'State',
              pincode: '123456',
              country: 'India'
            }
          }
        },
        academicInfo: {
          rollNumber: 'CS2024001',
          course: 'Computer Science Engineering',
          branch: 'Computer Science',
          semester: 1,
          year: 1,
          admissionYear: 2024
        }
      };

      const mockResult = {
        studentId: 'STU001',
        ...studentData,
        academicInfo: {
          ...studentData.academicInfo,
          status: 'active'
        },
        documents: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStudentService.addStudent.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', 'Bearer mock-token')
        .send(studentData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        message: 'Student created successfully'
      });

      expect(mockStudentService.addStudent).toHaveBeenCalledWith(studentData);
    });

    test('should return 403 for non-admin users', async () => {
      // Mock user as student (not admin)
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user123', role: 'student' };
        next();
      });

      mockAuth.requireRole.mockImplementation((roles) => (req, res, next) => {
        if (!roles.includes('student')) {
          return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
        next();
      });

      const studentData = { name: 'Test Student' };

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', 'Bearer mock-token')
        .send(studentData)
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });

      expect(mockStudentService.addStudent).not.toHaveBeenCalled();
    });

    test('should return 401 for unauthenticated requests', async () => {
      // Mock authentication failure
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({ success: false, message: 'Authentication required' });
      });

      const studentData = { name: 'Test Student' };

      const response = await request(app)
        .post('/api/students')
        .send(studentData)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Authentication required'
      });
    });

    test('should return 400 for validation errors', async () => {
      const invalidStudentData = {
        // Missing required fields
        personalInfo: {
          name: '' // Invalid - empty name
        }
      };

      mockStudentService.addStudent.mockRejectedValue(new Error('Validation failed: Name is required'));

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', 'Bearer mock-token')
        .send(invalidStudentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    test('should return 409 for duplicate roll number', async () => {
      const studentData = {
        personalInfo: { name: 'John Doe' },
        academicInfo: { rollNumber: 'CS2024001' }
      };

      mockStudentService.addStudent.mockRejectedValue(new Error('Student with this roll number already exists'));

      const response = await request(app)
        .post('/api/students')
        .set('Authorization', 'Bearer mock-token')
        .send(studentData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Student with this roll number already exists'
      });
    });
  });

  describe('GET /api/students', () => {
    test('should successfully get all students with no filters (admin)', async () => {
      const mockStudents = [
        {
          studentId: 'STU001',
          personalInfo: { name: 'John Doe' },
          academicInfo: { rollNumber: 'CS001', course: 'CS' }
        },
        {
          studentId: 'STU002',
          personalInfo: { name: 'Jane Smith' },
          academicInfo: { rollNumber: 'CS002', course: 'IT' }
        }
      ];

      mockStudentService.getAllStudents.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStudents,
        count: 2
      });

      expect(mockStudentService.getAllStudents).toHaveBeenCalledWith({});
    });

    test('should get students with filters', async () => {
      const filters = {
        course: 'Computer Science Engineering',
        semester: '2',
        year: '1',
        status: 'active'
      };

      const mockStudents = [
        {
          studentId: 'STU001',
          academicInfo: {
            course: 'Computer Science Engineering',
            semester: 2,
            year: 1,
            status: 'active'
          }
        }
      ];

      mockStudentService.getAllStudents.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get('/api/students')
        .query(filters)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStudents,
        count: 1
      });

      expect(mockStudentService.getAllStudents).toHaveBeenCalledWith(filters);
    });

    test('should handle search query', async () => {
      const searchTerm = 'john';
      const mockStudents = [
        {
          studentId: 'STU001',
          personalInfo: { name: 'John Doe' }
        }
      ];

      mockStudentService.searchStudents.mockResolvedValue(mockStudents);

      const response = await request(app)
        .get('/api/students')
        .query({ search: searchTerm })
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStudents,
        count: 1
      });

      expect(mockStudentService.searchStudents).toHaveBeenCalledWith(searchTerm);
    });
  });

  describe('GET /api/students/:id', () => {
    test('should successfully get student by ID', async () => {
      const studentId = 'STU001';
      const mockStudent = {
        studentId,
        personalInfo: { name: 'John Doe' },
        academicInfo: { rollNumber: 'CS001' }
      };

      mockStudentService.getStudentById.mockResolvedValue(mockStudent);

      const response = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStudent
      });

      expect(mockStudentService.getStudentById).toHaveBeenCalledWith(studentId);
    });

    test('should return 404 for non-existent student', async () => {
      const studentId = 'STU999';

      mockStudentService.getStudentById.mockRejectedValue(new Error('Student not found'));

      const response = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Student not found'
      });
    });
  });

  describe('PUT /api/students/:id', () => {
    test('should successfully update student', async () => {
      const studentId = 'STU001';
      const updateData = {
        personalInfo: { name: 'Updated Name' },
        academicInfo: { semester: 2 }
      };

      const mockUpdatedStudent = {
        studentId,
        personalInfo: { name: 'Updated Name' },
        academicInfo: { semester: 2 }
      };

      mockStudentService.updateStudent.mockResolvedValue(mockUpdatedStudent);

      const response = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedStudent,
        message: 'Student updated successfully'
      });

      expect(mockStudentService.updateStudent).toHaveBeenCalledWith(studentId, updateData);
    });

    test('should return 404 for non-existent student', async () => {
      const studentId = 'STU999';
      const updateData = { personalInfo: { name: 'Updated' } };

      mockStudentService.updateStudent.mockRejectedValue(new Error('Student not found'));

      const response = await request(app)
        .put(`/api/students/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Student not found'
      });
    });
  });

  describe('PATCH /api/students/:id/status', () => {
    test('should successfully update student status', async () => {
      const studentId = 'STU001';
      const statusData = { status: 'graduated' };

      const mockUpdatedStudent = {
        studentId,
        academicInfo: { status: 'graduated' }
      };

      mockStudentService.updateStudentStatus.mockResolvedValue(mockUpdatedStudent);

      const response = await request(app)
        .patch(`/api/students/${studentId}/status`)
        .set('Authorization', 'Bearer mock-token')
        .send(statusData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedStudent,
        message: 'Student status updated successfully'
      });

      expect(mockStudentService.updateStudentStatus).toHaveBeenCalledWith(studentId, 'graduated');
    });

    test('should return 400 for invalid status', async () => {
      const studentId = 'STU001';
      const statusData = { status: 'invalid-status' };

      mockStudentService.updateStudentStatus.mockRejectedValue(
        new Error('Invalid status. Must be one of: active, graduated, dropped, suspended')
      );

      const response = await request(app)
        .patch(`/api/students/${studentId}/status`)
        .set('Authorization', 'Bearer mock-token')
        .send(statusData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid status');
    });
  });

  describe('DELETE /api/students/:id', () => {
    test('should successfully delete student', async () => {
      const studentId = 'STU001';

      mockStudentService.deleteStudent.mockResolvedValue({
        message: 'Student deleted successfully'
      });

      const response = await request(app)
        .delete(`/api/students/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Student deleted successfully'
      });

      expect(mockStudentService.deleteStudent).toHaveBeenCalledWith(studentId);
    });

    test('should return 404 for non-existent student', async () => {
      const studentId = 'STU999';

      mockStudentService.deleteStudent.mockRejectedValue(new Error('Student not found'));

      const response = await request(app)
        .delete(`/api/students/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Student not found'
      });
    });
  });

  describe('GET /api/students/stats', () => {
    test('should successfully get student statistics', async () => {
      const mockStats = {
        total: 100,
        active: 85,
        graduated: 10,
        dropped: 3,
        suspended: 2,
        byCourse: {
          'Computer Science Engineering': 40,
          'Information Technology': 35,
          'Electronics Engineering': 25
        },
        byYear: { 1: 25, 2: 25, 3: 25, 4: 25 },
        bySemester: { 1: 15, 2: 15, 3: 15, 4: 15, 5: 10, 6: 10, 7: 10, 8: 10 }
      };

      mockStudentService.getStudentStatistics.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/students/stats')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStats
      });

      expect(mockStudentService.getStudentStatistics).toHaveBeenCalled();
    });
  });
});