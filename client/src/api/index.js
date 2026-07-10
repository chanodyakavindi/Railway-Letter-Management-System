import api from './client';

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const usersApi = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateStatus: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }),
  resetPassword: (id, password) => api.patch(`/users/${id}/reset-password`, { password }),
  tracking: () => api.get('/users/tracking'),
};

export const lettersApi = {
  list: (params) => api.get('/letters', { params }),
  get: (id) => api.get(`/letters/${id}`),
  create: (data) => api.post('/letters', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/letters/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, body) => api.patch(`/letters/${id}/status`, body),
  updateReminder: (id, body) => api.patch(`/letters/${id}/reminder`, body),
  addReply: (id, data) => api.post(`/letters/${id}/replies`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  upload: (id, data) => api.post(`/letters/${id}/upload`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadUrl: (id, attachmentId) => `/api/letters/${id}/download/${attachmentId}`,
  categories: () => api.get('/letters/categories/list'),
};

export const dashboardApi = {
  stats: (period) => api.get('/dashboard/stats', { params: { period } }),
  recent: () => api.get('/dashboard/recent'),
  dailySummary: () => api.get('/dashboard/daily-summary'),
};

export const remindersApi = {
  list: (period) => api.get('/reminders', { params: { period } }),
  summary: () => api.get('/reminders/summary'),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const auditApi = {
  list: (params) => api.get('/audit-logs', { params }),
};

export const reportsApi = {
  csvUrl: (params) => {
    const q = new URLSearchParams(params).toString();
    return `/api/reports/letters.csv?${q}`;
  },
  pdfUrl: (params) => {
    const q = new URLSearchParams(params).toString();
    return `/api/reports/letters.pdf?${q}`;
  },
};
