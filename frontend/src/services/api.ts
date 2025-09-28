import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token') || localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth-token');
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  rollNumber?: string;
  department?: string;
  semester?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'warden' | 'student';
  rollNumber?: string;
  department?: string;
  semester?: number;
}

export interface Student {
  id: string;
  studentId: string;
  userId?: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    address: {
      permanent: string;
      current: string;
    };
  };
  academicInfo: {
    course: string;
    branch: string;
    semester: number;
    year: number;
    rollNumber: string;
    admissionDate: string;
    status: 'active' | 'inactive' | 'graduated' | 'suspended';
  };
  documents?: Record<string, string | File | Blob>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    address: {
      permanent: string;
      current: string;
    };
  };
  academicInfo: {
    course: string;
    branch: string;
    semester: number;
    year: number;
    rollNumber: string;
    admissionDate: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/users/profile');
    return {
      success: response.data.success,
      user: response.data.data
    };
  },

  updateProfile: async (profileData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    bio?: string;
  }): Promise<{ success: boolean; user: User; message?: string }> => {
    const response = await api.put('/users/profile', profileData);
    return {
      success: response.data.success,
      user: response.data.user || response.data.data,
      message: response.data.message
    };
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.put('/users/change-password', passwordData);
    return {
      success: response.data.success,
      message: response.data.message
    };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('auth-token');
      localStorage.removeItem('auth-token');
    }
  },
};

export const studentsAPI = {
  getAll: async (params?: { search?: string; department?: string; year?: number }) => {
    const response = await api.get('/students', { params });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getMyDetails: async () => {
    const response = await api.get('/students/my-details');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  create: async (studentData: CreateStudentData) => {
    const response = await api.post('/students', studentData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  update: async (id: string, studentData: Partial<CreateStudentData>) => {
    const response = await api.put(`/students/${id}`, studentData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return {
      success: response.data.success,
      message: response.data.message
    };
  },
};

// Fee Management Types
export interface Fee {
  id: string;
  feeId: string;
  studentId: string;
  academicYear: string;
  semester: number;
  feeStructure: {
    tuitionFee?: number;
    labFee?: number;
    libraryFee?: number;
    examFee?: number;
    developmentFee?: number;
    total: number;
  };
  payments: FeePayment[];
  totalPaid: number;
  balance: number;
  status: 'pending' | 'partial' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  paymentId: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'cash' | 'card' | 'upi' | 'bank_transfer';
  transactionId?: string;
  receiptNumber: string;
  status: 'completed';
}

export interface CreateFeeStructureData {
  studentId: string;
  academicYear: string;
  semester: number;
  feeStructure: {
    tuitionFee?: number;
    labFee?: number;
    libraryFee?: number;
    examFee?: number;
    developmentFee?: number;
  };
}

export interface RecordPaymentData {
  amount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'bank_transfer';
  transactionId?: string;
  receiptNumber?: string;
}

// Hostel Management Types
export interface Hostel {
  id: string;
  hostelId: string;
  name: string;
  type: 'boys' | 'girls';
  capacity: number;
  warden: {
    name: string;
    phone: string;
    email: string;
  };
  address: string;
  facilities: string[];
  rules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HostelRoom {
  id: string;
  roomId: string;
  hostelId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  currentOccupancy: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  rent: number;
  facilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HostelAllocation {
  id: string;
  allocationId: string;
  studentId: string;
  roomId: string;
  hostelId: string;
  allocatedDate: string;
  vacatedDate?: string;
  status: 'active' | 'vacated';
  monthlyRent: number;
  securityDeposit: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHostelData {
  name: string;
  type: 'boys' | 'girls';
  capacity: number;
  warden: {
    name: string;
    phone: string;
    email: string;
  };
  address: string;
  facilities: string[];
  rules: string[];
}

export interface CreateRoomData {
  hostelId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  rent: number;
  facilities: string[];
}

export interface AllocateRoomData {
  studentId: string;
  roomId: string;
  monthlyRent?: number;
  securityDeposit?: number;
}

// Exam Management Types
export interface Exam {
  id: string;
  examId: string;
  name: string;
  examType: 'internal' | 'external' | 'practical' | 'viva';
  academicYear: string;
  semester: number;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  eligibleCourses: string[];
  subjects: ExamSubject[];
  status: 'upcoming' | 'registration_open' | 'ongoing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ExamSubject {
  subjectCode: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  duration: number; // in minutes
}

export interface ExamRegistration {
  id: string;
  registrationId: string;
  examId: string;
  studentId: string;
  registeredSubjects: {
    subjectCode: string;
    subjectName: string;
    isEligible: boolean;
    registrationFee: number;
  }[];
  totalFee: number;
  paymentStatus: 'pending' | 'paid';
  registrationDate: string;
  status: 'registered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamData {
  name: string;
  examType: 'internal' | 'external' | 'practical' | 'viva';
  academicYear: string;
  semester: number;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  eligibleCourses: string[];
  subjects: ExamSubject[];
}

export interface RegisterExamData {
  examId: string;
  registeredSubjects: {
    subjectCode: string;
    subjectName: string;
  }[];
}

// Fee Management API
export const feesAPI = {
  getAll: async (params?: { academicYear?: string; semester?: number; status?: string }) => {
    const response = await api.get('/fees', { params });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getStudentFees: async (studentId: string) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getMyFees: async () => {
    const response = await api.get('/fees/my-fees');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  createFeeStructure: async (feeData: CreateFeeStructureData) => {
    const response = await api.post('/fees', feeData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  recordPayment: async (feeId: string, paymentData: RecordPaymentData) => {
    const response = await api.post(`/fees/${feeId}/payment`, paymentData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getFeeStatistics: async () => {
    const response = await api.get('/fees/statistics');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getPendingFees: async () => {
    const response = await api.get('/fees/pending');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  }
};

// Hostel Management API
export const hostelsAPI = {
  getAll: async (params?: { type?: 'boys' | 'girls' }) => {
    const response = await api.get('/hostels', { params });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getById: async (id: string) => {
    const response = await api.get(`/hostels/${id}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  create: async (hostelData: CreateHostelData) => {
    const response = await api.post('/hostels', hostelData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  createRoom: async (roomData: CreateRoomData) => {
    const response = await api.post('/hostels/rooms', roomData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  allocateRoom: async (allocationData: AllocateRoomData) => {
    try {
      const response = await api.post('/hostels/allocate', allocationData);
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Allocation API Error:', error);
      console.error('Request data:', allocationData);
      if (error.response?.data) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  },

  getMyAllocation: async () => {
    try {
      const response = await api.get('/hostels/my-allocation');
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('API Error in getMyAllocation:', error);
      if (error.response?.status === 404) {
        // Handle case where student has no allocation
        return {
          success: false,
          data: null,
          message: 'You do not have any active room allocation'
        };
      }
      // Re-throw for other errors
      throw error;
    }
  },

  getAvailableRooms: async (hostelId: string) => {
    const response = await api.get(`/hostels/${hostelId}/available-rooms`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getOccupancyReport: async (hostelId: string) => {
    const response = await api.get(`/hostels/${hostelId}/occupancy-report`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getStatistics: async () => {
    const response = await api.get('/hostels/statistics');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  vacateRoom: async (allocationId: string) => {
    const response = await api.post(`/hostels/${allocationId}/vacate`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  }
};

// Exam Management API
export const examsAPI = {
  getAll: async (params?: { academicYear?: string; semester?: number; examType?: string; status?: string }) => {
    const response = await api.get('/exams', { params });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getById: async (id: string) => {
    const response = await api.get(`/exams/${id}`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  create: async (examData: CreateExamData) => {
    const response = await api.post('/exams', examData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  register: async (registrationData: RegisterExamData) => {
    const response = await api.post('/exams/register', registrationData);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getMySchedule: async () => {
    const response = await api.get('/exams/my-schedule');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getMyRegistrations: async () => {
    const response = await api.get('/exams/my-registrations');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getRegisteredStudents: async (examId: string) => {
    const response = await api.get(`/exams/${examId}/students`);
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  updateStatus: async (examId: string, status: string) => {
    const response = await api.patch(`/exams/${examId}/status`, { status });
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  getStatistics: async () => {
    const response = await api.get('/exams/statistics');
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  },

  cancelRegistration: async (registrationId: string) => {
    const response = await api.delete(`/exams/registrations/${registrationId}`);
    return {
      success: response.data.success,
      message: response.data.message
    };
  }
};

export default api;