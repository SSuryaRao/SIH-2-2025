const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/courses-branches', admissionController.getCoursesAndBranches);
router.post('/submit', admissionController.submitApplication);
router.get('/track/:applicationNumber', admissionController.getAdmissionByApplicationNumber);

// Protected routes - Admin/Staff only
router.get(
  '/',
  authenticate,
  (req, res, next) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff role required.'
      });
    }
    next();
  },
  admissionController.getAllAdmissions
);

router.get(
  '/stats',
  authenticate,
  (req, res, next) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff role required.'
      });
    }
    next();
  },
  admissionController.getAdmissionStats
);

router.get(
  '/:id',
  authenticate,
  (req, res, next) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff role required.'
      });
    }
    next();
  },
  admissionController.getAdmissionById
);

router.patch(
  '/:id/status',
  authenticate,
  (req, res, next) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff role required.'
      });
    }
    next();
  },
  admissionController.updateAdmissionStatus
);

router.patch(
  '/:id/documents',
  authenticate,
  admissionController.uploadDocuments
);

// Protected routes - Admin only
router.post(
  '/:id/convert-to-student',
  authenticate,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  },
  admissionController.convertToStudent
);

module.exports = router;