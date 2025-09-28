const admissionService = require('../services/admissionService');
const Joi = require('joi');

// Validation schemas
const admissionSchema = Joi.object({
  personalInfo: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    category: Joi.string().valid('General', 'OBC', 'SC', 'ST', 'EWS').required(),
    nationality: Joi.string().required(),
    religion: Joi.string().optional(),
    address: Joi.object({
      permanent: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pincode: Joi.string().pattern(/^\d{6}$/).required(),
        country: Joi.string().required()
      }).required(),
      correspondence: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pincode: Joi.string().pattern(/^\d{6}$/).required(),
        country: Joi.string().required(),
        sameAsPermanent: Joi.boolean().required()
      }).required()
    }).required()
  }).required(),

  parentInfo: Joi.object({
    father: Joi.object({
      name: Joi.string().required(),
      occupation: Joi.string().required(),
      income: Joi.number().min(0).required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
      email: Joi.string().email().optional()
    }).required(),
    mother: Joi.object({
      name: Joi.string().required(),
      occupation: Joi.string().required(),
      income: Joi.number().min(0).required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
      email: Joi.string().email().optional()
    }).required(),
    guardian: Joi.object({
      name: Joi.string().required(),
      relation: Joi.string().required(),
      occupation: Joi.string().required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
      email: Joi.string().email().optional()
    }).optional()
  }).required(),

  academicInfo: Joi.object({
    appliedCourse: Joi.string().required(),
    appliedBranch: Joi.string().required(),
    previousEducation: Joi.array().items(
      Joi.object({
        level: Joi.string().valid('10th', '12th', 'Diploma', 'Bachelor').required(),
        board: Joi.string().required(),
        school: Joi.string().required(),
        year: Joi.number().integer().min(1990).max(new Date().getFullYear()).required(),
        percentage: Joi.number().min(0).max(100).required(),
        subjects: Joi.array().items(Joi.string()).optional()
      })
    ).min(1).required(),
    entranceExam: Joi.object({
      name: Joi.string().required(),
      rollNumber: Joi.string().required(),
      rank: Joi.number().integer().min(1).required(),
      score: Joi.number().min(0).required(),
      year: Joi.number().integer().min(2020).max(new Date().getFullYear()).required()
    }).optional()
  }).required(),

  documents: Joi.object({
    photo: Joi.string().uri().optional(),
    signature: Joi.string().uri().optional(),
    class10Certificate: Joi.string().uri().optional(),
    class12Certificate: Joi.string().uri().optional(),
    transferCertificate: Joi.string().uri().optional(),
    migrationCertificate: Joi.string().uri().optional(),
    aadharCard: Joi.string().uri().optional(),
    incomeCertificate: Joi.string().uri().optional(),
    casteCertificate: Joi.string().uri().optional(),
    domicileCertificate: Joi.string().uri().optional(),
    entranceExamScorecard: Joi.string().uri().optional()
  }).optional(),

  feeInfo: Joi.object({
    admissionFee: Joi.number().min(0).required(),
    processingFee: Joi.number().min(0).required(),
    totalFee: Joi.number().min(0).required(),
    paymentStatus: Joi.string().valid('pending', 'paid', 'partial').default('pending'),
    paymentDetails: Joi.object({
      transactionId: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      paymentDate: Joi.date().required(),
      paymentMode: Joi.string().valid('cash', 'card', 'upi', 'bank_transfer').required()
    }).optional()
  }).required()
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('submitted', 'under_review', 'approved', 'rejected', 'waitlisted').required(),
  comments: Joi.string().max(1000).optional(),
  score: Joi.number().min(0).max(100).optional()
});

class AdmissionController {
  // Submit new admission application
  async submitApplication(req, res) {
    try {
      const { error, value } = admissionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const result = await admissionService.submitApplication(value);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get all admissions (admin/staff only)
  async getAllAdmissions(req, res) {
    try {
      const { status, course, branch, page = 1, limit = 20 } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (course) filters.course = course;
      if (branch) filters.branch = branch;

      const result = await admissionService.getAllAdmissions(filters);

      if (result.success) {
        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedData = result.data.slice(startIndex, endIndex);

        res.status(200).json({
          ...result,
          data: paginatedData,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.data.length,
            totalPages: Math.ceil(result.data.length / parseInt(limit))
          }
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get all admissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get admission by ID
  async getAdmissionById(req, res) {
    try {
      const { id } = req.params;
      const result = await admissionService.getAdmissionById(id);

      if (result.success) {
        res.status(200).json(result);
      } else if (result.message === 'Admission not found') {
        res.status(404).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get admission by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get admission by application number
  async getAdmissionByApplicationNumber(req, res) {
    try {
      const { applicationNumber } = req.params;
      const result = await admissionService.getAdmissionByApplicationNumber(applicationNumber);

      if (result.success) {
        res.status(200).json(result);
      } else if (result.message === 'Application not found') {
        res.status(404).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get admission by application number error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update admission status (admin/staff only)
  async updateAdmissionStatus(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = statusUpdateSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const reviewerId = req.user.uid; // Get from authenticated user
      const result = await admissionService.updateAdmissionStatus(id, value, reviewerId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Update admission status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Upload documents
  async uploadDocuments(req, res) {
    try {
      const { id } = req.params;
      const documents = req.body.documents;

      if (!documents || typeof documents !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Documents object is required'
        });
      }

      const result = await admissionService.updateDocuments(id, documents);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Upload documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get admission statistics (admin/staff only)
  async getAdmissionStats(req, res) {
    try {
      const result = await admissionService.getAdmissionStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get admission stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Convert approved admission to student (admin only)
  async convertToStudent(req, res) {
    try {
      const { id } = req.params;
      const additionalStudentData = req.body.studentData || {};

      const result = await admissionService.convertToStudent(id, additionalStudentData);

      if (result.success) {
        res.status(200).json(result);
      } else if (result.message.includes('not found') || result.message.includes('Only approved')) {
        res.status(400).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Convert to student error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get available courses and branches (public endpoint)
  async getCoursesAndBranches(req, res) {
    try {
      // This could be made dynamic by storing in database
      const coursesAndBranches = {
        'Computer Science Engineering': [
          'Computer Science',
          'Artificial Intelligence',
          'Data Science',
          'Cyber Security'
        ],
        'Electronics & Communication': [
          'Electronics',
          'Communication Systems',
          'VLSI Design',
          'Embedded Systems'
        ],
        'Mechanical Engineering': [
          'Mechanical',
          'Automobile',
          'Production',
          'Thermal Engineering'
        ],
        'Civil Engineering': [
          'Civil',
          'Environmental',
          'Structural',
          'Transportation'
        ],
        'Electrical Engineering': [
          'Electrical',
          'Power Systems',
          'Control Systems',
          'Renewable Energy'
        ]
      };

      res.status(200).json({
        success: true,
        data: coursesAndBranches,
        message: 'Courses and branches retrieved successfully'
      });
    } catch (error) {
      console.error('Get courses and branches error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

const admissionController = new AdmissionController();

module.exports = {
  submitApplication: admissionController.submitApplication.bind(admissionController),
  getAllAdmissions: admissionController.getAllAdmissions.bind(admissionController),
  getAdmissionById: admissionController.getAdmissionById.bind(admissionController),
  getAdmissionByApplicationNumber: admissionController.getAdmissionByApplicationNumber.bind(admissionController),
  updateAdmissionStatus: admissionController.updateAdmissionStatus.bind(admissionController),
  uploadDocuments: admissionController.uploadDocuments.bind(admissionController),
  getAdmissionStats: admissionController.getAdmissionStats.bind(admissionController),
  convertToStudent: admissionController.convertToStudent.bind(admissionController),
  getCoursesAndBranches: admissionController.getCoursesAndBranches.bind(admissionController)
};