import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  seedAdmin: () => api.post('/auth/seed-admin')
};

// Product endpoints
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Serial Number endpoints
export const serialAPI = {
  getAll: (params) => api.get('/serials', { params }),
  getById: (id) => api.get(`/serials/${id}`),
  verify: (serialNumber) => api.get(`/serials/verify/${encodeURIComponent(serialNumber)}`),
  addSerials: (data) => api.post('/serials', data),
  sellSerial: (id, data) => api.post(`/serials/${id}/sell`, data),
  recordPayment: (id, data) => api.post(`/serials/${id}/payments`, data),
  update: (id, data) => api.put(`/serials/${id}`, data),
  delete: (id) => api.delete(`/serials/${id}`)
};

// Customer endpoints
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Dashboard endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard')
};

export default api;

