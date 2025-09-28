// Mock database helpers
const mockDbHelpers = {
  getDocument: jest.fn(),
  setDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  getDocuments: jest.fn(),
  addToArray: jest.fn(),
  removeFromArray: jest.fn()
};

// Mock collections
const mockCollections = {
  USERS: 'users',
  STUDENTS: 'students',
  ADMISSIONS: 'admissions',
  EXAMS: 'exams',
  EXAM_REGISTRATIONS: 'examRegistrations',
  FEES: 'fees',
  FEE_PAYMENTS: 'feePayments',
  HOSTELS: 'hostels',
  HOSTEL_ALLOCATIONS: 'hostelAllocations',
  LIBRARY_BOOKS: 'libraryBooks',
  LIBRARY_TRANSACTIONS: 'libraryTransactions'
};

// Mock Firebase Auth
const mockAuth = {
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUserByEmail: jest.fn()
};

module.exports = {
  dbHelpers: mockDbHelpers,
  collections: mockCollections,
  mockAuth,

  // Helper functions to reset mocks
  resetMocks: () => {
    Object.values(mockDbHelpers).forEach(mock => mock.mockReset());
    Object.values(mockAuth).forEach(mock => mock.mockReset());
  },

  // Helper functions to setup common mock responses
  setupSuccessfulDbOperations: () => {
    mockDbHelpers.getDocument.mockResolvedValue(null);
    mockDbHelpers.setDocument.mockResolvedValue({ id: 'test-id' });
    mockDbHelpers.updateDocument.mockResolvedValue({ id: 'test-id' });
    mockDbHelpers.deleteDocument.mockResolvedValue(true);
    mockDbHelpers.getDocuments.mockResolvedValue([]);
  },

  setupFailedDbOperations: () => {
    const error = new Error('Database operation failed');
    mockDbHelpers.getDocument.mockRejectedValue(error);
    mockDbHelpers.setDocument.mockRejectedValue(error);
    mockDbHelpers.updateDocument.mockRejectedValue(error);
    mockDbHelpers.deleteDocument.mockRejectedValue(error);
    mockDbHelpers.getDocuments.mockRejectedValue(error);
  }
};