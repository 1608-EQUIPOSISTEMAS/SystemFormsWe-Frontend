<template>
  <div class="admin-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <AdminSidebar 
      :collapsed="sidebarCollapsed" 
      :class="{ 'mobile-open': mobileMenuOpen }"
      @toggle="sidebarCollapsed = !sidebarCollapsed" 
    />

    <!-- Mobile Overlay -->
    <transition name="fade">
      <div 
        v-if="mobileMenuOpen" 
        class="mobile-overlay" 
        @click="mobileMenuOpen = false"
      ></div>
    </transition>

    <!-- Main Content -->
    <div class="main-wrapper">
      <AdminHeader @toggle-mobile="mobileMenuOpen = !mobileMenuOpen" />
      
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

// Cerrar menú móvil al cambiar de ruta
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

// Verificar autenticación al montar
onMounted(async () => {
  if (!authStore.token) {
    router.push('/admin/login')
    return
  }

  // Si hay token pero no hay datos de usuario, cargarlos
  if (!authStore.user) {
    try {
      // Importar dinámicamente el servicio
      const { default: authService } = await import('@/services/auth.service')
      const response = await authService.me()
      
      if (response.ok) {
        authStore.setUser(response.data.user)
      } else {
        authStore.clearAuth()
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error)
      authStore.clearAuth()
      router.push('/admin/login')
    }
  }
})

// Guardar estado del sidebar en localStorage
watch(sidebarCollapsed, (val) => {
  localStorage.setItem('sidebar_collapsed', val ? '1' : '0')
})

// Restaurar estado del sidebar
onMounted(() => {
  const saved = localStorage.getItem('sidebar_collapsed')
  if (saved === '1') {
    sidebarCollapsed.value = true
  }
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f8fafc;
}

.main-wrapper {
  margin-left: 260px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.sidebar-collapsed .main-wrapper {
  margin-left: 72px;
}

.main-content {
  flex: 1;
  padding: 24px;
  min-height: calc(100vh - 64px);
}

/* Mobile Overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-wrapper {
    margin-left: 72px;
  }
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>