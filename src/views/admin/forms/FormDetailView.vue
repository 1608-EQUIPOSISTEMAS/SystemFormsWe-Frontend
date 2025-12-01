<template>
  <div class="form-detail-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando formulario...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
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
            ← Volver
          </router-link>
          <div class="header-info">
            <h1>{{ form.title }}</h1>
            <div class="form-meta">
              <span class="badge" :class="form.form_type?.toLowerCase()">
                {{ form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
              </span>
              <span class="status" :class="{ active: form.is_active }">
                {{ form.is_active ? '● Activo' : '○ Inactivo' }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button @click="toggleActive" class="btn-secondary">
            {{ form.is_active ? 'Desactivar' : 'Activar' }}
          </button>
          <router-link :to="`/admin/forms/${form.uuid}/edit`" class="btn-secondary">
            Editar
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.total || 0 }}</span>
            <span class="stat-label">Total respuestas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.completed || 0 }}</span>
            <span class="stat-label">Completadas</span>
          </div>
        </div>
        <div v-if="form.form_type === 'EXAM'" class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.avgScore || 0 }}%</span>
            <span class="stat-label">Promedio</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatDate(stats.lastResponse) }}</span>
            <span class="stat-label">Última respuesta</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'preview' }"
            @click="activeTab = 'preview'"
          >
            Vista previa
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'share' }"
            @click="activeTab = 'share'"
          >
            Compartir
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            Configuración
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
                class="btn-secondary btn-sm"
              >
                Abrir en nueva ventana ↗
              </a>
            </div>
            <iframe 
              :src="`/form/${form.uuid}?preview=true`"
              class="preview-iframe"
            ></iframe>
          </div>

          <!-- Share Tab -->
          <div v-if="activeTab === 'share'" class="share-container">
            <div class="share-section">
              <label>Enlace público para compartir</label>
              <p class="share-description">
                Comparte este enlace con los usuarios que deben responder el formulario.
                {{ form.requires_login ? 'Deberán registrarse o iniciar sesión para responder.' : 'Pueden responder sin registro.' }}
              </p>
              <div class="input-group">
                <input 
                  type="text" 
                  :value="shareUrl" 
                  readonly 
                  ref="shareInput"
                  class="share-input"
                >
                <button @click="copyUrl" class="btn-primary">
                  {{ copied ? '✓ Copiado!' : 'Copiar' }}
                </button>
              </div>
            </div>

            <div class="share-section">
              <label>Código QR</label>
              <div class="qr-container">
                <canvas ref="qrCanvas" width="200" height="200"></canvas>
                <button @click="downloadQR" class="btn-secondary" :disabled="!qrGenerated">
                  Descargar QR
                </button>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="settings-container">
            <h3>Configuración del formulario</h3>
            <div class="settings-grid">
              <div class="setting-item">
                <span class="setting-label">Tipo:</span>
                <span class="setting-value">{{ form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}</span>
              </div>
              <div class="setting-item">
                <span class="setting-label">Requiere login:</span>
                <span class="setting-value">{{ form.requires_login ? 'Sí' : 'No' }}</span>
              </div>
              <div class="setting-item">
                <span class="setting-label">Público:</span>
                <span class="setting-value">{{ form.is_public ? 'Sí' : 'No' }}</span>
              </div>
              <div v-if="form.time_limit_minutes" class="setting-item">
                <span class="setting-label">Tiempo límite:</span>
                <span class="setting-value">{{ form.time_limit_minutes }} minutos</span>
              </div>
              <div v-if="form.passing_score" class="setting-item">
                <span class="setting-label">Nota aprobatoria:</span>
                <span class="setting-value">{{ form.passing_score }}%</span>
              </div>
              <div class="setting-item">
                <span class="setting-label">Creado:</span>
                <span class="setting-value">{{ formatDate(form.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bottom-actions">
        <router-link 
          :to="`/admin/forms/${form.uuid}/responses`" 
          class="btn-primary btn-lg"
        >
          📊 Ver todas las respuestas
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import formService from '@/services/form.service'

const route = useRoute()

// State
const form = ref(null)
const stats = ref({})
const loading = ref(true)
const error = ref(null)
const activeTab = ref('preview')
const copied = ref(false)
const shareInput = ref(null)
const qrCanvas = ref(null)
const qrGenerated = ref(false)

// Computed
const shareUrl = computed(() => 
  form.value ? `${window.location.origin}/form/${form.value.uuid}` : ''
)

// Methods
async function loadForm() {
  try {
    loading.value = true
    error.value = null
    
    const formUuid = route.params.id
    
    if (!formUuid) {
      error.value = 'ID de formulario no válido'
      return
    }
    
    // Cargar datos del formulario
    const formResponse = await formService.get(formUuid)
    
    // El backend devuelve { ok: true, data: { form, sections, questions } }
    if (formResponse.ok && formResponse.data) {
      form.value = formResponse.data.form || formResponse.data
    } else {
      form.value = formResponse.data || formResponse
    }
    
    // Cargar estadísticas
    try {
      const statsResponse = await formService.getStats(formUuid)
      stats.value = statsResponse.data || statsResponse || {}
    } catch (statsError) {
      console.warn('No se pudieron cargar estadísticas:', statsError)
      stats.value = {}
    }
    
  } catch (err) {
    console.error('Error:', err)
    error.value = err.response?.data?.error || 'No se pudo cargar el formulario'
  } finally {
    loading.value = false
  }
}

async function toggleActive() {
  try {
    await formService.update(form.value.uuid, {
      is_active: !form.value.is_active
    })
    form.value.is_active = !form.value.is_active
  } catch (err) {
    console.error('Error:', err)
  }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    // Fallback para navegadores que no soportan clipboard API
    if (shareInput.value) {
      shareInput.value.select()
      document.execCommand('copy')
    }
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

// ✅ Importación dinámica DENTRO de la función (no top-level)
async function generateQR() {
  if (!qrCanvas.value || !shareUrl.value) return
  
  try {
    // Importar dinámicamente solo cuando se necesita
    const QRCode = (await import('qrcode')).default
    
    await QRCode.toCanvas(qrCanvas.value, shareUrl.value, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff'
      }
    })
    qrGenerated.value = true
  } catch (err) {
    console.warn('Error generando QR:', err)
    // Mostrar placeholder si falla
    const ctx = qrCanvas.value?.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, 200, 200)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('QR no disponible', 100, 100)
    }
  }
}

function downloadQR() {
  const canvas = qrCanvas.value
  if (!canvas || !qrGenerated.value) return
  
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = `qr-${form.value.title.replace(/\s+/g, '-')}.png`
  a.click()
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadForm()
})

// Generar QR cuando cambie el tab a 'share'
watch(() => activeTab.value, async (newTab) => {
  if (newTab === 'share') {
    await nextTick()
    generateQR()
  }
})
</script>

<style scoped>
.form-detail-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading & Error */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  width: 60px;
  height: 60px;
  border: 2px solid #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ef4444;
}

.error-container h3 { color: #333; margin: 0; }
.error-container p { color: #666; margin: 0; }

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-link {
  color: #6366f1;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover { text-decoration: underline; }

.header-info h1 {
  margin: 0;
  font-size: 24px;
  color: #1a1a2e;
}

.form-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge.survey { background: #dbeafe; color: #1d4ed8; }
.badge.exam { background: #fef3c7; color: #d97706; }

.status { font-size: 14px; color: #666; }
.status.active { color: #10b981; }

.header-actions {
  display: flex;
  gap: 8px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-icon { font-size: 28px; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

/* Tabs */
.tabs-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  padding: 14px 20px;
  background: none;
  border: none;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover { background: #f9fafb; }

.tab.active {
  color: #6366f1;
  background: #f5f3ff;
  border-bottom: 2px solid #6366f1;
}

.tab-content { padding: 24px; }

/* Preview */
.preview-container { min-height: 500px; }

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h3 { margin: 0; color: #333; }

.preview-iframe {
  width: 100%;
  height: 600px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

/* Share */
.share-container { display: flex; flex-direction: column; gap: 32px; }
.share-section label { font-weight: 600; color: #333; display: block; margin-bottom: 8px; }
.share-description { color: #666; font-size: 14px; margin-bottom: 12px; }

.input-group { display: flex; gap: 8px; }

.share-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #f9fafb;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.qr-container canvas {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

/* Settings */
.settings-container h3 { margin-top: 0; color: #333; }

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label { font-size: 13px; color: #6b7280; }
.setting-value { font-size: 15px; color: #1a1a2e; font-weight: 500; }

/* Buttons */
.btn-primary, .btn-secondary {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #6366f1;
  color: white;
  border: none;
}

.btn-primary:hover { background: #4f46e5; }

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover { background: #f9fafb; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-sm { padding: 6px 12px; font-size: 13px; }
.btn-lg { padding: 14px 24px; font-size: 15px; }

/* Bottom Actions */
.bottom-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>