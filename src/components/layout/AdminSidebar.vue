<template>
  <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
    <!-- Brand Header -->
    <div class="sidebar-brand">
      <div class="brand-logo">
        <span class="logo-w">W</span>
        <span class="logo-separator">|</span>
        <span class="logo-e">E</span>
      </div>
      <transition name="slide-fade">
        <div v-if="!collapsed" class="brand-info">
          <span class="brand-title">FormBuilder</span>
          <span class="brand-subtitle">Sistema de Gestión</span>
        </div>
      </transition>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- Main Section -->
      <div class="nav-group">
        <transition name="slide-fade">
          <span v-if="!collapsed" class="group-label">Principal</span>
        </transition>
        
        <router-link 
          v-for="item in mainMenu" 
          :key="item.to" 
          :to="item.to" 
          class="nav-link"
          :class="{ 'is-active': isActive(item.to) }"
          :title="collapsed ? item.label : ''"
        >
          <div class="nav-indicator"></div>
          <div class="nav-icon" v-html="item.icon"></div>
          <transition name="slide-fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </router-link>
      </div>

      <!-- Management Section -->
      <div class="nav-group">
        <transition name="slide-fade">
          <span v-if="!collapsed" class="group-label">Gestión</span>
        </transition>
        
        <router-link 
          v-for="item in managementMenu" 
          :key="item.to" 
          :to="item.to" 
          class="nav-link"
          :class="{ 'is-active': isActive(item.to) }"
          :title="collapsed ? item.label : ''"
        >
          <div class="nav-indicator"></div>
          <div class="nav-icon" v-html="item.icon"></div>
          <transition name="slide-fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </router-link>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <button class="collapse-btn" @click="$emit('toggle')" :title="collapsed ? 'Expandir' : 'Colapsar'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline :points="collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"/>
        </svg>
        <transition name="slide-fade">
          <span v-if="!collapsed">Colapsar</span>
        </transition>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  collapsed: { type: Boolean, default: false }
})

defineEmits(['toggle'])

const route = useRoute()

const mainMenu = [
  { 
    to: '/admin/dashboard', 
    label: 'Dashboard',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>`
  },
  { 
    to: '/admin/forms', 
    label: 'Formularios',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`
  },
  { 
    to: '/admin/responses', 
    label: 'Respuestas',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`
  },
  { 
    to: '/admin/templates', 
    label: 'Plantillas',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/>
      <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>`
  }
]

const managementMenu = [
  { 
    to: '/admin/users', 
    label: 'Usuarios',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`
  },
  { 
    to: '/admin/courses', 
    label: 'Cursos',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`
  },
  { 
    to: '/admin/settings', 
    label: 'Configuración',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
    </svg>`
  }
]

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
/* ═══════════════════════════════════════
   SIDEBAR BASE
═══════════════════════════════════════ */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: #fafafa;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  z-index: 90;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.is-collapsed {
  width: 64px;
}

/* ═══════════════════════════════════════
   BRAND HEADER
═══════════════════════════════════════ */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 56px;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-w,
.logo-e {
  font-size: 14px;
  font-weight: 700;
  color: #001845;
  line-height: 1;
}

.logo-separator {
  font-size: 12px;
  font-weight: 200;
  color: rgba(0, 24, 69, 0.3);
  line-height: 1;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

.brand-subtitle {
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

/* Nav Group */
.nav-group {
  margin-bottom: 20px;
}

.nav-group:last-child {
  margin-bottom: 0;
}

.group-label {
  display: block;
  padding: 8px 12px 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9ca3af;
}

/* Nav Link */
.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;
  cursor: pointer;
  overflow: hidden;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.nav-link:hover .nav-icon {
  color: #001845;
}

/* Active State */
.nav-link.is-active {
  color: #001845;
  background: #f0f9ff;
}

.nav-link.is-active .nav-icon {
  color: #001845;
}

.nav-link.is-active .nav-indicator {
  opacity: 1;
  transform: scaleY(1);
}

/* Nav Indicator (left border) */
.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 20px;
  background: #001845;
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: all 0.2s ease;
}

/* Nav Icon */
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: inherit;
  transition: color 0.15s ease;
}

.nav-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

/* Nav Label */
.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Collapsed State */
.sidebar.is-collapsed .nav-link {
  justify-content: center;
  padding: 10px;
}

.sidebar.is-collapsed .group-label {
  text-align: center;
  padding: 8px 4px 6px;
}

/* ═══════════════════════════════════════
   FOOTER
═══════════════════════════════════════ */
.sidebar-footer {
  padding: 8px;
  border-top: 1px solid #f0f0f0;
}

.collapse-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.collapse-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.collapse-btn svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.sidebar.is-collapsed .collapse-btn {
  justify-content: center;
  padding: 10px;
}

/* ═══════════════════════════════════════
   TRANSITIONS
═══════════════════════════════════════ */
.slide-fade-enter-active {
  transition: all 0.2s ease;
}

.slide-fade-leave-active {
  transition: all 0.15s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* ═══════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════ */
@media (max-width: 1024px) {
  .sidebar {
    width: 64px;
  }
  
  .brand-info,
  .group-label,
  .nav-label,
  .collapse-btn span {
    display: none;
  }
  
  .nav-link {
    justify-content: center;
    padding: 10px;
  }
  
  .collapse-btn {
    justify-content: center;
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 8px 0 24px rgba(0, 0, 0, 0.12);
  }
  
  /* Backdrop overlay for mobile */
  .sidebar::before {
    content: '';
    position: fixed;
    top: 0;
    left: 100%;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  .sidebar.mobile-open::before {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 240px;
  }
  
  .sidebar.is-collapsed {
    width: 240px;
  }
  
  /* Force expanded state on mobile */
  .sidebar.mobile-open .brand-info,
  .sidebar.mobile-open .group-label,
  .sidebar.mobile-open .nav-label,
  .sidebar.mobile-open .collapse-btn span {
    display: block;
  }
  
  .sidebar.mobile-open .nav-link {
    justify-content: flex-start;
    padding: 8px 12px;
  }
}
</style>