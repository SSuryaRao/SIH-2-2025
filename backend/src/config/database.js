const { getFirestore } = require('./firebase');

// Get Firestore instance
const db = getFirestore();

// Collection references
const collections = {
  USERS: 'users',
  STUDENTS: 'students',
  FEES: 'fees',
  HOSTELS: 'hostels',
  HOSTEL_ROOMS: 'hostelRooms',
  HOSTEL_ALLOCATIONS: 'hostelAllocations',
  EXAMS: 'exams',
  EXAM_REGISTRATIONS: 'examRegistrations'
};

// Helper functions for database operations
const dbHelpers = {
  // Add document with auto-generated ID
  async addDocument(collectionName, data) {
    try {
      const docRef = await db.collection(collectionName).add({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Error adding document: ${error.message}`);
    }
  },

  // Add document with custom ID
  async setDocument(collectionName, docId, data) {
    try {
      await db.collection(collectionName).doc(docId).set({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docId, ...data };
    } catch (error) {
      throw new Error(`Error setting document: ${error.message}`);
    }
  },

  // Get document by ID
  async getDocument(collectionName, docId) {
    try {
      const doc = await db.collection(collectionName).doc(docId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting document: ${error.message}`);
    }
  },

  // Update document
  async updateDocument(collectionName, docId, data) {
    try {
      await db.collection(collectionName).doc(docId).update({
        ...data,
        updatedAt: new Date()
      });
      return { id: docId, ...data };
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  },

  // Delete document
  async deleteDocument(collectionName, docId) {
    try {
      await db.collection(collectionName).doc(docId).delete();
      return { id: docId };
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  },

  // Get documents with query
  async getDocuments(collectionName, filters = [], orderBy = null, limit = null) {
    try {
      let query = db.collection(collectionName);

      // Apply filters
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      const docs = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      return docs;
    } catch (error) {
      throw new Error(`Error getting documents: ${error.message}`);
    }
  },

  // Check if document exists
  async documentExists(collectionName, docId) {
    try {
      const doc = await db.collection(collectionName).doc(docId).get();
      return doc.exists;
    } catch (error) {
      throw new Error(`Error checking document existence: ${error.message}`);
    }
  },

  // Get document count
  async getDocumentCount(collectionName, filters = []) {
    try {
      let query = db.collection(collectionName);

      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });

      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Error getting document count: ${error.message}`);
    }
  }
};

module.exports = {
  db,
  collections,
  dbHelpers
};