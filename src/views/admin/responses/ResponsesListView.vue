<template>
  <div class="responses-view">
    <div class="page-header">
      <div class="header-content">
        <h1>Respuestas</h1>
        <p>Gestión de todas las respuestas recibidas</p>
      </div>
      <div class="header-actions">
        <button class="btn-export">
          <i class="bi bi-download"></i>
          Exportar
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group">
        <label>Buscar</label>
        <input 
          v-model="filters.search" 
          type="search" 
          placeholder="Buscar por formulario o respuesta..."
        >
      </div>
      
      <div class="filter-group">
        <label>Formulario</label>
        <select v-model="filters.formId">
          <option value="">Todos los formularios</option>
          <option 
            v-for="form in forms" 
            :key="form.id" 
            :value="form.id"
          >
            {{ form.title }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Fecha</label>
        <select v-model="filters.dateRange">
          <option value="">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="year">Último año</option>
        </select>
      </div>
    </div>

    <!-- Content -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Cargando respuestas...</p>
    </div>

    <div v-else-if="responses.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9 11V6a3 3 0 1 1 6 0v4m-8 0h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zm5 5v2" />
      </svg>
      <h2>No hay respuestas aún</h2>
      <p>Las respuestas a tus formularios aparecerán aquí</p>
    </div>

    <div v-else class="responses-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Formulario</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="response in filteredResponses" :key="response.id">
            <td>{{ response.id }}</td>
            <td>{{ response.form_title }}</td>
            <td>{{ formatDate(response.created_at) }}</td>
            <td>
              <span class="status-badge" :class="response.status">
                {{ response.status === 'completed' ? 'Completada' : 'Pendiente' }}
              </span>
            </td>
            <td>
              <router-link 
                :to="`/admin/forms/${response.form_id}/responses#${response.id}`"
                class="btn-link"
              >
                Ver detalle
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(false)
const responses = ref([])
const forms = ref([])

const filters = ref({
  search: '',
  formId: '',
  dateRange: ''
})

const filteredResponses = computed(() => {
  let result = responses.value
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(r => 
      r.form_title.toLowerCase().includes(search) ||
      r.id.toString().includes(search)
    )
  }
  
  if (filters.value.formId) {
    result = result.filter(r => r.form_id === filters.value.formId)
  }
  
  return result
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Cargar datos
  loading.value = true
  setTimeout(() => {
    loading.value = false
    // Simular datos para desarrollo
    responses.value = []
    forms.value = []
  }, 1000)
})
</script>

<style scoped>
.responses-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-content h1 {
  margin: 0 0 4px 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.header-content p {
  margin: 0;
  color: #6b7280;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #001845;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-export:hover {
  background: #002d6e;
}

/* Filters */
.filters-bar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.filter-group input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #001845;
  box-shadow: 0 0 0 3px rgba(0, 24, 69, 0.1);
}

/* States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #001845;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  color: #e5e7eb;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #111827;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

/* Table */
.responses-table {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #f9fafb;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.btn-link {
  color: #001845;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.15s ease;
}

.btn-link:hover {
  color: #002d6e;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .filters-bar {
    grid-template-columns: 1fr;
  }
  
  .responses-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 600px;
  }
}
</style>