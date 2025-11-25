<!-- frontend/src/components/forms/FormSettingsModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Configuración del formulario</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- General -->
        <section class="settings-section">
          <h3>General</h3>
          <div class="settings-grid">
            <label class="toggle-setting">
              <span>Formulario activo</span>
              <input type="checkbox" v-model="local.is_active" />
            </label>
            <label class="toggle-setting">
              <span>Público (sin registro)</span>
              <input type="checkbox" v-model="local.is_public" />
            </label>
            <label class="toggle-setting">
              <span>Permitir múltiples respuestas</span>
              <input type="checkbox" v-model="local.allow_multiple_responses" />
            </label>
            <label class="toggle-setting">
              <span>Mostrar barra de progreso</span>
              <input type="checkbox" v-model="local.show_progress_bar" />
            </label>
          </div>
        </section>

        <!-- Disponibilidad -->
        <section class="settings-section">
          <h3>Disponibilidad</h3>
          <div class="date-fields">
            <div class="field">
              <label>Disponible desde</label>
              <input type="datetime-local" v-model="local.available_from" />
            </div>
            <div class="field">
              <label>Disponible hasta</label>
              <input type="datetime-local" v-model="local.available_until" />
            </div>
          </div>
        </section>

        <!-- Examen -->
        <section v-if="formType === 'EXAM'" class="settings-section">
          <h3>Configuración de examen</h3>
          <div class="exam-settings">
            <div class="field">
              <label>Tiempo límite (minutos)</label>
              <input type="number" v-model.number="local.time_limit_minutes" min="1" placeholder="Sin límite" />
            </div>
            <div class="field">
              <label>Puntaje mínimo para aprobar (%)</label>
              <input type="number" v-model.number="local.passing_score" min="0" max="100" placeholder="60" />
            </div>
            <label class="toggle-setting">
              <span>Mezclar preguntas aleatoriamente</span>
              <input type="checkbox" v-model="local.shuffle_questions" />
            </label>
            <label class="toggle-setting">
              <span>Mostrar puntaje al finalizar</span>
              <input type="checkbox" v-model="local.show_score_after_submit" />
            </label>
            <label class="toggle-setting">
              <span>Mostrar respuestas correctas</span>
              <input type="checkbox" v-model="local.show_correct_answers" />
            </label>
          </div>
        </section>

        <!-- Mensajes -->
        <section class="settings-section">
          <h3>Mensajes personalizados</h3>
          <div class="field">
            <label>Mensaje de bienvenida</label>
            <textarea v-model="local.welcome_message" rows="2" placeholder="Opcional..."></textarea>
          </div>
          <div class="field">
            <label>Mensaje al enviar</label>
            <textarea v-model="local.submit_message" rows="2" placeholder="Gracias por completar el formulario."></textarea>
          </div>
        </section>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
        <button class="btn-save" @click="handleSave">Guardar cambios</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  settings: { type: Object, required: true },
  formType: { type: String, default: 'SURVEY' }
})

const emit = defineEmits(['close', 'save'])

const local = reactive({ ...props.settings })

function handleSave() {
  emit('save', { ...local })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h3 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-grid {
  display: grid;
  gap: 12px;
}

.toggle-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
}

.toggle-setting span {
  font-size: 14px;
  color: #374151;
}

.toggle-setting input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #001845;
}

.date-fields,
.exam-settings {
  display: grid;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.field input,
.field textarea {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #001845;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #001845;
  color: #ffffff;
}

.btn-save:hover {
  background: #002866;
}
</style>