import { api } from './client'

export const pricingApi = {
  get: () => api.get('/admin/pricing'),
  update: (data) => api.put('/admin/pricing', data),
}
