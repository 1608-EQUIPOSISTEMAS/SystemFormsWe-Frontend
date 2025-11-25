<!-- src/views/admin/forms/FormResponsesView.vue -->
<template>
  <div class="responses-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando respuestas...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <router-link :to="`/admin/forms/${formId}`" class="back-link">
            <i class="bi bi-arrow-left"></i>
            Volver al formulario
          </router-link>
          <h1>Respuestas: {{ form?.title }}</h1>
        </div>
        
        <button @click="exportResponses" class="btn-primary">
          <i class="bi bi-download"></i>
          Exportar
        </button>
      </div>

      <!-- Stats Summary -->
      <div class="stats-summary">
        <div class="stat">
          <span class="stat-label">Total respuestas</span>
          <span class="stat-value">{{ responses.length }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Tasa de finalización</span>
          <span class="stat-value">{{ completionRate }}%</span>
        </div>
        <div class="stat" v-if="form?.form_type === 'EXAM'">
          <span class="stat-label">Puntuación promedio</span>
          <span class="stat-value">{{ avgScore }}%</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input 
          type="text"
          v-model="filters.search"
          placeholder="Buscar por email o nombre..."
          class="search-input"
        >
        
        <select v-model="filters.status" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="SUBMITTED">Completados</option>
          <option value="IN_PROGRESS">En progreso</option>
        </select>
        
        <input 
          type="date"
          v-model="filters.dateFrom"
          class="date-input"
          placeholder="Desde"
        >
        
        <input 
          type="date"
          v-model="filters.dateTo"
          class="date-input"
          placeholder="Hasta"
        >
      </div>

      <!-- Responses Table -->
      <div class="table-container">
        <table class="responses-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Respondiente</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th v-if="form?.form_type === 'EXAM'">Puntuación</th>
              <th>Tiempo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="response in filteredResponses" :key="response.id">
              <td>{{ response.id }}</td>
              <td>
                <div class="respondent-info">
                  <p class="name">{{ response.respondent_name || 'Anónimo' }}</p>
                  <p class="email">{{ response.respondent_email || '-' }}</p>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="response.status.toLowerCase()">
                  {{ getStatusLabel(response.status) }}
                </span>
              </td>
              <td>{{ formatDate(response.submitted_at || response.started_at) }}</td>
              <td v-if="form?.form_type === 'EXAM'">
                <span v-if="response.percentage_score !== null">
                  {{ response.percentage_score }}%
                  <i v-if="response.passed" class="bi bi-check-circle text-success"></i>
                  <i v-else class="bi bi-x-circle text-danger"></i>
                </span>
                <span v-else>-</span>
              </td>
              <td>{{ formatDuration(response.duration_minutes) }}</td>
              <td>
                <button 
                  @click="viewResponse(response)"
                  class="btn-action"
                  title="Ver respuesta"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button 
                  @click="deleteResponse(response)"
                  class="btn-action text-danger"
                  title="Eliminar"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredResponses.length === 0" class="empty-state">
          <p>No se encontraron respuestas</p>
        </div>
      </div>
    </div>

    <!-- Response Detail Modal -->
    <BaseModal 
      v-model="showDetailModal" 
      :title="`Respuesta #${selectedResponse?.id}`"
      size="lg"
    >
      <div v-if="selectedResponse" class="response-detail">
        <div class="detail-header">
          <div class="detail-info">
            <p><strong>Respondiente:</strong> {{ selectedResponse.respondent_name || 'Anónimo' }}</p>
            <p><strong>Email:</strong> {{ selectedResponse.respondent_email || '-' }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(selectedResponse.submitted_at) }}</p>
          </div>
          <div v-if="form?.form_type === 'EXAM'" class="detail-score">
            <p class="score-label">Puntuación</p>
            <p class="score-value">{{ selectedResponse.percentage_score }}%</p>
          </div>
        </div>

        <div class="answers-list">
          <div v-for="answer in selectedResponse.answers" :key="answer.id" class="answer-item">
            <p class="question">{{ answer.question_text }}</p>
            <p class="answer">{{ formatAnswer(answer) }}</p>
            <div v-if="form?.form_type === 'EXAM'" class="answer-meta">
              <span v-if="answer.is_correct !== null" :class="answer.is_correct ? 'correct' : 'incorrect'">
                {{ answer.is_correct ? '✓ Correcto' : '✗ Incorrecto' }}
              </span>
              <span v-if="answer.points_earned !== null">
                {{ answer.points_earned }} / {{ answer.max_points }} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import formService from '@/services/form.service'
import responseService from '@/services/response.service'
import BaseModal from '@/components/common/BaseModal.vue'

const route = useRoute()
const formId = ref(route.params.id)

const form = ref(null)
const responses = ref([])
const loading = ref(true)
const showDetailModal = ref(false)
const selectedResponse = ref(null)

const filters = ref({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

const filteredResponses = computed(() => {
  let result = responses.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(r => 
      r.respondent_name?.toLowerCase().includes(search) ||
      r.respondent_email?.toLowerCase().includes(search)
    )
  }

  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status)
  }

  if (filters.value.dateFrom) {
    result = result.filter(r => new Date(r.started_at) >= new Date(filters.value.dateFrom))
  }

  if (filters.value.dateTo) {
    result = result.filter(r => new Date(r.started_at) <= new Date(filters.value.dateTo))
  }

  return result
})

const completionRate = computed(() => {
  if (responses.value.length === 0) return 0
  const completed = responses.value.filter(r => r.status === 'SUBMITTED').length
  return Math.round((completed / responses.value.length) * 100)
})

const avgScore = computed(() => {
  const scores = responses.value
    .filter(r => r.percentage_score !== null)
    .map(r => r.percentage_score)
  
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
})

async function loadData() {
  try {
    loading.value = true
    
    // Cargar formulario
    const formResponse = await formService.get(formId.value)
    form.value = formResponse.data
    
    // Cargar respuestas
    const responsesResponse = await formService.getResponses(formId.value)
    responses.value = responsesResponse.data.responses || []
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

async function viewResponse(response) {
  try {
    const { data } = await responseService.get(response.id)
    selectedResponse.value = data
    showDetailModal.value = true
  } catch (error) {
    console.error('Error:', error)
  }
}

async function deleteResponse(response) {
  if (!confirm('¿Estás seguro de eliminar esta respuesta?')) return
  
  try {
    await responseService.delete(response.id)
    responses.value = responses.value.filter(r => r.id !== response.id)
  } catch (error) {
    console.error('Error:', error)
  }
}

async function exportResponses() {
  try {
    const { data } = await formService.exportResponses(formId.value, {
      format: 'excel'
    })
    
    // Descargar archivo
    const blob = new Blob([data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `respuestas-${form.value.title}.xlsx`
    a.click()
  } catch (error) {
    console.error('Error:', error)
  }
}

function getStatusLabel(status) {
  const labels = {
    'SUBMITTED': 'Completado',
    'IN_PROGRESS': 'En progreso',
    'GRADED': 'Calificado'
  }
  return labels[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDuration(minutes) {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}min`
}

function formatAnswer(answer) {
  if (answer.answer_text) return answer.answer_text
  if (answer.answer_number !== null) return String(answer.answer_number)
  if (answer.answer_date) return formatDate(answer.answer_date)
  if (answer.selected_options) return answer.selected_options.join(', ')
  return '-'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Estilos similares a los anteriores con ajustes para la tabla de respuestas */
.responses-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ... resto de estilos ... */
</style>