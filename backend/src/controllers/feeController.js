const feeService = require('../services/feeService');
const { asyncHandler } = require('../middleware/errorHandler');
const { ROLES } = require('../utils/auth');

// Create fee structure for a student
const createFeeStructure = asyncHandler(async (req, res) => {
  const { studentId, academicYear, semester, feeStructure } = req.body;
  const fee = await feeService.createFeeStructure(studentId, academicYear, semester, feeStructure);

  res.status(201).json({
    success: true,
    message: 'Fee structure created successfully',
    data: fee
  });
});

// Record fee payment
const recordPayment = asyncHandler(async (req, res) => {
  const feeId = req.params.feeId;
  const paymentData = req.validatedData;

  const result = await feeService.recordPayment(feeId, paymentData);

  res.status(200).json({
    success: true,
    message: 'Payment recorded successfully',
    data: result
  });
});

// Get fee details by ID
const getFeeById = asyncHandler(async (req, res) => {
  const fee = await feeService.getFeeById(req.params.feeId);

  res.status(200).json({
    success: true,
    message: 'Fee details retrieved successfully',
    data: fee
  });
});

// Get all fees for a student
const getStudentFees = asyncHandler(async (req, res) => {
  let studentId = req.params.studentId;

  // If student is accessing their own fees, use their student ID from token
  if (req.userRole === ROLES.STUDENT) {
    const studentService = require('../services/studentService');

    try {
      const student = await studentService.getStudentByUserId(req.userId);
      studentId = student.studentId;
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found. Please contact administrator to link your account.',
        error: error.message
      });
    }
  }

  const fees = await feeService.getStudentFees(studentId);

  res.status(200).json({
    success: true,
    message: 'Student fees retrieved successfully',
    data: fees,
    count: fees.length
  });
});

// Get all fees with filters
const getAllFees = asyncHandler(async (req, res) => {
  const filters = {
    studentId: req.query.studentId,
    academicYear: req.query.academicYear,
    semester: req.query.semester,
    status: req.query.status
  };

  const fees = await feeService.getAllFees(filters);

  res.status(200).json({
    success: true,
    message: 'Fees retrieved successfully',
    data: fees,
    count: fees.length
  });
});

// Get pending/overdue fees
const getPendingFees = asyncHandler(async (req, res) => {
  const pendingFees = await feeService.getPendingFees();

  res.status(200).json({
    success: true,
    message: 'Pending fees retrieved successfully',
    data: pendingFees,
    count: pendingFees.length
  });
});

// Update fee structure
const updateFeeStructure = asyncHandler(async (req, res) => {
  const { feeStructure } = req.body;
  const updatedFee = await feeService.updateFeeStructure(req.params.feeId, feeStructure);

  res.status(200).json({
    success: true,
    message: 'Fee structure updated successfully',
    data: updatedFee
  });
});

// Update due date
const updateDueDate = asyncHandler(async (req, res) => {
  const { dueDate } = req.body;
  const updatedFee = await feeService.updateDueDate(req.params.feeId, dueDate);

  res.status(200).json({
    success: true,
    message: 'Due date updated successfully',
    data: updatedFee
  });
});

// Get payment history for a fee
const getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await feeService.getPaymentHistory(req.params.feeId);

  res.status(200).json({
    success: true,
    message: 'Payment history retrieved successfully',
    data: payments
  });
});

// Get fee statistics
const getFeeStatistics = asyncHandler(async (req, res) => {
  const filters = {
    academicYear: req.query.academicYear,
    semester: req.query.semester
  };

  const stats = await feeService.getFeeStatistics(filters);

  res.status(200).json({
    success: true,
    message: 'Fee statistics retrieved successfully',
    data: stats
  });
});

// Generate receipt
const generateReceipt = asyncHandler(async (req, res) => {
  const { feeId, paymentId } = req.params;
  const receipt = await feeService.generateReceipt(feeId, paymentId);

  res.status(200).json({
    success: true,
    message: 'Receipt generated successfully',
    data: receipt
  });
});

module.exports = {
  createFeeStructure,
  recordPayment,
  getFeeById,
  getStudentFees,
  getAllFees,
  getPendingFees,
  updateFeeStructure,
  updateDueDate,
  getPaymentHistory,
  getFeeStatistics,
  generateReceipt
};