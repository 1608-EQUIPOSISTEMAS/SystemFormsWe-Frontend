import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const usePublicFormStore = defineStore('publicForm', () => {
  // State
  const form = ref(null)
  const questions = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref(null)
  
  // Exam state
  const currentIndex = ref(0)
  const answers = reactive({})
  const errors = reactive({})
  const startTime = ref(null)
  const timeRemaining = ref(null)
  const timerInterval = ref(null)
  
  // Result state
  const examResult = ref(null)
  const showResults = ref(false)
  
  // Odoo state
  const odooValidated = ref(false)
  const odooStudent = ref(null)
  const validatingEmail = ref(false)

  // Getters
  const isExam = computed(() => form.value?.form_type === 'EXAM')
  const requiresOdooValidation = computed(() => form.value?.requires_odoo_validation)
  const currentQuestion = computed(() => questions.value[currentIndex.value])
  const progress = computed(() => 
    questions.value.length ? ((currentIndex.value + 1) / questions.value.length) * 100 : 0
  )
  const canSubmit = computed(() => {
    if (!requiresOdooValidation.value) return true
    return odooValidated.value
  })

  // ═══════════════════════════════════════
  // VALIDAR ESTUDIANTE EN ODOO
  // ═══════════════════════════════════════
  async function validateStudent(email) {
    if (!form.value?.uuid) return { ok: false, error: 'Formulario no cargado' }
    
    validatingEmail.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/public/validate-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          form_uuid: form.value.uuid
        })
      })
      
      const data = await res.json()
      
      if (!data.ok) {
        error.value = data.error
        return { ok: false, error: data.error, code: data.code }
      }
      
      if (data.validated) {
        odooValidated.value = true
        odooStudent.value = data.student
      }
      
      return { ok: true, student: data.student }
    } catch (err) {
      error.value = 'Error de conexión al validar'
      return { ok: false, error: err.message }
    } finally {
      validatingEmail.value = false
    }
  }

  // ═══════════════════════════════════════
  // CARGAR FORMULARIO
  // ═══════════════════════════════════════
  async function loadForm(uuid) {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(`${API_URL}/public/forms/${uuid}`)
      const data = await res.json()
      
      if (!data.ok) {
        error.value = data.error
        return false
      }
      
      form.value = data.data.form
      questions.value = data.data.questions || []
      
      // Inicializar respuestas
      questions.value.forEach(q => {
        answers[q.id] = q.type_code === 'MULTIPLE_CHOICE' ? [] : null
      })
      
      return true
    } catch (err) {
      error.value = 'Error al cargar formulario'
      return false
    } finally {
      loading.value = false
    }
  }

  // ═══════════════════════════════════════
  // INICIAR EXAMEN (con timer)
  // ═══════════════════════════════════════
  function startExam() {
    startTime.value = Date.now()
    
    if (form.value?.time_limit_minutes) {
      timeRemaining.value = form.value.time_limit_minutes * 60
      
      timerInterval.value = setInterval(() => {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          clearInterval(timerInterval.value)
          submitExam(true) // Auto-submit
        }
      }, 1000)
    }
  }

  // ═══════════════════════════════════════
  // ENVIAR EXAMEN
  // ═══════════════════════════════════════
  async function submitExam(autoSubmit = false) {
    if (submitting.value) return
    submitting.value = true
    
    // Detener timer
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
    
    // Calcular tiempo empleado
    const timeSpent = startTime.value 
      ? Math.floor((Date.now() - startTime.value) / 1000) 
      : null
    
    // Preparar respuestas
    const answersArray = Object.entries(answers).map(([qid, value]) => ({
      question_id: parseInt(qid),
      answer_value: value
    }))
    
    try {
      const payload = {
        form_uuid: form.value.uuid,
        answers: answersArray,
        time_spent: timeSpent,
        respondent_email: odooStudent.value?.email || null,
        respondent_name: odooStudent.value?.full_name || null
      }
      
      // Agregar datos Odoo si fue validado
      if (odooValidated.value && odooStudent.value) {
        payload.odoo_partner_id = odooStudent.value.partner_id
        payload.odoo_student_names = odooStudent.value.names
        payload.odoo_student_surnames = odooStudent.value.surnames
      }
      
      const res = await fetch(`${API_URL}/public/responses/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      
      if (!data.ok) {
        error.value = data.error
        return false
      }
      
      // Guardar resultado
      examResult.value = {
        response_uuid: data.data.response_uuid,
        exam_title: data.data.exam_title,
        score: data.data.score,
        passed: data.data.passed,
        correct_count: data.data.correct_count,
        total_questions: data.data.total_questions,
        total_score: data.data.total_score,
        max_score: data.data.max_score,
        passing_score: data.data.passing_score,
        time_spent: data.data.time_spent,
        details: data.data.details || [],
        odoo: data.data.odoo || null
      }
      
      showResults.value = true
      return true
      
    } catch (err) {
      error.value = autoSubmit 
        ? 'Tiempo agotado. Error al enviar.' 
        : 'Error al enviar respuestas'
      return false
    } finally {
      submitting.value = false
    }
  }

  // ═══════════════════════════════════════
  // NAVEGACIÓN
  // ═══════════════════════════════════════
  function goToQuestion(index) {
    if (index >= 0 && index < questions.value.length) {
      currentIndex.value = index
    }
  }
  
  function nextQuestion() {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
    }
  }
  
  function prevQuestion() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  // ═══════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════
  function reset() {
    form.value = null
    questions.value = []
    currentIndex.value = 0
    Object.keys(answers).forEach(k => delete answers[k])
    Object.keys(errors).forEach(k => delete errors[k])
    startTime.value = null
    timeRemaining.value = null
    examResult.value = null
    showResults.value = false
    odooValidated.value = false
    odooStudent.value = null
    error.value = null
    
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  }

  return {
    // State
    form,
    questions,
    loading,
    submitting,
    error,
    currentIndex,
    answers,
    errors,
    timeRemaining,
    examResult,
    showResults,
    odooValidated,
    odooStudent,
    validatingEmail,
    // Getters
    isExam,
    requiresOdooValidation,
    currentQuestion,
    progress,
    canSubmit,
    // Actions
    validateStudent,
    loadForm,
    startExam,
    submitExam,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    reset
  }
})