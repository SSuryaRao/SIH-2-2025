const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock dependencies before importing the service
jest.mock('../../src/config/database');
jest.mock('../../src/utils/auth');

const { dbHelpers, collections, resetMocks } = require('../mocks/database');
const examService = require('../../src/services/examService');

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

describe('ExamService', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();

    // Setup default mock returns
    mockAuthUtils.generateUniqueId.mockReturnValue('EXAM001');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createExam', () => {
    test('should successfully create a new exam', async () => {
      const examData = {
        name: 'Mid-Term Exam',
        examType: 'internal',
        academicYear: '2024-25',
        semester: 1,
        startDate: '2024-11-01',
        endDate: '2024-11-15',
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
        ],
        eligibleCourses: ['Computer Science Engineering']
      };

      const expectedExamDoc = {
        examId: 'EXAM001',
        status: 'upcoming',
        ...examData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      dbHelpers.addDocument.mockResolvedValue(expectedExamDoc);

      const result = await examService.createExam(examData);

      expect(result).toEqual(expectedExamDoc);
      expect(dbHelpers.addDocument).toHaveBeenCalledWith(collections.EXAMS, expectedExamDoc);
    });

    test('should handle database errors during exam creation', async () => {
      const examData = { name: 'Test Exam' };

      dbHelpers.addDocument.mockRejectedValue(new Error('Database error'));

      await expect(examService.createExam(examData)).rejects.toThrow(
        'Failed to create exam: Database error'
      );
    });
  });

  describe('getExamById', () => {
    test('should successfully get exam by ID', async () => {
      const examId = 'EXAM001';
      const mockExam = {
        examId,
        name: 'Mid-Term Exam',
        status: 'upcoming'
      };

      dbHelpers.getDocument.mockResolvedValue(mockExam);

      const result = await examService.getExamById(examId);

      expect(result).toEqual(mockExam);
      expect(dbHelpers.getDocument).toHaveBeenCalledWith(collections.EXAMS, examId);
    });

    test('should throw error if exam not found', async () => {
      const examId = 'EXAM999';

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(examService.getExamById(examId)).rejects.toThrow(
        'Exam not found'
      );
    });
  });

  describe('getAllExams', () => {
    test('should get all exams with no filters', async () => {
      const mockExams = [
        { examId: 'EXAM001', name: 'Exam 1' },
        { examId: 'EXAM002', name: 'Exam 2' }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockExams);

      const result = await examService.getAllExams();

      expect(result).toEqual(mockExams);
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.EXAMS,
        [],
        { field: 'createdAt', direction: 'desc' }
      );
    });

    test('should get exams with filters', async () => {
      const filters = {
        academicYear: '2024-25',
        semester: '1',
        examType: 'internal',
        status: 'upcoming'
      };

      const mockExams = [{ examId: 'EXAM001', name: 'Filtered Exam' }];

      dbHelpers.getDocuments.mockResolvedValue(mockExams);

      const result = await examService.getAllExams(filters);

      expect(result).toEqual(mockExams);
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.EXAMS,
        [
          { field: 'academicYear', operator: '==', value: '2024-25' },
          { field: 'semester', operator: '==', value: 1 },
          { field: 'examType', operator: '==', value: 'internal' },
          { field: 'status', operator: '==', value: 'upcoming' }
        ],
        { field: 'createdAt', direction: 'desc' }
      );
    });
  });
});