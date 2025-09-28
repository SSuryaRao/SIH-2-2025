const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const request = require('supertest');

// Mock services before importing the app
const mockFeeService = {
  createFeeStructure: jest.fn(),
  getAllFees: jest.fn(),
  getFeeById: jest.fn(),
  getFeesByStudentId: jest.fn(),
  recordPayment: jest.fn(),
  updateFeeStructure: jest.fn(),
  updateDueDate: jest.fn(),
  getPaymentHistory: jest.fn(),
  generateReceipt: jest.fn(),
  getFeeStatistics: jest.fn(),
  getPendingFees: jest.fn()
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
jest.doMock('../../src/services/feeService', () => mockFeeService);
jest.doMock('../../src/middleware/auth', () => mockAuth);

const app = require('../testApp');

describe('Fee Routes Integration Tests', () => {
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

  describe('POST /api/fees', () => {
    test('should successfully create fee structure (admin)', async () => {
      const feeData = {
        studentId: 'STU001',
        academicYear: '2024-25',
        semester: 1,
        feeStructure: {
          tuitionFee: 50000,
          labFee: 5000,
          libraryFee: 2000,
          examFee: 3000,
          developmentFee: 10000,
          total: 70000
        },
        dueDate: '2024-12-31'
      };

      const mockResult = {
        feeId: 'FEE001',
        ...feeData,
        status: 'pending',
        totalPaid: 0,
        balance: 70000,
        payments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockFeeService.createFeeStructure.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/fees')
        .set('Authorization', 'Bearer mock-token')
        .send(feeData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        message: 'Fee structure created successfully'
      });

      expect(mockFeeService.createFeeStructure).toHaveBeenCalledWith(feeData);
    });

    test('should return 403 for non-admin/staff users', async () => {
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

      const feeData = { studentId: 'STU001' };

      const response = await request(app)
        .post('/api/fees')
        .set('Authorization', 'Bearer mock-token')
        .send(feeData)
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });

      expect(mockFeeService.createFeeStructure).not.toHaveBeenCalled();
    });

    test('should return 401 for unauthenticated requests', async () => {
      // Mock authentication failure
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        res.status(401).json({ success: false, message: 'Authentication required' });
      });

      const feeData = { studentId: 'STU001' };

      const response = await request(app)
        .post('/api/fees')
        .send(feeData)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Authentication required'
      });
    });

    test('should return 400 for validation errors', async () => {
      const invalidFeeData = {
        studentId: '', // Invalid - empty studentId
        academicYear: 'invalid', // Invalid format
        semester: 10 // Invalid - out of range
      };

      mockFeeService.createFeeStructure.mockRejectedValue(new Error('Validation failed: Invalid fee data'));

      const response = await request(app)
        .post('/api/fees')
        .set('Authorization', 'Bearer mock-token')
        .send(invalidFeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/fees', () => {
    test('should successfully get all fees (admin)', async () => {
      const mockFees = [
        {
          feeId: 'FEE001',
          studentId: 'STU001',
          academicYear: '2024-25',
          semester: 1,
          status: 'pending',
          balance: 70000
        },
        {
          feeId: 'FEE002',
          studentId: 'STU002',
          academicYear: '2024-25',
          semester: 1,
          status: 'completed',
          balance: 0
        }
      ];

      mockFeeService.getAllFees.mockResolvedValue(mockFees);

      const response = await request(app)
        .get('/api/fees')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockFees,
        count: 2
      });

      expect(mockFeeService.getAllFees).toHaveBeenCalledWith({});
    });

    test('should get fees with filters', async () => {
      const filters = {
        academicYear: '2024-25',
        semester: '1',
        status: 'pending'
      };

      const mockFees = [
        {
          feeId: 'FEE001',
          academicYear: '2024-25',
          semester: 1,
          status: 'pending'
        }
      ];

      mockFeeService.getAllFees.mockResolvedValue(mockFees);

      const response = await request(app)
        .get('/api/fees')
        .query(filters)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockFees,
        count: 1
      });

      expect(mockFeeService.getAllFees).toHaveBeenCalledWith(filters);
    });
  });

  describe('GET /api/fees/:feeId', () => {
    test('should successfully get fee by ID', async () => {
      const feeId = 'FEE001';
      const mockFee = {
        feeId,
        studentId: 'STU001',
        academicYear: '2024-25',
        semester: 1,
        feeStructure: { total: 70000 },
        status: 'pending',
        balance: 70000
      };

      mockFeeService.getFeeById.mockResolvedValue(mockFee);

      const response = await request(app)
        .get(`/api/fees/${feeId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockFee
      });

      expect(mockFeeService.getFeeById).toHaveBeenCalledWith(feeId);
    });

    test('should return 404 for non-existent fee', async () => {
      const feeId = 'FEE999';

      mockFeeService.getFeeById.mockRejectedValue(new Error('Fee not found'));

      const response = await request(app)
        .get(`/api/fees/${feeId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Fee not found'
      });
    });
  });

  describe('POST /api/fees/:feeId/payment', () => {
    test('should successfully record payment', async () => {
      const feeId = 'FEE001';
      const paymentData = {
        amount: 25000,
        paymentMode: 'cash',
        transactionId: 'TXN001',
        receiptNumber: 'REC001'
      };

      const mockUpdatedFee = {
        feeId,
        totalPaid: 25000,
        balance: 45000,
        status: 'partial',
        payments: [
          {
            paymentId: 'PAY001',
            ...paymentData,
            paymentDate: new Date()
          }
        ]
      };

      mockFeeService.recordPayment.mockResolvedValue(mockUpdatedFee);

      const response = await request(app)
        .post(`/api/fees/${feeId}/payment`)
        .set('Authorization', 'Bearer mock-token')
        .send(paymentData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedFee,
        message: 'Payment recorded successfully'
      });

      expect(mockFeeService.recordPayment).toHaveBeenCalledWith(feeId, paymentData);
    });

    test('should return 400 for invalid payment amount', async () => {
      const feeId = 'FEE001';
      const paymentData = {
        amount: -1000, // Invalid negative amount
        paymentMode: 'cash'
      };

      mockFeeService.recordPayment.mockRejectedValue(new Error('Payment amount must be positive'));

      const response = await request(app)
        .post(`/api/fees/${feeId}/payment`)
        .set('Authorization', 'Bearer mock-token')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Payment amount must be positive');
    });

    test('should return 400 when payment exceeds balance', async () => {
      const feeId = 'FEE001';
      const paymentData = {
        amount: 80000, // Exceeds balance
        paymentMode: 'cash'
      };

      mockFeeService.recordPayment.mockRejectedValue(new Error('Payment amount cannot exceed balance'));

      const response = await request(app)
        .post(`/api/fees/${feeId}/payment`)
        .set('Authorization', 'Bearer mock-token')
        .send(paymentData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Payment amount cannot exceed balance'
      });
    });
  });

  describe('GET /api/fees/student/:studentId', () => {
    test('should get student fees with proper authorization', async () => {
      const studentId = 'STU001';
      const mockFees = [
        {
          feeId: 'FEE001',
          studentId,
          academicYear: '2024-25',
          semester: 1,
          status: 'pending'
        }
      ];

      mockFeeService.getFeesByStudentId.mockResolvedValue(mockFees);

      const response = await request(app)
        .get(`/api/fees/student/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockFees,
        count: 1
      });

      expect(mockFeeService.getFeesByStudentId).toHaveBeenCalledWith(studentId);
    });

    test('should return empty array for student with no fees', async () => {
      const studentId = 'STU999';

      mockFeeService.getFeesByStudentId.mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/fees/student/${studentId}`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });
  });

  describe('GET /api/fees/my-fees', () => {
    test('should get current student fees', async () => {
      // Mock as student user
      mockAuth.authenticateToken.mockImplementation((req, res, next) => {
        req.user = { userId: 'user123', role: 'student', studentId: 'STU001' };
        next();
      });

      const mockFees = [
        {
          feeId: 'FEE001',
          studentId: 'STU001',
          academicYear: '2024-25',
          semester: 1,
          status: 'pending',
          balance: 45000
        }
      ];

      mockFeeService.getFeesByStudentId.mockResolvedValue(mockFees);

      const response = await request(app)
        .get('/api/fees/my-fees')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockFees,
        count: 1
      });
    });

    test('should return 403 for non-student users', async () => {
      // Keep as admin user
      mockAuth.requireRole.mockImplementation((roles) => (req, res, next) => {
        if (!roles.includes('admin')) {
          return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }
        next();
      });

      const response = await request(app)
        .get('/api/fees/my-fees')
        .set('Authorization', 'Bearer mock-token')
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });
    });
  });

  describe('GET /api/fees/pending', () => {
    test('should get pending fees (admin)', async () => {
      const mockPendingFees = [
        {
          feeId: 'FEE001',
          studentId: 'STU001',
          status: 'pending',
          balance: 70000,
          dueDate: '2024-12-31'
        },
        {
          feeId: 'FEE002',
          studentId: 'STU002',
          status: 'partial',
          balance: 35000,
          dueDate: '2024-12-31'
        }
      ];

      mockFeeService.getPendingFees.mockResolvedValue(mockPendingFees);

      const response = await request(app)
        .get('/api/fees/pending')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPendingFees,
        count: 2
      });

      expect(mockFeeService.getPendingFees).toHaveBeenCalled();
    });
  });

  describe('GET /api/fees/statistics', () => {
    test('should get fee statistics (admin)', async () => {
      const mockStats = {
        totalFees: 100,
        completedFees: 70,
        partialFees: 20,
        pendingFees: 10,
        totalAmount: 7000000,
        totalCollected: 5600000,
        totalPending: 1400000,
        averageBalance: 14000
      };

      mockFeeService.getFeeStatistics.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/fees/statistics')
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockStats
      });

      expect(mockFeeService.getFeeStatistics).toHaveBeenCalled();
    });
  });

  describe('PUT /api/fees/:feeId/structure', () => {
    test('should successfully update fee structure', async () => {
      const feeId = 'FEE001';
      const updateData = {
        feeStructure: {
          tuitionFee: 55000, // Updated amount
          labFee: 5000,
          libraryFee: 2000,
          examFee: 3000,
          developmentFee: 10000,
          total: 75000 // Updated total
        }
      };

      const mockUpdatedFee = {
        feeId,
        ...updateData,
        balance: 75000, // Updated balance
        updatedAt: new Date()
      };

      mockFeeService.updateFeeStructure.mockResolvedValue(mockUpdatedFee);

      const response = await request(app)
        .put(`/api/fees/${feeId}/structure`)
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedFee,
        message: 'Fee structure updated successfully'
      });

      expect(mockFeeService.updateFeeStructure).toHaveBeenCalledWith(feeId, updateData);
    });
  });

  describe('PUT /api/fees/:feeId/due-date', () => {
    test('should successfully update due date', async () => {
      const feeId = 'FEE001';
      const updateData = { dueDate: '2025-01-31' };

      const mockUpdatedFee = {
        feeId,
        dueDate: '2025-01-31',
        updatedAt: new Date()
      };

      mockFeeService.updateDueDate.mockResolvedValue(mockUpdatedFee);

      const response = await request(app)
        .put(`/api/fees/${feeId}/due-date`)
        .set('Authorization', 'Bearer mock-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedFee,
        message: 'Due date updated successfully'
      });

      expect(mockFeeService.updateDueDate).toHaveBeenCalledWith(feeId, updateData.dueDate);
    });
  });

  describe('GET /api/fees/:feeId/payments', () => {
    test('should get payment history', async () => {
      const feeId = 'FEE001';
      const mockPayments = [
        {
          paymentId: 'PAY001',
          amount: 25000,
          paymentMode: 'cash',
          paymentDate: '2024-01-15',
          transactionId: 'TXN001'
        },
        {
          paymentId: 'PAY002',
          amount: 25000,
          paymentMode: 'online',
          paymentDate: '2024-02-15',
          transactionId: 'TXN002'
        }
      ];

      mockFeeService.getPaymentHistory.mockResolvedValue(mockPayments);

      const response = await request(app)
        .get(`/api/fees/${feeId}/payments`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPayments,
        count: 2
      });

      expect(mockFeeService.getPaymentHistory).toHaveBeenCalledWith(feeId);
    });
  });

  describe('GET /api/fees/:feeId/payment/:paymentId/receipt', () => {
    test('should generate payment receipt', async () => {
      const feeId = 'FEE001';
      const paymentId = 'PAY001';
      const mockReceipt = {
        receiptId: 'REC001',
        feeId,
        paymentId,
        amount: 25000,
        paymentDate: '2024-01-15',
        studentInfo: {
          name: 'John Doe',
          rollNumber: 'CS2024001'
        }
      };

      mockFeeService.generateReceipt.mockResolvedValue(mockReceipt);

      const response = await request(app)
        .get(`/api/fees/${feeId}/payment/${paymentId}/receipt`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockReceipt
      });

      expect(mockFeeService.generateReceipt).toHaveBeenCalledWith(feeId, paymentId);
    });
  });
});