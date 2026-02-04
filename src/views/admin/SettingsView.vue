<template>
  <div class="settings-view">
    <div class="page-header">
      <h1>Configuración</h1>
      <p class="subtitle">Ajustes generales del sistema</p>
    </div>

    <div class="settings-content">
      <!-- Sidebar -->
      <div class="settings-sidebar">
        <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
          <component :is="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Content -->
      <div class="settings-panel">
        <!-- General -->
        <div v-if="activeTab === 'general'" class="panel-content">
          <h2>Configuración General</h2>
          <p class="panel-desc">Ajustes generales de la plataforma</p>

          <div class="settings-form">
            <div class="form-group">
              <label>Nombre de la Plataforma</label>
              <input v-model="settings.platform_name" type="text" placeholder="Sistema de Formularios">
            </div>
            <div class="form-group">
              <label>Email de Contacto</label>
              <input v-model="settings.contact_email" type="email" placeholder="admin@example.com">
            </div>
            <div class="form-group">
              <label>Zona Horaria</label>
              <select v-model="settings.timezone">
                <option value="America/Lima">Lima (UTC-5)</option>
                <option value="America/Bogota">Bogotá (UTC-5)</option>
                <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
                <option value="Europe/Madrid">Madrid (UTC+1)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Idioma por Defecto</label>
              <select v-model="settings.default_language">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Exámenes -->
        <div v-if="activeTab === 'exams'" class="panel-content">
          <h2>Configuración de Exámenes</h2>
          <p class="panel-desc">Ajustes predeterminados para exámenes</p>

          <div class="settings-form">
            <div class="form-group">
              <label>Puntaje Mínimo para Aprobar (%)</label>
              <input v-model.number="settings.default_passing_score" type="number" min="0" max="100" placeholder="70">
            </div>
            <div class="form-group">
              <label>Tiempo Límite por Defecto (minutos)</label>
              <input v-model.number="settings.default_time_limit" type="number" min="0" placeholder="60">
            </div>
            <div class="form-group switch-group">
              <div class="switch-info">
                <label>Mostrar Puntaje al Enviar</label>
                <span class="switch-desc">El alumno verá su puntaje inmediatamente</span>
              </div>
              <label class="switch">
                <input v-model="settings.show_score_after_submit" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="form-group switch-group">
              <div class="switch-info">
                <label>Mostrar Respuestas Correctas</label>
                <span class="switch-desc">Mostrar las respuestas correctas después del envío</span>
              </div>
              <label class="switch">
                <input v-model="settings.show_correct_answers" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="form-group switch-group">
              <div class="switch-info">
                <label>Mezclar Preguntas</label>
                <span class="switch-desc">Orden aleatorio de preguntas por defecto</span>
              </div>
              <label class="switch">
                <input v-model="settings.shuffle_questions" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Certificados / Odoo -->
        <div v-if="activeTab === 'certificates'" class="panel-content">
          <h2>Integración Odoo</h2>
          <p class="panel-desc">Configuración para certificados y validación de alumnos</p>

          <div class="settings-form">
            <div class="form-group switch-group">
              <div class="switch-info">
                <label>Habilitar Integración Odoo</label>
                <span class="switch-desc">Validar alumnos y generar certificados con Odoo</span>
              </div>
              <label class="switch">
                <input v-model="settings.odoo_enabled" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>

            <template v-if="settings.odoo_enabled">
              <div class="form-group">
                <label>URL del Servidor Odoo</label>
                <input v-model="settings.odoo_url" type="url" placeholder="https://odoo.example.com">
              </div>
              <div class="form-group">
                <label>Base de Datos</label>
                <input v-model="settings.odoo_database" type="text" placeholder="production">
              </div>
              <div class="form-group">
                <label>Usuario API</label>
                <input v-model="settings.odoo_username" type="text" placeholder="api_user">
              </div>
              <div class="form-group">
                <label>API Key</label>
                <div class="input-with-btn">
                  <input v-model="settings.odoo_api_key" :type="showApiKey ? 'text' : 'password'" placeholder="••••••••••••">
                  <button type="button" class="toggle-btn" @click="showApiKey = !showApiKey">
                    <svg v-if="showApiKey" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              <button type="button" class="btn-outline" @click="testOdooConnection" :disabled="testingOdoo">
                {{ testingOdoo ? 'Probando...' : 'Probar Conexión' }}
              </button>
            </template>
          </div>
        </div>

        <!-- Notificaciones -->
        <div v-if="activeTab === 'notifications'" class="panel-content">
          <h2>Notificaciones</h2>
          <p class="panel-desc">Configurar alertas y notificaciones del sistema</p>

          <div class="settings-form">
            <div class="form-group switch-group">
              <div class="switch-info">
                <label>Notificar Nuevas Respuestas</label>
                <span class="switch-desc">Recibir notificación cuando alguien complete un formulario</span>
              </div>
              <label class="switch">
                <input v-model="settings.notify_new_responses" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="form-group switch-group">
              <div class="switch-info">
                <label>Notificar Exámenes Aprobados</label>
                <span class="switch-desc">Alertar cuando un alumno apruebe un examen</span>
              </div>
              <label class="switch">
                <input v-model="settings.notify_passed_exams" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
            <div class="form-group switch-group">
              <div class="switch-info">
                <label>Notificaciones por Email</label>
                <span class="switch-desc">Enviar notificaciones también por correo</span>
              </div>
              <label class="switch">
                <input v-model="settings.email_notifications" type="checkbox">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Apariencia -->
        <div v-if="activeTab === 'appearance'" class="panel-content">
          <h2>Apariencia</h2>
          <p class="panel-desc">Personalizar la interfaz del sistema</p>

          <div class="settings-form">
            <div class="form-group">
              <label>Color Principal</label>
              <div class="color-picker">
                <input v-model="settings.primary_color" type="color">
                <input v-model="settings.primary_color" type="text" placeholder="#6366f1">
              </div>
            </div>
            <div class="form-group">
              <label>Logo de la Plataforma</label>
              <div class="file-upload">
                <div class="upload-preview" v-if="settings.logo_url">
                  <img :src="settings.logo_url" alt="Logo">
                </div>
                <label class="upload-btn">
                  <input type="file" accept="image/*" @change="handleLogoUpload" hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Subir Logo
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="panel-footer">
          <button class="btn-primary" @click="saveSettings" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import api from '@/services/api'

const activeTab = ref('general')
const saving = ref(false)
const testingOdoo = ref(false)
const showApiKey = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const settings = ref({
  platform_name: 'Sistema de Formularios',
  contact_email: '',
  timezone: 'America/Lima',
  default_language: 'es',
  default_passing_score: 70,
  default_time_limit: 60,
  show_score_after_submit: true,
  show_correct_answers: false,
  shuffle_questions: false,
  odoo_enabled: false,
  odoo_url: '',
  odoo_database: '',
  odoo_username: '',
  odoo_api_key: '',
  notify_new_responses: true,
  notify_passed_exams: true,
  email_notifications: false,
  primary_color: '#6366f1',
  logo_url: ''
})

const tabs = [
  { id: 'general', label: 'General', icon: { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('circle', { cx: 12, cy: 12, r: 3 }), h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })]) } },
  { id: 'exams', label: 'Exámenes', icon: { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }), h('polyline', { points: '14 2 14 8 20 8' }), h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }), h('line', { x1: 16, y1: 17, x2: 8, y2: 17 })]) } },
  { id: 'certificates', label: 'Certificados', icon: { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('circle', { cx: 12, cy: 8, r: 7 }), h('polyline', { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' })]) } },
  { id: 'notifications', label: 'Notificaciones', icon: { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }), h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })]) } },
  { id: 'appearance', label: 'Apariencia', icon: { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('circle', { cx: 13.5, cy: 6.5, r: '.5' }), h('circle', { cx: 17.5, cy: 10.5, r: '.5' }), h('circle', { cx: 8.5, cy: 7.5, r: '.5' }), h('circle', { cx: 6.5, cy: 12.5, r: '.5' }), h('path', { d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z' })]) } }
]

function notify(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

async function loadSettings() {
  try {
    const res = await api.get('/settings')
    if (res.data.ok) {
      settings.value = { ...settings.value, ...res.data.data }
    }
  } catch (e) {
    console.error('Error loading settings:', e)
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await api.put('/settings', settings.value)
    notify('Configuración guardada correctamente')
  } catch (e) {
    notify(e.response?.data?.message || 'Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

async function testOdooConnection() {
  testingOdoo.value = true
  try {
    const res = await api.post('/settings/test-odoo', {
      url: settings.value.odoo_url,
      database: settings.value.odoo_database,
      username: settings.value.odoo_username,
      api_key: settings.value.odoo_api_key
    })
    if (res.data.ok) {
      notify('Conexión exitosa con Odoo')
    } else {
      notify(res.data.message || 'Error de conexión', 'error')
    }
  } catch (e) {
    notify('No se pudo conectar con Odoo', 'error')
  } finally {
    testingOdoo.value = false
  }
}

function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      settings.value.logo_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-view { padding: 24px; }

.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 600; color: #1a1a2e; margin: 0; }
.page-header .subtitle { color: #64748b; margin: 4px 0 0; font-size: 14px; }

.settings-content { display: grid; grid-template-columns: 220px 1fr; gap: 24px; }

.settings-sidebar { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 12px; height: fit-content; position: sticky; top: 24px; }
.tab-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; background: none; border: none; border-radius: 8px; font-size: 14px; color: #64748b; cursor: pointer; transition: all 0.2s; text-align: left; }
.tab-btn:hover { background: #f8fafc; color: #1a1a2e; }
.tab-btn.active { background: #6366f1; color: #fff; }

.settings-panel { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
.panel-content { padding: 24px; }
.panel-content h2 { font-size: 18px; font-weight: 600; color: #1a1a2e; margin: 0 0 4px; }
.panel-desc { color: #64748b; font-size: 14px; margin: 0 0 24px; }

.settings-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: #475569; }
.form-group input, .form-group select { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

.switch-group { flex-direction: row; align-items: center; justify-content: space-between; padding: 16px; background: #f8fafc; border-radius: 10px; }
.switch-info { flex: 1; }
.switch-info label { display: block; font-size: 14px; font-weight: 500; color: #1a1a2e; margin-bottom: 2px; }
.switch-desc { font-size: 12px; color: #64748b; }

.switch { position: relative; width: 48px; height: 26px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 26px; transition: 0.3s; }
.slider:before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
.switch input:checked + .slider { background: #6366f1; }
.switch input:checked + .slider:before { transform: translateX(22px); }

.input-with-btn { display: flex; gap: 8px; }
.input-with-btn input { flex: 1; }
.toggle-btn { padding: 10px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; color: #64748b; }
.toggle-btn:hover { background: #e2e8f0; }

.btn-outline { padding: 10px 20px; background: #fff; border: 1px solid #6366f1; border-radius: 8px; color: #6366f1; font-weight: 500; cursor: pointer; }
.btn-outline:hover { background: #f5f5ff; }
.btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }

.color-picker { display: flex; gap: 12px; align-items: center; }
.color-picker input[type="color"] { width: 50px; height: 40px; border: none; border-radius: 8px; cursor: pointer; }
.color-picker input[type="text"] { flex: 1; }

.file-upload { display: flex; align-items: center; gap: 16px; }
.upload-preview { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
.upload-preview img { width: 100%; height: 100%; object-fit: contain; }
.upload-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #f1f5f9; border-radius: 8px; cursor: pointer; font-size: 14px; color: #475569; transition: all 0.2s; }
.upload-btn:hover { background: #e2e8f0; }

.panel-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
.btn-primary { padding: 10px 24px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
.btn-primary:hover { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 14px; font-weight: 500; z-index: 1000; }
.toast.success { border-left: 4px solid #10b981; color: #059669; }
.toast.error { border-left: 4px solid #ef4444; color: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(100px); }

@media (max-width: 768px) {
  .settings-content { grid-template-columns: 1fr; }
  .settings-sidebar { position: static; display: flex; overflow-x: auto; padding: 8px; gap: 8px; }
  .tab-btn { white-space: nowrap; padding: 10px 14px; }
  .tab-btn span { display: none; }
}
</style>