const hostelService = require('../services/hostelService');
const { asyncHandler } = require('../middleware/errorHandler');
const { ROLES } = require('../utils/auth');

// Create new hostel
const createHostel = asyncHandler(async (req, res) => {
  const hostel = await hostelService.createHostel(req.body);

  res.status(201).json({
    success: true,
    message: 'Hostel created successfully',
    data: hostel
  });
});

// Create hostel room
const createRoom = asyncHandler(async (req, res) => {
  const room = await hostelService.createHostelRoom(req.body);

  res.status(201).json({
    success: true,
    message: 'Room created successfully',
    data: room
  });
});

// Allocate room to student
const allocateRoom = asyncHandler(async (req, res) => {
  const { studentId, roomId, securityDeposit } = req.validatedData;
  const allocation = await hostelService.allocateRoom(studentId, roomId, { securityDeposit });

  res.status(200).json({
    success: true,
    message: 'Room allocated successfully',
    data: allocation
  });
});

// Vacate room
const vacateRoom = asyncHandler(async (req, res) => {
  const allocationId = req.params.allocationId;
  const result = await hostelService.vacateRoom(allocationId);

  res.status(200).json({
    success: true,
    message: 'Room vacated successfully',
    data: result
  });
});

// Get all hostels
const getAllHostels = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type
  };

  const hostels = await hostelService.getAllHostels(filters);

  res.status(200).json({
    success: true,
    message: 'Hostels retrieved successfully',
    data: hostels,
    count: hostels.length
  });
});

// Get hostel by ID
const getHostelById = asyncHandler(async (req, res) => {
  const hostel = await hostelService.getHostelById(req.params.hostelId);

  res.status(200).json({
    success: true,
    message: 'Hostel details retrieved successfully',
    data: hostel
  });
});

// Get available rooms in a hostel
const getAvailableRooms = asyncHandler(async (req, res) => {
  const availableRooms = await hostelService.getAvailableRooms(req.params.hostelId);

  res.status(200).json({
    success: true,
    message: 'Available rooms retrieved successfully',
    data: availableRooms,
    count: availableRooms.length
  });
});

// Get student's current allocation
const getStudentAllocation = asyncHandler(async (req, res) => {
  let studentId = req.params.studentId;

  // If student is accessing their own allocation, use their student ID from token
  if (req.userRole === ROLES.STUDENT) {
    const studentService = require('../services/studentService');
    const student = await studentService.getStudentByUserId(req.userId);
    studentId = student.studentId;
  }

  const allocation = await hostelService.getStudentAllocation(studentId);

  if (!allocation) {
    return res.status(404).json({
      success: false,
      message: 'No active room allocation found for this student'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Student allocation retrieved successfully',
    data: allocation
  });
});

// Get current student's allocation (for student role)
const getMyAllocation = asyncHandler(async (req, res) => {
  if (req.userRole !== ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is only for students'
    });
  }

  const studentService = require('../services/studentService');
  const student = await studentService.getStudentByUserId(req.userId);
  const allocation = await hostelService.getStudentAllocation(student.studentId);

  if (!allocation) {
    return res.status(404).json({
      success: false,
      message: 'You do not have any active room allocation'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Your allocation details retrieved successfully',
    data: allocation
  });
});

// Get all allocations with filters
const getAllAllocations = asyncHandler(async (req, res) => {
  const filters = {
    hostelId: req.query.hostelId,
    status: req.query.status,
    studentId: req.query.studentId
  };

  const allocations = await hostelService.getAllAllocations(filters);

  res.status(200).json({
    success: true,
    message: 'Allocations retrieved successfully',
    data: allocations,
    count: allocations.length
  });
});

// Get hostel occupancy report
const getOccupancyReport = asyncHandler(async (req, res) => {
  const report = await hostelService.getHostelOccupancyReport(req.params.hostelId);

  res.status(200).json({
    success: true,
    message: 'Occupancy report generated successfully',
    data: report
  });
});

// Update room details
const updateRoom = asyncHandler(async (req, res) => {
  const updatedRoom = await hostelService.updateRoom(req.params.roomId, req.body);

  res.status(200).json({
    success: true,
    message: 'Room updated successfully',
    data: updatedRoom
  });
});

// Update hostel details
const updateHostel = asyncHandler(async (req, res) => {
  const updatedHostel = await hostelService.updateHostel(req.params.hostelId, req.body);

  res.status(200).json({
    success: true,
    message: 'Hostel updated successfully',
    data: updatedHostel
  });
});

// Get hostel statistics
const getHostelStatistics = asyncHandler(async (req, res) => {
  const stats = await hostelService.getHostelStatistics();

  res.status(200).json({
    success: true,
    message: 'Hostel statistics retrieved successfully',
    data: stats
  });
});

module.exports = {
  createHostel,
  createRoom,
  allocateRoom,
  vacateRoom,
  getAllHostels,
  getHostelById,
  getAvailableRooms,
  getStudentAllocation,
  getMyAllocation,
  getAllAllocations,
  getOccupancyReport,
  updateRoom,
  updateHostel,
  getHostelStatistics
};