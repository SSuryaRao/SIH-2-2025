const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');

// Mock services before importing the app
const mockExamService = {
  createExam: jest.fn(),
  getAllExams: jest.fn(),
  getExamById: jest.fn(),
  updateExamStatus: jest.fn(),
  getExamStatistics: jest.fn(),
  registerForExam: jest.fn(),
  getMyExamRegistrations: jest.fn(),
  getMyExamSchedule: jest.fn()
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
jest.doMock('../../src/services/examService', () => mockExamService);
jest.doMock('../../src/middleware/auth', () => mockAuth);

const app = require('../testApp');

describe('Exam Routes Integration Tests', () => {
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

  describe('POST /api/exams', () => {
    test('should successfully create a new exam (admin)', async () => {
      const examData = {
        name: 'Mid-Term Examination',
        examType: 'internal',
        academicYear: '2024-25',
        semester: 1,
        startDate: '2024-11-01',
        endDate: '2024-11-15',
        registrationStartDate: '2024-10-01',
        registrationEndDate: '2024-10-25',
        eligibleCourses: ['Computer Science Engineering'],
        subjects: [
          {
            subjectCode: 'CS101',
            subjectName: 'Programming Fundamentals',
            examDate: '2024-11-05',
            startTime: '09:00',
            endTime: '12:00',
            maxMarks: 100,
            duration: 180
          }
        ]
      };

      const mockResult = {
        examId: 'EXAM001',
        status: 'upcoming',
        ...examData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockExamService.createExam.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/exams')
        .set('Authorization', 'Bearer mock-token')
        .send(examData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        message: 'Exam created successfully'
      });

      expect(mockExamService.createExam).toHaveBeenCalledWith(examData);
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

      const examData = { name: 'Test Exam' };

      const response = await request(app)
        .post('/api/exams')
        .set('Authorization', 'Bearer mock-token')
        .send(examData)
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });

      expect(mockExamService.createExam).not.toHaveBeenCalled();
    });

    test('should return 400 for validation errors', async () => {
      const invalidExamData = {
        name: '', // Invalid - empty name
        examType: 'invalid-type' // Invalid exam type
      };

      mockExamService.createExam.mockRejectedValue(new Error('Validation failed: Name is required'));

      const response = await request(app)
        .post('/api/exams')
        .set('Authorization', 'Bearer mock-token')
        .send(invalidExamData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/exams', () => {
    test('should successfully get all exams with no filters', async () => {
      const mockExams = [
        {
          examId: 'EXAM001',
          name: 'Mid-Term Exam',
          examType: 'internal',
          status: 'upcoming',
          academicYear: '2024-25',
          semester: 1
        },
        {
          examId: 'EXAM002',
          name: 'Final Exam',
          examType: 'external',
          status: 'registration_open',
          academicYear: '2024-25',
          semester: 1
        }
      ];

      mockExamService.getAllExams.mockResolvedValue(mockExams);

      const response = await request(app)
        .get('/api/exams')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockExams
      });

      expect(mockExamService.getAllExams).toHaveBeenCalledWith({});
    });

    test('should get exams with filters', async () => {
      const filters = {
        academicYear: '2024-25',
        semester: '1',
        examType: 'internal',
        status: 'upcoming'
      };

      const mockExams = [
        {
          examId: 'EXAM001',
          name: 'Mid-Term Exam',
          examType: 'internal',
          status: 'upcoming',
          academicYear: '2024-25',
          semester: 1
        }
      ];

      mockExamService.getAllExams.mockResolvedValue(mockExams);

      const response = await request(app)
        .get('/api/exams')
        .query(filters)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockExams
      });

      expect(mockExamService.getAllExams).toHaveBeenCalledWith(filters);
    });

    test('should allow access to students and staff', async () => {
      // Mock user as student
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user123', role: 'student' };
        next();
      });

      mockAuth.requireRole.mockImplementation((roles) => (req, res, next) => {
        if (roles.includes('student')) {
          next();
        } else {
          res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
      });

      mockExamService.getAllExams.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/exams')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/exams/:id', () => {
    test('should successfully get exam by ID', async () => {
      const examId = 'EXAM001';
      const mockExam = {
        examId,
        name: 'Mid-Term Exam',
        examType: 'internal',
        status: 'upcoming',
        subjects: [
          {
            subjectCode: 'CS101',
            subjectName: 'Programming Fundamentals',
            examDate: '2024-11-05',
            startTime: '09:00',
            endTime: '12:00'
          }
        ]
      };

      mockExamService.getExamById.mockResolvedValue(mockExam);

      const response = await request(app)
        .get(`/api/exams/${examId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockExam
      });

      expect(mockExamService.getExamById).toHaveBeenCalledWith(examId);
    });

    test('should return 404 for non-existent exam', async () => {
      const examId = 'EXAM999';

      mockExamService.getExamById.mockRejectedValue(new Error('Exam not found'));

      const response = await request(app)
        .get(`/api/exams/${examId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Exam not found'
      });
    });
  });

  describe('PATCH /api/exams/:id/status', () => {
    test('should successfully update exam status (admin)', async () => {
      const examId = 'EXAM001';
      const statusData = { status: 'registration_open' };

      const mockUpdatedExam = {
        examId,
        name: 'Mid-Term Exam',
        status: 'registration_open'
      };

      mockExamService.updateExamStatus.mockResolvedValue(mockUpdatedExam);

      const response = await request(app)
        .patch(`/api/exams/${examId}/status`)
        .set('Authorization', 'Bearer mock-token')
        .send(statusData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedExam,
        message: 'Exam status updated successfully'
      });

      expect(mockExamService.updateExamStatus).toHaveBeenCalledWith(examId, 'registration_open');
    });

    test('should return 403 for non-admin users', async () => {
      // Mock user as student
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

      const examId = 'EXAM001';
      const statusData = { status: 'registration_open' };

      const response = await request(app)
        .patch(`/api/exams/${examId}/status`)
        .set('Authorization', 'Bearer mock-token')
        .send(statusData)
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });

      expect(mockExamService.updateExamStatus).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid status', async () => {
      const examId = 'EXAM001';
      const statusData = { status: 'invalid-status' };

      mockExamService.updateExamStatus.mockRejectedValue(
        new Error('Invalid status. Must be one of: upcoming, registration_open, ongoing, completed')
      );

      const response = await request(app)
        .patch(`/api/exams/${examId}/status`)
        .set('Authorization', 'Bearer mock-token')
        .send(statusData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid status');
    });
  });

  describe('POST /api/exams/:id/register', () => {
    test('should successfully register student for exam', async () => {
      // Mock user as student
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user123', role: 'student' };
        next();
      });

      mockAuth.requireRole.mockImplementation((roles) => (req, res, next) => {
        if (roles.includes('student')) {
          next();
        } else {
          res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
      });

      const examId = 'EXAM001';
      const registrationData = {
        selectedSubjects: ['CS101', 'CS102']
      };

      const mockResult = {
        registrationId: 'REG001',
        examId,
        studentId: 'STU001',
        subjects: ['CS101', 'CS102'],
        registrationDate: new Date(),
        status: 'registered'
      };

      mockExamService.registerForExam.mockResolvedValue(mockResult);

      const response = await request(app)
        .post(`/api/exams/${examId}/register`)
        .set('Authorization', 'Bearer mock-token')
        .send(registrationData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        message: 'Successfully registered for exam'
      });

      expect(mockExamService.registerForExam).toHaveBeenCalledWith(
        examId,
        'user123',
        registrationData.selectedSubjects
      );
    });

    test('should return 403 for non-student users', async () => {
      // Mock user as admin (not student)
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user123', role: 'admin' };
        next();
      });

      mockAuth.requireRole.mockImplementation((roles) => (req, res, next) => {
        if (!roles.includes('admin')) {
          return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
        next();
      });

      const examId = 'EXAM001';
      const registrationData = { selectedSubjects: ['CS101'] };

      const response = await request(app)
        .post(`/api/exams/${examId}/register`)
        .set('Authorization', 'Bearer mock-token')
        .send(registrationData)
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });

      expect(mockExamService.registerForExam).not.toHaveBeenCalled();
    });

    test('should return 400 for registration period closed', async () => {
      // Mock user as student
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user123', role: 'student' };
        next();
      });

      mockAuth.requireRole.mockImplementation((roles) => (req, res, next) => {
        if (roles.includes('student')) {
          next();
        } else {
          res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
      });

      const examId = 'EXAM001';
      const registrationData = { selectedSubjects: ['CS101'] };

      mockExamService.registerForExam.mockRejectedValue(
        new Error('Registration period has ended')
      );

      const response = await request(app)
        .post(`/api/exams/${examId}/register`)
        .set('Authorization', 'Bearer mock-token')
        .send(registrationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Registration period has ended');
    });
  });

  describe('GET /api/exams/my-registrations', () => {
    test('should get student exam registrations', async () => {
      // Mock user as student
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user123', role: 'student' };
        next();
      });

      mockAuth.requireRole.mockImplementation((roles) => (req, res, next) => {
        if (roles.includes('student')) {
          next();
        } else {
          res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
      });

      const mockRegistrations = [
        {
          registrationId: 'REG001',
          examId: 'EXAM001',
          examName: 'Mid-Term Exam',
          subjects: ['CS101', 'CS102'],
          status: 'registered'
        }
      ];

      mockExamService.getMyExamRegistrations.mockResolvedValue(mockRegistrations);

      const response = await request(app)
        .get('/api/exams/my-registrations')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockRegistrations
      });

      expect(mockExamService.getMyExamRegistrations).toHaveBeenCalledWith('user123');
    });
  });

  describe('GET /api/exams/statistics', () => {
    test('should get exam statistics (admin)', async () => {
      const mockStats = {
        totalExams: 10,
        upcomingExams: 3,
        ongoingExams: 2,
        completedExams: 5,
        totalRegistrations: 150,
        activeRegistrations: 45,
        examsByType: {
          internal: 6,
          external: 3,
          practical: 1
        },
        examsBySemester: {
          1: 3,
          2: 2,
          3: 3,
          4: 2
        }
      };

      mockExamService.getExamStatistics.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/exams/statistics')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStats
      });

      expect(mockExamService.getExamStatistics).toHaveBeenCalled();
    });

    test('should return 403 for non-admin users', async () => {
      // Mock user as student
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

      const response = await request(app)
        .get('/api/exams/statistics')
        .set('Authorization', 'Bearer mock-token')
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });

      expect(mockExamService.getExamStatistics).not.toHaveBeenCalled();
    });
  });
});