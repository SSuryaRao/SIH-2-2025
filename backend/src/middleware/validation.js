const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration schema
  userRegistration: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('student', 'staff', 'warden', 'admin').required(),
    profile: Joi.object({
      phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
      address: Joi.string().max(500).optional(),
      department: Joi.string().max(100).optional(),
      designation: Joi.string().max(100).optional(),
      rollNumber: Joi.string().optional(),
      semester: Joi.number().integer().min(1).max(8).optional()
    }).optional()
  }),

  // User login schema
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Student creation schema
  studentCreation: Joi.object({
    personalInfo: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
      dateOfBirth: Joi.date().required(),
      gender: Joi.string().valid('male', 'female', 'other').required(),
      bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
      address: Joi.object({
        permanent: Joi.string().max(500).required(),
        current: Joi.string().max(500).required()
      }).required()
    }).required(),
    academicInfo: Joi.object({
      course: Joi.string().required(),
      branch: Joi.string().required(),
      semester: Joi.number().integer().min(1).max(8).required(),
      year: Joi.number().integer().min(1).max(4).required(),
      rollNumber: Joi.string().required(),
      admissionDate: Joi.date().required()
    }).required()
  }),

  // Fee payment schema
  feePayment: Joi.object({
    studentId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    paymentMode: Joi.string().valid('cash', 'card', 'upi', 'bank_transfer').required(),
    transactionId: Joi.string().optional(),
    receiptNumber: Joi.string().optional()
  }),

  // Hostel room allocation schema
  hostelAllocation: Joi.object({
    studentId: Joi.string().required(),
    roomId: Joi.string().required(),
    securityDeposit: Joi.number().min(0).optional(),
    monthlyRent: Joi.number().positive().optional()
  }),

  // Exam registration schema
  examRegistration: Joi.object({
    examId: Joi.string().required(),
    studentId: Joi.string().optional(), // Optional for students registering themselves
    registeredSubjects: Joi.array().items(
      Joi.object({
        subjectCode: Joi.string().required(),
        subjectName: Joi.string().required()
      })
    ).min(1).required()
  }),

  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  })
};

// Validate pagination parameters (for query params)
const validatePagination = (req, res, next) => {
  const { error, value } = schemas.pagination.validate(req.query, { allowUnknown: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pagination parameters',
      errors: error.details.map(detail => detail.message)
    });
  }

  req.pagination = value;
  next();
};

// Validate ObjectId format
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

module.exports = {
  validate,
  schemas,
  validatePagination,
  validateObjectId
};