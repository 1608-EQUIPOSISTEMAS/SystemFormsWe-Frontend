// src/services/api.js
import axios from 'axios'
import { loader } from '@/utils/loader'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor
api.interceptors.request.use((config) => {
  // Agregar token de autenticación
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Mostrar loader (excepto si se indica lo contrario)
  if (!config.meta?.skipLoader) {
    loader.start()
  }

  return config
}, (error) => {
  loader.stop()
  return Promise.reject(error)
})

// Response interceptor
api.interceptors.response.use((response) => {
  if (!response.config.meta?.skipLoader) {
    loader.stop()
  }
  return response
}, (error) => {
  if (!error.config?.meta?.skipLoader) {
    loader.stop()
  }
  
  // Manejar errores de autenticación
  if (error.response?.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/admin/login'
  }
  
  return Promise.reject(error)
})

export default api