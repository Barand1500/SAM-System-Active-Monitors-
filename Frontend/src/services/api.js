import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// JWT token ekleyici (her istek öncesi)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hata response handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized ise token'ı sil ve login'e yönelt
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============== USERS ENDPOINTS ==============
export const userAPI = {
  list: () => apiClient.get('/users'),
  get: (id) => apiClient.get(`/users/${id}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`)
};

// ============== ANNOUNCEMENTS ENDPOINTS ==============
export const announcementAPI = {
  list: () => apiClient.get('/announcements'),
  create: (data) => apiClient.post('/announcements', data),
  update: (id, data) => apiClient.put(`/announcements/${id}`, data),
  delete: (id) => apiClient.delete(`/announcements/${id}`)
};

// ============== DEPARTMENTS ENDPOINTS ==============
export const departmentAPI = {
  list: () => apiClient.get('/departments'),
  get: (id) => apiClient.get(`/departments/${id}`),
  create: (data) => apiClient.post('/departments', data),
  update: (id, data) => apiClient.put(`/departments/${id}`, data),
  delete: (id) => apiClient.delete(`/departments/${id}`)
};

// ============== NOTIFICATIONS ENDPOINTS ==============
export const notificationAPI = {
  list: () => apiClient.get('/notifications')
};

// ============== TASKS ENDPOINTS ==============
export const taskAPI = {
  list: () => apiClient.get('/tasks'),
  get: (id) => apiClient.get(`/tasks/${id}`),
  create: (data) => apiClient.post('/tasks', data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
  assign: (taskId, userId) => apiClient.post(`/tasks/${taskId}/assign`, { user_id: userId }),
  unassign: (taskId, userId) => apiClient.delete(`/tasks/${taskId}/assign/${userId}`),
  getByList: (listId) => apiClient.get(`/tasks/list/${listId}`),
  getConfig: () => apiClient.get('/tasks/config')
};

// ============== PROJECTS ENDPOINTS ==============
export const projectAPI = {
  listByWorkspace: (workspaceId) => apiClient.get(`/projects/workspace/${workspaceId}`),
  get: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post('/projects', data),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`)
};

// ============== TASK LISTS ENDPOINTS ==============
export const taskListAPI = {
  listByProject: (projectId) => apiClient.get(`/task-lists/project/${projectId}`),
  get: (id) => apiClient.get(`/task-lists/${id}`),
  create: (data) => apiClient.post('/task-lists', data),
  update: (id, data) => apiClient.put(`/task-lists/${id}`, data),
  delete: (id) => apiClient.delete(`/task-lists/${id}`)
};

// ============== WORKSPACE ENDPOINTS ==============
export const workspaceAPI = {
  list: () => apiClient.get('/workspaces'),
  get: (id) => apiClient.get(`/workspaces/${id}`)
};

// ============== ATTENDANCE ENDPOINTS ==============
export const attendanceAPI = {
  checkIn: () => apiClient.post('/attendance/check-in'),
  checkOut: () => apiClient.post('/attendance/check-out'),
  list: (date) => apiClient.get('/attendance', { params: { date } }),
  startBreak: (breakTypeId) => apiClient.post('/attendance/breaks/start', { break_type_id: breakTypeId || null }),
  endBreak: (breakId) => apiClient.post(`/attendance/breaks/end/${breakId}`)
};

// ============== LEAVE REQUESTS ENDPOINTS ==============
export const leaveAPI = {
  list: () => apiClient.get('/leaves'),
  create: (data) => apiClient.post('/leaves', data),
  getPending: () => apiClient.get('/leaves/pending'),
  approve: (id) => apiClient.patch(`/leaves/${id}/approve`),
  reject: (id, reason) => apiClient.patch(`/leaves/${id}/reject`, { rejection_reason: reason })
};

// ============== SUPPORT TICKET ENDPOINTS ==============
export const supportTicketAPI = {
  list: (params) => apiClient.get('/support-tickets', { params }),
  create: (data) => apiClient.post('/support-tickets', data),
  get: (id) => apiClient.get(`/support-tickets/${id}`),
  update: (id, data) => apiClient.put(`/support-tickets/${id}`, data),
  delete: (id) => apiClient.delete(`/support-tickets/${id}`),
  updateStatus: (id, data) => apiClient.put(`/support-tickets/${id}/status`, data),
  getByStatus: (status) => apiClient.get(`/support-tickets/status/${status}`),
  assign: (id, userId) => apiClient.put(`/support-tickets/${id}/assign`, { userId }),
  addMessage: (id, data) => apiClient.post(`/support-tickets/${id}/messages`, data),
  getStats: () => apiClient.get('/support-tickets/company/stats')
};

// ============== CUSTOMER (CRM) ENDPOINTS ==============
export const customerAPI = {
  list: (params) => apiClient.get('/customers', { params }),
  create: (data) => apiClient.post('/customers', data),
  get: (id) => apiClient.get(`/customers/${id}`),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`)
};

// ============== FILE SHARING ENDPOINTS ==============
export const fileAPI = {
  list: () => apiClient.get('/files/company'),
  upload: (formData) => apiClient.post('/files', formData, {
    headers: { 'Content-Type': undefined },
    timeout: 60000
  }),
  download: (id) => apiClient.get(`/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => apiClient.delete(`/files/${id}`)
};

export default apiClient;
