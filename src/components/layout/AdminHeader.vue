<template>
  <header class="admin-header">
    <!-- Left Section -->
    <div class="header-left">
      <!-- Mobile Menu Toggle -->
      <button class="icon-btn mobile-only" @click="$emit('toggleMobile')" title="Menú">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <!-- Search Bar -->
      <div class="search-wrapper" :class="{ 'is-focused': searchFocused }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          placeholder="Buscar formularios..." 
          v-model="searchQuery"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @keyup.enter="handleSearch"
        />
        <kbd class="shortcut">⌘K</kbd>
      </div>
    </div>

    <!-- Right Section -->
    <div class="header-right">

      <!-- Notifications -->
      <div class="dropdown" ref="notifDropdown">
        <button 
          class="icon-btn" 
          :class="{ 'has-indicator': unreadCount > 0 }"
          @click="toggleNotifications"
          title="Notificaciones"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="unreadCount > 0" class="indicator">{{ unreadCount }}</span>
        </button>

        <transition name="dropdown-fade">
          <div v-if="showNotifications" class="dropdown-panel notifications-panel">
            <!-- Header -->
            <div class="panel-header">
              <h3>Notificaciones</h3>
              <button 
                v-if="unreadCount > 0" 
                class="text-btn"
                @click="markAllRead"
              >
                Marcar leídas
              </button>
            </div>

            <!-- Body -->
            <div class="panel-body">
              <div v-if="notifications.length === 0" class="empty-state">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <p>Sin notificaciones</p>
              </div>

              <div 
                v-for="notif in notifications" 
                :key="notif.id" 
                class="notif-item"
                :class="{ 'is-unread': !notif.read }"
              >
                <div class="notif-indicator" :class="notif.type"></div>
                <div class="notif-body">
                  <p class="notif-message">{{ notif.message }}</p>
                  <span class="notif-time">{{ notif.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- User Menu -->
      <div class="dropdown" ref="userDropdown">
        <button class="user-trigger" @click="toggleUserMenu">
          <div class="user-avatar">{{ userInitials }}</div>
          <span class="user-name desktop-only">{{ userName }}</span>
          <svg class="chevron desktop-only" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <transition name="dropdown-fade">
          <div v-if="showUserMenu" class="dropdown-panel user-panel">
            <!-- User Info -->
            <div class="panel-user-info">
              <div class="user-avatar large">{{ userInitials }}</div>
              <div class="user-details">
                <p class="user-fullname">{{ userName }}</p>
                <p class="user-role">{{ userRoleLabel }}</p>
              </div>
            </div>

            <div class="panel-divider"></div>

            <!-- Menu Items -->
            <div class="panel-menu">
              <router-link to="/admin/profile" class="menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Mi Perfil</span>
              </router-link>

              <router-link to="/admin/settings" class="menu-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                </svg>
                <span>Configuración</span>
              </router-link>
            </div>

            <div class="panel-divider"></div>

            <!-- Logout -->
            <div class="panel-menu">
              <button class="menu-item danger" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineEmits(['toggleMobile'])

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const searchFocused = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const notifDropdown = ref(null)
const userDropdown = ref(null)

// Mock notifications
const notifications = ref([
  { id: 1, type: 'success', message: 'Nuevo formulario creado exitosamente', time: 'Hace 5 min', read: false },
  { id: 2, type: 'info', message: '15 nuevas respuestas recibidas', time: 'Hace 1 hora', read: false },
  { id: 3, type: 'warning', message: 'Formulario "Encuesta Q4" expira mañana', time: 'Hace 2 horas', read: true }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const userName = computed(() => authStore.fullName)

const userInitials = computed(() => authStore.initials)

const userRoleLabel = computed(() => {
  const roles = {
    'SUPER_ADMIN': 'Super Administrador',
    'ADMIN': 'Administrador',
    'INSTRUCTOR': 'Instructor',
    'USER': 'Usuario'
  }
  // Tu backend envía role como objeto { code, name }
  return roles[authStore.user?.role?.code] || authStore.user?.role?.name || 'Usuario'
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/admin/search', query: { q: searchQuery.value } })
  }
}

async function handleLogout() {
  authStore.clearAuth()
  router.push('/admin/login')
}

// Close dropdowns on outside click
function handleClickOutside(e) {
  if (notifDropdown.value && !notifDropdown.value.contains(e.target)) {
    showNotifications.value = false
  }
  if (userDropdown.value && !userDropdown.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ═══════════════════════════════════════
   HEADER BASE
═══════════════════════════════════════ */
.admin-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  gap: 20px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ═══════════════════════════════════════
   SEARCH BAR
═══════════════════════════════════════ */
.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 36px;
  min-width: 280px;
  background: #fafafa;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-wrapper svg {
  color: #9ca3af;
  flex-shrink: 0;
  transition: color 0.2s;
}

.search-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1f2937;
  font-family: inherit;
}

.search-wrapper input::placeholder {
  color: #9ca3af;
}

.search-wrapper .shortcut {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  font-family: inherit;
  line-height: 1;
}

.search-wrapper.is-focused {
  background: #ffffff;
  border-color: #001845;
  box-shadow: 0 0 0 3px rgba(0, 24, 69, 0.08);
}

.search-wrapper.is-focused svg {
  color: #001845;
}

.search-wrapper.is-focused .shortcut {
  opacity: 0;
  pointer-events: none;
}

/* ═══════════════════════════════════════
   BUTTONS
═══════════════════════════════════════ */
.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #f9fafb;
  color: #1f2937;
}

.icon-btn:active {
  transform: scale(0.96);
}

.icon-btn.has-indicator .indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #001845;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 999px;
  border: 2px solid #ffffff;
}

/* Create Button */
.btn-create {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 36px;
  background: #001845;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-create:hover {
  background: #002866;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 24, 69, 0.2);
}

.btn-create:active {
  transform: translateY(0);
}

/* ═══════════════════════════════════════
   USER TRIGGER
═══════════════════════════════════════ */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.user-trigger:hover {
  background: #f9fafb;
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001845 0%, #003d82 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.chevron {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

/* ═══════════════════════════════════════
   DROPDOWNS
═══════════════════════════════════════ */
.dropdown {
  position: relative;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  z-index: 200;
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.panel-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 500;
  color: #001845;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}

.text-btn:hover {
  opacity: 0.7;
}

/* Panel Body */
.panel-body {
  max-height: 360px;
  overflow-y: auto;
}

.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: transparent;
}

.panel-body::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state svg {
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}

/* ═══════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════ */
.notifications-panel {
  width: 380px;
}

.notif-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s ease;
  cursor: pointer;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item:hover {
  background: #f9fafb;
}

.notif-item.is-unread {
  background: #f0f9ff;
}

.notif-item.is-unread:hover {
  background: #e0f2fe;
}

.notif-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.notif-indicator.success { background: #10b981; }
.notif-indicator.info { background: #3b82f6; }
.notif-indicator.warning { background: #f59e0b; }
.notif-indicator.error { background: #ef4444; }

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-message {
  margin: 0 0 4px 0;
  font-size: 13px;
  line-height: 1.5;
  color: #1f2937;
}

.notif-time {
  font-size: 11px;
  color: #9ca3af;
}

/* ═══════════════════════════════════════
   USER MENU
═══════════════════════════════════════ */
.user-panel {
  width: 240px;
}

.panel-user-info {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-fullname {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.panel-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 0;
}

.panel-menu {
  padding: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item svg {
  color: #6b7280;
  flex-shrink: 0;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger svg {
  color: #dc2626;
}

/* ═══════════════════════════════════════
   TRANSITIONS
═══════════════════════════════════════ */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* ═══════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════ */
.mobile-only {
  display: none;
}

.desktop-only {
  display: inline-flex;
}

@media (max-width: 768px) {
  .mobile-only {
    display: inline-flex;
  }

  .desktop-only {
    display: none;
  }

  .search-wrapper {
    display: none;
  }

  .admin-header {
    padding: 0 16px;
  }

  .btn-create span {
    display: none;
  }

  .btn-create {
    width: 36px;
    padding: 0;
  }

  .notifications-panel {
    width: calc(100vw - 32px);
    right: -8px;
  }

  .user-panel {
    right: -8px;
  }
}

@media (max-width: 480px) {
  .header-right {
    gap: 4px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
  }

  .btn-create {
    width: 32px;
    height: 32px;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>