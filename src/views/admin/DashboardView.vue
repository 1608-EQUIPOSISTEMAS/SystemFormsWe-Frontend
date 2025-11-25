<!-- frontend/src/views/admin/DashboardView.vue -->
<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-header">
        <div class="welcome-brand">
          <div class="brand-mark">
            <span class="mark-w">W</span>
            <span class="mark-separator">|</span>
            <span class="mark-e">E</span>
          </div>
          <div class="brand-info">
            <h1>Bienvenido, {{ userFullName }}</h1>
            <p>Resumen de actividad · {{ currentDate }}</p>
          </div>
        </div>
        <router-link to="/admin/forms/create" class="btn-create-large">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear Formulario
        </router-link>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-item" v-for="stat in statsCards" :key="stat.label">
        <div class="stat-header">
          <span class="stat-label">{{ stat.label }}</span>
          <span v-if="stat.trend !== 0" class="stat-change" :class="{ positive: stat.trend > 0, negative: stat.trend < 0 }">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </span>
        </div>
        <div class="stat-value">
          <template v-if="loadingStats">
            <span class="stat-skeleton"></span>
          </template>
          <template v-else>
            {{ stat.value }}
          </template>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-layout">
      <!-- Recent Forms -->
      <div class="content-card">
        <div class="card-header">
          <h2>Formularios recientes</h2>
          <router-link to="/admin/forms" class="card-link">
            Ver todos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </router-link>
        </div>
        
        <div class="card-body">
          <div v-if="loadingForms" class="loading-state">
            <div class="loader"></div>
          </div>
          
          <div v-else-if="recentForms.length === 0" class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>Sin formularios creados</p>
            <router-link to="/admin/forms/create" class="empty-action">Crear el primero</router-link>
          </div>
          
          <div v-else class="forms-list">
            <router-link 
              v-for="form in recentForms" 
              :key="form.id" 
              :to="`/admin/forms/${form.uuid}`"
              class="form-row"
            >
              <div class="form-main">
                <span class="form-title">{{ form.title }}</span>
                <span class="form-meta">
                  {{ form.responses }} respuesta{{ form.responses !== 1 ? 's' : '' }} · 
                  {{ formatDate(form.created_at) }}
                </span>
              </div>
              <div class="form-badges">
                <span class="form-type" :class="form.form_type.toLowerCase()">
                  {{ form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
                </span>
                <span class="form-status" :class="{ active: form.is_active }">
                  {{ form.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="content-card">
        <div class="card-header">
          <h2>Acciones rápidas</h2>
        </div>
        
        <div class="card-body">
          <div class="actions-grid">
            <router-link to="/admin/forms/create" class="action-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Crear formulario</span>
            </router-link>
            
            <router-link to="/admin/templates" class="action-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="8" rx="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2"/>
              </svg>
              <span>Ver plantillas</span>
            </router-link>
            
            <router-link to="/admin/responses" class="action-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>Ver respuestas</span>
            </router-link>
            
            <router-link to="/admin/users" class="action-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Gestionar usuarios</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="content-card full-width">
      <div class="card-header">
        <h2>Actividad reciente</h2>
        <button v-if="recentActivity.length > 0" @click="refreshActivity" class="btn-refresh" :disabled="loadingActivity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loadingActivity }">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>
      
      <div class="card-body">
        <div v-if="loadingActivity && recentActivity.length === 0" class="loading-state">
          <div class="loader"></div>
        </div>
        
        <div v-else-if="recentActivity.length === 0" class="empty-state small">
          <p>Sin actividad reciente</p>
        </div>
        
        <div v-else class="timeline">
          <div v-for="activity in recentActivity" :key="activity.id" class="timeline-item">
            <div class="timeline-marker" :class="activity.type"></div>
            <div class="timeline-content">
              <p class="timeline-message">{{ activity.message }}</p>
              <span class="timeline-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardService } from '@/services/dashboard.service'

const authStore = useAuthStore()

// Estados de carga separados
const loadingStats = ref(true)
const loadingForms = ref(true)
const loadingActivity = ref(true)

// Datos del usuario
const userFullName = computed(() => {
  const user = authStore.user
  if (!user) return 'Usuario'
  return user.first_name || user.firstName || 'Usuario'
})

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('es-PE', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Datos del dashboard
const stats = ref({
  forms: 0,
  responses: 0,
  templates: 0,
  users: 0
})

const trends = ref({
  forms: 0,
  responses: 0,
  templates: 0,
  users: 0
})

const statsCards = computed(() => [
  { label: 'Formularios', value: stats.value.forms, trend: trends.value.forms },
  { label: 'Respuestas', value: stats.value.responses, trend: trends.value.responses },
  { label: 'Plantillas', value: stats.value.templates, trend: trends.value.templates },
  { label: 'Usuarios', value: stats.value.users, trend: trends.value.users }
])

const recentForms = ref([])
const recentActivity = ref([])

// Formatear fecha
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-PE', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Cargar estadísticas
async function fetchStats() {
  loadingStats.value = true
  try {
    const response = await dashboardService.getStats()
    if (response.ok) {
      stats.value = response.data.stats
      trends.value = response.data.trends
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loadingStats.value = false
  }
}

// Cargar formularios recientes
async function fetchRecentForms() {
  loadingForms.value = true
  try {
    const response = await dashboardService.getRecentForms(5)
    if (response.ok) {
      recentForms.value = response.data.forms
    }
  } catch (error) {
    console.error('Error fetching forms:', error)
  } finally {
    loadingForms.value = false
  }
}

// Cargar actividad reciente
async function fetchRecentActivity() {
  loadingActivity.value = true
  try {
    const response = await dashboardService.getRecentActivity(8)
    if (response.ok) {
      recentActivity.value = response.data.activities
    }
  } catch (error) {
    console.error('Error fetching activity:', error)
  } finally {
    loadingActivity.value = false
  }
}

// Refrescar actividad
function refreshActivity() {
  fetchRecentActivity()
}

// Cargar todo al montar
onMounted(() => {
  // Cargar en paralelo para mejor rendimiento
  Promise.all([
    fetchStats(),
    fetchRecentForms(),
    fetchRecentActivity()
  ])
})
</script>

<style scoped>
/* ═══════════════════════════════════════
   BASE LAYOUT
═══════════════════════════════════════ */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
  max-width: 100%;
}

/* ═══════════════════════════════════════
   WELCOME SECTION
═══════════════════════════════════════ */
.welcome-section {
  padding: 32px 0 24px;
}

.welcome-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.welcome-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #001845 0%, #003d82 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.mark-w,
.mark-e {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.mark-separator {
  font-size: 14px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1;
}

.brand-info h1 {
  margin: 0 0 4px 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -0.5px;
}

.brand-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.btn-create-large {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #001845;
  color: #ffffff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-create-large:hover {
  background: #002866;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 24, 69, 0.25);
}

/* ═══════════════════════════════════════
   STATS SECTION
═══════════════════════════════════════ */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  padding: 20px;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: border-color 0.2s ease;
}

.stat-item:hover {
  border-color: #e5e7eb;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
}

.stat-change.positive {
  background: #ecfdf5;
  color: #059669;
}

.stat-change.negative {
  background: #fef2f2;
  color: #dc2626;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -1px;
  line-height: 1;
}

.stat-skeleton {
  display: inline-block;
  width: 60px;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e5e7eb 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ═══════════════════════════════════════
   CONTENT LAYOUT
═══════════════════════════════════════ */
.content-layout {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
}

.content-card {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.content-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f9fafb;
}

.card-header h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.card-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s ease;
}

.card-link:hover {
  color: #001845;
}

.card-link svg {
  transition: transform 0.2s ease;
}

.card-link:hover svg {
  transform: translateX(2px);
}

.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh svg.spinning {
  animation: spin 1s linear infinite;
}

.card-body {
  padding: 20px;
}

/* ═══════════════════════════════════════
   FORMS LIST
═══════════════════════════════════════ */
.forms-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s ease;
  text-decoration: none;
  color: inherit;
}

.form-row:last-child {
  border-bottom: none;
}

.form-row:hover {
  background: #fafafa;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.form-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-meta {
  font-size: 12px;
  color: #9ca3af;
}

.form-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.form-type {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #eef2ff;
  color: #4f46e5;
}

.form-type.exam {
  background: #fef3c7;
  color: #d97706;
}

.form-type.survey {
  background: #e0e7ff;
  color: #4338ca;
}

.form-status {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-status.active {
  background: #ecfdf5;
  color: #059669;
}

/* ═══════════════════════════════════════
   ACTIONS GRID
═══════════════════════════════════════ */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid transparent;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.15s ease;
  cursor: pointer;
}

.action-item:hover {
  background: #ffffff;
  border-color: #e5e7eb;
  transform: translateY(-2px);
}

.action-item svg {
  color: #6b7280;
  transition: color 0.15s ease;
}

.action-item:hover svg {
  color: #001845;
}

.action-item span {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* ═══════════════════════════════════════
   TIMELINE
═══════════════════════════════════════ */
.timeline {
  display: flex;
  flex-direction: column;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: 12px;
  width: 1px;
  background: #f0f0f0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding: 10px 0;
  position: relative;
}

.timeline-marker {
  width: 10px;
  height: 10px;
  background: #ffffff;
  border: 2px solid #001845;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
  z-index: 1;
}

.timeline-marker.form_created {
  border-color: #3b82f6;
}

.timeline-marker.response_received {
  border-color: #10b981;
}

.timeline-marker.template_created {
  border-color: #8b5cf6;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-message {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.timeline-time {
  font-size: 12px;
  color: #9ca3af;
}

/* ═══════════════════════════════════════
   STATES
═══════════════════════════════════════ */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.loader {
  width: 28px;
  height: 28px;
  border: 2px solid #f0f0f0;
  border-top-color: #001845;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px;
  text-align: center;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #9ca3af;
}

.empty-state.small {
  padding: 32px 20px;
}

.empty-action {
  font-size: 13px;
  font-weight: 500;
  color: #001845;
  text-decoration: none;
  transition: opacity 0.15s ease;
}

.empty-action:hover {
  opacity: 0.7;
}

/* ═══════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════ */
@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    gap: 20px;
  }
  
  .welcome-section {
    padding: 24px 0 16px;
  }
  
  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-create-large {
    width: 100%;
    justify-content: center;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .form-badges {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .brand-mark {
    width: 40px;
    height: 40px;
  }
  
  .mark-w,
  .mark-e {
    font-size: 14px;
  }
  
  .brand-info h1 {
    font-size: 1.5rem;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
}
</style>