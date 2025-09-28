const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock dependencies before importing the service
jest.mock('../../src/config/database');
jest.mock('../../src/utils/auth');

const { dbHelpers, collections, resetMocks } = require('../mocks/database');
const feeService = require('../../src/services/feeService');

// Mock auth utilities
const mockAuthUtils = {
  generateUniqueId: jest.fn()
};

// Setup mocks
jest.doMock('../../src/config/database', () => ({
  dbHelpers: require('../mocks/database').dbHelpers,
  collections: require('../mocks/database').collections
}));

jest.doMock('../../src/utils/auth', () => mockAuthUtils);

describe('FeeService', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();

    // Setup default mock returns
    mockAuthUtils.generateUniqueId.mockReturnValue('FEE001');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createFeeStructure', () => {
    test('should successfully create fee structure', async () => {
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
        }
      };

      const expectedFeeDoc = {
        feeId: 'FEE001',
        ...feeData,
        status: 'pending',
        totalPaid: 0,
        balance: 70000,
        payments: [],
        dueDate: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      dbHelpers.addDocument.mockResolvedValue(expectedFeeDoc);

      const result = await feeService.createFeeStructure(feeData);

      expect(result).toEqual(expectedFeeDoc);
      expect(dbHelpers.addDocument).toHaveBeenCalledWith(collections.FEES, expectedFeeDoc);
    });

    test('should handle database errors during fee creation', async () => {
      const feeData = { studentId: 'STU001' };

      dbHelpers.addDocument.mockRejectedValue(new Error('Database error'));

      await expect(feeService.createFeeStructure(feeData)).rejects.toThrow(
        'Failed to create fee structure: Database error'
      );
    });
  });

  describe('getFeesByStudentId', () => {
    test('should get fees for a student', async () => {
      const studentId = 'STU001';
      const mockFees = [
        { feeId: 'FEE001', studentId, academicYear: '2024-25', semester: 1 },
        { feeId: 'FEE002', studentId, academicYear: '2024-25', semester: 2 }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockFees);

      const result = await feeService.getFeesByStudentId(studentId);

      expect(result).toEqual(mockFees);
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(collections.FEES, [
        { field: 'studentId', operator: '==', value: studentId }
      ]);
    });

    test('should return empty array if no fees found', async () => {
      const studentId = 'STU999';

      dbHelpers.getDocuments.mockResolvedValue([]);

      const result = await feeService.getFeesByStudentId(studentId);

      expect(result).toEqual([]);
    });
  });

  describe('recordPayment', () => {
    test('should successfully record a payment', async () => {
      const feeId = 'FEE001';
      const paymentData = {
        amount: 25000,
        paymentMode: 'cash',
        transactionId: 'TXN001',
        receiptNumber: 'REC001'
      };

      const mockFee = {
        feeId,
        feeStructure: { total: 70000 },
        totalPaid: 0,
        balance: 70000,
        payments: []
      };

      const paymentRecord = {
        paymentId: 'PAY001',
        ...paymentData,
        paymentDate: expect.any(Date),
        createdAt: expect.any(Date)
      };

      const updatedFee = {
        ...mockFee,
        totalPaid: 25000,
        balance: 45000,
        status: 'partial',
        payments: [paymentRecord],
        updatedAt: expect.any(Date)
      };

      dbHelpers.getDocument.mockResolvedValue(mockFee);
      dbHelpers.updateDocument.mockResolvedValue(updatedFee);

      const result = await feeService.recordPayment(feeId, paymentData);

      expect(result).toEqual(updatedFee);
      expect(dbHelpers.updateDocument).toHaveBeenCalledWith(
        collections.FEES,
        feeId,
        expect.objectContaining({
          totalPaid: 25000,
          balance: 45000,
          status: 'partial',
          payments: expect.arrayContaining([
            expect.objectContaining({
              amount: 25000,
              paymentMode: 'cash'
            })
          ])
        })
      );
    });

    test('should mark fee as completed when fully paid', async () => {
      const feeId = 'FEE001';
      const paymentData = { amount: 70000, paymentMode: 'cash' };

      const mockFee = {
        feeId,
        feeStructure: { total: 70000 },
        totalPaid: 0,
        balance: 70000,
        payments: []
      };

      dbHelpers.getDocument.mockResolvedValue(mockFee);
      dbHelpers.updateDocument.mockResolvedValue({
        ...mockFee,
        totalPaid: 70000,
        balance: 0,
        status: 'completed'
      });

      const result = await feeService.recordPayment(feeId, paymentData);

      expect(result.status).toBe('completed');
      expect(result.balance).toBe(0);
    });

    test('should throw error if fee not found', async () => {
      const feeId = 'FEE999';
      const paymentData = { amount: 1000, paymentMode: 'cash' };

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(feeService.recordPayment(feeId, paymentData)).rejects.toThrow(
        'Fee record not found'
      );
    });

    test('should throw error if payment amount exceeds balance', async () => {
      const feeId = 'FEE001';
      const paymentData = { amount: 80000, paymentMode: 'cash' };

      const mockFee = {
        feeId,
        balance: 70000
      };

      dbHelpers.getDocument.mockResolvedValue(mockFee);

      await expect(feeService.recordPayment(feeId, paymentData)).rejects.toThrow(
        'Payment amount cannot exceed balance'
      );
    });
  });

  describe('getFeeStatistics', () => {
    test('should calculate fee statistics correctly', async () => {
      const mockFees = [
        { status: 'completed', feeStructure: { total: 70000 }, totalPaid: 70000, balance: 0 },
        { status: 'partial', feeStructure: { total: 70000 }, totalPaid: 35000, balance: 35000 },
        { status: 'pending', feeStructure: { total: 70000 }, totalPaid: 0, balance: 70000 }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockFees);

      const result = await feeService.getFeeStatistics();

      expect(result).toEqual({
        totalFees: 3,
        completedFees: 1,
        partialFees: 1,
        pendingFees: 1,
        totalAmount: 210000,
        totalCollected: 105000,
        totalPending: 105000
      });
    });

    test('should handle empty fee list', async () => {
      dbHelpers.getDocuments.mockResolvedValue([]);

      const result = await feeService.getFeeStatistics();

      expect(result).toEqual({
        totalFees: 0,
        completedFees: 0,
        partialFees: 0,
        pendingFees: 0,
        totalAmount: 0,
        totalCollected: 0,
        totalPending: 0
      });
    });
  });
});