import { api } from './client'

export const emergenciesApi = {
  list: (params) => api.get('/admin/emergencies', { params }),
  update: (id, data) => api.patch(`/admin/emergencies/${id}`, data),
}
