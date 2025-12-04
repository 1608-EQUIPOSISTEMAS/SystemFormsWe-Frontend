<template>
  <div class="forms-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <h1>Formularios</h1>
        <p class="subtitle">Gestiona tus formularios y encuestas</p>
      </div>
      <router-link to="/admin/forms/create" class="btn-primary">
        <i class="bi bi-plus-lg"></i>
        Crear formulario
      </router-link>
    </header>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input 
          type="text" 
          v-model="filters.search"
          @input="debouncedSearch"
          placeholder="Buscar formularios..."
        >
      </div>
      
      <div class="filter-chips">
        <button 
          class="chip"
          :class="{ active: filters.type === 'all' }"
          @click="filters.type = 'all'"
        >
          Todos
        </button>
        <button 
          class="chip"
          :class="{ active: filters.type === 'SURVEY' }"
          @click="filters.type = 'SURVEY'"
        >
          <i class="bi bi-clipboard-check"></i>
          Encuestas
        </button>
        <button 
          class="chip"
          :class="{ active: filters.type === 'EXAM' }"
          @click="filters.type = 'EXAM'"
        >
          <i class="bi bi-file-earmark-text"></i>
          Exámenes
        </button>
      </div>

      <button 
        class="btn-refresh" 
        @click="loadForms"
        :disabled="loading"
      >
        <i class="bi bi-arrow-clockwise" :class="{ spinning: loading }"></i>
      </button>
    </div>

    <!-- Forms Grid -->
    <div v-if="loading && !forms.length" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando formularios...</p>
    </div>

    <div v-else-if="!loading && !forms.length" class="empty-state">
      <i class="bi bi-folder2-open"></i>
      <h3>No hay formularios</h3>
      <p>Crea tu primer formulario para empezar</p>
      <router-link to="/admin/forms/create" class="btn-primary">
        <i class="bi bi-plus-lg"></i>
        Crear formulario
      </router-link>
    </div>

    <div v-else class="forms-grid">
      <article 
        v-for="form in filteredForms" 
        :key="form.uuid"
        class="form-card"
        :class="{ inactive: !form.is_active }"
      >
        <div class="card-header">
          <div class="form-type" :class="form.form_type.toLowerCase()">
            {{ form.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
          </div>
          <div class="card-menu">
          </div>
        </div>

        <router-link 
          :to="`/admin/forms/${form.uuid}`"
          class="card-body"
        >
          <h3>{{ form.title }}</h3>
          <p v-if="form.description">{{ form.description }}</p>
          
          <div class="form-meta">
            <span>
              <i class="bi bi-calendar3"></i>
              {{ formatDate(form.created_at) }}
            </span>
            <span>
              <i class="bi bi-clipboard-check"></i>
              {{ form.question_count  || 0 }} preguntas
            </span>
            <span>
              <i class="bi bi-people"></i>
              {{ form.response_count  || 0 }} respuestas
            </span>
          </div>
        </router-link>

        <div class="card-footer">
          <router-link 
            :to="`/admin/forms/${form.uuid}/responses`"
            class="btn-secondary"
          >
            <i class="bi bi-bar-chart"></i>
            Ver respuestas
          </router-link>
          <button 
            class="btn-toggle"
            @click="toggleActive(form)"
          >
            <i :class="form.is_active ? 'bi bi-pause' : 'bi bi-play'"></i>
            {{ form.is_active ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </article>
    </div>

    <!-- Delete Modal -->
    <BaseModal 
      v-model="showDeleteModal"
      title="Eliminar formulario"
    >
      <p>¿Estás seguro de eliminar el formulario <strong>{{ formToDelete?.title }}</strong>?</p>
      <p class="text-warning">Se eliminarán también todas las respuestas asociadas.</p>
      
      <template #footer>
        <button class="btn-cancel" @click="showDeleteModal = false">
          Cancelar
        </button>
        <button 
          class="btn-danger" 
          @click="confirmDelete"
          :disabled="deleting"
        >
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </template>
    </BaseModal>

    <!-- Share Modal -->
    <BaseModal 
      v-model="showShareModal"
      title="Compartir formulario"
    >
      <div class="share-content">
        <p>Comparte este enlace:</p>
        <div class="share-url">
          <input 
            type="text" 
            :value="shareUrl"
            readonly
            ref="shareInput"
          >
          <button @click="copyUrl" class="btn-copy">
            <i :class="copied ? 'bi bi-check' : 'bi bi-clipboard'"></i>
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash-es'
import formService from '@/services/form.service'
import BaseModal from '@/components/common/BaseModal.vue'

const router = useRouter()

const forms = ref([])
const loading = ref(true)
const openMenu = ref(null)

const filters = ref({
  search: '',
  type: 'all'
})

// Modals
const showDeleteModal = ref(false)
const showShareModal = ref(false)
const formToDelete = ref(null)
const formToShare = ref(null)
const deleting = ref(false)
const shareUrl = ref('')
const shareInput = ref(null)
const copied = ref(false)

const filteredForms = computed(() => {
  let result = forms.value

  // Filtrar por tipo
  if (filters.value.type !== 'all') {
    result = result.filter(f => f.form_type === filters.value.type)
  }

  // Filtrar por búsqueda
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(f => 
      f.title.toLowerCase().includes(search) ||
      f.description?.toLowerCase().includes(search)
    )
  }

  return result
})

// Debounce búsqueda
const debouncedSearch = debounce(() => {
  // Si implementas búsqueda en servidor
}, 300)

// Cargar formularios
async function loadForms() {
  loading.value = true
  try {
    const { data } = await formService.list({
      page: 1,
      limit: 100
    })
    forms.value = data.forms || []
  } catch (error) {
    console.error('Error cargando formularios:', error)
  } finally {
    loading.value = false
  }
}

// Toggle menú - usa uuid como identificador
function toggleMenu(formUuid) {
  openMenu.value = openMenu.value === formUuid ? null : formUuid
}

// Cerrar menú al hacer click fuera
function handleClickOutside() {
  openMenu.value = null
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadForms()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Activar/Desactivar - usa uuid
async function toggleActive(form) {
  try {
    await formService.update(form.uuid, {
      is_active: !form.is_active
    })
    form.is_active = !form.is_active
  } catch (error) {
    console.error('Error:', error)
  }
}

// Duplicar - usa uuid
async function duplicateForm(form) {
  openMenu.value = null
  try {
    await formService.duplicate(form.uuid)
    await loadForms()
  } catch (error) {
    console.error('Error:', error)
  }
}

// Compartir
function shareForm(form) {
  openMenu.value = null
  formToShare.value = form
  shareUrl.value = `${window.location.origin}/form/${form.uuid}`
  showShareModal.value = true
  copied.value = false
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (error) {
    shareInput.value?.select()
    document.execCommand('copy')
    copied.value = true
  }
}

// Eliminar
function deleteForm(form) {
  openMenu.value = null
  formToDelete.value = form
  showDeleteModal.value = true
}

// Confirmar eliminación - usa uuid
async function confirmDelete() {
  if (!formToDelete.value) return
  
  deleting.value = true
  try {
    await formService.delete(formToDelete.value.uuid)
    // Filtra por uuid, no por id
    forms.value = forms.value.filter(f => f.uuid !== formToDelete.value.uuid)
    showDeleteModal.value = false
    formToDelete.value = null
  } catch (error) {
    console.error('Error:', error)
  } finally {
    deleting.value = false
  }
}

// Formatear fecha
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
/* ═══════════════════════════════════════
   PAGE LAYOUT
═══════════════════════════════════════ */
.forms-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-left h1 {
  margin: 0 0 4px 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

/* ═══════════════════════════════════════
   FILTERS BAR
═══════════════════════════════════════ */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: #001845;
}

.filter-chips {
  display: flex;
  gap: 8px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip:hover {
  border-color: #001845;
  color: #001845;
}

.chip.active {
  background: #001845;
  border-color: #001845;
  color: #ffffff;
}

.btn-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
}

.btn-refresh:hover:not(:disabled) {
  border-color: #001845;
  color: #001845;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════
   FORMS GRID
═══════════════════════════════════════ */
.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.form-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-card.inactive {
  opacity: 0.7;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.form-type {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-type.survey {
  background: #e0e7ff;
  color: #4338ca;
}

.form-type.exam {
  background: #fef3c7;
  color: #d97706;
}

.card-menu {
  position: relative;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
}

.menu-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.menu-item.text-danger {
  color: #dc2626;
}

.dropdown-menu hr {
  margin: 4px 0;
  border: none;
  border-top: 1px solid #f3f4f6;
}

.card-body {
  display: block;
  padding: 20px;
  text-decoration: none;
  color: inherit;
}

.card-body h3 {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.card-body p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.form-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.form-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.btn-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.btn-toggle:hover {
  background: #f3f4f6;
}

/* ═══════════════════════════════════════
   EMPTY & LOADING STATES
═══════════════════════════════════════ */
.empty-state,
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state i {
  font-size: 64px;
  color: #e5e7eb;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #001845;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

/* ═══════════════════════════════════════
   MODALS
═══════════════════════════════════════ */
.share-content p {
  margin: 0 0 12px 0;
  color: #6b7280;
}

.share-url {
  display: flex;
  gap: 8px;
}

.share-url input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-family: monospace;
  background: #f9fafb;
}

.btn-copy {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
}

.btn-copy:hover {
  background: #f3f4f6;
}

.text-warning {
  color: #d97706;
  font-size: 13px;
  margin-top: 8px;
}

/* ═══════════════════════════════════════
   BUTTONS
═══════════════════════════════════════ */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-primary {
  background: #001845;
  color: #ffffff;
}

.btn-primary:hover {
  background: #002866;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.btn-danger {
  padding: 8px 16px;
  border: none;
  background: #dc2626;
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════ */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>