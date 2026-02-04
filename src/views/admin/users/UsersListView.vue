<template>
  <div class="users-list-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Usuarios</h1>
        <p class="subtitle">Gestión de usuarios del sistema</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo Usuario
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o email..." @input="debouncedSearch">
      </div>
      <select v-model="roleFilter" class="filter-select" @change="loadUsers">
        <option value="">Todos los roles</option>
        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
      </select>
      <select v-model="statusFilter" class="filter-select" @change="loadUsers">
        <option value="">Todos los estados</option>
        <option value="1">Activos</option>
        <option value="0">Inactivos</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3>No hay usuarios</h3>
        <p>Crea el primer usuario para comenzar</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Último acceso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="user-cell">
              <div class="user-avatar">{{ getInitials(user) }}</div>
              <span class="user-name">{{ user.first_name }} {{ user.last_name }}</span>
            </td>
            <td>{{ user.email }}</td>
            <td><span class="role-badge" :class="user.role?.code?.toLowerCase()">{{ user.role?.name || 'Usuario' }}</span></td>
            <td><span class="status-badge" :class="user.is_active ? 'active' : 'inactive'">{{ user.is_active ? 'Activo' : 'Inactivo' }}</span></td>
            <td>{{ formatDate(user.last_login_at) }}</td>
            <td class="actions-cell">
              <button class="icon-btn" title="Editar" @click="editUser(user)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="icon-btn" :class="{ 'text-danger': user.is_active }" :title="user.is_active ? 'Desactivar' : 'Activar'" @click="toggleStatus(user)">
                <svg v-if="user.is_active" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </button>
              <button class="icon-btn text-danger" title="Eliminar" @click="confirmDelete(user)" :disabled="user.role?.code === 'SUPER_ADMIN'">
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
          <h2>{{ showEditModal ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
          <button class="close-btn" @click="closeModals">&times;</button>
        </div>
        <form @submit.prevent="saveUser" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="form.first_name" type="text" required>
            </div>
            <div class="form-group">
              <label>Apellido *</label>
              <input v-model="form.last_name" type="text" required>
            </div>
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input v-model="form.email" type="email" required :disabled="showEditModal">
          </div>
          <div class="form-group" v-if="!showEditModal">
            <label>Contraseña *</label>
            <input v-model="form.password" type="password" required minlength="6">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="form.phone" type="tel">
            </div>
            <div class="form-group">
              <label>Rol *</label>
              <select v-model="form.role_id" required>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group checkbox-group">
            <label><input v-model="form.is_active" type="checkbox"> Usuario activo</label>
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
          <h2>Eliminar Usuario</h2>
          <button class="close-btn" @click="showDeleteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar a <strong>{{ userToDelete?.first_name }} {{ userToDelete?.last_name }}</strong>?</p>
          <p class="text-muted">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn-danger" @click="deleteUser" :disabled="deleting">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const users = ref([])
const roles = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const editingUser = ref(null)

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  role_id: 4,
  is_active: true
})

let searchTimeout = null

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 300)
}

async function loadUsers() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: perPage,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(roleFilter.value && { role_id: roleFilter.value }),
      ...(statusFilter.value && { is_active: statusFilter.value })
    })
    const res = await api.get(`/users?${params}`)
    if (res.data.ok) {
      users.value = res.data.data.users
      totalPages.value = res.data.data.totalPages || 1
    }
  } catch (e) {
    console.error('Error loading users:', e)
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  try {
    const res = await api.get('/users/roles')
    if (res.data.ok) roles.value = res.data.data.roles
  } catch (e) {
    console.error('Error loading roles:', e)
  }
}

function getInitials(user) {
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

function formatDate(date) {
  if (!date) return 'Nunca'
  return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function editUser(user) {
  editingUser.value = user
  form.value = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    password: '',
    phone: user.phone || '',
    role_id: user.role_id,
    is_active: user.is_active
  }
  showEditModal.value = true
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null
  form.value = { first_name: '', last_name: '', email: '', password: '', phone: '', role_id: 4, is_active: true }
}

async function saveUser() {
  saving.value = true
  try {
    if (showEditModal.value && editingUser.value) {
      const payload = { ...form.value }
      delete payload.password
      delete payload.email
      await api.put(`/users/${editingUser.value.id}`, payload)
    } else {
      await api.post('/users', form.value)
    }
    closeModals()
    loadUsers()
  } catch (e) {
    console.error('Error saving user:', e)
    alert(e.response?.data?.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

async function toggleStatus(user) {
  try {
    await api.put(`/users/${user.id}`, { is_active: !user.is_active })
    user.is_active = !user.is_active
  } catch (e) {
    console.error('Error toggling status:', e)
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    await api.delete(`/users/${userToDelete.value.id}`)
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (e) {
    console.error('Error deleting user:', e)
  } finally {
    deleting.value = false
  }
}

function goToPage(page) {
  currentPage.value = page
  loadUsers()
}

onMounted(() => {
  loadRoles()
  loadUsers()
})
</script>

<style scoped>
.users-list-view { padding: 24px; }

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

.user-cell { display: flex; align-items: center; gap: 12px; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
.user-name { font-weight: 500; }

.role-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.role-badge.super_admin { background: #fef3c7; color: #d97706; }
.role-badge.admin { background: #dbeafe; color: #2563eb; }
.role-badge.instructor { background: #d1fae5; color: #059669; }
.role-badge.user { background: #f1f5f9; color: #64748b; }

.status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-badge.active { background: #d1fae5; color: #059669; }
.status-badge.inactive { background: #fee2e2; color: #dc2626; }

.actions-cell { display: flex; gap: 4px; }
.icon-btn { padding: 8px; background: transparent; border: none; border-radius: 6px; cursor: pointer; color: #64748b; transition: all 0.2s; }
.icon-btn:hover { background: #f1f5f9; color: #1a1a2e; }
.icon-btn.text-danger:hover { background: #fee2e2; color: #dc2626; }
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

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
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.form-group input:disabled { background: #f8fafc; cursor: not-allowed; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.checkbox-group label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.checkbox-group input[type="checkbox"] { width: auto; }
.text-muted { color: #64748b; font-size: 14px; margin-top: 8px; }
</style>