import { api } from './client'

export const authApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  me: () => api.get('/admin/me'),
  updateProfile: (data) => api.patch('/admin/me', data),
  refresh: () => api.post('/admin/refresh-token'),
}
