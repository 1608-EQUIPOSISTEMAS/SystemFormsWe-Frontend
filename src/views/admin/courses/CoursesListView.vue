<template>
  <div class="courses-list-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Cursos</h1>
        <p class="subtitle">Gestión de cursos del sistema</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Curso
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Buscar por código o nombre..." @input="debouncedSearch">
      </div>
      <select v-model="statusFilter" class="filter-select" @change="loadCourses">
        <option value="">Todos los estados</option>
        <option value="1">Activos</option>
        <option value="0">Inactivos</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando cursos...</p>
      </div>

      <div v-else-if="courses.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <h3>No hay cursos</h3>
        <p>Crea el primer curso para comenzar</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Instructor</th>
            <th>Fechas</th>
            <th>Exámenes</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courses" :key="course.id">
            <td><span class="code-badge">{{ course.code }}</span></td>
            <td>
              <div class="course-name">{{ course.name }}</div>
              <div v-if="course.description" class="course-desc">{{ truncate(course.description, 50) }}</div>
            </td>
            <td>{{ course.instructor_name || '-' }}</td>
            <td>
              <div v-if="course.start_date || course.end_date" class="date-range">
                <span>{{ formatDate(course.start_date) }}</span>
                <span v-if="course.end_date"> - {{ formatDate(course.end_date) }}</span>
              </div>
              <span v-else class="text-muted">Sin definir</span>
            </td>
            <td><span class="count-badge">{{ course.exams_count || 0 }}</span></td>
            <td>
              <span class="status-badge" :class="course.is_active ? 'active' : 'inactive'">
                {{ course.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="icon-btn" title="Ver exámenes" @click="viewExams(course)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </button>
              <button class="icon-btn" title="Editar" @click="editCourse(course)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="icon-btn" :class="{ 'text-danger': course.is_active }" :title="course.is_active ? 'Desactivar' : 'Activar'" @click="toggleStatus(course)">
                <svg v-if="course.is_active" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </button>
              <button class="icon-btn text-danger" title="Eliminar" @click="confirmDelete(course)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Anterior</button>
      <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Siguiente</button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Editar Curso' : 'Nuevo Curso' }}</h2>
          <button class="close-btn" @click="closeModals">&times;</button>
        </div>
        <form @submit.prevent="saveCourse" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Código *</label>
              <input v-model="form.code" type="text" required placeholder="CURSO-001" :disabled="showEditModal">
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select v-model="form.is_active">
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Nombre del Curso *</label>
            <input v-model="form.name" type="text" required placeholder="Nombre del curso">
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.description" rows="3" placeholder="Descripción del curso"></textarea>
          </div>
          <div class="form-group">
            <label>Instructor</label>
            <input v-model="form.instructor_name" type="text" placeholder="Nombre del instructor">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Inicio</label>
              <input v-model="form.start_date" type="date">
            </div>
            <div class="form-group">
              <label>Fecha de Fin</label>
              <input v-model="form.end_date" type="date">
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModals">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Guardando...' : (showEditModal ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Eliminar Curso</h2>
          <button class="close-btn" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar el curso <strong>{{ courseToDelete?.name }}</strong>?</p>
          <p class="text-muted">Se eliminarán también todos los exámenes asociados.</p>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn-danger" @click="deleteCourse" :disabled="deleting">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const courses = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const courseToDelete = ref(null)
const editingCourse = ref(null)

const form = ref({
  code: '',
  name: '',
  description: '',
  instructor_name: '',
  start_date: '',
  end_date: '',
  is_active: true
})

let searchTimeout = null

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadCourses()
  }, 300)
}

async function loadCourses() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: perPage,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(statusFilter.value && { is_active: statusFilter.value })
    })
    const res = await api.get(`/courses?${params}`)
    if (res.data.ok) {
      courses.value = res.data.data.courses
      totalPages.value = res.data.data.totalPages || 1
    }
  } catch (e) {
    console.error('Error loading courses:', e)
  } finally {
    loading.value = false
  }
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function editCourse(course) {
  editingCourse.value = course
  form.value = {
    code: course.code,
    name: course.name,
    description: course.description || '',
    instructor_name: course.instructor_name || '',
    start_date: course.start_date ? course.start_date.split('T')[0] : '',
    end_date: course.end_date ? course.end_date.split('T')[0] : '',
    is_active: course.is_active
  }
  showEditModal.value = true
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  editingCourse.value = null
  form.value = { code: '', name: '', description: '', instructor_name: '', start_date: '', end_date: '', is_active: true }
}

async function saveCourse() {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.start_date) delete payload.start_date
    if (!payload.end_date) delete payload.end_date

    if (showEditModal.value && editingCourse.value) {
      delete payload.code
      await api.put(`/courses/${editingCourse.value.id}`, payload)
    } else {
      await api.post('/courses', payload)
    }
    closeModals()
    loadCourses()
  } catch (e) {
    console.error('Error saving course:', e)
    alert(e.response?.data?.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(course) {
  try {
    await api.put(`/courses/${course.id}`, { is_active: !course.is_active })
    course.is_active = !course.is_active
  } catch (e) {
    console.error('Error toggling status:', e)
  }
}

function viewExams(course) {
  router.push({ name: 'AdminTests', query: { course_id: course.id } })
}

function confirmDelete(course) {
  courseToDelete.value = course
  showDeleteModal.value = true
}

async function deleteCourse() {
  if (!courseToDelete.value) return
  deleting.value = true
  try {
    await api.delete(`/courses/${courseToDelete.value.id}`)
    courses.value = courses.value.filter(c => c.id !== courseToDelete.value.id)
    showDeleteModal.value = false
    courseToDelete.value = null
  } catch (e) {
    console.error('Error deleting course:', e)
  } finally {
    deleting.value = false
  }
}

function goToPage(page) {
  currentPage.value = page
  loadCourses()
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.courses-list-view { padding: 24px; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h1 { font-size: 24px; font-weight: 600; color: #1a1a2e; margin: 0; }
.page-header .subtitle { color: #64748b; margin: 4px 0 0; font-size: 14px; }

.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
.btn-secondary:hover { background: #e2e8f0; }
.btn-danger { padding: 10px 20px; background: #ef4444; color: #fff; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
.btn-danger:hover { background: #dc2626; }

.filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.search-box { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; flex: 1; min-width: 200px; }
.search-box svg { color: #94a3b8; flex-shrink: 0; }
.search-box input { border: none; outline: none; width: 100%; font-size: 14px; }
.filter-select { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 14px; cursor: pointer; }

.table-container { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }

.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #64748b; }
.spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state h3 { margin: 16px 0 8px; color: #1a1a2e; }
.empty-state p { margin: 0; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 14px 16px; background: #f8fafc; font-weight: 600; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; }
.data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.data-table tr:hover { background: #fafbfc; }

.code-badge { display: inline-block; padding: 4px 10px; background: #f1f5f9; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: 500; color: #475569; }
.course-name { font-weight: 500; color: #1a1a2e; }
.course-desc { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.date-range { font-size: 13px; }
.text-muted { color: #94a3b8; font-size: 13px; }
.count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; background: #dbeafe; color: #2563eb; border-radius: 6px; font-size: 13px; font-weight: 600; }

.status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-badge.active { background: #d1fae5; color: #059669; }
.status-badge.inactive { background: #fee2e2; color: #dc2626; }

.actions-cell { display: flex; gap: 4px; }
.icon-btn { padding: 8px; background: transparent; border: none; border-radius: 6px; cursor: pointer; color: #64748b; transition: all 0.2s; }
.icon-btn:hover { background: #f1f5f9; color: #1a1a2e; }
.icon-btn.text-danger:hover { background: #fee2e2; color: #dc2626; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.page-btn { padding: 8px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 14px; }
.page-btn:hover:not(:disabled) { background: #f1f5f9; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { font-size: 14px; color: #64748b; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow: auto; }
.modal.modal-sm { max-width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
.modal-header h2 { font-size: 18px; font-weight: 600; margin: 0; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; line-height: 1; }
.close-btn:hover { color: #1a1a2e; }
.modal-body { padding: 24px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e2e8f0; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-group input:disabled { background: #f8fafc; cursor: not-allowed; }
.form-group textarea { resize: vertical; min-height: 80px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
</style>