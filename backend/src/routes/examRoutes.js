const express = require('express');
const router = express.Router();

const examController = require('../controllers/examController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas, validateObjectId } = require('../middleware/validation');
const { ROLES } = require('../utils/auth');

// All routes require authentication
router.use(authenticate);

// Student routes - students can view and register for exams
router.get('/schedule',
  examController.getExamSchedule
);

router.get('/my-schedule',
  authorize([ROLES.STUDENT]),
  examController.getMyExamSchedule
);

router.get('/my-registrations',
  authorize([ROLES.STUDENT]),
  examController.getMyRegistrations
);

router.post('/register',
  authorize([ROLES.STUDENT]),
  validate(schemas.examRegistration),
  examController.registerForExam
);

// Public routes (all authenticated users can view exams)
router.get('/',
  examController.getAllExams
);

// Admin/Staff routes - put specific routes before dynamic params
router.get('/statistics',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  examController.getExamStatistics
);

router.post('/',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  examController.createExam
);

router.get('/:examId',
  validateObjectId('examId'),
  examController.getExamById
);

router.put('/:examId',
  validateObjectId('examId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  examController.updateExam
);

router.put('/:examId/status',
  validateObjectId('examId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  examController.updateExamStatus
);

router.patch('/:examId/status',
  validateObjectId('examId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  examController.updateExamStatus
);

router.get('/:examId/registered-students',
  validateObjectId('examId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  examController.getRegisteredStudents
);

router.delete('/:examId',
  validateObjectId('examId'),
  authorize([ROLES.ADMIN]),
  examController.deleteExam
);

// Registration management routes
router.put('/registration/:registrationId/cancel',
  validateObjectId('registrationId'),
  authorize([ROLES.ADMIN, ROLES.STAFF, ROLES.STUDENT]),
  examController.cancelRegistration
);

router.get('/student/:studentId/registrations',
  validateObjectId('studentId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  examController.getStudentRegistrations
);

module.exports = router;