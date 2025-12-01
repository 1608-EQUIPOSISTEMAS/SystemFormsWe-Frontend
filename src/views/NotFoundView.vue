<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
      
      <div class="actions">
        <router-link to="/" class="btn-primary">
          <i class="bi bi-house"></i>
          Ir al inicio
        </router-link>
        
        <router-link 
          v-if="isAuthenticated" 
          to="/admin/dashboard" 
          class="btn-secondary"
        >
          <i class="bi bi-speedometer2"></i>
          Ir al dashboard
        </router-link>
      </div>
      
      <div class="help-links">
        <p>Enlaces útiles:</p>
        <div class="links-grid">
          <router-link to="/admin/forms">Formularios</router-link>
          <router-link to="/admin/responses">Respuestas</router-link>
          <router-link to="/admin/users">Usuarios</router-link>
          <router-link to="/admin/settings">Configuración</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
}

p {
  color: #6b7280;
  margin: 0 0 32px 0;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 48px;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #001845;
  color: white;
}

.btn-primary:hover {
  background: #002d6e;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #001845;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  border-color: #001845;
  transform: translateY(-1px);
}

.help-links {
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.help-links p {
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.links-grid a {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.links-grid a:hover {
  border-color: #001845;
  color: #001845;
}

@media (max-width: 640px) {
  .error-code {
    font-size: 6rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>