const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock dependencies before importing the service
jest.mock('../../src/config/database');
jest.mock('../../src/utils/auth');

const { dbHelpers, collections, resetMocks } = require('../mocks/database');
const studentService = require('../../src/services/studentService');

// Mock auth utilities
const mockAuthUtils = {
  generateStudentId: jest.fn()
};

// Setup mocks
jest.doMock('../../src/config/database', () => ({
  dbHelpers: require('../mocks/database').dbHelpers,
  collections: require('../mocks/database').collections
}));

jest.doMock('../../src/utils/auth', () => mockAuthUtils);

describe('StudentService', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();

    // Setup default mock returns
    mockAuthUtils.generateStudentId.mockReturnValue('STU001');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addStudent', () => {
    test('should successfully add a new student', async () => {
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
            },
            correspondence: {
              street: '123 Main St',
              city: 'City',
              state: 'State',
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
          admissionYear: 2024
        }
      };

      const expectedStudentDoc = {
        studentId: 'STU001',
        ...studentData,
        academicInfo: {
          ...studentData.academicInfo,
          status: 'active'
        },
        documents: {},
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      // Mock no existing student with same roll number
      dbHelpers.getDocuments.mockResolvedValue([]);

      // Mock successful document creation
      dbHelpers.setDocument.mockResolvedValue(expectedStudentDoc);

      const result = await studentService.addStudent(studentData);

      expect(result).toEqual(expectedStudentDoc);

      // Verify database operations
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(collections.STUDENTS, [
        { field: 'academicInfo.rollNumber', operator: '==', value: studentData.academicInfo.rollNumber }
      ]);
      expect(dbHelpers.setDocument).toHaveBeenCalledWith(
        collections.STUDENTS,
        'STU001',
        expectedStudentDoc
      );
    });

    test('should throw error if student with same roll number exists', async () => {
      const studentData = {
        academicInfo: {
          rollNumber: 'CS2024001'
        }
      };

      // Mock existing student
      dbHelpers.getDocuments.mockResolvedValue([{ rollNumber: 'CS2024001' }]);

      await expect(studentService.addStudent(studentData)).rejects.toThrow(
        'Student with this roll number already exists'
      );

      expect(dbHelpers.setDocument).not.toHaveBeenCalled();
    });

    test('should handle database errors during student creation', async () => {
      const studentData = {
        academicInfo: { rollNumber: 'CS2024001' }
      };

      dbHelpers.getDocuments.mockRejectedValue(new Error('Database error'));

      await expect(studentService.addStudent(studentData)).rejects.toThrow(
        'Failed to add student: Database error'
      );
    });
  });

  describe('getStudentById', () => {
    test('should successfully get student by ID', async () => {
      const studentId = 'STU001';
      const mockStudent = {
        studentId,
        personalInfo: { name: 'John Doe' },
        academicInfo: { rollNumber: 'CS2024001' }
      };

      dbHelpers.getDocument.mockResolvedValue(mockStudent);

      const result = await studentService.getStudentById(studentId);

      expect(result).toEqual(mockStudent);
      expect(dbHelpers.getDocument).toHaveBeenCalledWith(collections.STUDENTS, studentId);
    });

    test('should throw error if student not found', async () => {
      const studentId = 'STU999';

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(studentService.getStudentById(studentId)).rejects.toThrow(
        'Student not found'
      );
    });
  });

  describe('getStudentByUserId', () => {
    test('should successfully get student by user ID', async () => {
      const userId = 'user123';
      const mockStudent = {
        studentId: 'STU001',
        userId,
        personalInfo: { name: 'John Doe' }
      };

      dbHelpers.getDocuments.mockResolvedValue([mockStudent]);

      const result = await studentService.getStudentByUserId(userId);

      expect(result).toEqual(mockStudent);
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(collections.STUDENTS, [
        { field: 'userId', operator: '==', value: userId }
      ]);
    });

    test('should throw error if student record not found for user', async () => {
      const userId = 'user999';

      dbHelpers.getDocuments.mockResolvedValue([]);

      await expect(studentService.getStudentByUserId(userId)).rejects.toThrow(
        'Student record not found for this user'
      );
    });
  });

  describe('getAllStudents', () => {
    test('should get all students with no filters', async () => {
      const mockStudents = [
        { studentId: 'STU001', academicInfo: { course: 'CS', semester: 1 } },
        { studentId: 'STU002', academicInfo: { course: 'IT', semester: 2 } }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudents();

      expect(result).toEqual(mockStudents);
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.STUDENTS,
        [],
        { field: 'createdAt', direction: 'desc' }
      );
    });

    test('should get students with course filter', async () => {
      const filters = { course: 'Computer Science Engineering' };
      const mockStudents = [
        { studentId: 'STU001', academicInfo: { course: 'Computer Science Engineering' } }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockStudents);

      const result = await studentService.getAllStudents(filters);

      expect(result).toEqual(mockStudents);
      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.STUDENTS,
        [{ field: 'academicInfo.course', operator: '==', value: 'Computer Science Engineering' }],
        { field: 'createdAt', direction: 'desc' }
      );
    });

    test('should get students with multiple filters', async () => {
      const filters = {
        course: 'Computer Science Engineering',
        semester: '2',
        year: '1',
        status: 'active'
      };

      dbHelpers.getDocuments.mockResolvedValue([]);

      await studentService.getAllStudents(filters);

      expect(dbHelpers.getDocuments).toHaveBeenCalledWith(
        collections.STUDENTS,
        [
          { field: 'academicInfo.course', operator: '==', value: 'Computer Science Engineering' },
          { field: 'academicInfo.semester', operator: '==', value: 2 },
          { field: 'academicInfo.year', operator: '==', value: 1 },
          { field: 'academicInfo.status', operator: '==', value: 'active' }
        ],
        { field: 'createdAt', direction: 'desc' }
      );
    });
  });

  describe('updateStudent', () => {
    test('should successfully update student information', async () => {
      const studentId = 'STU001';
      const updateData = {
        personalInfo: { name: 'Updated Name' },
        academicInfo: { semester: 2 }
      };

      const mockStudent = {
        studentId,
        personalInfo: { name: 'Original Name' },
        academicInfo: { semester: 1 }
      };

      const updatedStudent = {
        ...mockStudent,
        personalInfo: { name: 'Updated Name' },
        academicInfo: { semester: 2 }
      };

      dbHelpers.getDocument.mockResolvedValue(mockStudent);
      dbHelpers.updateDocument.mockResolvedValue(updatedStudent);

      const result = await studentService.updateStudent(studentId, updateData);

      expect(result).toEqual(updatedStudent);
      expect(dbHelpers.updateDocument).toHaveBeenCalledWith(
        collections.STUDENTS,
        studentId,
        updateData
      );
    });

    test('should exclude studentId and userId from updates', async () => {
      const studentId = 'STU001';
      const updateData = {
        studentId: 'STU999',
        userId: 'user999',
        personalInfo: { name: 'Updated Name' }
      };

      const mockStudent = { studentId };

      dbHelpers.getDocument.mockResolvedValue(mockStudent);
      dbHelpers.updateDocument.mockResolvedValue(mockStudent);

      await studentService.updateStudent(studentId, updateData);

      expect(dbHelpers.updateDocument).toHaveBeenCalledWith(
        collections.STUDENTS,
        studentId,
        { personalInfo: { name: 'Updated Name' } }
      );
    });

    test('should throw error if student not found', async () => {
      const studentId = 'STU999';
      const updateData = { personalInfo: { name: 'Updated' } };

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(studentService.updateStudent(studentId, updateData)).rejects.toThrow(
        'Student not found'
      );
    });
  });

  describe('updateStudentStatus', () => {
    test('should successfully update student status', async () => {
      const studentId = 'STU001';
      const status = 'graduated';

      const mockStudent = {
        studentId,
        academicInfo: { status: 'active' }
      };

      const updatedStudent = {
        ...mockStudent,
        academicInfo: { status: 'graduated' }
      };

      dbHelpers.getDocument.mockResolvedValue(mockStudent);
      dbHelpers.updateDocument.mockResolvedValue(updatedStudent);

      const result = await studentService.updateStudentStatus(studentId, status);

      expect(result).toEqual(updatedStudent);
      expect(dbHelpers.updateDocument).toHaveBeenCalledWith(
        collections.STUDENTS,
        studentId,
        { 'academicInfo.status': status }
      );
    });

    test('should throw error for invalid status', async () => {
      const studentId = 'STU001';
      const invalidStatus = 'invalid-status';

      const mockStudent = { studentId };

      dbHelpers.getDocument.mockResolvedValue(mockStudent);

      await expect(studentService.updateStudentStatus(studentId, invalidStatus)).rejects.toThrow(
        'Invalid status. Must be one of: active, graduated, dropped, suspended'
      );

      expect(dbHelpers.updateDocument).not.toHaveBeenCalled();
    });

    test('should throw error if student not found', async () => {
      const studentId = 'STU999';
      const status = 'graduated';

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(studentService.updateStudentStatus(studentId, status)).rejects.toThrow(
        'Student not found'
      );
    });
  });

  describe('searchStudents', () => {
    test('should search students by name', async () => {
      const searchTerm = 'john';
      const mockStudents = [
        {
          studentId: 'STU001',
          personalInfo: { name: 'John Doe', email: 'john@example.com' },
          academicInfo: { rollNumber: 'CS001' }
        },
        {
          studentId: 'STU002',
          personalInfo: { name: 'Jane Smith', email: 'jane@example.com' },
          academicInfo: { rollNumber: 'CS002' }
        }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockStudents);

      const result = await studentService.searchStudents(searchTerm);

      expect(result).toHaveLength(1);
      expect(result[0].personalInfo.name).toBe('John Doe');
    });

    test('should search students by email', async () => {
      const searchTerm = 'jane@example.com';
      const mockStudents = [
        {
          studentId: 'STU001',
          personalInfo: { name: 'John Doe', email: 'john@example.com' },
          academicInfo: { rollNumber: 'CS001' }
        },
        {
          studentId: 'STU002',
          personalInfo: { name: 'Jane Smith', email: 'jane@example.com' },
          academicInfo: { rollNumber: 'CS002' }
        }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockStudents);

      const result = await studentService.searchStudents(searchTerm);

      expect(result).toHaveLength(1);
      expect(result[0].personalInfo.email).toBe('jane@example.com');
    });

    test('should search students by roll number', async () => {
      const searchTerm = 'CS001';
      const mockStudents = [
        {
          studentId: 'STU001',
          personalInfo: { name: 'John Doe', email: 'john@example.com' },
          academicInfo: { rollNumber: 'CS001' }
        }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockStudents);

      const result = await studentService.searchStudents(searchTerm);

      expect(result).toHaveLength(1);
      expect(result[0].academicInfo.rollNumber).toBe('CS001');
    });

    test('should return empty array if no matches found', async () => {
      const searchTerm = 'nonexistent';
      const mockStudents = [
        {
          personalInfo: { name: 'John Doe', email: 'john@example.com' },
          academicInfo: { rollNumber: 'CS001' },
          studentId: 'STU001'
        }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockStudents);

      const result = await studentService.searchStudents(searchTerm);

      expect(result).toHaveLength(0);
    });
  });

  describe('getStudentStatistics', () => {
    test('should calculate student statistics correctly', async () => {
      const mockStudents = [
        {
          academicInfo: {
            status: 'active',
            course: 'Computer Science',
            year: 1,
            semester: 1
          }
        },
        {
          academicInfo: {
            status: 'graduated',
            course: 'Computer Science',
            year: 4,
            semester: 8
          }
        },
        {
          academicInfo: {
            status: 'active',
            course: 'Information Technology',
            year: 2,
            semester: 3
          }
        }
      ];

      dbHelpers.getDocuments.mockResolvedValue(mockStudents);

      const result = await studentService.getStudentStatistics();

      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.graduated).toBe(1);
      expect(result.dropped).toBe(0);
      expect(result.suspended).toBe(0);
      expect(result.byCourse['Computer Science']).toBe(2);
      expect(result.byCourse['Information Technology']).toBe(1);
      expect(result.byYear[1]).toBe(1);
      expect(result.byYear[2]).toBe(1);
      expect(result.byYear[4]).toBe(1);
      expect(result.bySemester[1]).toBe(1);
      expect(result.bySemester[3]).toBe(1);
      expect(result.bySemester[8]).toBe(1);
    });

    test('should handle empty student list', async () => {
      dbHelpers.getDocuments.mockResolvedValue([]);

      const result = await studentService.getStudentStatistics();

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.graduated).toBe(0);
      expect(result.dropped).toBe(0);
      expect(result.suspended).toBe(0);
      expect(Object.keys(result.byCourse)).toHaveLength(0);
      expect(Object.keys(result.byYear)).toHaveLength(0);
      expect(Object.keys(result.bySemester)).toHaveLength(0);
    });
  });

  describe('deleteStudent', () => {
    test('should successfully delete student', async () => {
      const studentId = 'STU001';
      const mockStudent = { studentId };

      dbHelpers.getDocument.mockResolvedValue(mockStudent);
      dbHelpers.deleteDocument.mockResolvedValue(true);

      const result = await studentService.deleteStudent(studentId);

      expect(result.message).toBe('Student deleted successfully');
      expect(dbHelpers.deleteDocument).toHaveBeenCalledWith(collections.STUDENTS, studentId);
    });

    test('should throw error if student not found', async () => {
      const studentId = 'STU999';

      dbHelpers.getDocument.mockResolvedValue(null);

      await expect(studentService.deleteStudent(studentId)).rejects.toThrow(
        'Student not found'
      );

      expect(dbHelpers.deleteDocument).not.toHaveBeenCalled();
    });
  });
});