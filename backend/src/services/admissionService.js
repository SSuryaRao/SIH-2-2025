const { db } = require('../config/database');

class AdmissionService {
  constructor() {
    this.collectionName = 'admissions';
    this.collection = db.collection(this.collectionName);
  }

  // Generate unique application number
  async generateApplicationNumber() {
    const year = new Date().getFullYear();
    const prefix = `ADM${year}`;

    // Get the last application number for this year
    const q = this.collection
      .where('applicationNumber', '>=', prefix)
      .where('applicationNumber', '<', `ADM${year + 1}`)
      .orderBy('applicationNumber', 'desc')
      .limit(1);

    const snapshot = await q.get();
    let nextNumber = 1;

    if (!snapshot.empty) {
      const lastDoc = snapshot.docs[0];
      const lastNumber = lastDoc.data().applicationNumber;
      const lastSequence = parseInt(lastNumber.replace(prefix, ''));
      nextNumber = lastSequence + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  // Submit new admission application
  async submitApplication(applicationData) {
    try {
      const applicationNumber = await this.generateApplicationNumber();
      const admissionId = `adm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const admission = {
        admissionId,
        applicationNumber,
        ...applicationData,
        status: 'submitted',
        submittedAt: new Date(),
        lastUpdatedAt: new Date(),
        createdAt: new Date()
      };

      const docRef = db.collection(this.collectionName).doc(admissionId);
      await docRef.set(admission);

      return {
        success: true,
        data: { admissionId, applicationNumber },
        message: 'Application submitted successfully'
      };
    } catch (error) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        message: 'Failed to submit application'
      };
    }
  }

  // Get all admissions with filters
  async getAllAdmissions(filters = {}) {
    try {
      let q = this.collection;

      // Apply filters
      if (filters.status) {
        q = q.where('status', '==', filters.status);
      }
      if (filters.course) {
        q = q.where('academicInfo.appliedCourse', '==', filters.course);
      }
      if (filters.branch) {
        q = q.where('academicInfo.appliedBranch', '==', filters.branch);
      }

      // Add ordering
      q = q.orderBy('submittedAt', 'desc');

      const snapshot = await q.get();
      const admissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        lastUpdatedAt: doc.data().lastUpdatedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      return {
        success: true,
        data: admissions,
        message: 'Admissions retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting admissions:', error);
      return {
        success: false,
        message: 'Failed to retrieve admissions'
      };
    }
  }

  // Get admission by ID
  async getAdmissionById(admissionId) {
    try {
      const docRef = db.collection(this.collectionName).doc(admissionId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return {
          success: false,
          message: 'Admission not found'
        };
      }

      const admission = {
        id: docSnap.id,
        ...docSnap.data(),
        submittedAt: docSnap.data().submittedAt?.toDate(),
        lastUpdatedAt: docSnap.data().lastUpdatedAt?.toDate(),
        createdAt: docSnap.data().createdAt?.toDate()
      };

      return {
        success: true,
        data: admission,
        message: 'Admission retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting admission:', error);
      return {
        success: false,
        message: 'Failed to retrieve admission'
      };
    }
  }

  // Get admission by application number
  async getAdmissionByApplicationNumber(applicationNumber) {
    try {
      const q = this.collection.where('applicationNumber', '==', applicationNumber);
      const snapshot = await q.get();

      if (snapshot.empty) {
        return {
          success: false,
          message: 'Application not found'
        };
      }

      const doc = snapshot.docs[0];
      const admission = {
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        lastUpdatedAt: doc.data().lastUpdatedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      };

      return {
        success: true,
        data: admission,
        message: 'Application retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting application:', error);
      return {
        success: false,
        message: 'Failed to retrieve application'
      };
    }
  }

  // Update admission status (for staff/admin review)
  async updateAdmissionStatus(admissionId, statusData, reviewerId) {
    try {
      const docRef = db.collection(this.collectionName).doc(admissionId);
      const updateData = {
        status: statusData.status,
        lastUpdatedAt: new Date(),
        reviewInfo: {
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewComments: statusData.comments || '',
          approvalScore: statusData.score || null
        }
      };

      await docRef.update(updateData);

      return {
        success: true,
        message: 'Admission status updated successfully'
      };
    } catch (error) {
      console.error('Error updating admission status:', error);
      return {
        success: false,
        message: 'Failed to update admission status'
      };
    }
  }

  // Update application documents
  async updateDocuments(admissionId, documents) {
    try {
      const docRef = db.collection(this.collectionName).doc(admissionId);
      const updateData = {
        documents: {
          ...documents
        },
        lastUpdatedAt: new Date()
      };

      await docRef.update(updateData);

      return {
        success: true,
        message: 'Documents updated successfully'
      };
    } catch (error) {
      console.error('Error updating documents:', error);
      return {
        success: false,
        message: 'Failed to update documents'
      };
    }
  }

  // Get admission statistics
  async getAdmissionStats() {
    try {
      const allAdmissions = await this.getAllAdmissions();
      if (!allAdmissions.success) {
        return allAdmissions;
      }

      const admissions = allAdmissions.data;
      const stats = {
        total: admissions.length,
        submitted: admissions.filter(a => a.status === 'submitted').length,
        under_review: admissions.filter(a => a.status === 'under_review').length,
        approved: admissions.filter(a => a.status === 'approved').length,
        rejected: admissions.filter(a => a.status === 'rejected').length,
        waitlisted: admissions.filter(a => a.status === 'waitlisted').length,
        courseWise: {},
        branchWise: {}
      };

      // Calculate course-wise stats
      admissions.forEach(admission => {
        const course = admission.academicInfo?.appliedCourse || 'Unknown';
        const branch = admission.academicInfo?.appliedBranch || 'Unknown';

        stats.courseWise[course] = (stats.courseWise[course] || 0) + 1;
        stats.branchWise[branch] = (stats.branchWise[branch] || 0) + 1;
      });

      return {
        success: true,
        data: stats,
        message: 'Admission statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting admission stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve admission statistics'
      };
    }
  }

  // Convert approved admission to student record
  async convertToStudent(admissionId, additionalStudentData = {}) {
    try {
      const admissionResult = await this.getAdmissionById(admissionId);
      if (!admissionResult.success) {
        return admissionResult;
      }

      const admission = admissionResult.data;
      if (admission.status !== 'approved') {
        return {
          success: false,
          message: 'Only approved admissions can be converted to student records'
        };
      }

      // Generate student ID
      const year = new Date().getFullYear();
      const course = admission.academicInfo.appliedCourse.toUpperCase();
      const studentId = `${course}${year}${Math.random().toString().substr(2, 3)}`;

      // Create student data structure
      const studentData = {
        studentId,
        userId: null, // Will be set when user account is created
        personalInfo: {
          name: admission.personalInfo.name,
          email: admission.personalInfo.email,
          phone: admission.personalInfo.phone,
          dateOfBirth: admission.personalInfo.dateOfBirth,
          gender: admission.personalInfo.gender,
          bloodGroup: admission.personalInfo.bloodGroup,
          address: admission.personalInfo.address
        },
        academicInfo: {
          course: admission.academicInfo.appliedCourse,
          branch: admission.academicInfo.appliedBranch,
          semester: 1,
          year: 1,
          rollNumber: studentId, // Same as student ID initially
          admissionDate: new Date(),
          status: 'active',
          ...additionalStudentData.academicInfo
        },
        documents: admission.documents,
        admissionId: admissionId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add student to students collection
      await db.collection('students').doc(studentId).set(studentData);

      // Update admission status to indicate conversion
      await this.collection.doc(admissionId).update({
        status: 'converted_to_student',
        convertedStudentId: studentId,
        convertedAt: new Date(),
        lastUpdatedAt: new Date()
      });

      return {
        success: true,
        data: { studentId, studentData },
        message: 'Admission converted to student record successfully'
      };
    } catch (error) {
      console.error('Error converting admission to student:', error);
      return {
        success: false,
        message: 'Failed to convert admission to student record'
      };
    }
  }
}

module.exports = new AdmissionService();