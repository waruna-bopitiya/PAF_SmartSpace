import axios from 'axios';

const normalizeApiBaseUrl = (baseUrl) => {
  const fallback = 'http://localhost:8080/api';
  if (!baseUrl || typeof baseUrl !== 'string') {
    return fallback;
  }

  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }

  return `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: process.env.REACT_APP_API_TIMEOUT || 30000,
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH ENDPOINTS =====
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data) =>
    apiClient.post('/auth/register', data),
  logout: () =>
    apiClient.post('/auth/logout'),
  validate: () =>
    apiClient.get('/auth/validate'),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
};

// ===== USER ENDPOINTS =====
export const userAPI = {
  getAll: () =>
    apiClient.get('/users'),
  getById: (id) =>
    apiClient.get(`/users/${id}`),
  delete: (id) =>
    apiClient.delete(`/users/${id}`),
  update: (id, data) =>
    apiClient.put(`/users/${id}`, data),
};

// ===== RESOURCE ENDPOINTS =====
export const resourceAPI = {
  getAll: (page = 0, size = 10) =>
    apiClient.get('/resources', { params: { page, size } }),
  getById: (id) =>
    apiClient.get(`/resources/${id}`),
  getActive: () =>
    apiClient.get('/resources/status/active'),
  getByType: (type) =>
    apiClient.get(`/resources/type/${type}`),
  getByLocation: (location) =>
    apiClient.get(`/resources/location/${location}`),
  search: (query) =>
    apiClient.get('/resources/search', { params: { q: query } }),
  create: (data) =>
    apiClient.post('/resources', data),
  update: (id, data) =>
    apiClient.put(`/resources/${id}`, data),
  updateStatus: (id, status) =>
    apiClient.patch(`/resources/${id}/status?status=${status}`),
  delete: (id) =>
    apiClient.delete(`/resources/${id}`),
};

// ===== BOOKING ENDPOINTS =====
export const bookingAPI = {
  getAll: (page = 0, size = 10) =>
    apiClient.get('/bookings', { params: { page, size } }),
  getById: (id) =>
    apiClient.get(`/bookings/${id}`),
  getByUser: (userId, page = 0, size = 10) =>
    apiClient.get(`/bookings/user/${userId}`, { params: { page, size } }),
  getPending: (page = 0, size = 10) =>
    apiClient.get('/bookings/status/pending', { params: { page, size } }),
  getByResource: (resourceId) =>
    apiClient.get(`/bookings/resource/${resourceId}`),
  checkConflict: (resourceId, startTime, endTime) =>
    apiClient.get(`/bookings/resource/${resourceId}/conflict`, {
      params: { startTime, endTime },
    }),
  create: (data) =>
    apiClient.post('/bookings', data),
  update: (id, data) =>
    apiClient.patch(`/bookings/${id}`, data),
  approve: (id, reason) =>
    apiClient.put(`/bookings/${id}/approve`, { reason }),
  reject: (id, reason) =>
    apiClient.put(`/bookings/${id}/reject`, { reason }),
  cancel: (id) =>
    apiClient.put(`/bookings/${id}/cancel`, {}),
};

// ===== TICKET ENDPOINTS =====
export const ticketAPI = {
  getAll: (page = 0, size = 10) =>
    apiClient.get('/tickets', { params: { page, size } }),
  getById: (id) =>
    apiClient.get(`/tickets/${id}`),
  getCreatedBy: (userId, page = 0, size = 10) =>
    apiClient.get(`/tickets/created-by/${userId}`, { params: { page, size } }),
  getAssignedTo: (userId, page = 0, size = 10) =>
    apiClient.get(`/tickets/assigned-to/${userId}`, { params: { page, size } }),
  getOpen: (page = 0, size = 10) =>
    apiClient.get('/tickets/status/open', { params: { page, size } }),
  getByResource: (resourceId) =>
    apiClient.get(`/tickets/resource/${resourceId}`),
  getComments: (ticketId) =>
    apiClient.get(`/tickets/${ticketId}/comments`),
  create: (data) =>
    apiClient.post('/tickets', data),
  update: (id, data) =>
    apiClient.patch(`/tickets/${id}`, data),
  assign: (id, assignedTo) =>
    apiClient.put(`/tickets/${id}/assign`, { assignedTo }),
  updateStatus: (id, status) =>
    apiClient.put(`/tickets/${id}/status`, null, { params: { status } }),
  reject: (id, reason) =>
    apiClient.put(`/tickets/${id}/reject`, { reason }),
  close: (id, resolutionNotes) =>
    apiClient.put(`/tickets/${id}/close`, { resolutionNotes }),
  addComment: (ticketId, content) =>
    apiClient.post(`/tickets/${ticketId}/comments`, { content }),
  delete: (id) =>
    apiClient.delete(`/tickets/${id}`),
};

// ===== NOTIFICATION ENDPOINTS =====
export const notificationAPI = {
  getAll: (userId, page = 0, size = 10) =>
    apiClient.get(`/notifications/user/${userId}`, { params: { page, size } }),
  getUnread: (userId, page = 0, size = 10) =>
    apiClient.get(`/notifications/user/${userId}/unread`, { params: { page, size } }),
  getUnreadCount: (userId) =>
    apiClient.get(`/notifications/user/${userId}/unread-count`),
  getById: (id) =>
    apiClient.get(`/notifications/${id}`),
  markAsRead: (id) =>
    apiClient.put(`/notifications/${id}/read`, {}),
  markAllAsRead: (userId) =>
    apiClient.put(`/notifications/user/${userId}/read-all`, {}),
  delete: (id) =>
    apiClient.delete(`/notifications/${id}`),
  deleteAll: (userId) =>
    apiClient.delete(`/notifications/user/${userId}/all`),
};

export default apiClient;
