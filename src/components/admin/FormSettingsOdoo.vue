<template>
  <div class="odoo-settings">
    <div class="section-header">
      <h3>
        <span class="icon">🔗</span>
        Integración con Odoo
      </h3>
      <p class="section-desc">
        Configura la conexión con el sistema de certificados de WE Online
      </p>
    </div>

    <div class="settings-form">
      <!-- Toggle principal -->
      <div class="form-group toggle-group">
        <label class="toggle-label">
          <input 
            type="checkbox" 
            v-model="settings.requires_odoo_validation"
            @change="emit('update', settings)"
          />
          <span class="toggle-switch"></span>
          <span class="toggle-text">
            <strong>Requiere validación en Odoo</strong>
            <small>El alumno debe ingresar su correo registrado antes de iniciar</small>
          </span>
        </label>
      </div>

      <!-- Campos de Odoo (solo si está habilitado) -->
      <template v-if="settings.requires_odoo_validation">
        <div class="odoo-fields">
          <!-- Nombre del curso -->
          <div class="form-group">
            <label for="odoo_course_name">
              Nombre del Curso en Odoo
              <span class="required">*</span>
            </label>
            <input 
              type="text" 
              id="odoo_course_name"
              v-model="settings.odoo_course_name"
              placeholder="Ej: Excel Básico Online"
              @blur="emit('update', settings)"
            />
            <small class="help-text">
              Debe coincidir exactamente con el nombre en slide.channel
            </small>
          </div>

          <!-- ID del slide channel (opcional) -->
          <div class="form-group">
            <label for="odoo_slide_channel_id">
              ID del Slide Channel
              <span class="optional">(opcional)</span>
            </label>
            <input 
              type="number" 
              id="odoo_slide_channel_id"
              v-model.number="settings.odoo_slide_channel_id"
              placeholder="Ej: 9"
              @blur="emit('update', settings)"
            />
            <small class="help-text">
              Si lo conoces, acelera la búsqueda. Déjalo vacío para buscar por nombre.
            </small>
          </div>

          <!-- Horas académicas -->
          <div class="form-group">
            <label for="odoo_academic_hours">
              Horas Académicas
            </label>
            <input 
              type="number" 
              id="odoo_academic_hours"
              v-model.number="settings.odoo_academic_hours"
              placeholder="24"
              min="1"
              @blur="emit('update', settings)"
            />
          </div>

          <!-- Tipo de curso -->
          <div class="form-group">
            <label for="odoo_course_type">
              Tipo de Curso
            </label>
            <select 
              id="odoo_course_type"
              v-model="settings.odoo_course_type"
              @change="emit('update', settings)"
            >
              <option value="online_ind">Online Individual</option>
              <option value="online_corp">Online Corporativo</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        <!-- Info box -->
        <div class="info-box">
          <span class="info-icon">ℹ️</span>
          <div class="info-content">
            <strong>Flujo de certificación:</strong>
            <ol>
              <li>El alumno ingresa su correo y se valida en Odoo</li>
              <li>Al aprobar el examen, se genera automáticamente el certificado</li>
              <li>El alumno puede descargar el PDF y verlo en la intranet</li>
            </ol>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      requires_odoo_validation: false,
      odoo_course_name: '',
      odoo_slide_channel_id: null,
      odoo_academic_hours: 24,
      odoo_course_type: 'online_ind'
    })
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

const settings = reactive({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  Object.assign(settings, newVal)
}, { deep: true })

watch(settings, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })
</script>

<style scoped>
.odoo-settings {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
  font-size: 16px;
  color: #111827;
}

.icon {
  font-size: 20px;
}

.section-desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* Toggle */
.toggle-group {
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 20px;
}

.toggle-label {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
}

.toggle-label input {
  display: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-label input:checked + .toggle-switch {
  background: #059669;
}

.toggle-label input:checked + .toggle-switch::after {
  transform: translateX(20px);
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-text strong {
  color: #111827;
  font-size: 14px;
}

.toggle-text small {
  color: #6b7280;
  font-size: 13px;
}

/* Odoo Fields */
.odoo-fields {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.required {
  color: #dc2626;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
  font-size: 12px;
}

.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #001845;
}

.help-text {
  font-size: 12px;
  color: #6b7280;
}

/* Info Box */
.info-box {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 10px;
  border: 1px solid #bfdbfe;
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.info-content {
  font-size: 13px;
  color: #1e40af;
}

.info-content strong {
  display: block;
  margin-bottom: 8px;
}

.info-content ol {
  margin: 0;
  padding-left: 18px;
}

.info-content li {
  margin-bottom: 4px;
}
</style>