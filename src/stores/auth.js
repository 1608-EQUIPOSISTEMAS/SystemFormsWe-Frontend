import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // ══════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // ══════════════════════════════════════════
  // GETTERS
  // ══════════════════════════════════════════
  const isAuthenticated = computed(() => !!token.value)
  
  const fullName = computed(() => {
    if (!user.value) return 'Usuario'
    // ✅ Usar camelCase como viene del backend
    const first = user.value.firstName || user.value.first_name || ''
    const last = user.value.lastName || user.value.last_name || ''
    return `${first} ${last}`.trim() || 'Usuario'
  })

  const firstName = computed(() => {
    if (!user.value) return 'Usuario'
    return user.value.firstName || user.value.first_name || 'Usuario'
  })

  const initials = computed(() => {
    if (!user.value) return 'U'
    const f = (user.value.firstName || user.value.first_name)?.[0] || ''
    const l = (user.value.lastName || user.value.last_name)?.[0] || ''
    return (f + l).toUpperCase() || 'U'
  })

  const userRole = computed(() => {
    if (!user.value?.role) return null
    return user.value.role
  })

  // ══════════════════════════════════════════
  // ACTIONS
  // ══════════════════════════════════════════
  function setAuth(userData, tokenValue) {
    user.value = userData
    token.value = tokenValue
    
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function checkAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      return true
    }
    return false
  }

  return {
    token,
    user,
    isAuthenticated,
    fullName,
    firstName,
    initials,
    userRole,
    setAuth,
    clearAuth,
    checkAuth
  }
})