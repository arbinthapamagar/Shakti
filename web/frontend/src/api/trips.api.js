import { api } from './client'

export const tripsApi = {
  list: (params) => api.get('/admin/trips', { params }),
  get: (id) => api.get(`/admin/trips/${id}`),
  bids: (id) => api.get(`/admin/trips/${id}/bids`),
  cancel: (id, reason) => api.patch(`/admin/trips/${id}/cancel`, { reason }),
}
