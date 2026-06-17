import { api } from './client'

export const authApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  me: () => api.get('/admin/me'),
  updateProfile: (data) => api.patch('/admin/me', data),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/admin/me/avatar', form, { headers: { 'Content-Type': undefined } })
  },
  deleteAvatar: () => api.delete('/admin/me/avatar'),
  refresh: () => api.post('/admin/refresh-token'),
}
