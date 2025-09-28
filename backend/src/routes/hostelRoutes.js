const express = require('express');
const router = express.Router();

const hostelController = require('../controllers/hostelController');
const { authenticate, authorize, authorizeHostelAccess } = require('../middleware/auth');
const { validate, schemas, validateObjectId } = require('../middleware/validation');
const { ROLES } = require('../utils/auth');

// All routes require authentication
router.use(authenticate);

// Student routes - students can view their own allocation
router.get('/my-allocation',
  authorize([ROLES.STUDENT]),
  hostelController.getMyAllocation
);

// Public routes (all authenticated users can view basic hostel info)
router.get('/',
  hostelController.getAllHostels
);

router.get('/:hostelId/available-rooms',
  validateObjectId('hostelId'),
  hostelController.getAvailableRooms
);

// Admin only routes for hostel management
router.post('/',
  authorize([ROLES.ADMIN]),
  hostelController.createHostel
);

router.post('/rooms',
  authorize([ROLES.ADMIN]),
  hostelController.createRoom
);

router.get('/statistics',
  authorize([ROLES.ADMIN]),
  hostelController.getHostelStatistics
);

// Admin/Warden routes for room allocation management
router.post('/allocate',
  authorize([ROLES.ADMIN, ROLES.WARDEN]),
  validate(schemas.hostelAllocation),
  hostelController.allocateRoom
);

router.put('/allocation/:allocationId/vacate',
  validateObjectId('allocationId'),
  authorize([ROLES.ADMIN, ROLES.WARDEN]),
  hostelController.vacateRoom
);

router.get('/allocations',
  authorize([ROLES.ADMIN, ROLES.WARDEN]),
  hostelController.getAllAllocations
);

// Hostel-specific routes
router.get('/:hostelId',
  validateObjectId('hostelId'),
  authorizeHostelAccess, // Wardens can only access their assigned hostels
  hostelController.getHostelById
);

router.get('/:hostelId/occupancy-report',
  validateObjectId('hostelId'),
  authorizeHostelAccess,
  hostelController.getOccupancyReport
);

router.put('/:hostelId',
  validateObjectId('hostelId'),
  authorize([ROLES.ADMIN]),
  hostelController.updateHostel
);

// Room management routes
router.put('/room/:roomId',
  validateObjectId('roomId'),
  authorize([ROLES.ADMIN, ROLES.WARDEN]),
  hostelController.updateRoom
);

// Student allocation routes (with access control)
router.get('/student/:studentId/allocation',
  validateObjectId('studentId'),
  authorize([ROLES.ADMIN, ROLES.STAFF, ROLES.WARDEN]),
  hostelController.getStudentAllocation
);

module.exports = router;