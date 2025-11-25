import api from './api'

export default class DashboardService {
  
  async getStats() {
    const response = await api.get('/dashboard/stats')
    return response.data
  }
  
  async getRecentForms(limit = 5) {
    const response = await api.get('/dashboard/recent-forms', {
      params: { limit }
    })
    return response.data
  }
  
  async getRecentActivity(limit = 10) {
    const response = await api.get('/dashboard/recent-activity', {
      params: { limit }
    })
    return response.data
  }
}

// Instancia singleton
export const dashboardService = new DashboardService()