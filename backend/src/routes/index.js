const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const authRoutes = require('./auth');
const studentRoutes = require('./studentRoutes');
const feeRoutes = require('./feeRoutes');
const hostelRoutes = require('./hostelRoutes');
const examRoutes = require('./examRoutes');
const admissionRoutes = require('./admissionRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College ERP API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/fees', feeRoutes);
router.use('/hostels', hostelRoutes);
router.use('/exams', examRoutes);
router.use('/admissions', admissionRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College ERP System API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      users: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile',
        allUsers: 'GET /api/users'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      students: {
        add: 'POST /api/students',
        getAll: 'GET /api/students',
        getById: 'GET /api/students/:studentId',
        myDetails: 'GET /api/students/my-details',
        search: 'GET /api/students/search'
      },
      fees: {
        create: 'POST /api/fees',
        getAll: 'GET /api/fees',
        studentFees: 'GET /api/fees/student/:studentId',
        myFees: 'GET /api/fees/my-fees',
        recordPayment: 'POST /api/fees/:feeId/payment'
      },
      hostels: {
        getAll: 'GET /api/hostels',
        allocateRoom: 'POST /api/hostels/allocate',
        myAllocation: 'GET /api/hostels/my-allocation',
        occupancyReport: 'GET /api/hostels/:hostelId/occupancy-report'
      },
      exams: {
        getAll: 'GET /api/exams',
        register: 'POST /api/exams/register',
        mySchedule: 'GET /api/exams/my-schedule',
        myRegistrations: 'GET /api/exams/my-registrations'
      },
      admissions: {
        submit: 'POST /api/admissions/submit',
        getAll: 'GET /api/admissions',
        getById: 'GET /api/admissions/:id',
        track: 'GET /api/admissions/track/:applicationNumber',
        updateStatus: 'PATCH /api/admissions/:id/status',
        uploadDocuments: 'PATCH /api/admissions/:id/documents',
        getStats: 'GET /api/admissions/stats',
        convertToStudent: 'POST /api/admissions/:id/convert-to-student',
        coursesBranches: 'GET /api/admissions/courses-branches'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

module.exports = router;