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
    
    // 3. Convertir PDF a imagen si existe
    if (examData.value.pdfUrl) {
      statusMessage.value = 'Convirtiendo certificado PDF...'
      
      try {
        const pdfResponse = await fetch(`${API_URL}/linkedin/pdf-to-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdf_url: examData.value.pdfUrl })
        })
        
        const pdfData = await pdfResponse.json()
        
        if (pdfData.ok && pdfData.data?.image_base64) {
          images.push(pdfData.data.image_base64)
          console.log('✅ PDF convertido a imagen')
        }
      } catch (err) {
        console.warn('No se pudo convertir el PDF:', err)
        // Continuar sin la imagen del PDF
      }
    }
    
    // 4. Publicar en LinkedIn con todas las imágenes
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
      if (postData.data?.postId) {
        linkedInPostUrl.value = `https://www.linkedin.com/feed/update/${postData.data.postId}`
      }
    } else {
      status.value = 'error'
      errorMessage.value = postData.error || 'Error al publicar'
    }
    
    cleanupLinkedIn()
    
  } catch (error) {
    console.error('Error:', error)
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

function goBack() {
  const formUuid = examData.value?.formUuid
  if (formUuid) {
    router.push(`/form/${formUuid}`)
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="callback-screen">
    <div class="callback-card">
      <img src="@/assets/images/weonline.png" alt="WE Online" class="brand-logo" />
      
      <div v-if="status === 'loading'" class="status-section">
        <div class="loader"></div>
        <h2>Publicando en LinkedIn...</h2>
        <p>{{ statusMessage }}</p>
      </div>
      
      <div v-else-if="status === 'success'" class="status-section success">
        <div class="status-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2>¡Publicado exitosamente!</h2>
        <p>Tu logro y certificado ya están visibles en tu perfil de LinkedIn</p>
        <a :href="linkedInPostUrl" target="_blank" class="btn-view">Ver en LinkedIn</a>
        <button @click="goBack" class="btn-back">Volver al resultado</button>
      </div>
      
      <div v-else-if="status === 'error'" class="status-section error">
        <div class="status-icon error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2>Error al publicar</h2>
        <p>{{ errorMessage }}</p>
        <button @click="goBack" class="btn-back">Volver</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px;
}

.callback-card {
  background: white;
  border-radius: 20px;
  padding: 48px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.brand-logo {
  height: 40px;
  margin-bottom: 32px;
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.status-section h2 {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.status-section p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #0077b5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecfdf5;
  color: #059669;
}

.status-icon.error {
  background: #fef2f2;
  color: #dc2626;
}

.btn-view {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #0077b5;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  margin-top: 16px;
}

.btn-view:hover {
  background: #005885;
}

.btn-back {
  padding: 12px 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  margin-top: 8px;
}

.btn-back:hover {
  background: #e5e7eb;
}
</style>