// src/stores/publicForm.js - Actualizado para banco de preguntas

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

  // NUEVO: IDs de preguntas seleccionadas del banco
  const selectedQuestionIds = ref(null)

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

  // NUEVO: Info del banco de preguntas
  const questionBankInfo = computed(() => {
    if (!form.value?.use_question_bank) return null
    return {
      totalInBank: form.value.total_questions_in_bank,
      showing: questions.value.length,
      isRandom: true
    }
  })

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
      
      // NUEVO: Guardar IDs de preguntas seleccionadas
      selectedQuestionIds.value = data.data.selected_question_ids || null
      
      // Inicializar respuestas
      questions.value.forEach(q => {
        answers[q.id] = q.type_code === 'CHECKBOX' ? [] : null
      })
      
      // Si es examen con tiempo, iniciar timer
      if (form.value.form_type === 'EXAM' && form.value.time_limit_minutes) {
        startTimer(form.value.time_limit_minutes * 60)
      }
      
      startTime.value = new Date()
      return true
      
    } catch (err) {
      error.value = 'Error al cargar el formulario'
      return false
    } finally {
      loading.value = false
    }
  }

  // ═══════════════════════════════════════
  // ENVIAR RESPUESTAS
  // ═══════════════════════════════════════
  async function submitResponses() {
    if (submitting.value) return null
    
    submitting.value = true
    stopTimer()
    
    try {
      const timeSpent = startTime.value 
        ? Math.floor((new Date() - startTime.value) / 1000)
        : null

      const formattedAnswers = questions.value.map(q => ({
        question_id: q.id,
        answer_value: answers[q.id]
      }))

      const payload = {
        form_uuid: form.value.uuid,
        answers: formattedAnswers,
        time_spent: timeSpent,
        respondent_email: odooStudent.value?.email || null,
        respondent_name: odooStudent.value?.full_name || null,
        // NUEVO: Enviar IDs de preguntas mostradas
        shown_question_ids: selectedQuestionIds.value
      }

      // Datos de Odoo si aplica
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
        throw new Error(data.error)
      }

      examResult.value = {
        response_uuid: data.data.response_uuid,
        percentage: data.data.score || 0,
        passed: data.data.passed,
        correct_count: data.data.correct_count || 0,
        total_questions: data.data.total_questions || questions.value.length,
        total_score: data.data.total_score || 0,
        max_score: data.data.max_score || 0,
        passing_score: data.data.passing_score,
        details: data.data.details || [],
        odoo: data.data.odoo || null
      }
      
      showResults.value = true
      return examResult.value

    } catch (err) {
      error.value = err.message || 'Error al enviar respuestas'
      return null
    } finally {
      submitting.value = false
    }
  }

  // ═══════════════════════════════════════
  // TIMER FUNCTIONS
  // ═══════════════════════════════════════
  function startTimer(seconds) {
    timeRemaining.value = seconds
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        stopTimer()
        // Auto-submit cuando se acaba el tiempo
        submitResponses()
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  // ═══════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════
  function reset() {
    form.value = null
    questions.value = []
    selectedQuestionIds.value = null
    currentIndex.value = 0
    Object.keys(answers).forEach(k => delete answers[k])
    Object.keys(errors).forEach(k => delete errors[k])
    examResult.value = null
    showResults.value = false
    odooValidated.value = false
    odooStudent.value = null
    stopTimer()
    timeRemaining.value = null
    startTime.value = null
    error.value = null
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
    selectedQuestionIds,
    
    // Getters
    isExam,
    requiresOdooValidation,
    currentQuestion,
    progress,
    canSubmit,
    questionBankInfo,
    
    // Actions
    loadForm,
    submitResponses,
    reset,
    stopTimer
  }
})