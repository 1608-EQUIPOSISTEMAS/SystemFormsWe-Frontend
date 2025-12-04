<template>
  <div class="form-detail-page">
    <!-- Loading -->
    <div v-if="loading" class="state-container">
      <div class="loader"></div>
      <p>Cargando formulario...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-container error">
      <div class="state-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h3>Error al cargar</h3>
      <p>{{ error }}</p>
      <router-link to="/admin/forms" class="btn btn-secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Volver a la lista
      </router-link>
    </div>

    <!-- Content -->
    <template v-else-if="form">
      <!-- Header -->
      <header class="page-header">
        <div class="header-top">
          <router-link to="/admin/forms" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </router-link>
          <div class="header-badges">
            <span class="badge" :class="form.form_type?.toLowerCase()">
              <svg v-if="form.form_type === 'EXAM'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              {{ form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
            </span>
            <span class="status-badge" :class="{ active: form.is_active }">
              <span class="status-dot"></span>
              {{ form.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <div class="header-main">
          <div class="header-info">
            <h1>{{ form.title }}</h1>
            <p v-if="form.description" class="form-description">{{ form.description }}</p>
          </div>
          <div class="header-actions">
            <button @click="toggleActive" class="btn btn-ghost">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line v-if="form.is_active" x1="15" y1="9" x2="9" y2="15"/>
                <polyline v-else points="9 12 12 15 16 10"/>
              </svg>
              {{ form.is_active ? 'Desactivar' : 'Activar' }}
            </button>
            <router-link :to="`/admin/forms/${form.uuid}/edit`" class="btn btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </router-link>
            <router-link :to="`/admin/forms/${form.uuid}/responses`" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Ver respuestas
            </router-link>
          </div>
        </div>
      </header>

      <!-- Stats Cards -->
      <section class="stats-section">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.total || 0 }}</span>
            <span class="stat-label">Total respuestas</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.completed || 0 }}</span>
            <span class="stat-label">Completadas</span>
          </div>
        </div>

        <div v-if="form.form_type === 'EXAM'" class="stat-card">
          <div class="stat-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.avgScore || 0 }}<small>%</small></span>
            <span class="stat-label">Promedio</span>
          </div>
        </div>

        <div v-if="form.form_type === 'EXAM'" class="stat-card">
    <div class="stat-icon teal">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>
    <div class="stat-content">
      <span class="stat-value">{{ stats.certified || 0 }}</span>
      <span class="stat-label">Certificados</span>
    </div>
  </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value stat-date">{{ formatDate(stats.lastResponse) }}</span>
            <span class="stat-label">Última respuesta</span>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <section class="tabs-section">
        <div class="tabs-nav">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'preview' }"
            @click="activeTab = 'preview'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Vista previa
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'share' }"
            @click="activeTab = 'share'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Compartir
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Configuración
          </button>
        </div>

        <div class="tab-content">
          <!-- Preview Tab -->
          <div v-if="activeTab === 'preview'" class="tab-panel preview-panel">
            <div class="panel-header">
              <div class="panel-title">
                <h3>Vista previa del formulario</h3>
                <p>Así verán los usuarios tu formulario</p>
              </div>
              <a :href="`/form/${form.uuid}`" target="_blank" class="btn btn-ghost btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Abrir en nueva ventana
              </a>
            </div>
            <div class="preview-frame-container">
              <iframe :src="`/form/${form.uuid}?preview=true`" class="preview-frame"></iframe>
            </div>
          </div>

          <!-- Share Tab -->
          <div v-if="activeTab === 'share'" class="tab-panel share-panel">
            <div class="share-grid">
              <!-- URL Section -->
              <div class="share-card">
                <div class="share-card-header">
                  <div class="share-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Enlace para compartir</h4>
                    <p>{{ form.requires_login ? 'Requiere inicio de sesión' : 'Acceso público sin registro' }}</p>
                  </div>
                </div>
                <div class="url-input-group">
                  <input type="text" :value="shareUrl" readonly ref="shareInput" class="url-input">
                  <button @click="copyUrl" class="btn btn-primary">
                    <svg v-if="!copied" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {{ copied ? '¡Copiado!' : 'Copiar' }}
                  </button>
                </div>
              </div>

              <!-- QR Section -->
              <div class="share-card qr-card">
                <div class="share-card-header">
                  <div class="share-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Código QR</h4>
                    <p>Escanea para acceder al formulario</p>
                  </div>
                </div>
                <div class="qr-display">
                  <canvas ref="qrCanvas" width="180" height="180"></canvas>
                </div>
                <button @click="downloadQR" class="btn btn-secondary btn-block" :disabled="!qrGenerated">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar QR
                </button>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="tab-panel settings-panel">
            <div class="settings-grid">
              <div class="setting-card">
                <div class="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="setting-info">
                  <span class="setting-label">Tipo de formulario</span>
                  <span class="setting-value">{{ form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}</span>
                </div>
              </div>

              <div class="setting-card">
                <div class="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                <div class="setting-info">
                  <span class="setting-label">Requiere login</span>
                  <span class="setting-value" :class="form.requires_login ? 'yes' : 'no'">{{ form.requires_login ? 'Sí' : 'No' }}</span>
                </div>
              </div>

              <div class="setting-card">
                <div class="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
                <div class="setting-info">
                  <span class="setting-label">Acceso público</span>
                  <span class="setting-value" :class="form.is_public ? 'yes' : 'no'">{{ form.is_public ? 'Sí' : 'No' }}</span>
                </div>
              </div>

              <div v-if="form.time_limit_minutes" class="setting-card">
                <div class="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div class="setting-info">
                  <span class="setting-label">Tiempo límite</span>
                  <span class="setting-value">{{ form.time_limit_minutes }} minutos</span>
                </div>
              </div>

              <div v-if="form.passing_score" class="setting-card">
                <div class="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div class="setting-info">
                  <span class="setting-label">Nota aprobatoria</span>
                  <span class="setting-value">{{ form.passing_score }}%</span>
                </div>
              </div>

              <div class="setting-card">
                <div class="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="setting-info">
                  <span class="setting-label">Fecha de creación</span>
                  <span class="setting-value">{{ formatDate(form.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
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
    if (!formUuid) { error.value = 'ID de formulario no válido'; return }
    
    const formResponse = await formService.get(formUuid)
    if (formResponse.ok && formResponse.data) {
      form.value = formResponse.data.form || formResponse.data
    } else {
      form.value = formResponse.data || formResponse
    }
    
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
    await formService.update(form.value.uuid, { is_active: !form.value.is_active })
    form.value.is_active = !form.value.is_active
  } catch (err) { console.error('Error:', err) }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (err) {
    if (shareInput.value) { shareInput.value.select(); document.execCommand('copy') }
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

async function generateQR() {
  if (!qrCanvas.value || !shareUrl.value) return
  try {
    const QRCode = (await import('qrcode')).default
    await QRCode.toCanvas(qrCanvas.value, shareUrl.value, {
      width: 180, margin: 2,
      color: { dark: '#000F5A', light: '#ffffff' }
    })
    qrGenerated.value = true
  } catch (err) {
    console.warn('Error generando QR:', err)
    const ctx = qrCanvas.value?.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'; ctx.fillRect(0, 0, 180, 180)
      ctx.fillStyle = '#9ca3af'; ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'; ctx.fillText('QR no disponible', 90, 95)
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
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(() => loadForm())

watch(() => activeTab.value, async (newTab) => {
  if (newTab === 'share') { await nextTick(); generateQR() }
})
</script>

<style scoped>
.form-detail-page {
  --blue: #000F5A;
  --celeste: #0499D5;
  --gray: #EEEEEE;
  --gray-light: #F8F9FA;
  --white: #FFFFFF;
  --text: #1a1a2e;
  --text-light: #64748b;
  --text-muted: #94a3b8;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --border: #e2e8f0;
  --radius: 12px;
  
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--gray-light);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* State Container */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  background: var(--white);
  border-radius: var(--radius);
  padding: 40px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--celeste);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.state-container p { color: var(--text-light); margin: 0; }
.state-container.error .state-icon { color: var(--danger); }
.state-container h3 { margin: 0; color: var(--text); }
.stat-icon.teal { background: #ccfbf1; color: #0d9488; }


/* Header */
.page-header {
  background: var(--white);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-light);
  border-radius: 10px;
  color: var(--text-light);
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--gray);
  color: var(--text);
}

.header-badges {
  display: flex;
  gap: 10px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge.survey { background: #dbeafe; color: #1d4ed8; }
.badge.exam { background: #fef3c7; color: #d97706; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: var(--gray);
  color: var(--text-light);
}

.status-badge.active { background: #d1fae5; color: #059669; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.header-info h1 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--blue);
}

.form-description {
  margin: 0;
  font-size: 14px;
  color: var(--text-light);
  max-width: 500px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: none;
}

.btn-primary {
  background: var(--blue);
  color: var(--white);
}
.btn-primary:hover { background: #001a7a; }

.btn-secondary {
  background: var(--white);
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { background: var(--gray-light); border-color: var(--text-muted); }

.btn-ghost {
  background: transparent;
  color: var(--text-light);
}
.btn-ghost:hover { background: var(--gray-light); color: var(--text); }

.btn-sm { padding: 8px 14px; font-size: 13px; }
.btn-block { width: 100%; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.blue { background: #dbeafe; color: #2563eb; }
.stat-icon.green { background: #d1fae5; color: #059669; }
.stat-icon.orange { background: #fef3c7; color: #d97706; }
.stat-icon.purple { background: #ede9fe; color: #7c3aed; }

.stat-content { display: flex; flex-direction: column; }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--blue);
  line-height: 1.2;
}

.stat-value small { font-size: 18px; font-weight: 600; }
.stat-value.stat-date { font-size: 15px; font-weight: 600; }

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Tabs Section */
.tabs-section {
  background: var(--white);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.tabs-nav {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding: 0 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-btn:hover { color: var(--text); }

.tab-btn.active {
  color: var(--celeste);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--celeste);
  border-radius: 2px 2px 0 0;
}

.tab-content { padding: 24px; }

.tab-panel { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Preview Panel */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.panel-title h3 { margin: 0 0 4px; font-size: 16px; color: var(--text); }
.panel-title p { margin: 0; font-size: 13px; color: var(--text-muted); }

.preview-frame-container {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--gray-light);
}

.preview-frame {
  width: 100%;
  height: 550px;
  border: none;
  display: block;
}

/* Share Panel */
.share-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.share-card {
  background: var(--gray-light);
  border-radius: var(--radius);
  padding: 24px;
}

.share-card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
}

.share-icon {
  width: 44px;
  height: 44px;
  background: var(--white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--celeste);
  flex-shrink: 0;
}

.share-card-header h4 { margin: 0 0 4px; font-size: 15px; color: var(--text); }
.share-card-header p { margin: 0; font-size: 13px; color: var(--text-muted); }

.url-input-group {
  display: flex;
  gap: 10px;
}

.url-input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  background: var(--white);
  color: var(--text);
}

.qr-card { text-align: center; }

.qr-display {
  background: var(--white);
  border-radius: 10px;
  padding: 16px;
  display: inline-block;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.qr-display canvas { display: block; }

/* Settings Panel */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.setting-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--gray-light);
  border-radius: 10px;
  transition: background 0.2s;
}

.setting-card:hover { background: var(--gray); }

.setting-icon {
  width: 40px;
  height: 40px;
  background: var(--white);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.setting-info { display: flex; flex-direction: column; }
.setting-label { font-size: 12px; color: var(--text-muted); }
.setting-value { font-size: 14px; font-weight: 600; color: var(--text); margin-top: 2px; }
.setting-value.yes { color: var(--success); }
.setting-value.no { color: var(--text-muted); }

/* Responsive */
@media (max-width: 768px) {
  .form-detail-page { padding: 16px; }
  .header-main { flex-direction: column; }
  .header-actions { width: 100%; }
  .header-actions .btn { flex: 1; }
  .tabs-nav { overflow-x: auto; }
  .tab-btn { white-space: nowrap; padding: 14px 16px; font-size: 13px; }
  .stat-card { padding: 16px; }
  .stat-value { font-size: 24px; }
  .share-grid { grid-template-columns: 1fr; }
}
</style>