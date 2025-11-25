<!-- frontend/src/views/admin/forms/FormCreateView.vue -->
<template>
  <div class="form-builder">
    <!-- Header -->
    <header class="builder-header">
      <div class="header-left">
        <input
          type="text"
          class="title-input"
          placeholder="Ingrese el título del formulario"
          v-model="store.form.title"
        />
        
        <!-- NUEVO: Selector de tipo de formulario -->
        <div class="form-type-selector">
          <button 
            class="type-btn"
            :class="{ active: store.form.form_type === 'SURVEY' }"
            @click="store.form.form_type = 'SURVEY'"
          >
            <i class="bi bi-clipboard-check"></i>
            Encuesta
          </button>
          <button 
            class="type-btn"
            :class="{ active: store.form.form_type === 'EXAM' }"
            @click="store.form.form_type = 'EXAM'"
          >
            <i class="bi bi-file-earmark-text"></i>
            Examen
          </button>
        </div>
        
        <!-- Si es examen, mostrar selector de curso -->
        <select 
          v-if="store.form.form_type === 'EXAM'" 
          v-model="store.form.course_id"
          class="course-selector"
        >
          <option value="">Seleccione un curso</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.name }}
          </option>
        </select>
      </div>

      <div class="header-actions">
        <button class="btn-secondary" @click="showSettings = true">
          <i class="bi bi-gear"></i>
          Configuración
        </button>
        <button class="btn-secondary" @click="showPreview = true">
          <i class="bi bi-eye"></i>
          Vista previa
        </button>
        <button 
          class="btn-primary" 
          @click="handleSave"
          :disabled="!canSave || store.isSaving"
        >
          <i v-if="store.isSaving" class="bi bi-arrow-repeat spinning"></i>
          <i v-else class="bi bi-save"></i>
          {{ store.isSaving ? 'Guardando...' : 'Guardar formulario' }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="builder-content">
      <!-- Sidebar - Question Types -->
      <aside class="builder-sidebar">
        <div class="sidebar-section">
          <h3>Agregar pregunta</h3>
          <div class="question-types-grid">
            <button
              v-for="type in store.questionTypes"
              :key="type.id"
              class="type-btn"
              @click="addQuestion(type.id)"
              :title="type.description"
            >
              <component :is="getTypeIcon(type.code)" class="type-icon" />
              <span>{{ type.name }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Canvas - Questions -->
      <main class="builder-canvas">
        <div v-if="!store.hasQuestions" class="empty-canvas">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <h3>Comienza a crear tu formulario</h3>
          <p>Selecciona un tipo de pregunta del panel izquierdo para agregar</p>
        </div>

        <TransitionGroup v-else name="list" tag="div" class="questions-list">
          <QuestionCard
            v-for="(question, index) in store.questions"
            :key="question.temp_id || question.id"
            :question="question"
            :index="index"
            :is-exam="store.isExam"
            @update="(updates) => store.updateQuestion(question.temp_id || question.id, updates)"
            @remove="store.removeQuestion(question.temp_id || question.id)"
            @duplicate="store.duplicateQuestion(question.temp_id || question.id)"
            @move-up="moveUp(index)"
            @move-down="moveDown(index)"
            @add-option="store.addOption(question.temp_id || question.id)"
            @update-option="(optId, updates) => store.updateOption(question.temp_id || question.id, optId, updates)"
            @remove-option="(optId) => store.removeOption(question.temp_id || question.id, optId)"
          />
        </TransitionGroup>
      </main>
    </div>

    <!-- Settings Modal -->
    <FormSettingsModal
      v-if="showSettings"
      :settings="store.form.settings"
      :form-type="store.form.form_type"
      @close="showSettings = false"
      @save="handleSettingsSave"
    />

    <!-- Preview Modal -->
    <FormPreviewModal
      v-if="showPreview"
      :form="store.form"
      :questions="store.questions"
      @close="showPreview = false"
    />

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useFormBuilderStore } from '@/stores/formBuilder'
import QuestionCard from '@/components/forms/QuestionCard.vue'
import FormSettingsModal from '@/components/forms/FormSettingsModal.vue'
import FormPreviewModal from '@/components/forms/FormPreviewModal.vue'
import { formService } from '@/services/form.service'
import { courseService } from '@/services/course.service'


const router = useRouter()
const store = useFormBuilderStore()

const showSettings = ref(false)
const showPreview = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const canSave = computed(() => {
  return store.form.title.trim() && store.hasQuestions
})

const courses = ref([])

// En onMounted, agrega:
onMounted(async () => {
  store.resetForm()
  await store.loadQuestionTypes()
  
  // Cargar cursos
  try {
    const response = await courseService.list()
    courses.value = response.data?.courses || []
  } catch (error) {
    console.error('Error cargando cursos:', error)
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// Cargar tipos de preguntas
onMounted(async () => {
  store.resetForm()
  await store.loadQuestionTypes()
  
  // Prevenir salir sin guardar
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function handleBeforeUnload(e) {
  if (store.isDirty) {
    e.preventDefault()
    e.returnValue = ''
  }
}

function addQuestion(typeId) {
  store.addQuestion(typeId)
}

function moveUp(index) {
  if (index > 0) {
    store.moveQuestion(index, index - 1)
  }
}

function moveDown(index) {
  if (index < store.questions.length - 1) {
    store.moveQuestion(index, index + 1)
  }
}

function handleSettingsSave(newSettings) {
  store.form.settings = { ...store.form.settings, ...newSettings }
  store.isDirty = true
  showSettings.value = false
  showToast('Configuración actualizada', 'success')
}

async function handleSave() {
  if (!canSave.value) {
    showToast('Completa el título y agrega al menos una pregunta', 'error')
    return
  }

  // Validar que todas las preguntas tengan texto
  const emptyQuestion = store.questions.find(q => !q.question_text.trim())
  if (emptyQuestion) {
    showToast('Todas las preguntas deben tener texto', 'error')
    return
  }

  try {
    const result = await store.saveForm()
    showToast('Formulario guardado exitosamente', 'success')
    
    setTimeout(() => {
      router.push(`/admin/forms/${result.uuid}`)
    }, 1500)
  } catch (error) {
    showToast(error.message || 'Error al guardar el formulario', 'error')
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

function getTypeIcon(code) {
  const icons = {
    TEXT: 'IconText',
    TEXTAREA: 'IconTextarea',
    SELECT: 'IconSelect',
    RADIO: 'IconRadio',
    CHECKBOX: 'IconCheckbox',
    NUMBER: 'IconNumber',
    EMAIL: 'IconEmail',
    DATE: 'IconDate',
    TIME: 'IconTime',
    DATETIME: 'IconDatetime',
    FILE: 'IconFile',
    RATING: 'IconRating',
    SCALE: 'IconScale'
  }
  return icons[code] || 'IconText'
}
</script>

<style scoped>
.form-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}

.form-type-selector {
  display: flex;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
}

.form-type-selector .type-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.form-type-selector .type-btn.active {
  background: #ffffff;
  color: #001845;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-type-selector .type-btn:hover:not(.active) {
  color: #374151;
}

.course-selector {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  background: #ffffff;
  min-width: 200px;
}

/* Header */
.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.15s ease;
}

.btn-back:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.title-input {
  flex: 1;
  min-width: 0;
  border: none;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  background: transparent;
  padding: 8px 0;
}

.title-input:focus {
  outline: none;
}

.title-input::placeholder {
  color: #9ca3af;
}

.header-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.header-badge.survey {
  background: #e0e7ff;
  color: #4338ca;
}

.header-badge.exam {
  background: #fef3c7;
  color: #d97706;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary,
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #001845;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #002866;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Content */
.builder-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.builder-sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section {
  padding: 20px;
}

.sidebar-section h3 {
  margin: 0 0 16px 0;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-types-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.type-btn .type-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.type-btn span {
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.2;
}

/* Canvas */
.builder-canvas {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: #9ca3af;
}

.empty-canvas svg {
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-canvas h3 {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #4b5563;
}

.empty-canvas p {
  margin: 0;
  font-size: 14px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}

/* List Transition */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.toast.success {
  background: #059669;
}

.toast.error {
  background: #dc2626;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Spin animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .builder-sidebar {
    width: 220px;
  }
  
  .question-types-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .builder-header {
    flex-wrap: wrap;
    padding: 12px 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .builder-content {
    flex-direction: column;
  }
  
  .builder-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 200px;
  }
  
  .question-types-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .builder-canvas {
    padding: 16px;
  }
}
</style>