<template>
    <Teleport to="body">
        <div class="login-container">
            <!-- Panel Izquierdo -->
            <div class="brand-panel">
                <div class="brand-content">
                    <div class="brand-logo">
                    <span class="logo-w">W</span>
                    <span class="logo-separator">|</span>
                    <span class="logo-e">E</span>
                    </div>
                    <h2 class="brand-name">Educación Ejecutiva</h2>
                    <p class="brand-tagline"></p>
                </div>
                
                <!-- Elementos Decorativos Circulos -->
                <div class="brand-decoration">
                    <div class="deco-circle deco-1"></div>
                    <div class="deco-circle deco-2"></div>
                </div>
                
                <div class="brand-footer">
                    <p>Sistema de Gestión de Formularios</p>
                </div>
            </div>

            <!-- Panel Derecho -->
            <div class="form-panel">
                <div class="form-container">
                <!-- Logo (Solamente para movil) -->
                <div class="mobile-logo">
                    <div class="mobile-logo-circle">
                    <span class="logo-w">W</span>
                    <span class="logo-separator">|</span>
                    <span class="logo-e">E</span>
                    </div>
                    <p class="mobile-brand-name">Educación Ejecutiva</p>
                </div>

                <!-- Form Header -->
                <div class="form-header">
                    <h1>Bienvenido</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <!-- Login Form -->
                <form @submit.prevent="handleLogin" class="login-form">
                    <!-- Email Field -->
                    <div class="form-group" :class="{ 'has-error': errors.email, 'is-focused': focusedField === 'email' }">
                    <label for="email">Correo electrónico</label>
                    <div class="input-wrapper">
                        <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        placeholder="nombre@empresa.com"
                        autocomplete="email"
                        @focus="focusedField = 'email'"
                        @blur="focusedField = ''"
                        />
                        <span class="input-line"></span>
                    </div>
                    <transition name="fade">
                        <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
                    </transition>
                    </div>

                    <!-- Password Field -->
                    <div class="form-group" :class="{ 'has-error': errors.password, 'is-focused': focusedField === 'password' }">
                    <label for="password">Contraseña</label>
                    <div class="input-wrapper">
                        <input
                        id="password"
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        @focus="focusedField = 'password'"
                        @blur="focusedField = ''"
                        />
                        <button 
                        type="button" 
                        class="toggle-password"
                        @click="showPassword = !showPassword"
                        tabindex="-1"
                        >
                        <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                        </button>
                        <span class="input-line"></span>
                    </div>
                    <transition name="fade">
                        <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
                    </transition>
                    </div>

                    <!-- Options Row -->
                    <div class="form-options">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" v-model="form.remember" />
                        <span class="checkmark"></span>
                        <span class="checkbox-text">Mantener sesión</span>
                    </label>
                    <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
                    </div>

                    <!-- Error Alert -->
                    <transition name="slide">
                    <div v-if="errorMessage" class="alert-error">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{{ errorMessage }}</span>
                    </div>
                    </transition>

                    <!-- Submit Button -->
                    <button type="submit" class="btn-submit" :disabled="loading">
                    <span v-if="loading" class="spinner"></span>
                    <template v-else>
                        <span>Iniciar sesión</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </template>
                    </button>
                </form>

                <!-- Footer -->
                <div class="form-footer">
                    <p>© 2025 W|E Educación Ejecutiva</p>
                </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
    import { ref, reactive, onMounted, onUnmounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import authService from '@/services/auth.service'

    const router = useRouter()
    const authStore = useAuthStore()

    const form = reactive({
    email: '',
    password: '',
    remember: false
    })

    const errors = reactive({
    email: '',
    password: ''
    })

    const showPassword = ref(false)
    const loading = ref(false)
    const errorMessage = ref('')
    const focusedField = ref('')

    // Bloquear scroll del body cuando el login está montado
    onMounted(() => {
    document.body.style.overflow = 'hidden'
    document.body.classList.add('login-active')
    })

    onUnmounted(() => {
    document.body.style.overflow = ''
    document.body.classList.remove('login-active')
    })

    function validate() {
    errors.email = ''
    errors.password = ''
    let valid = true

    if (!form.email) {
        errors.email = 'El correo es requerido'
        valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Formato de correo inválido'
        valid = false
    }

    if (!form.password) {
        errors.password = 'La contraseña es requerida'
        valid = false
    } else if (form.password.length < 6) {
        errors.password = 'Mínimo 6 caracteres'
        valid = false
    }

    return valid
    }

    async function handleLogin() {
    errorMessage.value = ''
    if (!validate()) return

    loading.value = true
    try {
        const response = await authService.login(form.email, form.password)
        
        if (response.ok) {
        authStore.setAuth(response.data.user, response.data.token)
        router.push('/admin/dashboard')
        } else {
        errorMessage.value = response.message || 'Credenciales incorrectas'
        }
    } catch (e) {
        errorMessage.value = e.response?.data?.message || 'Error de conexión con el servidor'
    } finally {
        loading.value = false
    }
    }
</script>

<style>
    /* ═══════════════════════════════════════
    GOOGLE FONTS
    ═══════════════════════════════════════ */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    /* ═══════════════════════════════════════
    RESET COMPLETO PARA LOGIN
    ═══════════════════════════════════════ */
    body.login-active {
    overflow: hidden !important;
    }

    .login-container,
    .login-container *,
    .login-container *::before,
    .login-container *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    }

    /* ═══════════════════════════════════════
    MAIN CONTAINER
    ═══════════════════════════════════════ */
    .login-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    display: flex;
    flex-direction: row;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #fafafa;
    }

    /* ═══════════════════════════════════════
    BRAND PANEL - LEFT 50%
    ═══════════════════════════════════════ */
    .login-container .brand-panel {
    width: 50%;
    height: 100%;
    background: linear-gradient(160deg, #001845 0%, #001233 50%, #000814 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    padding: 40px;
    }

    .login-container .brand-content {
    text-align: center;
    z-index: 10;
    position: relative;
    }

    .login-container .brand-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 20px;
    }

    .login-container .brand-logo .logo-w,
    .login-container .brand-logo .logo-e {
    font-size: 4.5rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -2px;
    line-height: 1;
    }

    .login-container .brand-logo .logo-separator {
    font-size: 4rem;
    font-weight: 200;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1;
    }

    .login-container .brand-name {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 10px;
    }

    .login-container .brand-tagline {
    font-size: 0.9rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 0.5px;
    }

    /* Decorative Circles */
    .login-container .brand-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    pointer-events: none;
    }

    .login-container .deco-circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .login-container .deco-1 {
    width: 500px;
    height: 500px;
    top: -150px;
    right: -150px;
    border-color: rgb(255, 255, 255);
    }

    .login-container .deco-2 {
    width: 350px;
    height: 350px;
    bottom: -80px;
    left: -80px;
    border-color: rgba(255, 255, 255, 0.49);
    }

    /* Ciruclo en el medio del logo */
    .login-container .deco-3 {
    width: 180px;
    height: 180px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-color: rgba(255, 255, 255, 0.1);
    }

    .login-container .brand-footer {
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 10;
    }

    .login-container .brand-footer p {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 2px;
    text-transform: uppercase;
    }

    /* ═══════════════════════════════════════
    FORM PANEL - RIGHT 50%
    ═══════════════════════════════════════ */
    .login-container .form-panel {
    width: 50%;
    height: 100%;
    background: #fafafa;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    overflow-y: auto;
    }

    .login-container .form-container {
    width: 100%;
    max-width: 380px;
    }

    /* Mobile Logo - Hidden on desktop */
    .login-container .mobile-logo {
    display: none;
    }

    /* Form Header */
    .login-container .form-header {
    margin-bottom: 32px;
    }

    .login-container .form-header h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #0a0a0a;
    margin-bottom: 8px;
    letter-spacing: -1px;
    }

    .login-container .form-header p {
    font-size: 0.9rem;
    color: #71717a;
    font-weight: 400;
    }

    /* ═══════════════════════════════════════
    LOGIN FORM
    ═══════════════════════════════════════ */
    .login-container .login-form {
    display: flex;
    flex-direction: column;
    gap: 22px;
    }

    .login-container .form-group {
    position: relative;
    }

    .login-container .form-group label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #52525b;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    }

    .login-container .input-wrapper {
    position: relative;
    }

    .login-container .input-wrapper input {
    width: 100%;
    padding: 12px 0;
    font-size: 0.95rem;
    font-family: inherit;
    color: #18181b;
    background: transparent;
    border: none;
    border-bottom: 2px solid #e4e4e7;
    border-radius: 0;
    outline: none;
    transition: border-color 0.3s ease;
    }

    .login-container .input-wrapper input::placeholder {
    color: #a1a1aa;
    }

    .login-container .input-wrapper input:focus {
    outline: none;
    box-shadow: none;
    }

    .login-container .input-line {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #001845;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .login-container .form-group.is-focused .input-line {
    width: 100%;
    }

    .login-container .form-group.has-error .input-wrapper input {
    border-color: #ef4444;
    }

    .login-container .form-group.has-error .input-line {
    background: #ef4444;
    width: 100%;
    }

    /* Toggle Password */
    .login-container .toggle-password {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a1a1aa;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
    }

    .login-container .toggle-password:hover {
    color: #001845;
    }

    /* Error Message */
    .login-container .error-msg {
    display: block;
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 8px;
    font-weight: 500;
    }

    /* ═══════════════════════════════════════
    OPTIONS ROW
    ═══════════════════════════════════════ */
    .login-container .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    }

    .login-container .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    }

    .login-container .checkbox-wrapper input {
    display: none;
    }

    .login-container .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid #d4d4d8;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s ease;
    }

    .login-container .checkbox-wrapper input:checked + .checkmark {
    background: #001845;
    border-color: #001845;
    }

    .login-container .checkbox-wrapper input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    }

    .login-container .checkbox-text {
    font-size: 0.875rem;
    color: #71717a;
    }

    .login-container .forgot-link {
    font-size: 0.875rem;
    color: #001845;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s ease;
    }

    .login-container .forgot-link:hover {
    opacity: 0.7;
    }

    /* ═══════════════════════════════════════
    ALERT ERROR
    ═══════════════════════════════════════ */
    .login-container .alert-error {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: #fef2f2;
    border-left: 3px solid #ef4444;
    border-radius: 6px;
    color: #dc2626;
    font-size: 0.875rem;
    font-weight: 500;
    }

    /* ═══════════════════════════════════════
    SUBMIT BUTTON
    ═══════════════════════════════════════ */
    .login-container .btn-submit {
    width: 100%;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #001845;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: inherit;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .login-container .btn-submit:hover:not(:disabled) {
    background: #002866;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0, 24, 69, 0.3);
    }

    .login-container .btn-submit:active:not(:disabled) {
    transform: translateY(0);
    }

    .login-container .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    }

    .login-container .btn-submit svg {
    transition: transform 0.3s ease;
    }

    .login-container .btn-submit:hover:not(:disabled) svg {
    transform: translateX(4px);
    }

    /* Spinner */
    .login-container .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: login-spin 0.8s linear infinite;
    }

    @keyframes login-spin {
    to { transform: rotate(360deg); }
    }

    /* ═══════════════════════════════════════
    FORM FOOTER
    ═══════════════════════════════════════ */
    .login-container .form-footer {
    margin-top: 36px;
    text-align: center;
    }

    .login-container .form-footer p {
    font-size: 0.75rem;
    color: #a1a1aa;
    }

    /* ═══════════════════════════════════════
    TRANSITIONS
    ═══════════════════════════════════════ */
    .login-container .fade-enter-active,
    .login-container .fade-leave-active {
    transition: opacity 0.2s ease;
    }

    .login-container .fade-enter-from,
    .login-container .fade-leave-to {
    opacity: 0;
    }

    .login-container .slide-enter-active,
    .login-container .slide-leave-active {
    transition: all 0.3s ease;
    }

    .login-container .slide-enter-from,
    .login-container .slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
    }

    /* ═══════════════════════════════════════
    RESPONSIVE - TABLET
    ═══════════════════════════════════════ */
    @media (max-width: 1024px) {
    .login-container .brand-panel {
        width: 45%;
        padding: 30px;
    }
    
    .login-container .form-panel {
        width: 55%;
        padding: 30px;
    }
    
    .login-container .brand-logo .logo-w,
    .login-container .brand-logo .logo-e {
        font-size: 3.5rem;
    }
    
    .login-container .brand-logo .logo-separator {
        font-size: 3rem;
    }
    
    .login-container .brand-name {
        font-size: 0.9rem;
        letter-spacing: 2px;
    }
    
    .login-container .form-header h1 {
        font-size: 1.75rem;
    }
    }

    /* ═══════════════════════════════════════
    RESPONSIVE - MOBILE
    ═══════════════════════════════════════ */
    @media (max-width: 768px) {
    .login-container {
        flex-direction: column;
        overflow-y: auto;
    }
    
    .login-container .brand-panel {
        display: none;
    }
    
    .login-container .form-panel {
        width: 100%;
        height: 100%;
        min-height: 100vh;
        padding: 40px 24px;
        background: #fafafa;
    }
    
    .login-container .form-container {
        max-width: 100%;
    }
    
    /* Mobile Logo - Visible */
    .login-container .mobile-logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 32px;
    }
    
    .login-container .mobile-logo-circle {
        width: 80px;
        height: 80px;
        background: linear-gradient(160deg, #001845 0%, #001233 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        margin-bottom: 14px;
        box-shadow: 0 8px 24px rgba(0, 24, 69, 0.25);
    }
    
    .login-container .mobile-logo-circle .logo-w,
    .login-container .mobile-logo-circle .logo-e {
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -1px;
        line-height: 1;
    }
    
    .login-container .mobile-logo-circle .logo-separator {
        font-size: 1.25rem;
        font-weight: 200;
        color: rgba(255, 255, 255, 0.5);
        line-height: 1;
    }
    
    .login-container .mobile-brand-name {
        font-size: 0.7rem;
        font-weight: 600;
        color: #001845;
        letter-spacing: 2px;
        text-transform: uppercase;
    }
    
    .login-container .form-header {
        text-align: center;
        margin-bottom: 28px;
    }
    
    .login-container .form-header h1 {
        font-size: 1.5rem;
    }
    
    .login-container .login-form {
        gap: 20px;
    }
    
    .login-container .form-footer {
        margin-top: 32px;
    }
    }

    /* ═══════════════════════════════════════
    RESPONSIVE - SMALL MOBILE
    ═══════════════════════════════════════ */
    @media (max-width: 480px) {
    .login-container .form-panel {
        padding: 32px 20px;
    }

    .login-container .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .login-container .form-header h1 {
        font-size: 1.35rem;
    }

    .login-container .form-header p {
        font-size: 0.85rem;
    }

    .login-container .mobile-logo-circle {
        width: 70px;
        height: 70px;
    }

    .login-container .mobile-logo-circle .logo-w,
    .login-container .mobile-logo-circle .logo-e {
        font-size: 1.35rem;
    }

    .login-container .mobile-logo-circle .logo-separator {
        font-size: 1.1rem;
    }

    .login-container .mobile-logo {
        margin-bottom: 24px;
    }

    .login-container .form-footer {
        margin-top: 24px;
    }
    }
</style>