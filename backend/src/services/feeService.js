const { dbHelpers, collections } = require('../config/database');
const { generateUniqueId } = require('../utils/auth');

class FeeService {
  // Create fee structure for a student
  async createFeeStructure(studentId, academicYear, semester, feeStructure) {
    try {
      // Check if fee structure already exists for this student, year, and semester
      const existingFees = await dbHelpers.getDocuments(collections.FEES, [
        { field: 'studentId', operator: '==', value: studentId },
        { field: 'academicYear', operator: '==', value: academicYear },
        { field: 'semester', operator: '==', value: semester }
      ]);

      if (existingFees.length > 0) {
        throw new Error('Fee structure already exists for this student, academic year, and semester');
      }

      // Verify student exists
      const student = await dbHelpers.getDocument(collections.STUDENTS, studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Calculate total fee
      const total = Object.values(feeStructure).reduce((sum, fee) => sum + (fee || 0), 0);

      // Set due date (3 months from creation)
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 3);

      const feeDoc = {
        feeId: generateUniqueId('FEE'),
        studentId,
        academicYear,
        semester,
        feeStructure: {
          ...feeStructure,
          total
        },
        payments: [],
        totalPaid: 0,
        balance: total,
        status: 'pending',
        dueDate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const fee = await dbHelpers.addDocument(collections.FEES, feeDoc);
      return fee;
    } catch (error) {
      throw new Error(`Failed to create fee structure: ${error.message}`);
    }
  }

  // Record fee payment
  async recordPayment(feeId, paymentData) {
    try {
      const fee = await dbHelpers.getDocument(collections.FEES, feeId);
      if (!fee) {
        throw new Error('Fee record not found');
      }

      const { amount, paymentMode, transactionId, receiptNumber } = paymentData;

      // Validate payment amount
      if (amount <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      if (amount > fee.balance) {
        throw new Error(`Payment amount (${amount}) exceeds remaining balance (${fee.balance})`);
      }

      // Create payment record
      const payment = {
        paymentId: generateUniqueId('PAY'),
        amount,
        paymentDate: new Date(),
        paymentMode,
        transactionId: transactionId || null,
        receiptNumber: receiptNumber || generateUniqueId('RCP'),
        status: 'completed'
      };

      // Update fee record
      const updatedPayments = [...fee.payments, payment];
      const newTotalPaid = fee.totalPaid + amount;
      const newBalance = fee.balance - amount;

      // Determine new status
      let newStatus = 'partial';
      if (newBalance === 0) {
        newStatus = 'completed';
      } else if (newBalance < 0) {
        throw new Error('Payment amount exceeds balance');
      }

      const updatedFee = await dbHelpers.updateDocument(collections.FEES, feeId, {
        payments: updatedPayments,
        totalPaid: newTotalPaid,
        balance: newBalance,
        status: newStatus
      });

      return {
        fee: updatedFee,
        payment
      };
    } catch (error) {
      throw new Error(`Failed to record payment: ${error.message}`);
    }
  }

  // Get fee details by ID
  async getFeeById(feeId) {
    try {
      const fee = await dbHelpers.getDocument(collections.FEES, feeId);
      if (!fee) {
        throw new Error('Fee record not found');
      }
      return fee;
    } catch (error) {
      throw new Error(`Failed to get fee details: ${error.message}`);
    }
  }

  // Get all fees for a student
  async getStudentFees(studentId) {
    try {
      const fees = await dbHelpers.getDocuments(collections.FEES, [
        { field: 'studentId', operator: '==', value: studentId }
      ]);

      // Sort in memory to avoid Firestore index requirement
      return fees.sort((a, b) => {
        // Sort by academic year descending, then by created date descending
        if (a.academicYear !== b.academicYear) {
          return b.academicYear - a.academicYear;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } catch (error) {
      throw new Error(`Failed to get student fees: ${error.message}`);
    }
  }

  // Get fees with filters
  async getAllFees(filters = {}) {
    try {
      const queryFilters = [];

      // Add student ID filter
      if (filters.studentId) {
        queryFilters.push({ field: 'studentId', operator: '==', value: filters.studentId });
      }

      // Add academic year filter
      if (filters.academicYear) {
        queryFilters.push({ field: 'academicYear', operator: '==', value: filters.academicYear });
      }

      // Add semester filter
      if (filters.semester) {
        queryFilters.push({ field: 'semester', operator: '==', value: parseInt(filters.semester) });
      }

      // Add status filter
      if (filters.status) {
        queryFilters.push({ field: 'status', operator: '==', value: filters.status });
      }

      const fees = await dbHelpers.getDocuments(
        collections.FEES,
        queryFilters,
        { field: 'createdAt', direction: 'desc' }
      );

      return fees;
    } catch (error) {
      throw new Error(`Failed to get fees: ${error.message}`);
    }
  }

  // Get pending fees (overdue)
  async getPendingFees() {
    try {
      const currentDate = new Date();
      const allFees = await dbHelpers.getDocuments(collections.FEES, [
        { field: 'status', operator: 'in', value: ['pending', 'partial'] }
      ]);

      // Filter overdue fees
      const overdueFees = allFees.filter(fee => {
        const dueDate = fee.dueDate.toDate ? fee.dueDate.toDate() : new Date(fee.dueDate);
        return dueDate < currentDate;
      });

      return overdueFees;
    } catch (error) {
      throw new Error(`Failed to get pending fees: ${error.message}`);
    }
  }

  // Update fee structure
  async updateFeeStructure(feeId, updatedFeeStructure) {
    try {
      const fee = await dbHelpers.getDocument(collections.FEES, feeId);
      if (!fee) {
        throw new Error('Fee record not found');
      }

      // Don't allow update if payments have been made
      if (fee.totalPaid > 0) {
        throw new Error('Cannot update fee structure after payments have been made');
      }

      // Calculate new total
      const newTotal = Object.values(updatedFeeStructure).reduce((sum, fee) => sum + (fee || 0), 0);

      const updatedFee = await dbHelpers.updateDocument(collections.FEES, feeId, {
        feeStructure: {
          ...updatedFeeStructure,
          total: newTotal
        },
        balance: newTotal
      });

      return updatedFee;
    } catch (error) {
      throw new Error(`Failed to update fee structure: ${error.message}`);
    }
  }

  // Update due date
  async updateDueDate(feeId, newDueDate) {
    try {
      const fee = await dbHelpers.getDocument(collections.FEES, feeId);
      if (!fee) {
        throw new Error('Fee record not found');
      }

      const updatedFee = await dbHelpers.updateDocument(collections.FEES, feeId, {
        dueDate: new Date(newDueDate)
      });

      return updatedFee;
    } catch (error) {
      throw new Error(`Failed to update due date: ${error.message}`);
    }
  }

  // Get payment history for a fee
  async getPaymentHistory(feeId) {
    try {
      const fee = await dbHelpers.getDocument(collections.FEES, feeId);
      if (!fee) {
        throw new Error('Fee record not found');
      }

      return fee.payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    } catch (error) {
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  // Get fee statistics
  async getFeeStatistics(filters = {}) {
    try {
      let fees = await this.getAllFees(filters);

      const stats = {
        total: fees.length,
        completed: 0,
        pending: 0,
        partial: 0,
        overdue: 0,
        totalAmount: 0,
        totalCollected: 0,
        totalPending: 0
      };

      const currentDate = new Date();

      fees.forEach(fee => {
        // Status counts
        stats[fee.status]++;

        // Amount calculations
        stats.totalAmount += fee.feeStructure.total;
        stats.totalCollected += fee.totalPaid;
        stats.totalPending += fee.balance;

        // Overdue check
        const dueDate = fee.dueDate.toDate ? fee.dueDate.toDate() : new Date(fee.dueDate);
        if (fee.status !== 'completed' && dueDate < currentDate) {
          stats.overdue++;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get fee statistics: ${error.message}`);
    }
  }

  // Generate receipt
  async generateReceipt(feeId, paymentId) {
    try {
      const fee = await dbHelpers.getDocument(collections.FEES, feeId);
      if (!fee) {
        throw new Error('Fee record not found');
      }

      const payment = fee.payments.find(p => p.paymentId === paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Get student details
      const student = await dbHelpers.getDocument(collections.STUDENTS, fee.studentId);

      const receipt = {
        receiptNumber: payment.receiptNumber,
        studentDetails: {
          studentId: student.studentId,
          name: student.personalInfo.name,
          rollNumber: student.academicInfo.rollNumber,
          course: student.academicInfo.course,
          branch: student.academicInfo.branch
        },
        feeDetails: {
          academicYear: fee.academicYear,
          semester: fee.semester,
          totalFee: fee.feeStructure.total,
          totalPaid: fee.totalPaid,
          balance: fee.balance
        },
        paymentDetails: payment,
        generatedAt: new Date()
      };

      return receipt;
    } catch (error) {
      throw new Error(`Failed to generate receipt: ${error.message}`);
    }
  }
}

module.exports = new FeeService();