<!-- src/views/admin/forms/FormDetailView.vue -->
<template>
  <div class="form-detail-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando formulario...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <i class="bi bi-exclamation-circle"></i>
      <h3>Error al cargar</h3>
      <p>{{ error }}</p>
      <router-link to="/admin/forms" class="btn-secondary">
        Volver a la lista
      </router-link>
    </div>

    <!-- Content -->
    <div v-else-if="form">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <router-link to="/admin/forms" class="back-link">
            <i class="bi bi-arrow-left"></i>
            Volver
          </router-link>
          <div class="header-info">
            <h1>{{ form.title }}</h1>
            <div class="form-meta">
              <span class="badge" :class="form.form_type.toLowerCase()">
                {{ form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
              </span>
              <span class="status" :class="form.is_active ? 'active' : 'inactive'">
                <i class="bi bi-circle-fill"></i>
                {{ form.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="toggleActive" class="btn-secondary">
            <i :class="form.is_active ? 'bi bi-pause' : 'bi bi-play'"></i>
            {{ form.is_active ? 'Desactivar' : 'Activar' }}
          </button>
          <router-link :to="`/admin/forms/${form.id}/edit`" class="btn-primary">
            <i class="bi bi-pencil"></i>
            Editar
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <i class="bi bi-clipboard-check"></i>
          <div class="stat-content">
            <p class="stat-label">Total respuestas</p>
            <p class="stat-value">{{ stats.total_responses || 0 }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <i class="bi bi-people"></i>
          <div class="stat-content">
            <p class="stat-label">Respuestas únicas</p>
            <p class="stat-value">{{ stats.unique_respondents || 0 }}</p>
          </div>
        </div>
        
        <div class="stat-card">
          <i class="bi bi-clock-history"></i>
          <div class="stat-content">
            <p class="stat-label">Tiempo promedio</p>
            <p class="stat-value">{{ stats.avg_completion_time || '0 min' }}</p>
          </div>
        </div>
        
        <div class="stat-card" v-if="form.form_type === 'EXAM'">
          <i class="bi bi-percent"></i>
          <div class="stat-content">
            <p class="stat-label">Puntuación promedio</p>
            <p class="stat-value">{{ stats.avg_score || '0' }}%</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="content-tabs">
        <div class="tabs-header">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'preview' }"
            @click="activeTab = 'preview'"
          >
            <i class="bi bi-eye"></i>
            Vista previa
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            <i class="bi bi-gear"></i>
            Configuración
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'share' }"
            @click="activeTab = 'share'"
          >
            <i class="bi bi-share"></i>
            Compartir
          </button>
        </div>

        <div class="tab-content">
          <!-- Preview Tab -->
          <div v-if="activeTab === 'preview'" class="preview-container">
            <div class="preview-header">
              <h3>Vista previa del formulario</h3>
              <a 
                :href="`/form/${form.uuid}`" 
                target="_blank"
                class="btn-secondary"
              >
                <i class="bi bi-box-arrow-up-right"></i>
                Abrir en nueva ventana
              </a>
            </div>
            <iframe 
              :src="`/form/${form.uuid}?preview=true`"
              class="preview-iframe"
            ></iframe>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="settings-container">
            <h3>Configuración del formulario</h3>
            
            <div class="setting-group">
              <label>Descripción</label>
              <p>{{ form.description || 'Sin descripción' }}</p>
            </div>

            <div class="setting-group">
              <label>Disponibilidad</label>
              <div class="availability-info">
                <p v-if="form.available_from">
                  <i class="bi bi-calendar-check"></i>
                  Desde: {{ formatDate(form.available_from) }}
                </p>
                <p v-if="form.available_until">
                  <i class="bi bi-calendar-x"></i>
                  Hasta: {{ formatDate(form.available_until) }}
                </p>
                <p v-else>
                  <i class="bi bi-infinity"></i>
                  Sin límite de tiempo
                </p>
              </div>
            </div>

            <div class="setting-group" v-if="form.form_type === 'EXAM'">
              <label>Configuración de examen</label>
              <ul class="settings-list">
                <li v-if="form.time_limit_minutes">
                  <i class="bi bi-hourglass"></i>
                  Tiempo límite: {{ form.time_limit_minutes }} minutos
                </li>
                <li v-if="form.passing_score">
                  <i class="bi bi-award"></i>
                  Puntaje para aprobar: {{ form.passing_score }}%
                </li>
                <li>
                  <i class="bi bi-shuffle"></i>
                  Preguntas aleatorias: {{ form.shuffle_questions ? 'Sí' : 'No' }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Share Tab -->
          <div v-if="activeTab === 'share'" class="share-container">
            <h3>Compartir formulario</h3>
            
            <div class="share-section">
              <label>Enlace público</label>
              <div class="share-url">
                <input 
                  type="text" 
                  :value="shareUrl"
                  readonly
                  ref="shareInput"
                >
                <button @click="copyUrl" class="btn-copy">
                  <i :class="copied ? 'bi bi-check' : 'bi bi-clipboard'"></i>
                  {{ copied ? 'Copiado!' : 'Copiar' }}
                </button>
              </div>
            </div>

            <div class="share-section">
              <label>Código QR</label>
              <div class="qr-container">
                <canvas ref="qrCanvas"></canvas>
                <button @click="downloadQR" class="btn-secondary">
                  <i class="bi bi-download"></i>
                  Descargar QR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bottom-actions">
        <router-link 
          :to="`/admin/forms/${form.id}/responses`" 
          class="btn-primary btn-lg"
        >
          <i class="bi bi-bar-chart"></i>
          Ver todas las respuestas
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import formService from '@/services/form.service'
import QRCode from 'qrcode' // npm install qrcode

const route = useRoute()

const form = ref(null)
const stats = ref({})
const loading = ref(true)
const error = ref(null)
const activeTab = ref('preview')
const copied = ref(false)
const shareInput = ref(null)
const qrCanvas = ref(null)

const shareUrl = computed(() => 
  form.value ? `${window.location.origin}/form/${form.value.uuid}` : ''
)

async function loadForm() {
  try {
    loading.value = true
    const formId = route.params.id
    
    // Cargar datos del formulario
    const { data } = await formService.get(formId)
    form.value = data
    
    // Cargar estadísticas
    const statsResponse = await formService.getStats(formId)
    stats.value = statsResponse.data
    
  } catch (err) {
    console.error('Error:', err)
    error.value = 'No se pudo cargar el formulario'
  } finally {
    loading.value = false
  }
}

async function toggleActive() {
  try {
    await formService.update(form.value.id, {
      is_active: !form.value.is_active
    })
    form.value.is_active = !form.value.is_active
  } catch (error) {
    console.error('Error:', error)
  }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (error) {
    shareInput.value?.select()
    document.execCommand('copy')
    copied.value = true
  }
}

async function generateQR() {
  if (qrCanvas.value && shareUrl.value) {
    await QRCode.toCanvas(qrCanvas.value, shareUrl.value, {
      width: 200,
      margin: 2
    })
  }
}

async function downloadQR() {
  const canvas = qrCanvas.value
  if (!canvas) return
  
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `qr-${form.value.title.replace(/\s+/g, '-')}.png`
  a.click()
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadForm()
})

// Generar QR cuando cambie el tab
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'share') {
    setTimeout(generateQR, 100)
  }
})
</script>

<style scoped>
/* Page Layout */
.form-detail-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  color: #001845;
}

.header-info h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.form-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.survey {
  background: #e0e7ff;
  color: #4338ca;
}

.badge.exam {
  background: #fef3c7;
  color: #d97706;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.status i {
  font-size: 8px;
}

.status.active {
  color: #10b981;
}

.status.inactive {
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.stat-card i {
  font-size: 24px;
  color: #001845;
}

.stat-content {
  flex: 1;
}

.stat-label {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.stat-value {
  margin: 4px 0 0 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

/* Tabs */
.content-tabs {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab:hover {
  background: #f9fafb;
  color: #1f2937;
}

.tab.active {
  color: #001845;
  background: #f3f4f6;
  border-bottom: 2px solid #001845;
  margin-bottom: -1px;
}

.tab-content {
  padding: 32px;
}

/* Preview */
.preview-container {
  min-height: 400px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.preview-iframe {
  width: 100%;
  height: 600px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* Settings */
.settings-container h3 {
  margin: 0 0 24px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.setting-group {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.setting-group:last-child {
  border-bottom: none;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.setting-group p {
  margin: 0;
  color: #6b7280;
}

.availability-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.availability-info p {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.settings-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #6b7280;
}

/* Share */
.share-container h3 {
  margin: 0 0 24px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.share-section {
  margin-bottom: 32px;
}

.share-section label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.share-url {
  display: flex;
  gap: 8px;
}

.share-url input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-family: monospace;
  background: #f9fafb;
}

.btn-copy {
  padding: 10px 20px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-copy:hover {
  background: #f3f4f6;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  text-align: center;
}

/* Bottom Actions */
.bottom-actions {
  display: flex;
  justify-content: center;
}

.btn-lg {
  padding: 12px 32px;
  font-size: 16px;
}

/* Loading & Error */
.loading-container,
.error-container {
  text-align: center;
  padding: 80px 20px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #001845;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container i {
  font-size: 48px;
  color: #dc2626;
  margin-bottom: 16px;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-primary {
  background: #001845;
  color: white;
}

.btn-primary:hover {
  background: #002866;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions button,
  .header-actions a {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .tabs-header {
    overflow-x: auto;
  }
  
  .preview-iframe {
    height: 400px;
  }
}
</style>