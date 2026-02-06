<template>
  <div class="result-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-screen">
      <div class="loader"></div>
      <p>Cargando resultado...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-screen">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2>Error</h2>
      <p>{{ error }}</p>
    </div>

    <!-- Resultado -->
    <div v-else class="result-screen">
      <div class="result-layout">
        <div class="result-left">
          <div class="result-mobile-header">
            <button @click="scrollToReview" class="mobile-nav-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              Ver respuestas
            </button>
            <button @click="scrollToTop" class="mobile-nav-btn back">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
              Volver arriba
            </button>
          </div>

          <!-- Score Card -->
          <div class="score-card" :class="{ passed: examResult?.passed }">
            <div class="score-status">
              <div class="status-icon">
                <svg v-if="examResult?.passed" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <span class="status-text">{{ examResult?.passed ? '¡Aprobado!' : 'No aprobado' }}</span>
            </div>
            <div class="score-main">
              <div class="score-number">
                <span class="score-obtained">{{ displayScore }}</span>
                <span class="score-separator">/</span>
                <span class="score-total">{{ displayMaxScore }}</span>
              </div>
              <span class="score-label">{{ hasPointsSystem ? 'Puntos obtenidos' : 'Respuestas correctas' }}</span>
            </div>
            <div class="score-stats">
              <div class="stat-box correct"><span class="stat-num">{{ examResult?.correct_count || 0 }}</span><span class="stat-label">CORRECTAS</span></div>
              <div class="stat-box wrong"><span class="stat-num">{{ (examResult?.total_questions || 0) - (examResult?.correct_count || 0) }}</span><span class="stat-label">INCORRECTAS</span></div>
            </div>
            <div class="score-progress">
              <div class="progress-track"><div class="progress-fill" :class="{ passed: examResult?.passed }" :style="{ width: (examResult?.score || 0) + '%' }"></div></div>
            </div>
          </div>

          <div class="section-divider"><span class="divider-line"></span><span class="divider-text">Revisión</span><span class="divider-line"></span></div>

          <!-- Review Section -->
          <div v-if="examResult?.details?.length" class="review-section" ref="reviewSection">
            <div class="review-header">
              <h3>Revisión de respuestas</h3>
              <div class="review-summary">
                <span class="summary-correct">{{ examResult.correct_count }} correctas</span>
                <span class="summary-wrong">{{ examResult.total_questions - examResult.correct_count }} incorrectas</span>
              </div>
            </div>
            <div class="review-pills">
              <button v-for="(item, idx) in examResult.details" :key="idx" class="pill" :class="{ active: reviewIndex === idx, correct: item.is_correct === true, wrong: item.is_correct === false }" @click="reviewIndex = idx">{{ idx + 1 }}</button>
            </div>
            <div v-if="currentReview" class="review-card">
              <div class="review-card-header">
                <span class="review-number">Pregunta {{ reviewIndex + 1 }}</span>
                <div class="review-meta">
                  <span v-if="currentReview.points_possible" class="review-points">{{ currentReview.points_earned || 0 }}/{{ currentReview.points_possible }} pts</span>
                  <span class="review-status" :class="{ correct: currentReview.is_correct, wrong: currentReview.is_correct === false }">{{ currentReview.is_correct ? 'Correcta' : 'Incorrecta' }}</span>
                </div>
              </div>
              <p class="review-question">{{ currentReview.question_text }}</p>
              <div class="review-answers">
                <div class="review-answer user" :class="{ wrong: currentReview.is_correct === false }">
                  <span class="answer-label">TU RESPUESTA</span>
                  <span class="answer-text">{{ currentReview.user_answer || 'Sin respuesta' }}</span>
                </div>
                <div v-if="currentReview.is_correct === false && currentReview.correct_answer" class="review-answer correct">
                  <span class="answer-label">RESPUESTA CORRECTA</span>
                  <span class="answer-text">{{ currentReview.correct_answer }}</span>
                </div>
              </div>
              <div class="review-nav">
                <button @click="reviewIndex = Math.max(0, reviewIndex - 1)" :disabled="reviewIndex === 0" class="review-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span class="review-counter">{{ reviewIndex + 1 }} de {{ examResult.details.length }}</span>
                <button @click="reviewIndex = Math.min(examResult.details.length - 1, reviewIndex + 1)" :disabled="reviewIndex >= examResult.details.length - 1" class="review-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Sin detalles -->
          <div v-else class="no-details">
            <p>La revisión detallada no está disponible para este examen.</p>
          </div>
        </div>

        <div class="result-right" ref="sidebarSection">
          <div class="sidebar-logo"><img src="@/assets/images/weonline.png" alt="WE Online" /></div>
          
          <div v-if="examResult?.respondent_name" class="sidebar-student">
            <div class="student-avatar-lg">{{ examResult.respondent_name.charAt(0) }}</div>
            <div class="student-details">
              <strong>{{ examResult.respondent_name }}</strong>
              <span>{{ examResult.respondent_email }}</span>
            </div>
          </div>
          
          <div class="sidebar-exam">
            <h4>{{ examResult?.exam_title || 'Examen' }}</h4>
            <div class="exam-details">
              <div class="detail-row"><span class="detail-label">Fecha</span><span class="detail-value">{{ formatDate(examResult?.submitted_at) }}</span></div>
              <div class="detail-row" v-if="hasPointsSystem"><span class="detail-label">Puntaje</span><span class="detail-value">{{ examResult?.total_score || 0 }} / {{ examResult?.max_score || 0 }} pts</span></div>
              <div class="detail-row"><span class="detail-label">Aciertos</span><span class="detail-value">{{ examResult?.correct_count || 0 }} / {{ examResult?.total_questions || 0 }}</span></div>
              <div class="detail-row" v-if="examResult?.passing_score"><span class="detail-label">Nota mínima</span><span class="detail-value">{{ examResult.passing_score }}%</span></div>
            </div>
          </div>
          
          <!-- QR Section -->
          <div v-if="examResult?.odoo?.pdf_url" class="sidebar-certificate">
            <div class="cert-header">
              <span class="cert-icon">🎓</span>
              <div class="cert-text"><strong>¡Certificado disponible!</strong><span>Escanea el QR o descarga</span></div>
            </div>
            <div class="cert-qr"><canvas ref="qrCanvas" class="qr-canvas"></canvas></div>
          </div>
          
          <!-- Actions -->
          <div class="sidebar-actions">
            <a v-if="examResult?.odoo?.pdf_url" :href="examResult.odoo.pdf_url" target="_blank" class="action-btn pdf">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Certificado oficial (PDF)
            </a>
            <button @click="downloadTicket" class="action-btn download">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Descargar constancia
            </button>
            <button @click="openLinkedInModal" class="action-btn linkedin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Compartir en LinkedIn
            </button>
          </div>
          <div class="sidebar-footer"><span>W|E Educación Ejecutiva</span></div>
        </div>
      </div>
    </div>

    <!-- MODAL LINKEDIN -->
    <Teleport to="body">
      <div v-if="showLinkedInModal" class="linkedin-modal-overlay" @click.self="closeLinkedInModal">
        <div class="linkedin-modal">
          <div class="linkedin-modal-header">
            <div class="linkedin-header-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span>Compartir en LinkedIn</span>
            </div>
            <button @click="closeLinkedInModal" class="linkedin-close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="linkedin-modal-body">
            <div class="linkedin-preview-card">
              <div class="preview-header">
                <div class="preview-avatar">{{ examResult?.respondent_name?.charAt(0) || 'U' }}</div>
                <div class="preview-info">
                  <strong>{{ examResult?.respondent_name || 'Usuario' }}</strong>
                  <span>Publicación • Ahora</span>
                </div>
              </div>
              <div class="preview-image">
                <div class="preview-image-placeholder">
                  <div class="placeholder-score">
                    <span class="placeholder-value">{{ displayScore }}/{{ displayMaxScore }}</span>
                    <span class="placeholder-status" :class="{ passed: examResult?.passed }">{{ examResult?.passed ? 'APROBADO' : 'NO APROBADO' }}</span>
                  </div>
                  <span class="placeholder-title">{{ examResult?.exam_title }}</span>
                </div>
              </div>
            </div>
            <div class="linkedin-editor">
              <label class="editor-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edita tu mensaje
              </label>
              <textarea v-model="linkedInPostText" class="editor-textarea" rows="8" placeholder="Escribe tu mensaje..."></textarea>
              <div class="editor-footer">
                <span class="char-count" :class="{ warning: linkedInPostText.length > 2800 }">{{ linkedInPostText.length }} / 3000</span>
              </div>
            </div>
            <div class="linkedin-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>Se incluirá automáticamente tu nota del examen y también tu certificado conseguido</span>
            </div>
          </div>
          <div class="linkedin-modal-footer">
            <button @click="closeLinkedInModal" class="linkedin-btn-cancel">Cancelar</button>
            <button @click="confirmLinkedInShare" class="linkedin-btn-share" :disabled="linkedInLoading || linkedInPostText.length > 3000">
              <span v-if="linkedInLoading" class="btn-loader"></span>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              {{ linkedInLoading ? 'Preparando...' : 'Publicar en LinkedIn' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const examResult = ref(null)
const reviewIndex = ref(0)
const qrCanvas = ref(null)
const reviewSection = ref(null)
const sidebarSection = ref(null)

// LinkedIn Modal State
const showLinkedInModal = ref(false)
const linkedInPostText = ref('')
const linkedInLoading = ref(false)

const hasPointsSystem = computed(() => (examResult.value?.max_score || 0) > examResult.value?.total_questions)
const displayScore = computed(() => hasPointsSystem.value ? (examResult.value?.total_score || 0) : (examResult.value?.correct_count || 0))
const displayMaxScore = computed(() => hasPointsSystem.value ? (examResult.value?.max_score || 0) : (examResult.value?.total_questions || 0))
const currentReview = computed(() => examResult.value?.details?.[reviewIndex.value] || null)

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('es-PE')
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function scrollToReview() {
  reviewSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ═══════════════════════════════════════════════════════════════
// QR - Se genera cuando el canvas existe en el DOM
// ═══════════════════════════════════════════════════════════════
watch(qrCanvas, async (canvas) => {
  if (canvas && examResult.value?.odoo?.certificate_id) {
    await generateQR()
  }
})

async function generateQR() {
  if (!qrCanvas.value || !examResult.value?.odoo?.certificate_id) return
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const responseUuid = examResult.value.response_uuid
    const qrUrl = responseUuid
      ? `${API_URL}/public/certificate/${responseUuid}`
      : `${window.location.origin}/verificar/${examResult.value.odoo.certificate_id}`

    await QRCode.toCanvas(qrCanvas.value, qrUrl, {
      width: 120,
      margin: 2,
      color: { dark: '#000F5A', light: '#ffffff' }
    })
  } catch (err) {
    console.error('QR error:', err)
  }
}

function downloadTicket() {
  const r = examResult.value
  const scoreDisplay = hasPointsSystem.value ? `${r?.total_score||0}/${r?.max_score||0} pts` : `${r?.correct_count||0}/${r?.total_questions||0}`
  const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Constancia</title><style>@page{size:80mm 200mm;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial;width:80mm;padding:8mm;background:#fff}.ticket{text-align:center}.logo{font-size:18px;font-weight:bold;color:#000F5A;margin-bottom:4mm;letter-spacing:2px}.title{font-size:10px;color:#666;margin-bottom:6mm;border-bottom:1px dashed #ccc;padding-bottom:4mm}.exam-name{font-size:12px;font-weight:600;color:#000F5A;margin-bottom:6mm}.score-box{background:${r?.passed?'#ecfdf5':'#fef2f2'};padding:6mm;border-radius:3mm;margin-bottom:5mm}.score{font-size:28px;font-weight:bold;color:${r?.passed?'#059669':'#dc2626'}}.status{font-size:11px;font-weight:600;color:${r?.passed?'#059669':'#dc2626'};margin-top:2mm}.details{font-size:9px;color:#666;margin-bottom:4mm}.footer{font-size:8px;color:#999;border-top:1px dashed #ccc;padding-top:4mm;margin-top:4mm}</style></head><body><div class="ticket"><div class="logo">W|E</div><div class="title">CONSTANCIA DE EXAMEN</div><div class="exam-name">${r?.exam_title||'Examen'}</div><div class="score-box"><div class="score">${scoreDisplay}</div><div class="status">${r?.passed?'APROBADO':'NO APROBADO'}</div></div><div class="details">${r?.correct_count||0} correctas de ${r?.total_questions||0}<br>${formatDate(r?.submitted_at)}</div><div class="footer">W|E Educación Ejecutiva</div></div></body></html>`
  const w = window.open('', '_blank')
  w.document.write(content)
  w.document.close()
  setTimeout(() => { w.print() }, 300)
}

// ═══════════════════════════════════════════════════════════════
// LinkedIn Functions
// ═══════════════════════════════════════════════════════════════
function generateDefaultLinkedInText() {
  const r = examResult.value
  const timestamp = new Date().toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const scoreText = hasPointsSystem.value ? `${r?.total_score||0}/${r?.max_score||0} puntos` : `${r?.correct_count||0}/${r?.total_questions||0}`
  
  let text = `🎓 ¡Completé la evaluación "${r?.exam_title}"!\n\n`
  text += `📊 Resultado: ${scoreText} (${r?.score||0}%) ${r?.passed ? '✅ APROBADO' : ''}\n\n`
  if (r?.respondent_name) text += `👤 ${r.respondent_name}\n\n`
  text += `Gracias a @WE Online por esta oportunidad.\n\n`
  text += `📅 ${timestamp}\n\n`
  text += `#WEOnline #EducaciónEjecutiva #Certificación`
  
  return text
}

function openLinkedInModal() {
  linkedInPostText.value = generateDefaultLinkedInText()
  showLinkedInModal.value = true
}

function closeLinkedInModal() {
  showLinkedInModal.value = false
  linkedInLoading.value = false
}

async function confirmLinkedInShare() {
  linkedInLoading.value = true
  
  try {
    const imageBlob = await generateCertificateImage()
    if (!imageBlob) { 
      alert('Error al generar imagen')
      linkedInLoading.value = false
      return
    }
    
    const r = examResult.value
    
    const examData = {
      title: r?.exam_title,
      percentage: r?.score || 0,
      passed: r?.passed,
      correct: r?.correct_count || 0,
      total: r?.total_questions || 0,
      totalScore: r?.total_score || 0,
      maxScore: r?.max_score || 0,
      studentName: r?.respondent_name || '',
      certificateId: r?.odoo?.certificate_id || null,
      pdfUrl: r?.odoo?.pdf_url || null,
      returnUrl: window.location.pathname
    }
    
    localStorage.setItem('linkedin_exam_data', JSON.stringify(examData))
    localStorage.setItem('linkedin_post_text', linkedInPostText.value)
    
    const reader = new FileReader()
    reader.readAsDataURL(imageBlob)
    reader.onloadend = () => {
      localStorage.setItem('linkedin_certificate_image', reader.result.split(',')[1])
      const state = btoa(JSON.stringify({ responseUuid: r?.response_uuid, ts: Date.now() }))
      const clientId = '78grbv4vc7hu8f'
      const redirectUri = encodeURIComponent(`${window.location.origin}/linkedin/callback`)
      const scope = encodeURIComponent('openid profile email w_member_social')
      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}&scope=${scope}`
    }
    reader.onerror = () => { 
      alert('Error al procesar imagen')
      linkedInLoading.value = false
    }
  } catch (err) { 
    console.error('Error LinkedIn:', err)
    alert('Error al preparar publicación')
    linkedInLoading.value = false
  }
}

async function generateCertificateImage() {
  const r = examResult.value
  const scoreText = hasPointsSystem.value ? `${r?.total_score||0}/${r?.max_score||0}` : `${r?.correct_count||0}/${r?.total_questions||0}`
  const scoreLabel = hasPointsSystem.value ? 'puntos' : 'respuestas correctas'
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = `<div style="width:600px;padding:40px;background:linear-gradient(135deg,#000F5A 0%,#0499D5 100%);border-radius:16px;font-family:'Segoe UI',Arial,sans-serif;color:white;text-align:center;"><div style="font-size:28px;font-weight:bold;letter-spacing:4px;margin-bottom:8px;">W | E</div><div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.9;margin-bottom:24px;">Constancia de Evaluación</div><div style="font-size:18px;font-weight:600;margin-bottom:32px;line-height:1.4;">${r?.exam_title||'Examen'}</div>${r?.respondent_name?`<div style="font-size:14px;opacity:0.9;margin-bottom:24px;">${r.respondent_name}</div>`:''}<div style="background:rgba(255,255,255,0.2);padding:24px 40px;border-radius:12px;display:inline-block;margin-bottom:24px;"><div style="font-size:64px;font-weight:700;line-height:1;">${scoreText}</div><div style="font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-top:8px;">${r?.passed?'APROBADO':'NO APROBADO'}</div></div><div style="font-size:14px;opacity:0.9;">${r?.score||0}% - ${scoreLabel}</div><div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.2);font-size:12px;opacity:0.8;">${formatDate(r?.submitted_at)} • WE | Educación Ejecutiva</div></div>`
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  document.body.appendChild(tempDiv)
  
  try {
    const canvas = await html2canvas(tempDiv.firstElementChild, { scale: 2, backgroundColor: null, logging: false })
    document.body.removeChild(tempDiv)
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png', 1.0))
  } catch (err) { 
    document.body.removeChild(tempDiv)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// Cargar resultado
// ═══════════════════════════════════════════════════════════════
async function loadResult() {
  const uuid = route.params.uuid
  if (!uuid) { error.value = 'UUID no válido'; loading.value = false; return }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const res = await fetch(`${API_URL}/public/result/${uuid}`)
    const data = await res.json()
    
    if (!data.ok) throw new Error(data.error || 'Error al cargar resultado')
    
    examResult.value = data.data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadResult)
</script>

<style scoped>
.result-page { min-height: 100vh; background: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.loading-screen, .error-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; }
.loader { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #000F5A; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-icon { color: #dc2626; }
.btn-home { padding: 12px 24px; background: #000F5A; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
.btn-home:hover { background: #001a8c; }

.result-screen { padding: 20px; }
.result-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; max-width: 1200px; margin: 0 auto; }
@media (max-width: 968px) { .result-layout { grid-template-columns: 1fr; } }

.result-mobile-header { display: none; gap: 8px; margin-bottom: 16px; }
@media (max-width: 968px) { .result-mobile-header { display: flex; } }
.mobile-nav-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; cursor: pointer; }

.score-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid #e2e8f0; }
.score-card.passed { border-color: #10b981; background: linear-gradient(135deg, #ecfdf5 0%, white 50%); }
.score-status { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.status-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #fef2f2; color: #dc2626; }
.score-card.passed .status-icon { background: #d1fae5; color: #059669; }
.status-text { font-size: 20px; font-weight: 700; color: #dc2626; }
.score-card.passed .status-text { color: #059669; }
.score-main { text-align: center; margin-bottom: 20px; }
.score-number { font-size: 48px; font-weight: 800; color: #1e293b; }
.score-separator { color: #94a3b8; margin: 0 4px; }
.score-label { display: block; font-size: 13px; color: #64748b; margin-top: 4px; }
.score-stats { display: flex; gap: 12px; margin-bottom: 16px; }
.stat-box { flex: 1; padding: 12px; border-radius: 10px; text-align: center; }
.stat-box.correct { background: #ecfdf5; }
.stat-box.wrong { background: #fef2f2; }
.stat-num { display: block; font-size: 24px; font-weight: 700; }
.stat-box.correct .stat-num { color: #059669; }
.stat-box.wrong .stat-num { color: #dc2626; }
.stat-label { font-size: 10px; color: #64748b; letter-spacing: 0.5px; }
.score-progress { margin-top: 8px; }
.progress-track { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: #dc2626; border-radius: 4px; transition: width 0.5s; }
.progress-fill.passed { background: #10b981; }

.section-divider { display: flex; align-items: center; gap: 16px; margin: 32px 0; }
.divider-line { flex: 1; height: 1px; background: #e2e8f0; }
.divider-text { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

.review-section { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.review-header h3 { font-size: 18px; color: #1e293b; }
.review-summary { display: flex; gap: 16px; font-size: 13px; }
.summary-correct { color: #059669; }
.summary-wrong { color: #dc2626; }
.review-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.pill { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #e2e8f0; background: white; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.pill.correct { border-color: #10b981; color: #059669; }
.pill.wrong { border-color: #ef4444; color: #dc2626; }
.pill.active { transform: scale(1.1); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.review-card { background: #f8fafc; border-radius: 12px; padding: 20px; }
.review-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.review-number { font-weight: 600; color: #64748b; }
.review-meta { display: flex; gap: 12px; align-items: center; }
.review-points { font-size: 12px; color: #64748b; }
.review-status { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
.review-status.correct { background: #d1fae5; color: #059669; }
.review-status.wrong { background: #fee2e2; color: #dc2626; }
.review-question { font-size: 15px; color: #1e293b; line-height: 1.6; margin-bottom: 16px; }
.review-answers { display: flex; flex-direction: column; gap: 12px; }
.review-answer { padding: 12px 16px; border-radius: 8px; }
.review-answer.user { background: #e2e8f0; }
.review-answer.user.wrong { background: #fee2e2; }
.review-answer.correct { background: #d1fae5; }
.answer-label { display: block; font-size: 10px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.answer-text { font-size: 14px; color: #1e293b; }
.review-nav { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.review-arrow { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e2e8f0; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.review-arrow:disabled { opacity: 0.4; cursor: not-allowed; }
.review-counter { font-size: 13px; color: #64748b; }
.no-details { text-align: center; padding: 40px; color: #64748b; }

.result-right { display: flex; flex-direction: column; gap: 20px; }
@media (max-width: 968px) { .result-right { order: -1; } }
.sidebar-logo { text-align: center; padding: 16px; }
.sidebar-logo img { height: 40px; }
.sidebar-student { display: flex; align-items: center; gap: 12px; padding: 16px; background: white; border-radius: 12px; }
.student-avatar-lg { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #000F5A, #1e40af); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; }
.student-details { display: flex; flex-direction: column; }
.student-details strong { font-size: 14px; color: #1e293b; }
.student-details span { font-size: 12px; color: #64748b; }
.sidebar-exam { background: white; border-radius: 12px; padding: 20px; }
.sidebar-exam h4 { font-size: 15px; color: #1e293b; margin-bottom: 16px; line-height: 1.4; }
.exam-details { display: flex; flex-direction: column; gap: 10px; }
.detail-row { display: flex; justify-content: space-between; font-size: 13px; }
.detail-label { color: #64748b; }
.detail-value { color: #1e293b; font-weight: 500; }
.sidebar-certificate { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; text-align: center; }
.cert-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; text-align: left; }
.cert-icon { font-size: 32px; }
.cert-text strong { display: block; font-size: 14px; color: #92400e; }
.cert-text span { font-size: 12px; color: #a16207; }
.cert-qr { display: flex; justify-content: center; }
.qr-canvas { border-radius: 8px; }
.sidebar-actions { display: flex; flex-direction: column; gap: 10px; }
.action-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; }
.action-btn.pdf { background: #dc2626; color: white; }
.action-btn.pdf:hover { background: #b91c1c; }
.action-btn.download { background: #000F5A; color: white; }
.action-btn.download:hover { background: #001a8c; }
.action-btn.linkedin { background: #0077b5; color: white; }
.action-btn.linkedin:hover { background: #006097; }
.action-btn.home { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.action-btn.home:hover { background: #e2e8f0; }
.sidebar-footer { text-align: center; padding: 16px; font-size: 12px; color: #94a3b8; }

/* LinkedIn Modal */
.linkedin-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
.linkedin-modal { background: white; border-radius: 16px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; }
.linkedin-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
.linkedin-header-left { display: flex; align-items: center; gap: 12px; font-weight: 600; color: #1e293b; }
.linkedin-close-btn { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; }
.linkedin-modal-body { padding: 24px; }
.linkedin-preview-card { background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
.preview-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.preview-avatar { width: 40px; height: 40px; border-radius: 50%; background: #0077b5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.preview-info strong { display: block; font-size: 14px; color: #1e293b; }
.preview-info span { font-size: 12px; color: #64748b; }
.preview-image { background: linear-gradient(135deg, #000F5A, #0499D5); border-radius: 8px; padding: 24px; text-align: center; color: white; }
.placeholder-score { margin-bottom: 8px; }
.placeholder-value { font-size: 28px; font-weight: 800; }
.placeholder-status { display: block; font-size: 12px; font-weight: 600; margin-top: 4px; }
.placeholder-status.passed { color: #a7f3d0; }
.placeholder-title { font-size: 14px; opacity: 0.9; }
.linkedin-editor { margin-bottom: 16px; }
.editor-label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
.editor-textarea { width: 100%; padding: 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; resize: none; font-family: inherit; }
.editor-textarea:focus { outline: none; border-color: #0077b5; }
.editor-footer { display: flex; justify-content: flex-end; margin-top: 8px; }
.char-count { font-size: 12px; color: #64748b; }
.char-count.warning { color: #f59e0b; }
.linkedin-info { display: flex; align-items: flex-start; gap: 10px; padding: 14px; background: #f0f9ff; border-radius: 10px; font-size: 13px; color: #0369a1; }
.linkedin-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid #e2e8f0; }
.linkedin-btn-cancel { padding: 12px 20px; background: #f1f5f9; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; }
.linkedin-btn-share { display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: #0077b5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.linkedin-btn-share:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-loader { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
</style>