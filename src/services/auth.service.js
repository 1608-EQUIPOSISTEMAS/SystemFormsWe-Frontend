import api from './api'

export default {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  async me() {
    const { data } = await api.post('/auth/me')
    return data
  },

  async logout() {
    localStorage.removeItem('token')
  }
}