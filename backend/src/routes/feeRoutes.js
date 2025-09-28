const express = require('express');
const router = express.Router();

const feeController = require('../controllers/feeController');
const { authenticate, authorize, authorizeStudentAccess } = require('../middleware/auth');
const { validate, schemas, validateObjectId } = require('../middleware/validation');
const { ROLES } = require('../utils/auth');

// All routes require authentication
router.use(authenticate);

// Special route for students to view their own fees (MUST be before parameterized routes)
router.get('/my-fees',
  authorize([ROLES.STUDENT]),
  feeController.getStudentFees
);

// Admin/Staff routes for fee management
router.post('/',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.createFeeStructure
);

router.get('/',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.getAllFees
);

router.get('/pending',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.getPendingFees
);

router.get('/statistics',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.getFeeStatistics
);

// Fee-specific routes
router.get('/:feeId',
  validateObjectId('feeId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]), // Only admin/staff can view specific fee details
  feeController.getFeeById
);

router.post('/:feeId/payment',
  validateObjectId('feeId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  validate(schemas.feePayment),
  feeController.recordPayment
);

router.put('/:feeId/structure',
  validateObjectId('feeId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.updateFeeStructure
);

router.put('/:feeId/due-date',
  validateObjectId('feeId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.updateDueDate
);

router.get('/:feeId/payments',
  validateObjectId('feeId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.getPaymentHistory
);

router.get('/:feeId/payment/:paymentId/receipt',
  validateObjectId('feeId'),
  validateObjectId('paymentId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  feeController.generateReceipt
);

// Student routes - students can view their own fees
router.get('/student/:studentId',
  validateObjectId('studentId'),
  authorizeStudentAccess, // Students can only access their own fees
  feeController.getStudentFees
);

module.exports = router;