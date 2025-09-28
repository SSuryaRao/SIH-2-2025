const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const { authenticate, authorize, authorizeStudentAccess } = require('../middleware/auth');
const { validate, schemas, validateObjectId } = require('../middleware/validation');
const { ROLES } = require('../utils/auth');

// All routes require authentication
router.use(authenticate);

// Student can access their own details
router.get('/my-details',
  authorize([ROLES.STUDENT]),
  studentController.getMyDetails
);

// Admin/Staff routes for managing students
router.post('/',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  validate(schemas.studentCreation),
  studentController.addStudent
);

router.get('/',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  studentController.getAllStudents
);

router.get('/search',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  studentController.searchStudents
);

router.get('/statistics',
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  studentController.getStudentStatistics
);

router.get('/diagnose-links',
  authorize([ROLES.ADMIN]),
  studentController.diagnoseLinks
);

router.post('/link-to-user',
  authorize([ROLES.ADMIN]),
  studentController.linkStudentToUser
);

router.get('/course/:course/semester/:semester',
  validateObjectId('course'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  studentController.getStudentsByCourseAndSemester
);

// Student-specific routes (with access control)
router.get('/:studentId',
  validateObjectId('studentId'),
  authorizeStudentAccess, // This middleware checks if user can access specific student data
  studentController.getStudentById
);

router.put('/:studentId',
  validateObjectId('studentId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]), // Only admin/staff can update student info
  studentController.updateStudent
);

router.put('/:studentId/status',
  validateObjectId('studentId'),
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  studentController.updateStudentStatus
);

router.put('/:studentId/documents',
  validateObjectId('studentId'),
  authorizeStudentAccess, // Students can upload their own documents, admin/staff can upload any
  studentController.uploadDocuments
);

router.delete('/:studentId',
  validateObjectId('studentId'),
  authorize([ROLES.ADMIN]), // Only admin can delete students
  studentController.deleteStudent
);

module.exports = router;