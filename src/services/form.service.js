import api from './api'

class FormService {
  
  async getQuestionTypes() {
    const response = await api.get('/forms/question-types')
    return response.data
  }

  async create(formData) {
    const response = await api.post('/forms', formData)
    return response.data
  }

  async getPublic(uuid) {
  const response = await api.get(`/forms/public/${uuid}`)
  return response
}

  async list(params = {}) {
    const response = await api.get('/forms', { params })
    return response.data
  }

  async getByUuid(uuid) {
    const response = await api.get(`/forms/${uuid}`)
    return response.data
  }

  async update(uuid, formData) {
    const response = await api.put(`/forms/${uuid}`, formData)
    return response.data
  }

  async delete(uuid) {
    const response = await api.delete(`/forms/${uuid}`)
    return response.data
  }

  async duplicate(uuid) {
    const response = await api.post(`/forms/${uuid}/duplicate`)
    return response.data
  }
}

export const formService = new FormService()
export default new FormService()
