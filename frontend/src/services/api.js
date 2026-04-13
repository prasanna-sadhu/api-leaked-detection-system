import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (updateData) => {
    const response = await api.put('/auth/profile', updateData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};
export const scanService = {
  scanFile: async (filePath) => {
    const response = await api.post('/scan', { filePath });
    return response.data;
  }
};

// Findings Service
export const findingsService = {
  getAllFindings: async (params = {}) => {
    const response = await api.get('/findings', { params });
    return response.data;
  },

  getFindingById: async (id) => {
    const response = await api.get(`/findings/${id}`);
    return response.data;
  }
};

// Notifications Service
export const notificationsService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsSent: async (id) => {
    const response = await api.post(`/notifications/${id}/sent`);
    return response.data;
  },

  markAsAcknowledged: async (id) => {
    const response = await api.post(`/notifications/${id}/acknowledge`);
    return response.data;
  }
};

// Reports Service
export const reportsService = {
  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  },

  getFilteredFindings: async (filters = {}) => {
    const response = await api.get('/reports/findings', { params: filters });
    return response.data;
  }
};
