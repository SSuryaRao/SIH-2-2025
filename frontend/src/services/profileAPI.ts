import { api } from './api';

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  // Add more fields as needed based on user type
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category?: string;
}

export interface ProfileStats {
  [key: string]: {
    label: string;
    value: string | number;
    description?: string;
    trend?: 'up' | 'down' | 'stable';
  };
}

export const profileAPI = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return {
      success: response.data.success,
      data: response.data.user,
      message: response.data.message
    };
  },

  // Update user profile
  updateProfile: async (profileData: ProfileUpdateData) => {
    const response = await api.put('/users/profile', profileData);
    return {
      success: response.data.success,
      data: response.data.user,
      message: response.data.message
    };
  },

  // Change password
  changePassword: async (passwordData: PasswordChangeData) => {
    const response = await api.put('/users/change-password', passwordData);
    return {
      success: response.data.success,
      message: response.data.message
    };
  },

  // Get user activity log
  getActivityLog: async (limit = 20) => {
    const response = await api.get('/users/activity-log', { params: { limit } });
    return {
      success: response.data.success,
      data: response.data.activities as ActivityItem[],
      message: response.data.message
    };
  },

  // Get user statistics (role-specific)
  getProfileStats: async () => {
    const response = await api.get('/users/profile-stats');
    return {
      success: response.data.success,
      data: response.data.stats as ProfileStats,
      message: response.data.message
    };
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: response.data.success,
      data: response.data.profilePictureUrl,
      message: response.data.message
    };
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await api.delete('/users/profile-picture');
    return {
      success: response.data.success,
      message: response.data.message
    };
  },

  // Get profile completion percentage
  getProfileCompletion: async () => {
    const response = await api.get('/users/profile-completion');
    return {
      success: response.data.success,
      data: {
        percentage: response.data.percentage,
        missingFields: response.data.missingFields,
        suggestions: response.data.suggestions
      },
      message: response.data.message
    };
  },

  // Export user data
  exportUserData: async (format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    const response = await api.get('/users/export-data', {
      params: { format },
      responseType: 'blob'
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `profile-data.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },

  // Role-specific profile endpoints
  admin: {
    getSystemStats: async () => {
      const response = await api.get('/admin/system-stats');
      return {
        success: response.data.success,
        data: response.data.stats,
        message: response.data.message
      };
    },

    getManagementOverview: async () => {
      const response = await api.get('/admin/management-overview');
      return {
        success: response.data.success,
        data: response.data.overview,
        message: response.data.message
      };
    }
  },

  staff: {
    getTeachingStats: async () => {
      const response = await api.get('/staff/teaching-stats');
      return {
        success: response.data.success,
        data: response.data.stats,
        message: response.data.message
      };
    },

    getCurrentCourses: async () => {
      const response = await api.get('/staff/current-courses');
      return {
        success: response.data.success,
        data: response.data.courses,
        message: response.data.message
      };
    }
  },

  warden: {
    getHostelStats: async () => {
      const response = await api.get('/warden/hostel-stats');
      return {
        success: response.data.success,
        data: response.data.stats,
        message: response.data.message
      };
    },

    getManagedHostels: async () => {
      const response = await api.get('/warden/managed-hostels');
      return {
        success: response.data.success,
        data: response.data.hostels,
        message: response.data.message
      };
    }
  },

  student: {
    getAcademicStats: async () => {
      const response = await api.get('/students/academic-stats');
      return {
        success: response.data.success,
        data: response.data.stats,
        message: response.data.message
      };
    },

    getCurrentCourses: async () => {
      const response = await api.get('/students/current-courses');
      return {
        success: response.data.success,
        data: response.data.courses,
        message: response.data.message
      };
    }
  }
};