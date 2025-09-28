const { dbHelpers, collections } = require('../config/database');
const { generateStudentId } = require('../utils/auth');
const userService = require('./userService');

class StudentService {
  // Add new student
  async addStudent(studentData) {
    try {
      // Generate unique student ID
      const studentId = generateStudentId();

      // Check if roll number already exists
      const existingStudents = await dbHelpers.getDocuments(collections.STUDENTS, [
        { field: 'academicInfo.rollNumber', operator: '==', value: studentData.academicInfo.rollNumber }
      ]);

      if (existingStudents.length > 0) {
        throw new Error('Student with this roll number already exists');
      }

      // Check if email already exists
      const existingStudentsByEmail = await dbHelpers.getDocuments(collections.STUDENTS, [
        { field: 'personalInfo.email', operator: '==', value: studentData.personalInfo.email }
      ]);

      if (existingStudentsByEmail.length > 0) {
        throw new Error('Student with this email already exists');
      }

      // Handle user account creation/linking
      let userId = null;

      // First, check if a user with this email already exists
      const existingUsers = await dbHelpers.getDocuments(collections.USERS, [
        { field: 'email', operator: '==', value: studentData.personalInfo.email }
      ]);

      if (existingUsers.length > 0) {
        // User already exists - link to existing user
        const existingUser = existingUsers[0];
        userId = existingUser.id || existingUser.uid;
        console.log('Linking to existing user account with ID:', userId);

        // Verify the existing user has student role
        if (existingUser.role !== 'student') {
          console.warn(`Warning: Existing user has role '${existingUser.role}', not 'student'`);
          // You might want to throw an error here or update the role
          throw new Error(`Cannot create student record. Email belongs to a user with role '${existingUser.role}'. Please use a different email or contact administrator.`);
        }
      } else {
        // No existing user - create new user account
        try {
          const tempPassword = `${studentData.academicInfo.rollNumber}@123`;

          const userData = {
            name: studentData.personalInfo.name,
            email: studentData.personalInfo.email,
            password: tempPassword,
            role: 'student',
            profile: {
              phone: studentData.personalInfo.phone,
              department: studentData.academicInfo.branch,
              rollNumber: studentData.academicInfo.rollNumber,
              semester: studentData.academicInfo.semester
            }
          };

          const userResult = await userService.registerUser(userData);
          userId = userResult.user.id || userResult.user.uid;
          console.log('Created new user account with ID:', userId);
        } catch (userError) {
          console.error('Failed to create user account:', userError.message);
          throw new Error(`Failed to create user account: ${userError.message}. Please ensure the email is not already in use.`);
        }
      }

      // Create student document
      const studentDoc = {
        studentId,
        userId, // Link to user account if created successfully
        ...studentData,
        academicInfo: {
          ...studentData.academicInfo,
          status: 'active'
        },
        documents: studentData.documents || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const student = await dbHelpers.setDocument(collections.STUDENTS, studentId, studentDoc);
      return student;
    } catch (error) {
      throw new Error(`Failed to add student: ${error.message}`);
    }
  }

  // Get student by ID
  async getStudentById(studentId) {
    try {
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    } catch (error) {
      throw new Error(`Failed to get student: ${error.message}`);
    }
  }

  // Get student by user ID
  async getStudentByUserId(userId) {
    try {
      console.log('Looking for student with userId:', userId);

      const students = await dbHelpers.getDocuments(collections.STUDENTS, [
        { field: 'userId', operator: '==', value: userId }
      ]);

      console.log('Found students:', students.length);

      if (students.length === 0) {
        // Let's also try to find by email if userId link is missing
        const users = await dbHelpers.getDocuments('users', [
          { field: 'id', operator: '==', value: userId }
        ]);

        if (users.length > 0) {
          const userEmail = users[0].email;
          console.log('User email:', userEmail);

          const studentsByEmail = await dbHelpers.getDocuments(collections.STUDENTS, [
            { field: 'personalInfo.email', operator: '==', value: userEmail }
          ]);

          console.log('Found students by email:', studentsByEmail.length);

          if (studentsByEmail.length > 0) {
            // Update the student record with the userId for future lookups
            const student = studentsByEmail[0];
            await dbHelpers.updateDocument(collections.STUDENTS, student.id, { userId });
            return student;
          }
        }

        throw new Error(`Student record not found for user ID: ${userId}. Please contact administrator to link your account.`);
      }

      return students[0];
    } catch (error) {
      console.error('Error in getStudentByUserId:', error);
      throw new Error(`Failed to get student by user ID: ${error.message}`);
    }
  }

  // Get all students with filters
  async getAllStudents(filters = {}) {
    try {
      const queryFilters = [];

      // Add course filter
      if (filters.course) {
        queryFilters.push({ field: 'academicInfo.course', operator: '==', value: filters.course });
      }

      // Add branch filter
      if (filters.branch) {
        queryFilters.push({ field: 'academicInfo.branch', operator: '==', value: filters.branch });
      }

      // Add semester filter
      if (filters.semester) {
        queryFilters.push({ field: 'academicInfo.semester', operator: '==', value: parseInt(filters.semester) });
      }

      // Add year filter
      if (filters.year) {
        queryFilters.push({ field: 'academicInfo.year', operator: '==', value: parseInt(filters.year) });
      }

      // Add status filter
      if (filters.status) {
        queryFilters.push({ field: 'academicInfo.status', operator: '==', value: filters.status });
      }

      const students = await dbHelpers.getDocuments(
        collections.STUDENTS,
        queryFilters,
        { field: 'createdAt', direction: 'desc' }
      );

      return students;
    } catch (error) {
      throw new Error(`Failed to get students: ${error.message}`);
    }
  }

  // Update student information
  async updateStudent(studentId, updateData) {
    try {
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Don't allow updating studentId or userId
      const { studentId: _, userId: __, ...allowedUpdates } = updateData;

      const updatedStudent = await dbHelpers.updateDocument(collections.STUDENTS, studentId, allowedUpdates);
      return updatedStudent;
    } catch (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  // Update student academic status
  async updateStudentStatus(studentId, status) {
    try {
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const validStatuses = ['active', 'graduated', 'dropped', 'suspended'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be one of: active, graduated, dropped, suspended');
      }

      const updatedStudent = await dbHelpers.updateDocument(collections.STUDENTS, studentId, {
        'academicInfo.status': status
      });

      return updatedStudent;
    } catch (error) {
      throw new Error(`Failed to update student status: ${error.message}`);
    }
  }

  // Upload student documents
  async uploadStudentDocuments(studentId, documents) {
    try {
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const updatedDocuments = {
        ...student.documents,
        ...documents
      };

      const updatedStudent = await dbHelpers.updateDocument(collections.STUDENTS, studentId, {
        documents: updatedDocuments
      });

      return updatedStudent;
    } catch (error) {
      throw new Error(`Failed to upload documents: ${error.message}`);
    }
  }

  // Search students by name, email, or roll number
  async searchStudents(searchTerm) {
    try {
      // Since Firestore doesn't support full-text search, we'll get all students and filter
      // In a production app, you might want to use Algolia or similar for better search
      const allStudents = await dbHelpers.getDocuments(collections.STUDENTS);

      const searchRegex = new RegExp(searchTerm, 'i');
      const filteredStudents = allStudents.filter(student =>
        searchRegex.test(student.personalInfo.name) ||
        searchRegex.test(student.personalInfo.email) ||
        searchRegex.test(student.academicInfo.rollNumber) ||
        searchRegex.test(student.studentId)
      );

      return filteredStudents;
    } catch (error) {
      throw new Error(`Failed to search students: ${error.message}`);
    }
  }

  // Get students by course and semester (for exam registration)
  async getStudentsByCourseAndSemester(course, semester) {
    try {
      const students = await dbHelpers.getDocuments(collections.STUDENTS, [
        { field: 'academicInfo.course', operator: '==', value: course },
        { field: 'academicInfo.semester', operator: '==', value: parseInt(semester) },
        { field: 'academicInfo.status', operator: '==', value: 'active' }
      ]);

      return students;
    } catch (error) {
      throw new Error(`Failed to get students by course and semester: ${error.message}`);
    }
  }

  // Get student statistics
  async getStudentStatistics() {
    try {
      const allStudents = await dbHelpers.getDocuments(collections.STUDENTS);

      const stats = {
        total: allStudents.length,
        active: 0,
        graduated: 0,
        dropped: 0,
        suspended: 0,
        byCourse: {},
        byYear: {},
        bySemester: {}
      };

      allStudents.forEach(student => {
        const status = student.academicInfo.status;
        const course = student.academicInfo.course;
        const year = student.academicInfo.year;
        const semester = student.academicInfo.semester;

        // Status counts
        if (stats[status] !== undefined) {
          stats[status]++;
        }

        // Course counts
        stats.byCourse[course] = (stats.byCourse[course] || 0) + 1;

        // Year counts
        stats.byYear[year] = (stats.byYear[year] || 0) + 1;

        // Semester counts
        stats.bySemester[semester] = (stats.bySemester[semester] || 0) + 1;
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get student statistics: ${error.message}`);
    }
  }

  // Delete student record
  async deleteStudent(studentId) {
    try {
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      await dbHelpers.deleteDocument(collections.STUDENTS, studentId);
      return { message: 'Student deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  // Diagnostic method to check students and their linked users
  async diagnoseStudentUserLinks() {
    try {
      const allStudents = await dbHelpers.getDocuments(collections.STUDENTS);
      const allUsers = await dbHelpers.getDocuments(collections.USERS);

      console.log('=== STUDENT-USER LINK DIAGNOSIS ===');
      console.log(`Total students: ${allStudents.length}`);
      console.log(`Total users: ${allUsers.length}`);

      const studentsWithUserId = allStudents.filter(s => s.userId);
      const studentsWithoutUserId = allStudents.filter(s => !s.userId);

      console.log(`Students with userId: ${studentsWithUserId.length}`);
      console.log(`Students without userId: ${studentsWithoutUserId.length}`);

      if (studentsWithoutUserId.length > 0) {
        console.log('\nStudents without userId:');
        studentsWithoutUserId.forEach(student => {
          console.log(`- ${student.personalInfo?.name || 'Unknown'} (${student.personalInfo?.email || 'No email'})`);
        });
      }

      return {
        totalStudents: allStudents.length,
        totalUsers: allUsers.length,
        studentsWithUserId: studentsWithUserId.length,
        studentsWithoutUserId: studentsWithoutUserId.length,
        unlinkedStudents: studentsWithoutUserId.map(s => ({
          name: s.personalInfo?.name,
          email: s.personalInfo?.email,
          rollNumber: s.academicInfo?.rollNumber
        }))
      };
    } catch (error) {
      throw new Error(`Failed to diagnose student-user links: ${error.message}`);
    }
  }

  // Link existing student to existing user (admin function)
  async linkStudentToUser(studentId, userEmail) {
    try {
      // Get student record
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Get user by email
      const users = await dbHelpers.getDocuments(collections.USERS, [
        { field: 'email', operator: '==', value: userEmail }
      ]);

      if (users.length === 0) {
        throw new Error('User not found with this email');
      }

      const user = users[0];

      // Verify user is a student
      if (user.role !== 'student') {
        throw new Error(`Cannot link to user with role '${user.role}'. User must have 'student' role.`);
      }

      // Check if student already has a userId
      if (student.userId) {
        throw new Error(`Student is already linked to user ID: ${student.userId}`);
      }

      // Check if user is already linked to another student
      const existingStudentsWithThisUserId = await dbHelpers.getDocuments(collections.STUDENTS, [
        { field: 'userId', operator: '==', value: user.id }
      ]);

      if (existingStudentsWithThisUserId.length > 0) {
        throw new Error(`User is already linked to another student: ${existingStudentsWithThisUserId[0].personalInfo.name}`);
      }

      // Update student record with userId
      const updatedStudent = await dbHelpers.updateDocument(collections.STUDENTS, studentId, {
        userId: user.id || user.uid,
        updatedAt: new Date()
      });

      console.log(`Successfully linked student ${student.personalInfo.name} to user ${userEmail}`);

      return {
        message: 'Student successfully linked to user account',
        student: updatedStudent,
        linkedUserId: user.id || user.uid
      };
    } catch (error) {
      throw new Error(`Failed to link student to user: ${error.message}`);
    }
  }
}

module.exports = new StudentService();