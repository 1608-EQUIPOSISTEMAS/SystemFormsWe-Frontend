<!-- frontend/src/components/forms/QuestionCard.vue -->
<template>
  <div 
    class="qcard" 
    :class="{ 'qcard--required': question.is_required }"
  >
    <!-- ═══ HEADER ═══ -->
    <div class="qcard__header">
      <div class="qcard__header-left" @click="isExpanded = !isExpanded">
        <span class="qcard__num">{{ index + 1 }}</span>
        <span class="qcard__type">{{ question.type_name }}</span>
        <span v-if="question.is_required" class="qcard__req-dot"></span>
        <span v-if="isExam && localQuestion.points" class="qcard__pts">
          {{ localQuestion.points }} pts
        </span>
      </div>
      <div class="qcard__actions" @click.stop>
        <button class="qcard__act" @click="$emit('move-up')" :disabled="index === 0" title="Subir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button class="qcard__act" @click="$emit('move-down')" title="Bajar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <span class="qcard__act-sep"></span>
        <button class="qcard__act" @click="$emit('duplicate')" title="Duplicar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
        <button class="qcard__act qcard__act--del" @click="$emit('remove')" title="Eliminar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
        <button class="qcard__act qcard__act--expand" @click="isExpanded = !isExpanded">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ transform: isExpanded ? 'rotate(180deg)' : '' }"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>

    <!-- ═══ QUESTION TEXT ═══ -->
    <div class="qcard__question">
      <input
        v-model="localQuestion.question_text"
        type="text"
        class="qcard__title-input"
        placeholder="Escribe tu pregunta aquí..."
        @input="emitUpdate"
      />
    </div>

    <!-- ═══ EXPANDED BODY ═══ -->
    <div v-if="isExpanded" class="qcard__body">
      
      <!-- OPTIONS (RADIO, CHECKBOX, SELECT) -->
      <div v-if="question.has_options" class="qcard__options-section">
        <div class="qcard__section-top">
          <span class="qcard__section-label">OPCIONES</span>
          <span v-if="isExam" class="qcard__section-hint">
            {{ question.type_code === 'RADIO' ? '● Selecciona solo 1 correcta' : '☑ Marca las correctas' }}
          </span>
        </div>

        <div class="qcard__options">
          <div
            v-for="(option, oi) in localQuestion.options"
            :key="option.temp_id || option.id"
            class="qcard__opt"
          >
            <!-- Marker -->
            <span class="qcard__opt-marker">
              <template v-if="question.type_code === 'RADIO'">
                <span class="marker-radio"></span>
              </template>
              <template v-else-if="question.type_code === 'CHECKBOX'">
                <span class="marker-check"></span>
              </template>
              <template v-else>
                <span class="marker-num">{{ oi + 1 }}</span>
              </template>
            </span>

            <!-- Text input -->
            <input
              v-model="option.option_text"
              type="text"
              class="qcard__opt-input"
              :placeholder="'Opción ' + (oi + 1)"
              @input="emitOptionUpdate(option)"
            />

            <!-- ★ CORRECT BUTTON (exam only) ★ -->
            <button
              v-if="isExam"
              class="qcard__correct-btn"
              :class="{ active: option.is_correct }"
              :title="option.is_correct ? '✓ Correcta' : 'Marcar correcta'"
              @click="handleToggleCorrect(option, oi)"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>

            <!-- Move option up/down -->
            <div class="qcard__opt-move">
              <button 
                type="button"
                @click="handleMoveOption(oi, oi - 1)" 
                :disabled="oi === 0"
                title="Subir opción"
              >↑</button>
              <button 
                type="button"
                @click="handleMoveOption(oi, oi + 1)" 
                :disabled="oi === localQuestion.options.length - 1"
                title="Bajar opción"
              >↓</button>
            </div>

            <!-- Remove option -->
            <button
              type="button"
              class="qcard__opt-remove"
              @click="$emit('remove-option', option.temp_id || option.id)"
              :disabled="localQuestion.options.length <= 2"
              title="Eliminar opción"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <button type="button" class="qcard__add-opt" @click="$emit('add-option')">
          + Agregar opción
        </button>
      </div>

      <!-- SCALE CONFIG -->
      <div v-if="question.type_code === 'SCALE'" class="qcard__config">
        <span class="qcard__section-label">ESCALA</span>
        <div class="qcard__config-row">
          <div class="qcard__config-field">
            <label>Mínimo</label>
            <input type="number" v-model.number="localQuestion.config.min" @input="emitUpdate" />
          </div>
          <div class="qcard__config-field">
            <label>Máximo</label>
            <input type="number" v-model.number="localQuestion.config.max" @input="emitUpdate" />
          </div>
        </div>
      </div>

      <!-- RATING CONFIG -->
      <div v-if="question.type_code === 'RATING'" class="qcard__config">
        <span class="qcard__section-label">CALIFICACIÓN</span>
        <div class="qcard__config-field">
          <label>Estrellas</label>
          <select v-model.number="localQuestion.config.max_stars" @change="emitUpdate">
            <option :value="3">3</option>
            <option :value="5">5</option>
            <option :value="10">10</option>
          </select>
        </div>
      </div>

      <!-- SETTINGS BAR -->
      <div class="qcard__settings">
        <label class="qcard__checkbox">
          <input type="checkbox" v-model="localQuestion.is_required" @change="emitUpdate" />
          <span class="qcard__checkbox-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span>Obligatorio</span>
        </label>
        <div v-if="isExam" class="qcard__points">
          <label>Puntos</label>
          <input type="number" v-model.number="localQuestion.points" min="0" step="0.5" @input="emitUpdate" placeholder="0" />
        </div>
      </div>

      <!-- HELP TEXT -->
      <div class="qcard__help">
        <input
          v-model="localQuestion.help_text"
          type="text"
          placeholder="Texto de ayuda (opcional)..."
          @input="emitUpdate"
        />
      </div>
    </div>
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

watch(() => props.question, (val) => {
  Object.assign(localQuestion, val)
}, { deep: true })

function emitUpdate() {
  emit('update', {
    question_text: localQuestion.question_text,
    help_text: localQuestion.help_text,
    is_required: localQuestion.is_required,
    points: localQuestion.points,
    config: localQuestion.config,
    options: localQuestion.options
  })
}

function emitOptionUpdate(option) {
  emit('update-option', option.temp_id || option.id, {
    option_text: option.option_text,
    is_correct: option.is_correct,
    points: option.points
  })
}

/**
 * ★ FIX PRINCIPAL: RADIO = solo 1 correcta, CHECKBOX = múltiples
 */
function handleToggleCorrect(option, optIndex) {
  if (props.question.type_code === 'RADIO') {
    // Primero desmarcar TODAS
    localQuestion.options.forEach((opt, i) => {
      if (i !== optIndex && opt.is_correct) {
        opt.is_correct = false
        emitOptionUpdate(opt)
      }
    })
  }
  // Toggle la seleccionada
  option.is_correct = !option.is_correct
  emitOptionUpdate(option)
}

/**
 * Mover opción de posición
 */
function handleMoveOption(from, to) {
  if (to < 0 || to >= localQuestion.options.length) return
  const arr = [...localQuestion.options]
  const item = arr.splice(from, 1)[0]
  arr.splice(to, 0, item)
  localQuestion.options = arr
  emitUpdate()
}
</script>

<style scoped>
/* ═══════════════════════════════
   CARD
   ═══════════════════════════════ */
.qcard {
  background: #fff;
  border: 1px solid #e2e4e9;
  border-radius: 10px;
  transition: box-shadow 0.2s;
}
.qcard:hover {
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.qcard--required {
  border-left: 3px solid #ef4444;
}

/* ═══════════════════════════════
   HEADER
   ═══════════════════════════════ */
.qcard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 10px 16px;
  border-bottom: 1px solid #f0f1f3;
}

.qcard__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.qcard__num {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  background: #111;
  color: #fff;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
}

.qcard__type {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.qcard__req-dot {
  width: 7px;
  height: 7px;
  background: #ef4444;
  border-radius: 50%;
}

.qcard__pts {
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #555;
}

/* Actions */
.qcard__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.qcard__act {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 6px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.15s;
}
.qcard__act svg {
  width: 15px;
  height: 15px;
}
.qcard__act:hover:not(:disabled) {
  background: #f3f4f6;
  color: #555;
}
.qcard__act:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
.qcard__act--del:hover {
  background: #fef2f2 !important;
  color: #ef4444 !important;
}
.qcard__act--expand svg {
  transition: transform 0.2s ease;
}

.qcard__act-sep {
  width: 1px;
  height: 18px;
  background: #e5e7eb;
  margin: 0 4px;
}

/* ═══════════════════════════════
   QUESTION INPUT
   ═══════════════════════════════ */
.qcard__question {
  padding: 14px 16px 6px;
}

.qcard__title-input {
  width: 100%;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #111;
  outline: none;
  background: transparent;
}
.qcard__title-input::placeholder {
  color: #bbb;
}

/* ═══════════════════════════════
   BODY
   ═══════════════════════════════ */
.qcard__body {
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Section top */
.qcard__section-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.qcard__section-label {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  letter-spacing: 0.06em;
}

.qcard__section-hint {
  font-size: 11px;
  font-weight: 600;
  color: #6366f1;
}

/* ═══════════════════════════════
   OPTIONS
   ═══════════════════════════════ */
.qcard__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qcard__opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 4px 0;
  border-radius: 6px;
}
.qcard__opt:hover {
  background: #fafbfc;
}

/* Option marker */
.qcard__opt-marker {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marker-radio {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 50%;
}

.marker-check {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
}

.marker-num {
  font-size: 12px;
  font-weight: 600;
  color: #999;
}

/* Option input */
.qcard__opt-input {
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #e2e4e9;
  border-radius: 7px;
  font-size: 14px;
  color: #111;
  transition: border-color 0.15s;
}
.qcard__opt-input:focus {
  outline: none;
  border-color: #999;
}

/* ★★★ CORRECT BUTTON ★★★ */
.qcard__correct-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: #fff;
  color: #ddd;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.qcard__correct-btn svg {
  width: 18px;
  height: 18px;
}
.qcard__correct-btn:hover {
  border-color: #10b981;
  color: #10b981;
  background: #ecfdf5;
}
.qcard__correct-btn.active {
  border-color: #10b981;
  background: #10b981;
  color: #fff;
  box-shadow: 0 2px 8px rgba(16,185,129,0.3);
}

/* Move option */
.qcard__opt-move {
  display: flex;
  flex-direction: column;
  gap: 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.qcard__opt:hover .qcard__opt-move {
  opacity: 1;
}
.qcard__opt-move button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 16px;
  border: none;
  background: none;
  border-radius: 3px;
  font-size: 10px;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
}
.qcard__opt-move button:hover:not(:disabled) {
  background: #f0f0f0;
  color: #555;
}
.qcard__opt-move button:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

/* Remove option */
.qcard__opt-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 6px;
  color: #ccc;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0;
  transition: all 0.15s;
}
.qcard__opt-remove svg {
  width: 14px;
  height: 14px;
}
.qcard__opt:hover .qcard__opt-remove {
  opacity: 1;
}
.qcard__opt-remove:hover:not(:disabled) {
  background: #fef2f2;
  color: #ef4444;
}
.qcard__opt-remove:disabled {
  opacity: 0 !important;
  cursor: not-allowed;
}

/* Add option */
.qcard__add-opt {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px dashed #d1d5db;
  border-radius: 7px;
  background: none;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.15s;
  width: fit-content;
}
.qcard__add-opt:hover {
  border-color: #111;
  color: #111;
}

/* ═══════════════════════════════
   CONFIG
   ═══════════════════════════════ */
.qcard__config {
  padding: 14px;
  background: #f9fafb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qcard__config-row {
  display: flex;
  gap: 16px;
}

.qcard__config-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.qcard__config-field label {
  font-size: 12px;
  color: #888;
}
.qcard__config-field input,
.qcard__config-field select {
  padding: 7px 10px;
  border: 1px solid #e2e4e9;
  border-radius: 6px;
  font-size: 14px;
  color: #111;
}

/* ═══════════════════════════════
   SETTINGS BAR
   ═══════════════════════════════ */
.qcard__settings {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 8px;
}

/* ★★★ CUSTOM CHECKBOX ★★★ */
.qcard__checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  user-select: none;
}

.qcard__checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.qcard__checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 2px solid #c5c9d0;
  border-radius: 6px;
  background: #fff;
  color: transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.qcard__checkbox-box svg {
  width: 14px;
  height: 14px;
}

.qcard__checkbox input:checked + .qcard__checkbox-box {
  background: #111;
  border-color: #111;
  color: #fff;
}

.qcard__checkbox:hover .qcard__checkbox-box {
  border-color: #999;
}

/* Points */
.qcard__points {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qcard__points label {
  font-size: 13px;
  color: #888;
}
.qcard__points input {
  width: 70px;
  padding: 7px 10px;
  border: 1px solid #e2e4e9;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  color: #111;
}
.qcard__points input:focus {
  outline: none;
  border-color: #999;
}

/* ═══════════════════════════════
   HELP TEXT
   ═══════════════════════════════ */
.qcard__help input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 13px;
  color: #555;
  background: #f9fafb;
  transition: all 0.15s;
}
.qcard__help input:hover {
  border-color: #e2e4e9;
}
.qcard__help input:focus {
  outline: none;
  border-color: #999;
  background: #fff;
}
.qcard__help input::placeholder {
  color: #bbb;
}

/* ═══════════════════════════════
   RESPONSIVE
   ═══════════════════════════════ */
@media (max-width: 640px) {
  .qcard__actions { gap: 0; }
  .qcard__act { width: 28px; height: 28px; }
  .qcard__act-sep { display: none; }
  .qcard__opt-move { opacity: 1; }
  .qcard__opt-remove { opacity: 1; }
  .qcard__correct-btn { width: 32px; height: 32px; }
  .qcard__settings {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>