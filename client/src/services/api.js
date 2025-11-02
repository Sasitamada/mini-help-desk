import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Workspaces
export const workspacesAPI = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
  getMembers: (id) => api.get(`/workspaces/${id}/members`),
  addMember: (id, data) => api.post(`/workspaces/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}`),
  updateMemberRole: (id, userId, data) => api.put(`/workspaces/${id}/members/${userId}`, data),
};

// Projects
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getByWorkspace: (workspaceId) => api.get(`/projects/workspace/${workspaceId}`),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Tasks
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id, userId) => api.delete(`/tasks/${id}`, { data: { userId } }),
  bulkUpdate: (tasks) => api.put('/tasks/bulk/update', { tasks }),
  uploadAttachments: (id, formData) => api.post(`/tasks/${id}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteAttachment: (id, filename, userId) => api.delete(`/tasks/${id}/attachments/${filename}`, { data: { userId } }),
  addReminder: (id, data) => api.post(`/tasks/${id}/reminders`, data),
  getHistory: (id) => api.get(`/tasks/${id}/history`),
};

// Comments
export const commentsAPI = {
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),
  getById: (id) => api.get(`/comments/${id}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Workspace Chat
export const workspaceChatAPI = {
  getMessages: (workspaceId) => api.get(`/workspace-chat/${workspaceId}`),
  sendMessage: (workspaceId, formData) => api.post(`/workspace-chat/${workspaceId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAiSuggestion: (workspaceId, prompt) => api.post(`/workspace-chat/${workspaceId}/ai`, { prompt }),
};

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Users
export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
  getAll: (params) => api.get('/users', { params }),
  update: (id, formData) => api.put(`/users/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Workspace Invitations
export const workspaceInvitationsAPI = {
  invite: (data) => api.post('/workspace-invitations/invite', data),
  accept: (token, data) => api.post(`/workspace-invitations/accept/${token}`, data),
  getByWorkspace: (workspaceId) => api.get(`/workspace-invitations/workspace/${workspaceId}`),
  cancel: (id) => api.delete(`/workspace-invitations/${id}`),
};

export default api;
