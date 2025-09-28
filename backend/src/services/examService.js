const { dbHelpers, collections } = require('../config/database');
const { generateUniqueId } = require('../utils/auth');

class ExamService {
  // Create new exam
  async createExam(examData) {
    try {
      const examDoc = {
        examId: generateUniqueId('EXAM'),
        status: 'upcoming',
        ...examData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const exam = await dbHelpers.addDocument(collections.EXAMS, examDoc);
      return exam;
    } catch (error) {
      throw new Error(`Failed to create exam: ${error.message}`);
    }
  }

  // Get exam by ID
  async getExamById(examId) {
    try {
      const exam = await dbHelpers.getDocument(collections.EXAMS, examId);
      if (!exam) {
        throw new Error('Exam not found');
      }
      return exam;
    } catch (error) {
      throw new Error(`Failed to get exam: ${error.message}`);
    }
  }

  // Get all exams with filters
  async getAllExams(filters = {}) {
    try {
      const queryFilters = [];

      if (filters.academicYear) {
        queryFilters.push({ field: 'academicYear', operator: '==', value: filters.academicYear });
      }

      if (filters.semester) {
        queryFilters.push({ field: 'semester', operator: '==', value: parseInt(filters.semester) });
      }

      if (filters.examType) {
        queryFilters.push({ field: 'examType', operator: '==', value: filters.examType });
      }

      if (filters.status) {
        queryFilters.push({ field: 'status', operator: '==', value: filters.status });
      }

      const exams = await dbHelpers.getDocuments(
        collections.EXAMS,
        queryFilters
      );

      // Sort in memory to avoid Firestore index requirement
      return exams.sort((a, b) => {
        return new Date(b.startDate) - new Date(a.startDate);
      });
    } catch (error) {
      throw new Error(`Failed to get exams: ${error.message}`);
    }
  }

  // Register student for exam
  async registerStudentForExam(examId, studentId, registeredSubjects) {
    try {
      // Verify exam exists
      const exam = await dbHelpers.getDocument(collections.EXAMS, examId);
      if (!exam) {
        throw new Error('Exam not found');
      }

      // Check if registration is open
      const currentDate = new Date();
      const regStartDate = exam.registrationStartDate.toDate ? exam.registrationStartDate.toDate() : new Date(exam.registrationStartDate);
      const regEndDate = exam.registrationEndDate.toDate ? exam.registrationEndDate.toDate() : new Date(exam.registrationEndDate);

      if (currentDate < regStartDate) {
        throw new Error('Registration has not started yet');
      }

      if (currentDate > regEndDate) {
        throw new Error('Registration period has ended');
      }

      // Verify student exists and get details
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      console.log('Student data:', {
        studentId,
        course: student.academicInfo?.course,
        branch: student.academicInfo?.branch,
        academicInfo: student.academicInfo
      });
      console.log('Exam data:', {
        examId,
        eligibleCourses: exam.eligibleCourses,
        examType: exam.examType
      });

      // Check if student is eligible (branch match, not course)
      const studentBranch = student.academicInfo.branch;
      if (!exam.eligibleCourses.includes(studentBranch)) {
        throw new Error(`Student is not eligible for this exam. Student branch: "${studentBranch}", Eligible branches: [${exam.eligibleCourses.join(', ')}]`);
      }

      // Check if student is already registered for this exam
      const existingRegistrations = await dbHelpers.getDocuments(collections.EXAM_REGISTRATIONS, [
        { field: 'examId', operator: '==', value: examId },
        { field: 'studentId', operator: '==', value: studentId }
      ]);

      if (existingRegistrations.length > 0) {
        throw new Error('Student is already registered for this exam');
      }

      // Validate subjects
      const validSubjects = exam.subjects.map(s => s.subjectCode);
      const invalidSubjects = registeredSubjects.filter(s => !validSubjects.includes(s.subjectCode));

      if (invalidSubjects.length > 0) {
        throw new Error(`Invalid subjects: ${invalidSubjects.map(s => s.subjectCode).join(', ')}`);
      }

      // Calculate total fee (if applicable)
      const totalFee = registeredSubjects.length * 100; // Example: ₹100 per subject

      const registrationDoc = {
        registrationId: generateUniqueId('REG'),
        examId,
        studentId,
        registeredSubjects: registeredSubjects.map(subject => ({
          ...subject,
          isEligible: true,
          registrationFee: 100
        })),
        totalFee,
        paymentStatus: 'pending',
        registrationDate: new Date(),
        status: 'registered',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const registration = await dbHelpers.addDocument(collections.EXAM_REGISTRATIONS, registrationDoc);
      return registration;
    } catch (error) {
      throw new Error(`Failed to register student for exam: ${error.message}`);
    }
  }

  // Get exam schedule for students
  async getExamSchedule(filters = {}) {
    try {
      const queryFilters = [];

      if (filters.studentId) {
        // Get student's registered exams
        const registrations = await dbHelpers.getDocuments(collections.EXAM_REGISTRATIONS, [
          { field: 'studentId', operator: '==', value: filters.studentId },
          { field: 'status', operator: '==', value: 'registered' }
        ]);

        const examIds = registrations.map(reg => reg.examId);
        if (examIds.length === 0) {
          return [];
        }

        // Get exam details for registered exams
        const exams = await dbHelpers.getDocuments(collections.EXAMS);
        const studentExams = exams.filter(exam => examIds.includes(exam.id));

        return studentExams.map(exam => {
          const registration = registrations.find(reg => reg.examId === exam.id);
          return {
            ...exam,
            registeredSubjects: registration.registeredSubjects
          };
        });
      } else {
        // Get all exams
        if (filters.academicYear) {
          queryFilters.push({ field: 'academicYear', operator: '==', value: filters.academicYear });
        }

        if (filters.semester) {
          queryFilters.push({ field: 'semester', operator: '==', value: parseInt(filters.semester) });
        }

        const exams = await dbHelpers.getDocuments(
          collections.EXAMS,
          queryFilters
        );

        // Sort in memory to avoid Firestore index requirement
        return exams.sort((a, b) => {
          return new Date(a.startDate) - new Date(b.startDate);
        });
      }
    } catch (error) {
      throw new Error(`Failed to get exam schedule: ${error.message}`);
    }
  }

  // Get registered students for an exam
  async getRegisteredStudents(examId) {
    try {
      const exam = await dbHelpers.getDocument(collections.EXAMS, examId);
      if (!exam) {
        throw new Error('Exam not found');
      }

      const registrations = await dbHelpers.getDocuments(collections.EXAM_REGISTRATIONS, [
        { field: 'examId', operator: '==', value: examId },
        { field: 'status', operator: '==', value: 'registered' }
      ]);

      // Get student details for each registration
      const studentRegistrations = [];
      for (const registration of registrations) {
        const student = await dbHelpers.getDocument(collections.STUDENTS, registration.studentId);
        if (student) {
          studentRegistrations.push({
            registration,
            student: {
              studentId: student.studentId,
              name: student.personalInfo.name,
              rollNumber: student.academicInfo.rollNumber,
              course: student.academicInfo.course,
              branch: student.academicInfo.branch,
              semester: student.academicInfo.semester
            }
          });
        }
      }

      return studentRegistrations;
    } catch (error) {
      throw new Error(`Failed to get registered students: ${error.message}`);
    }
  }

  // Update exam status
  async updateExamStatus(examId, status) {
    try {
      const exam = await dbHelpers.getDocument(collections.EXAMS, examId);
      if (!exam) {
        throw new Error('Exam not found');
      }

      const validStatuses = ['upcoming', 'registration_open', 'ongoing', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const updatedExam = await dbHelpers.updateDocument(collections.EXAMS, examId, { status });
      return updatedExam;
    } catch (error) {
      throw new Error(`Failed to update exam status: ${error.message}`);
    }
  }

  // Cancel exam registration
  async cancelRegistration(registrationId) {
    try {
      const registration = await dbHelpers.getDocument(collections.EXAM_REGISTRATIONS, registrationId);
      if (!registration) {
        throw new Error('Registration not found');
      }

      if (registration.status !== 'registered') {
        throw new Error('Registration cannot be cancelled');
      }

      const updatedRegistration = await dbHelpers.updateDocument(collections.EXAM_REGISTRATIONS, registrationId, {
        status: 'cancelled'
      });

      return updatedRegistration;
    } catch (error) {
      throw new Error(`Failed to cancel registration: ${error.message}`);
    }
  }

  // Get student's exam registrations
  async getStudentRegistrations(studentId) {
    try {
      const registrations = await dbHelpers.getDocuments(collections.EXAM_REGISTRATIONS, [
        { field: 'studentId', operator: '==', value: studentId }
      ]);

      // Sort in memory to avoid Firestore index requirement
      const sortedRegistrations = registrations.sort((a, b) => {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      });

      // Get exam details for each registration
      const studentRegistrations = [];
      for (const registration of sortedRegistrations) {
        const exam = await dbHelpers.getDocument(collections.EXAMS, registration.examId);
        if (exam) {
          studentRegistrations.push({
            registration,
            exam
          });
        }
      }

      return studentRegistrations;
    } catch (error) {
      throw new Error(`Failed to get student registrations: ${error.message}`);
    }
  }

  // Update exam details
  async updateExam(examId, updateData) {
    try {
      const exam = await dbHelpers.getDocument(collections.EXAMS, examId);
      if (!exam) {
        throw new Error('Exam not found');
      }

      // Don't allow updating examId
      const { examId: _, ...allowedUpdates } = updateData;

      const updatedExam = await dbHelpers.updateDocument(collections.EXAMS, examId, allowedUpdates);
      return updatedExam;
    } catch (error) {
      throw new Error(`Failed to update exam: ${error.message}`);
    }
  }

  // Get exam statistics
  async getExamStatistics() {
    try {
      const exams = await dbHelpers.getDocuments(collections.EXAMS);
      const registrations = await dbHelpers.getDocuments(collections.EXAM_REGISTRATIONS);

      const stats = {
        totalExams: exams.length,
        upcomingExams: 0,
        ongoingExams: 0,
        completedExams: 0,
        totalRegistrations: registrations.length,
        activeRegistrations: registrations.filter(r => r.status === 'registered').length,
        cancelledRegistrations: registrations.filter(r => r.status === 'cancelled').length,
        examsByType: {},
        examsBySemester: {}
      };

      exams.forEach(exam => {
        // Status counts
        if (exam.status === 'upcoming' || exam.status === 'registration_open') {
          stats.upcomingExams++;
        } else if (exam.status === 'ongoing') {
          stats.ongoingExams++;
        } else if (exam.status === 'completed') {
          stats.completedExams++;
        }

        // Type counts
        stats.examsByType[exam.examType] = (stats.examsByType[exam.examType] || 0) + 1;

        // Semester counts
        stats.examsBySemester[exam.semester] = (stats.examsBySemester[exam.semester] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get exam statistics: ${error.message}`);
    }
  }

  // Delete exam
  async deleteExam(examId) {
    try {
      const exam = await dbHelpers.getDocument(collections.EXAMS, examId);
      if (!exam) {
        throw new Error('Exam not found');
      }

      // Check if there are any registrations
      const registrations = await dbHelpers.getDocuments(collections.EXAM_REGISTRATIONS, [
        { field: 'examId', operator: '==', value: examId }
      ]);

      if (registrations.length > 0) {
        throw new Error('Cannot delete exam with existing registrations');
      }

      await dbHelpers.deleteDocument(collections.EXAMS, examId);
      return { message: 'Exam deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete exam: ${error.message}`);
    }
  }
}

module.exports = new ExamService();