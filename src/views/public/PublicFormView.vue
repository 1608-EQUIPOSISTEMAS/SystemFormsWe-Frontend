<!-- src/components/forms/QuestionRenderer.vue -->
<template>
  <div class="question-wrapper">
    <label class="question-label">
      <span class="question-text">{{ question.question_text }}</span>
      <span v-if="question.is_required" class="required">*</span>
    </label>
    
    <p v-if="question.help_text" class="help-text">
      {{ question.help_text }}
    </p>

    <!-- Text Input -->
    <input
      v-if="question.type === 'TEXT'"
      type="text"
      v-model="localValue"
      :placeholder="question.placeholder"
      :required="question.is_required"
      class="form-control"
      @input="updateValue"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="question.type === 'TEXTAREA'"
      v-model="localValue"
      :placeholder="question.placeholder"
      :required="question.is_required"
      class="form-control"
      rows="4"
      @input="updateValue"
    />

    <!-- Email -->
    <input
      v-else-if="question.type === 'EMAIL'"
      type="email"
      v-model="localValue"
      :placeholder="question.placeholder || 'correo@ejemplo.com'"
      :required="question.is_required"
      class="form-control"
      @input="updateValue"
    />

    <!-- Number -->
    <input
      v-else-if="question.type === 'NUMBER'"
      type="number"
      v-model="localValue"
      :placeholder="question.placeholder"
      :required="question.is_required"
      class="form-control"
      @input="updateValue"
    />

    <!-- Date -->
    <input
      v-else-if="question.type === 'DATE'"
      type="date"
      v-model="localValue"
      :required="question.is_required"
      class="form-control"
      @change="updateValue"
    />

    <!-- Radio buttons -->
    <div v-else-if="question.type === 'RADIO'" class="options-list">
      <label 
        v-for="option in question.options" 
        :key="option.id"
        class="option-item radio"
      >
        <input
          type="radio"
          :name="`question_${question.id}`"
          :value="option.id"
          v-model="localValue"
          @change="updateValue"
        />
        <span>{{ option.option_text }}</span>
      </label>
    </div>

    <!-- Checkboxes -->
    <div v-else-if="question.type === 'CHECKBOX'" class="options-list">
      <label 
        v-for="option in question.options" 
        :key="option.id"
        class="option-item checkbox"
      >
        <input
          type="checkbox"
          :value="option.id"
          v-model="checkboxValues"
          @change="updateCheckboxes"
        />
        <span>{{ option.option_text }}</span>
      </label>
    </div>

    <!-- Select dropdown -->
    <select
      v-else-if="question.type === 'SELECT'"
      v-model="localValue"
      :required="question.is_required"
      class="form-control"
      @change="updateValue"
    >
      <option value="">Seleccione una opción</option>
      <option 
        v-for="option in question.options" 
        :key="option.id"
        :value="option.id"
      >
        {{ option.option_text }}
      </option>
    </select>

    <!-- Rating -->
    <div v-else-if="question.type === 'RATING'" class="rating-container">
      <div class="stars">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="star"
          :class="{ active: localValue >= star }"
          @click="setRating(star)"
        >
          <i :class="localValue >= star ? 'bi bi-star-fill' : 'bi bi-star'"></i>
        </button>
      </div>
    </div>

    <!-- Scale -->
    <div v-else-if="question.type === 'SCALE'" class="scale-container">
      <div class="scale-labels">
        <span>{{ question.config?.min || 1 }}</span>
        <span>{{ question.config?.max || 10 }}</span>
      </div>
      <input
        type="range"
        v-model="localValue"
        :min="question.config?.min || 1"
        :max="question.config?.max || 10"
        :step="question.config?.step || 1"
        class="scale-input"
        @input="updateValue"
      />
      <div class="scale-value">{{ localValue || question.config?.min || 1 }}</div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'error'])

const localValue = ref(null)
const checkboxValues = ref([])
const error = ref(null)

// Initialize values
onMounted(() => {
  if (props.question.type === 'CHECKBOX') {
    checkboxValues.value = Array.isArray(props.modelValue) ? props.modelValue : []
  } else {
    localValue.value = props.modelValue
  }
})

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  if (props.question.type === 'CHECKBOX') {
    checkboxValues.value = Array.isArray(newVal) ? newVal : []
  } else {
    localValue.value = newVal
  }
})

function updateValue() {
  validateAndEmit(localValue.value)
}

function updateCheckboxes() {
  validateAndEmit(checkboxValues.value)
}

function setRating(rating) {
  localValue.value = rating
  validateAndEmit(rating)
}

function validateAndEmit(value) {
  error.value = null
  
  // Validar requerido
  if (props.question.is_required) {
    if (Array.isArray(value) && value.length === 0) {
      error.value = 'Este campo es obligatorio'
    } else if (!Array.isArray(value) && !value) {
      error.value = 'Este campo es obligatorio'
    }
  }
  
  // Validar reglas adicionales
  if (props.question.validation_rules) {
    const rules = props.question.validation_rules
    
    if (rules.min_length && value.length < rules.min_length) {
      error.value = `Mínimo ${rules.min_length} caracteres`
    }
    
    if (rules.max_length && value.length > rules.max_length) {
      error.value = `Máximo ${rules.max_length} caracteres`
    }
    
    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      error.value = 'Formato inválido'
    }
  }
  
  emit('update:modelValue', value)
  emit('error', error.value)
}
</script>

<style scoped>
.question-wrapper {
  margin-bottom: 24px;
}

.question-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1f2937;
  font-size: 1rem;
}

.required {
  color: #dc2626;
  margin-left: 4px;
}

.help-text {
  margin: -4px 0 8px 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.15s ease;
}

.form-control:focus {
  outline: none;
  border-color: #001845;
  box-shadow: 0 0 0 3px rgba(0, 24, 69, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Options list */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.option-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.option-item input[type="radio"],
.option-item input[type="checkbox"] {
  margin: 0;
}

/* Rating */
.rating-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stars {
  display: flex;
  gap: 4px;
}

.star {
  background: none;
  border: none;
  font-size: 24px;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.15s ease;
  padding: 4px;
}

.star:hover,
.star.active {
  color: #fbbf24;
}

/* Scale */
.scale-container {
  padding: 16px 0;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}

.scale-input {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  outline: none;
  border-radius: 3px;
}

.scale-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #001845;
  cursor: pointer;
  border-radius: 50%;
}

.scale-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #001845;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

.scale-value {
  text-align: center;
  margin-top: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #001845;
}

/* Error */
.error-message {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
  color: #dc2626;
}
</style>