// src/services/response.service.js
import api from './api'

class ResponseService {
  
  async submit(data) {
    const response = await api.post('/responses/submit', data)
    return response
  }
  
  async get(responseId) {
    const response = await api.get(`/responses/${responseId}`)
    return response
  }
  
  async list(params = {}) {
    const response = await api.get('/responses', { params })
    return response
  }

  async delete(responseId) {
    const response = await api.delete(`/responses/${responseId}`)
    return response
  }
}

// Exportar como instancia por defecto
export default new ResponseService()