import { api } from './client'

export const withdrawalsApi = {
  list: (params) => api.get('/admin/withdrawals', { params }),
  process: (id, data) => api.patch(`/admin/withdrawals/${id}`, data),
}
