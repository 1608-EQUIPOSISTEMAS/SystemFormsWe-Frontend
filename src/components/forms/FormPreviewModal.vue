<!-- frontend/src/components/forms/FormPreviewModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="preview-card">
      <div class="preview-header">
        <h2>Vista previa</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="preview-body">
        <div class="form-preview">
          <h1 class="preview-title">{{ form.title || 'Sin título' }}</h1>
          <p v-if="form.description" class="preview-description">{{ form.description }}</p>
          
          <div v-if="form.settings?.welcome_message" class="welcome-message">
            {{ form.settings.welcome_message }}
          </div>

          <div class="questions-preview">
            <div
              v-for="(question, index) in questions"
              :key="question.temp_id || question.id"
              class="question-preview"
            >
              <div class="question-label">
                <span class="question-num">{{ index + 1 }}.</span>
                <span>{{ question.question_text || 'Pregunta sin texto' }}</span>
                <span v-if="question.is_required" class="required-mark">*</span>
              </div>
              
              <p v-if="question.help_text" class="question-help">{{ question.help_text }}</p>

              <!-- Preview según tipo -->
              <div class="question-input-preview">
                <template v-if="question.type_code === 'TEXT'">
                  <input type="text" disabled placeholder="Respuesta corta" />
                </template>
                
                <template v-else-if="question.type_code === 'TEXTAREA'">
                  <textarea disabled placeholder="Respuesta larga" rows="3"></textarea>
                </template>
                
                <template v-else-if="question.type_code === 'EMAIL'">
                  <input type="email" disabled placeholder="correo@ejemplo.com" />
                </template>
                
                <template v-else-if="question.type_code === 'NUMBER'">
                  <input type="number" disabled placeholder="0" />
                </template>
                
                <template v-else-if="question.type_code === 'DATE'">
                  <input type="date" disabled />
                </template>
                
                <template v-else-if="question.type_code === 'TIME'">
                  <input type="time" disabled />
                </template>
                
                <template v-else-if="question.type_code === 'DATETIME'">
                  <input type="datetime-local" disabled />
                </template>
                
                <template v-else-if="question.type_code === 'SELECT'">
                  <select disabled>
                    <option value="">Seleccionar...</option>
                    <option v-for="opt in question.options" :key="opt.temp_id || opt.id">
                      {{ opt.option_text }}
                    </option>
                  </select>
                </template>
                
                <template v-else-if="question.type_code === 'RADIO'">
                  <div class="radio-options">
                    <label v-for="opt in question.options" :key="opt.temp_id || opt.id" class="radio-option">
                      <input type="radio" disabled :name="`q_${index}`" />
                      <span>{{ opt.option_text }}</span>
                    </label>
                  </div>
                </template>
                
                <template v-else-if="question.type_code === 'CHECKBOX'">
                  <div class="checkbox-options">
                    <label v-for="opt in question.options" :key="opt.temp_id || opt.id" class="checkbox-option">
                      <input type="checkbox" disabled />
                      <span>{{ opt.option_text }}</span>
                    </label>
                  </div>
                </template>
                
                <template v-else-if="question.type_code === 'RATING'">
                  <div class="rating-preview">
                    <span v-for="n in (question.config?.max_stars || 5)" :key="n" class="star">☆</span>
                  </div>
                </template>
                
                <template v-else-if="question.type_code === 'SCALE'">
                  <div class="scale-preview">
                    <span>{{ question.config?.min || 1 }}</span>
                    <input type="range" :min="question.config?.min || 1" :max="question.config?.max || 10" disabled />
                    <span>{{ question.config?.max || 10 }}</span>
                  </div>
                </template>
                
                <template v-else-if="question.type_code === 'FILE'">
                  <div class="file-preview">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Subir archivo</span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <button class="submit-preview" disabled>Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  questions: { type: Array, default: () => [] }
})

defineEmits(['close'])
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

.preview-card {
  background: #f8fafc;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h2 {
  margin: 0;
  font-size: 1rem;
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
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-preview {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preview-title {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.preview-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
}

.welcome-message {
  padding: 12px 16px;
  background: #f0f9ff;
  border-left: 3px solid #0284c7;
  border-radius: 4px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #0369a1;
}

.questions-preview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-preview {
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.question-preview:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.question-label {
  display: flex;
  gap: 6px;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.question-num {
  color: #6b7280;
}

.required-mark {
  color: #dc2626;
}

.question-help {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #9ca3af;
}

.question-input-preview input,
.question-input-preview textarea,
.question-input-preview select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #f9fafb;
}

.radio-options,
.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.rating-preview {
  display: flex;
  gap: 4px;
}

.rating-preview .star {
  font-size: 24px;
  color: #fbbf24;
}

.scale-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scale-preview input[type="range"] {
  flex: 1;
}

.scale-preview span {
  font-size: 13px;
  color: #6b7280;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  color: #9ca3af;
  font-size: 14px;
}

.submit-preview {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  background: #001845;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  opacity: 0.7;
  cursor: not-allowed;
}
</style>