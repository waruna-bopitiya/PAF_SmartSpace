import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Resource APIs
export const resourceAPI = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  search: (params) => api.get('/resources/search', { params }),
};

// Booking APIs
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  approve: (id, notes) => api.post(`/bookings/${id}/approve`, {}, { params: { notes } }),
  reject: (id, reason) => api.post(`/bookings/${id}/reject`, {}, { params: { reason } }),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  getPending: () => api.get('/bookings/pending'),
};

// Ticket APIs
export const ticketAPI = {
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  getOpen: () => api.get('/tickets/open'),
  assign: (id, technicianId) => api.post(`/tickets/${id}/assign`, {}, { params: { technicianId } }),
  updateStatus: (id, status, resolutionNotes) => 
    api.put(`/tickets/${id}/status`, {}, { params: { status, resolutionNotes } }),
  reject: (id, reason) => api.post(`/tickets/${id}/reject`, {}, { params: { reason } }),
  addComment: (id, content) => api.post(`/tickets/${id}/comments`, {}, { params: { content } }),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
