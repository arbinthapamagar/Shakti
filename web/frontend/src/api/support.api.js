import { api } from './client'

export const supportApi = {
  list: (params) => api.get('/admin/support', { params }),
  get: (id) => api.get(`/admin/support/${id}`),
  update: (id, data) => api.patch(`/admin/support/${id}`, data),
  reply: (id, message) => api.post(`/admin/support/${id}/reply`, { message }),
  assign: (id, adminId) => api.patch(`/admin/support/${id}/assign`, { adminId }),
  comment: (id, { body, mentions }) => api.post(`/admin/support/${id}/comments`, { body, mentions }),
  editComment: (id, commentId, { body, mentions }) => api.patch(`/admin/support/${id}/comments/${commentId}`, { body, mentions }),
  deleteComment: (id, commentId) => api.delete(`/admin/support/${id}/comments/${commentId}`),
  agents: () => api.get('/admin/support-agents'),
  settings: () => api.get('/admin/support-settings'),
  updateSettings: (data) => api.patch('/admin/support-settings', data),
}
