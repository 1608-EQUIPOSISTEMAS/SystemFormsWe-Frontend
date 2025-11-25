<!-- frontend/src/components/forms/QuestionCard.vue -->
<template>
  <div class="question-card" :class="{ expanded: isExpanded, required: question.is_required }">
    <!-- Header -->
    <div class="card-header" @click="toggleExpand">
      <div class="header-left">
        <span class="question-number">{{ index + 1 }}</span>
        <div class="question-info">
          <span class="question-type">{{ question.type_name }}</span>
          <span v-if="question.is_required" class="required-badge">Requerido</span>
        </div>
      </div>
      
      <div class="header-actions" @click.stop>
        <button class="action-btn" @click="$emit('move-up')" :disabled="index === 0" title="Mover arriba">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <button class="action-btn" @click="$emit('move-down')" title="Mover abajo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <button class="action-btn" @click="$emit('duplicate')" title="Duplicar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="action-btn delete" @click="$emit('remove')" title="Eliminar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
        <button class="action-btn expand" @click="toggleExpand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: isExpanded }">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Question Text (always visible) -->
    <div class="card-question">
      <input
        v-model="localQuestion.question_text"
        type="text"
        class="question-input"
        placeholder="Escribe tu pregunta aquí..."
        @input="emitUpdate"
      />
    </div>

    <!-- Expanded Content -->
    <Transition name="expand">
      <div v-if="isExpanded" class="card-body">
        <!-- Options for SELECT, RADIO, CHECKBOX -->
        <div v-if="question.has_options" class="options-section">
          <label class="section-label">Opciones</label>
          <div class="options-list">
            <div
              v-for="(option, optIndex) in localQuestion.options"
              :key="option.temp_id || option.id"
              class="option-item"
            >
              <span class="option-marker">
                <template v-if="question.type_code === 'CHECKBOX'">☐</template>
                <template v-else-if="question.type_code === 'RADIO'">○</template>
                <template v-else>{{ optIndex + 1 }}.</template>
              </span>
              <input
                v-model="option.option_text"
                type="text"
                class="option-input"
                placeholder="Texto de la opción"
                @input="emitOptionUpdate(option)"
              />
              <label v-if="isExam" class="correct-toggle" :title="option.is_correct ? 'Respuesta correcta' : 'Marcar como correcta'">
                <input
                  type="checkbox"
                  v-model="option.is_correct"
                  @change="emitOptionUpdate(option)"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="option.is_correct ? '#059669' : '#d1d5db'" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </label>
              <button
                class="remove-option-btn"
                @click="$emit('remove-option', option.temp_id || option.id)"
                :disabled="localQuestion.options.length <= 2"
                title="Eliminar opción"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <button class="add-option-btn" @click="$emit('add-option')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar opción
          </button>
        </div>

        <!-- Scale Config -->
        <div v-if="question.type_code === 'SCALE'" class="config-section">
          <label class="section-label">Configuración de escala</label>
          <div class="scale-config">
            <div class="config-field">
              <label>Mínimo</label>
              <input type="number" v-model.number="localQuestion.config.min" @input="emitUpdate" />
            </div>
            <div class="config-field">
              <label>Máximo</label>
              <input type="number" v-model.number="localQuestion.config.max" @input="emitUpdate" />
            </div>
          </div>
        </div>

        <!-- Rating Config -->
        <div v-if="question.type_code === 'RATING'" class="config-section">
          <label class="section-label">Configuración de calificación</label>
          <div class="config-field">
            <label>Número de estrellas</label>
            <select v-model.number="localQuestion.config.max_stars" @change="emitUpdate">
              <option :value="3">3 estrellas</option>
              <option :value="5">5 estrellas</option>
              <option :value="10">10 estrellas</option>
            </select>
          </div>
        </div>

        <!-- Additional Settings -->
        <div class="settings-row">
          <label class="toggle-field">
            <input type="checkbox" v-model="localQuestion.is_required" @change="emitUpdate" />
            <span>Obligatorio</span>
          </label>

          <div v-if="isExam" class="points-field">
            <label>Puntos</label>
            <input type="number" v-model.number="localQuestion.points" min="0" step="0.5" @input="emitUpdate" />
          </div>
        </div>

        <!-- Help Text -->
        <div class="help-text-field">
          <label>Texto de ayuda (opcional)</label>
          <input
            v-model="localQuestion.help_text"
            type="text"
            placeholder="Instrucciones adicionales para el usuario..."
            @input="emitUpdate"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  index: { type: Number, required: true },
  isExam: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update', 'remove', 'duplicate', 'move-up', 'move-down',
  'add-option', 'update-option', 'remove-option'
])

const isExpanded = ref(true)
const localQuestion = reactive({ ...props.question })

watch(() => props.question, (newVal) => {
  Object.assign(localQuestion, newVal)
}, { deep: true })

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function emitUpdate() {
  emit('update', {
    question_text: localQuestion.question_text,
    help_text: localQuestion.help_text,
    is_required: localQuestion.is_required,
    points: localQuestion.points,
    config: localQuestion.config
  })
}

function emitOptionUpdate(option) {
  emit('update-option', option.temp_id || option.id, {
    option_text: option.option_text,
    is_correct: option.is_correct,
    points: option.points
  })
}
</script>

<style scoped>
.question-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.question-card.required {
  border-left: 3px solid #ef4444;
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #001845;
  color: #ffffff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-type {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.required-badge {
  padding: 2px 8px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #4b5563;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.expand svg {
  transition: transform 0.2s ease;
}

.action-btn.expand svg.rotated {
  transform: rotate(180deg);
}

/* Question Input */
.card-question {
  padding: 16px;
}

.question-input {
  width: 100%;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  background: transparent;
  padding: 0;
}

.question-input:focus {
  outline: none;
}

.question-input::placeholder {
  color: #9ca3af;
}

/* Card Body */
.card-body {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

/* Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-marker {
  width: 20px;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.15s ease;
}

.option-input:focus {
  outline: none;
  border-color: #001845;
}

.correct-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.correct-toggle input {
  display: none;
}

.remove-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s ease;
}

.remove-option-btn:hover:not(:disabled) {
  background: #fef2f2;
  color: #dc2626;
}

.remove-option-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-option-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: 4px;
}

.add-option-btn:hover {
  border-color: #001845;
  color: #001845;
}

/* Config */
.config-section {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.scale-config {
  display: flex;
  gap: 16px;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-field label {
  font-size: 12px;
  color: #6b7280;
}

.config-field input,
.config-field select {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

/* Settings Row */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.toggle-field {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
}

.toggle-field input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #001845;
}

.points-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-field label {
  font-size: 14px;
  color: #4b5563;
}

.points-field input {
  width: 80px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

/* Help Text */
.help-text-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.help-text-field label {
  font-size: 12px;
  color: #6b7280;
}

.help-text-field input {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.help-text-field input:focus {
  outline: none;
  border-color: #001845;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>