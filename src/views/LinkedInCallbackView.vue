<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const status = ref('loading')
const statusMessage = ref('Conectando con LinkedIn...')
const errorMessage = ref('')
const linkedInPostUrl = ref('https://www.linkedin.com/feed/')
const examData = ref(null)

onMounted(async () => {
  const code = route.query.code
  
  if (!code) {
    status.value = 'error'
    errorMessage.value = 'No se recibió autorización de LinkedIn'
    return
  }
  
  await publishToLinkedIn(code)
})

async function publishToLinkedIn(code) {
  try {
    examData.value = JSON.parse(localStorage.getItem('linkedin_exam_data') || '{}')
    const postText = localStorage.getItem('linkedin_post_text') || ''
    const certificateImage = localStorage.getItem('linkedin_certificate_image')
    
    if (!examData.value.title) {
      status.value = 'error'
      errorMessage.value = 'No se encontraron datos del examen'
      cleanupLinkedIn()
      return
    }
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const redirectUri = `${window.location.origin}/linkedin/callback`
    
    // 1. Intercambiar código por token
    statusMessage.value = 'Obteniendo autorización...'
    
    const tokenResponse = await fetch(`${API_URL}/linkedin/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri })
    })
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenData.ok) {
      status.value = 'error'
      errorMessage.value = tokenData.error || 'Error al autorizar con LinkedIn'
      cleanupLinkedIn()
      return
    }
    
    // 2. Preparar imágenes (score card)
    const images = []
    if (certificateImage) {
      images.push(certificateImage)
    }
    
    // 3. Publicar - usa post-with-document si hay certificado PDF
    //    El backend sube el PDF como documento nativo de LinkedIn
    //    Si falla, hace fallback automático a imágenes
    statusMessage.value = examData.value.certificateId 
      ? 'Subiendo certificado PDF...' 
      : 'Publicando en LinkedIn...'
    
    const postResponse = await fetch(`${API_URL}/linkedin/post-with-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: tokenData.data.access_token,
        user_id: tokenData.data.user.id,
        text: postText,
        images: images,
        certificate_id: examData.value.certificateId || null
      })
    })
    
    const postData = await postResponse.json()
    
    if (postData.ok) {
      status.value = 'success'
      const typeLabel = postData.data?.type === 'document' ? ' (con certificado PDF)' : ''
      statusMessage.value = `¡Publicado exitosamente${typeLabel}!`
      linkedInPostUrl.value = 'https://www.linkedin.com/feed/'
    } else {
      status.value = 'error'
      errorMessage.value = postData.error || 'Error al publicar'
    }
    
    cleanupLinkedIn()
    
  } catch (error) {
    console.error('Error en LinkedIn:', error)
    status.value = 'error'
    errorMessage.value = 'Error de conexión'
    cleanupLinkedIn()
  }
}

function cleanupLinkedIn() {
  localStorage.removeItem('linkedin_exam_data')
  localStorage.removeItem('linkedin_post_text')
  localStorage.removeItem('linkedin_certificate_image')
}

function goToLinkedIn() {
  window.open(linkedInPostUrl.value, '_blank')
}

function goBack() {
  const returnUrl = examData.value?.returnUrl
  if (returnUrl) {
    router.push(returnUrl)
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="linkedin-callback">
    <div class="callback-card">
      <!-- Loading -->
      <template v-if="status === 'loading'">
        <div class="spinner"></div>
        <h2>{{ statusMessage }}</h2>
        <p class="text-muted">Por favor espera...</p>
      </template>
      
      <!-- Success -->
      <template v-else-if="status === 'success'">
        <div class="success-icon">✅</div>
        <h2>{{ statusMessage }}</h2>
        <p class="text-muted">Tu publicación ya está en LinkedIn</p>
        <div class="actions">
          <button class="btn btn-primary" @click="goToLinkedIn">Ver en LinkedIn</button>
          <button class="btn btn-secondary" @click="goBack">Volver</button>
        </div>
      </template>
      
      <!-- Error -->
      <template v-else>
        <div class="error-icon">❌</div>
        <h2>Error</h2>
        <p class="error-text">{{ errorMessage }}</p>
        <button class="btn btn-secondary" @click="goBack">Volver</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.linkedin-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f2ef;
  padding: 20px;
}
.callback-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.spinner {
  width: 48px; height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #0a66c2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.success-icon, .error-icon { font-size: 48px; margin-bottom: 16px; }
.text-muted { color: #666; margin-top: 8px; }
.error-text { color: #d32f2f; margin-top: 8px; }
.actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
.btn {
  padding: 10px 24px;
  border-radius: 24px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary { background: #0a66c2; color: white; }
.btn-primary:hover { background: #004182; }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-secondary:hover { background: #d0d0d0; }
</style>