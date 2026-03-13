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
    // 401 Unauthorized ise token'ı sil ve sayfayı yenile (sonsuz döngü önlenir)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentCompany');
      
      // Sadece login sayfasında değilsek yönlendir
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
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
  delete: (id) => apiClient.delete(`/users/${id}`),
  updateSkills: (id, skills) => apiClient.put(`/users/${id}/skills`, { skills }),
  uploadAvatar: (id, formData) => apiClient.post(`/users/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
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
  list: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/read/${id}`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
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
  list: () => apiClient.get('/projects/company'),
  listByWorkspace: (workspaceId) => apiClient.get(`/projects/workspace/${workspaceId}`),
  get: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post('/projects', data),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  addMember: (id, userId, role) => apiClient.post(`/projects/${id}/members`, { user_id: userId, role }),
  removeMember: (id, userId) => apiClient.delete(`/projects/${id}/members/${userId}`)
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
  myWeekly: () => apiClient.get('/attendance/my-weekly'),
  startBreak: (breakTypeId) => apiClient.post('/attendance/breaks/start', { break_type_id: breakTypeId || null }),
  endBreak: (breakId) => apiClient.post(`/attendance/breaks/end/${breakId}`)
};

// ============== LEAVE REQUESTS ENDPOINTS ==============
export const leaveAPI = {
  list: () => apiClient.get('/leaves'),
  create: (data) => apiClient.post('/leaves', data),
  getPending: () => apiClient.get('/leaves/pending'),
  getAll: () => apiClient.get('/leaves/all'),
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

// ============== SURVEY ENDPOINTS ==============
export const surveyAPI = {
  list: () => apiClient.get('/surveys'),
  create: (data) => apiClient.post('/surveys', data),
  get: (id) => apiClient.get(`/surveys/${id}`),
  update: (id, data) => apiClient.put(`/surveys/${id}`, data),
  delete: (id) => apiClient.delete(`/surveys/${id}`),
  submit: (id, answers) => apiClient.post(`/surveys/${id}/submit`, { answers }),
  getResponses: (id) => apiClient.get(`/surveys/${id}/responses`),
  getStats: (id) => apiClient.get(`/surveys/${id}/stats`)
};

// ============== TASK STATUS ENDPOINTS ==============
export const taskStatusAPI = {
  list: () => apiClient.get('/task-statuses'),
  get: (id) => apiClient.get(`/task-statuses/${id}`),
  create: (data) => apiClient.post('/task-statuses', data),
  update: (id, data) => apiClient.put(`/task-statuses/${id}`, data),
  delete: (id) => apiClient.delete(`/task-statuses/${id}`),
  reorder: (items) => apiClient.put('/task-statuses/reorder', { items })
};

// ============== TASK PRIORITY ENDPOINTS ==============
export const taskPriorityAPI = {
  list: () => apiClient.get('/task-priorities'),
  get: (id) => apiClient.get(`/task-priorities/${id}`),
  create: (data) => apiClient.post('/task-priorities', data),
  update: (id, data) => apiClient.put(`/task-priorities/${id}`, data),
  delete: (id) => apiClient.delete(`/task-priorities/${id}`),
  reorder: (items) => apiClient.put('/task-priorities/reorder', { items })
};

// ============== RECURRING TASK ENDPOINTS ==============
export const recurringTaskAPI = {
  list: () => apiClient.get('/recurring-tasks'),
  get: (id) => apiClient.get(`/recurring-tasks/${id}`),
  create: (data) => apiClient.post('/recurring-tasks', data),
  update: (id, data) => apiClient.put(`/recurring-tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/recurring-tasks/${id}`),
  toggleActive: (id) => apiClient.patch(`/recurring-tasks/${id}/toggle`)
};

export const companyProfileAPI = {
  get: () => apiClient.get('/settings/profile'),
  update: (data) => apiClient.put('/settings/profile', data),
  uploadLogo: (formData) => apiClient.post('/settings/profile/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const foldersAPI = {
  get: () => apiClient.get('/settings/folders'),
  update: (data) => apiClient.put('/settings/folders', data),
};

export const dashboardSettingAPI = {
  get: () => apiClient.get('/dashboard-settings'),
  update: (data) => apiClient.put('/dashboard-settings', data),
};

export const auditLogAPI = {
  list: (params) => apiClient.get('/audit-logs', { params }),
  create: (data) => apiClient.post('/audit-logs', data),
  clear: () => apiClient.delete('/audit-logs'),
};

export const contactAPI = {
  list: () => apiClient.get('/contacts'),
  create: (data) => apiClient.post('/contacts', data),
  update: (id, data) => apiClient.put(`/contacts/${id}`, data),
  delete: (id) => apiClient.delete(`/contacts/${id}`),
};

export const tagAPI = {
  list: () => apiClient.get('/tags'),
  create: (data) => apiClient.post('/tags', data),
  update: (id, data) => apiClient.put(`/tags/${id}`, data),
  delete: (id) => apiClient.delete(`/tags/${id}`),
};

export const personalNoteAPI = {
  list: () => apiClient.get('/personal-notes'),
  create: (data) => apiClient.post('/personal-notes', data),
  update: (id, data) => apiClient.put(`/personal-notes/${id}`, data),
  delete: (id) => apiClient.delete(`/personal-notes/${id}`),
};

// ============== REPORTS ENDPOINTS ==============
export const reportAPI = {
  taskReport: () => apiClient.get('/reports/tasks'),
  attendanceReport: (params) => apiClient.get('/reports/attendance', { params }),
  leaveReport: () => apiClient.get('/reports/leaves'),
  weeklyTrend: () => apiClient.get('/reports/weekly-trend'),
  taskTrends: () => apiClient.get('/reports/task-trends'),
};

// ============== ROLES ENDPOINTS ==============
export const roleAPI = {
  list: () => apiClient.get('/roles'),
  create: (data) => apiClient.post('/roles', data),
  update: (id, data) => apiClient.put(`/roles/${id}`, data),
  delete: (id) => apiClient.delete(`/roles/${id}`),
  reorder: (orderedIds) => apiClient.put('/roles/reorder/sort', { orderedIds }),
};

// ============== SMS ENDPOINTS ==============
export const smsAPI = {
  // Groups
  listGroups: () => apiClient.get('/sms/groups'),
  createGroup: (data) => apiClient.post('/sms/groups', data),
  updateGroup: (id, data) => apiClient.put(`/sms/groups/${id}`, data),
  deleteGroup: (id) => apiClient.delete(`/sms/groups/${id}`),
  // History + Send
  listHistory: () => apiClient.get('/sms/history'),
  send: (data) => apiClient.post('/sms/send', data),
};

// ============== SYSTEM ENDPOINTS ==============
export const systemAPI = {
  // Server restart (sadece boss)
  restart: () => apiClient.post('/system/restart'),
  // Emergency restart (gizli token ile)
  emergencyRestart: (token) => apiClient.post(`/system/emergency-restart/${token}`),
  // Server health check
  health: () => apiClient.get('/system/health'),
};

export default apiClient;
