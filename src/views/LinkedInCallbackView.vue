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
    // Recuperar datos guardados
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
    
    // 2. Preparar imágenes
    const images = []
    
    // Imagen del score (siempre)
    if (certificateImage) {
      images.push(certificateImage)
    }
    
    // 3. ★ Convertir PDF a imagen si existe (usando certificate_id)
    if (examData.value.certificateId) {
      statusMessage.value = 'Convirtiendo certificado PDF...'
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos
        
        const pdfResponse = await fetch(`${API_URL}/linkedin/pdf-to-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certificate_id: examData.value.certificateId }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        const pdfData = await pdfResponse.json()
        
        if (pdfData.ok && pdfData.data?.image_base64) {
          images.push(pdfData.data.image_base64)
          console.log('✅ PDF convertido a imagen')
        }
      } catch (err) {
        console.warn('⚠️ No se pudo convertir el PDF:', err.message)
        // Continuar sin el PDF
      }
    }
    
    // 4. Publicar en LinkedIn
    statusMessage.value = 'Publicando en LinkedIn...'
    
    const postResponse = await fetch(`${API_URL}/linkedin/post-with-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: tokenData.data.access_token,
        user_id: tokenData.data.user.id,
        text: postText,
        images: images
      })
    })
    
    const postData = await postResponse.json()
    
    if (postData.ok) {
      status.value = 'success'
      statusMessage.value = '¡Publicado exitosamente!'
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
        <div class="icon-success">✓</div>
        <h2>¡Publicación exitosa!</h2>
        <p>Tu certificado ha sido compartido en LinkedIn</p>
        <div class="button-group">
          <button @click="goToLinkedIn" class="btn btn-primary">
            Ver en LinkedIn
          </button>
          <button @click="goBack" class="btn btn-outline">
            Volver al examen
          </button>
        </div>
      </template>
      
      <!-- Error -->
      <template v-else>
        <div class="icon-error">✕</div>
        <h2>Error</h2>
        <p class="error-text">{{ errorMessage }}</p>
        <button @click="goBack" class="btn btn-outline">
          Volver
        </button>
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
  background: #f5f5f5;
  padding: 20px;
}

.callback-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e5e5;
  border-top-color: #0077b5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-success {
  width: 64px;
  height: 64px;
  background: #059669;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 24px;
}

.icon-error {
  width: 64px;
  height: 64px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 24px;
}

h2 {
  margin-bottom: 8px;
  color: #1a1a1a;
}

.text-muted {
  color: #666;
}

.error-text {
  color: #dc2626;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 15px;
}

.btn-primary {
  background: #0077b5;
  color: white;
}

.btn-primary:hover {
  background: #006097;
}

.btn-outline {
  background: transparent;
  border: 2px solid #ddd;
  color: #333;
}

.btn-outline:hover {
  background: #f5f5f5;
}
</style>