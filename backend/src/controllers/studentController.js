const studentService = require('../services/studentService');
const { asyncHandler } = require('../middleware/errorHandler');
const { ROLES } = require('../utils/auth');

// Add new student
const addStudent = asyncHandler(async (req, res) => {
  const student = await studentService.addStudent(req.validatedData);

  res.status(201).json({
    success: true,
    message: 'Student added successfully',
    data: student
  });
});

// Get student by ID
const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.studentId);

  res.status(200).json({
    success: true,
    message: 'Student retrieved successfully',
    data: student
  });
});

// Get all students with optional filters
const getAllStudents = asyncHandler(async (req, res) => {
  const filters = {
    course: req.query.course,
    branch: req.query.branch,
    semester: req.query.semester,
    year: req.query.year,
    status: req.query.status
  };

  const students = await studentService.getAllStudents(filters);

  res.status(200).json({
    success: true,
    message: 'Students retrieved successfully',
    data: students,
    count: students.length
  });
});

// Get current student's own details (for student role)
const getMyDetails = asyncHandler(async (req, res) => {
  // Only students can access this endpoint
  if (req.userRole !== ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only for students'
    });
  }

  console.log('getMyDetails called for userId:', req.userId, 'role:', req.userRole);

  try {
    const student = await studentService.getStudentByUserId(req.userId);

    res.status(200).json({
      success: true,
      message: 'Student details retrieved successfully',
      data: student
    });
  } catch (error) {
    console.error('Error in getMyDetails:', error);

    // Return specific error for missing student records
    if (error.message.includes('Student record not found')) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found. Your account may not be linked to a student profile. Please contact the administrator.',
        errorCode: 'STUDENT_NOT_LINKED'
      });
    }

    // Re-throw other errors to be handled by asyncHandler
    throw error;
  }
});

// Update student information
const updateStudent = asyncHandler(async (req, res) => {
  const updatedStudent = await studentService.updateStudent(req.params.studentId, req.body);

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: updatedStudent
  });
});

// Update student academic status
const updateStudentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updatedStudent = await studentService.updateStudentStatus(req.params.studentId, status);

  res.status(200).json({
    success: true,
    message: 'Student status updated successfully',
    data: updatedStudent
  });
});

// Upload student documents
const uploadDocuments = asyncHandler(async (req, res) => {
  const { documents } = req.body;
  const updatedStudent = await studentService.uploadStudentDocuments(req.params.studentId, documents);

  res.status(200).json({
    success: true,
    message: 'Documents uploaded successfully',
    data: updatedStudent
  });
});

// Search students
const searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search term must be at least 2 characters long'
    });
  }

  const students = await studentService.searchStudents(q.trim());

  res.status(200).json({
    success: true,
    message: 'Search results retrieved successfully',
    data: students,
    count: students.length
  });
});

// Get students by course and semester
const getStudentsByCourseAndSemester = asyncHandler(async (req, res) => {
  const { course, semester } = req.params;
  const students = await studentService.getStudentsByCourseAndSemester(course, semester);

  res.status(200).json({
    success: true,
    message: 'Students retrieved successfully',
    data: students,
    count: students.length
  });
});

// Get student statistics
const getStudentStatistics = asyncHandler(async (req, res) => {
  const stats = await studentService.getStudentStatistics();

  res.status(200).json({
    success: true,
    message: 'Student statistics retrieved successfully',
    data: stats
  });
});

// Delete student
const deleteStudent = asyncHandler(async (req, res) => {
  const result = await studentService.deleteStudent(req.params.studentId);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

// Diagnostic endpoint to check student-user links
const diagnoseLinks = asyncHandler(async (req, res) => {
  const diagnosis = await studentService.diagnoseStudentUserLinks();

  res.status(200).json({
    success: true,
    message: 'Diagnosis completed',
    data: diagnosis
  });
});

// Link existing student to existing user
const linkStudentToUser = asyncHandler(async (req, res) => {
  const { studentId, userEmail } = req.body;

  if (!studentId || !userEmail) {
    return res.status(400).json({
      success: false,
      message: 'Student ID and user email are required'
    });
  }

  const result = await studentService.linkStudentToUser(studentId, userEmail);

  res.status(200).json({
    success: true,
    message: result.message,
    data: result
  });
});

module.exports = {
  addStudent,
  getStudentById,
  getAllStudents,
  getMyDetails,
  updateStudent,
  updateStudentStatus,
  uploadDocuments,
  searchStudents,
  getStudentsByCourseAndSemester,
  getStudentStatistics,
  deleteStudent,
  diagnoseLinks,
  linkStudentToUser
};