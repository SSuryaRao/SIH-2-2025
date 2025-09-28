const examService = require('../services/examService');
const { asyncHandler } = require('../middleware/errorHandler');
const { ROLES } = require('../utils/auth');

// Create new exam
const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body);

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: exam
  });
});

// Get exam by ID
const getExamById = asyncHandler(async (req, res) => {
  const exam = await examService.getExamById(req.params.examId);

  res.status(200).json({
    success: true,
    message: 'Exam details retrieved successfully',
    data: exam
  });
});

// Get all exams with filters
const getAllExams = asyncHandler(async (req, res) => {
  const filters = {
    academicYear: req.query.academicYear,
    semester: req.query.semester,
    examType: req.query.examType,
    status: req.query.status
  };

  const exams = await examService.getAllExams(filters);

  res.status(200).json({
    success: true,
    message: 'Exams retrieved successfully',
    data: exams,
    count: exams.length
  });
});

// Register student for exam
const registerForExam = asyncHandler(async (req, res) => {
  const { examId, studentId, registeredSubjects } = req.validatedData;

  // If student is registering themselves, use their student ID from token
  let actualStudentId = studentId;
  if (req.userRole === ROLES.STUDENT) {
    const studentService = require('../services/studentService');
    const student = await studentService.getStudentByUserId(req.userId);
    actualStudentId = student.studentId;
  }

  const registration = await examService.registerStudentForExam(examId, actualStudentId, registeredSubjects);

  res.status(200).json({
    success: true,
    message: 'Registration successful',
    data: registration
  });
});

// Get exam schedule
const getExamSchedule = asyncHandler(async (req, res) => {
  const filters = {
    academicYear: req.query.academicYear,
    semester: req.query.semester,
    studentId: req.query.studentId
  };

  // If student is accessing their own schedule, use their student ID from token
  if (req.userRole === ROLES.STUDENT) {
    const studentService = require('../services/studentService');
    const student = await studentService.getStudentByUserId(req.userId);
    filters.studentId = student.studentId;
  }

  const schedule = await examService.getExamSchedule(filters);

  res.status(200).json({
    success: true,
    message: 'Exam schedule retrieved successfully',
    data: schedule,
    count: schedule.length
  });
});

// Get current student's exam schedule (for student role)
const getMyExamSchedule = asyncHandler(async (req, res) => {
  if (req.userRole !== ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only for students'
    });
  }

  const studentService = require('../services/studentService');
  const student = await studentService.getStudentByUserId(req.userId);

  const schedule = await examService.getExamSchedule({
    studentId: student.studentId
  });

  res.status(200).json({
    success: true,
    message: 'Your exam schedule retrieved successfully',
    data: schedule,
    count: schedule.length
  });
});

// Get registered students for an exam
const getRegisteredStudents = asyncHandler(async (req, res) => {
  const registeredStudents = await examService.getRegisteredStudents(req.params.examId);

  res.status(200).json({
    success: true,
    message: 'Registered students retrieved successfully',
    data: registeredStudents,
    count: registeredStudents.length
  });
});

// Update exam status
const updateExamStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updatedExam = await examService.updateExamStatus(req.params.examId, status);

  res.status(200).json({
    success: true,
    message: 'Exam status updated successfully',
    data: updatedExam
  });
});

// Cancel exam registration
const cancelRegistration = asyncHandler(async (req, res) => {
  const result = await examService.cancelRegistration(req.params.registrationId);

  res.status(200).json({
    success: true,
    message: 'Registration cancelled successfully',
    data: result
  });
});

// Get student's exam registrations
const getStudentRegistrations = asyncHandler(async (req, res) => {
  let studentId = req.params.studentId;

  // If student is accessing their own registrations, use their student ID from token
  if (req.userRole === ROLES.STUDENT) {
    const studentService = require('../services/studentService');
    const student = await studentService.getStudentByUserId(req.userId);
    studentId = student.studentId;
  }

  const registrations = await examService.getStudentRegistrations(studentId);

  res.status(200).json({
    success: true,
    message: 'Student registrations retrieved successfully',
    data: registrations,
    count: registrations.length
  });
});

// Get current student's registrations (for student role)
const getMyRegistrations = asyncHandler(async (req, res) => {
  if (req.userRole !== ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only for students'
    });
  }

  const studentService = require('../services/studentService');
  const student = await studentService.getStudentByUserId(req.userId);

  const registrations = await examService.getStudentRegistrations(student.studentId);

  res.status(200).json({
    success: true,
    message: 'Your exam registrations retrieved successfully',
    data: registrations,
    count: registrations.length
  });
});

// Update exam details
const updateExam = asyncHandler(async (req, res) => {
  const updatedExam = await examService.updateExam(req.params.examId, req.body);

  res.status(200).json({
    success: true,
    message: 'Exam updated successfully',
    data: updatedExam
  });
});

// Get exam statistics
const getExamStatistics = asyncHandler(async (req, res) => {
  const stats = await examService.getExamStatistics();

  res.status(200).json({
    success: true,
    message: 'Exam statistics retrieved successfully',
    data: stats
  });
});

// Delete exam
const deleteExam = asyncHandler(async (req, res) => {
  const result = await examService.deleteExam(req.params.examId);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = {
  createExam,
  getExamById,
  getAllExams,
  registerForExam,
  getExamSchedule,
  getMyExamSchedule,
  getRegisteredStudents,
  updateExamStatus,
  cancelRegistration,
  getStudentRegistrations,
  getMyRegistrations,
  updateExam,
  getExamStatistics,
  deleteExam
};