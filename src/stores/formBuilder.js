// frontend/src/stores/formBuilder.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formService } from '@/services/form.service'

export const useFormBuilderStore = defineStore('formBuilder', () => {
  // Estado
  const questionTypes = ref([])
  const form = ref({
    title: '',
    description: '',
    form_type: 'SURVEY',
    course_id: null,
    settings: {
      is_active: true,
      is_public: false,
      requires_login: true,
      available_from: null,
      available_until: null,
      time_limit_minutes: null,
      allow_multiple_responses: false,
      show_progress_bar: true,
      shuffle_questions: false,
      passing_score: null,
      show_score_after_submit: false,
      show_correct_answers: false,
      welcome_message: '',
      submit_message: 'Gracias por completar el formulario.'
    }
  })
  const sections = ref([])
  const questions = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const isDirty = ref(false)

  // Getters
  const hasQuestions = computed(() => questions.value.length > 0)
  const questionsCount = computed(() => questions.value.length)
  const isExam = computed(() => form.value.form_type === 'EXAM')

  // Acciones
  async function loadQuestionTypes() {
    if (questionTypes.value.length > 0) return
    try {
      const response = await formService.getQuestionTypes()
      if (response.ok) {
        questionTypes.value = response.data.types
      }
    } catch (error) {
      console.error('Error loading question types:', error)
    }
  }

  function resetForm() {
    form.value = {
      title: '',
      description: '',
      form_type: 'SURVEY',
      course_id: null,
      settings: {
        is_active: true,
        is_public: false,
        requires_login: true,
        available_from: null,
        available_until: null,
        time_limit_minutes: null,
        allow_multiple_responses: false,
        show_progress_bar: true,
        shuffle_questions: false,
        passing_score: null,
        show_score_after_submit: false,
        show_correct_answers: false,
        welcome_message: '',
        submit_message: 'Gracias por completar el formulario.'
      }
    }
    sections.value = []
    questions.value = []
    isDirty.value = false
  }

  function addQuestion(typeId) {
    const type = questionTypes.value.find(t => t.id === typeId)
    if (!type) return null

    const newQuestion = {
      temp_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question_type_id: typeId,
      type_code: type.code,
      type_name: type.name,
      has_options: type.has_options,
      question_text: '',
      help_text: '',
      placeholder: '',
      is_required: false,
      display_order: questions.value.length,
      points: 0,
      validation_rules: null,
      config: getDefaultConfig(type.code),
      options: type.has_options ? [
        { temp_id: `opt_${Date.now()}_1`, option_text: 'Opción 1', display_order: 0, is_correct: false, points: 0 },
        { temp_id: `opt_${Date.now()}_2`, option_text: 'Opción 2', display_order: 1, is_correct: false, points: 0 }
      ] : []
    }

    questions.value.push(newQuestion)
    isDirty.value = true
    return newQuestion
  }

  function getDefaultConfig(typeCode) {
    switch (typeCode) {
      case 'SCALE':
        return { min: 1, max: 10, step: 1, min_label: '', max_label: '' }
      case 'RATING':
        return { max_stars: 5 }
      case 'NUMBER':
        return { min: null, max: null, step: 1 }
      default:
        return null
    }
  }

  function updateQuestion(tempId, updates) {
    const index = questions.value.findIndex(q => 
      q.temp_id === tempId || q.id === tempId
    )
    if (index !== -1) {
      questions.value[index] = { ...questions.value[index], ...updates }
      isDirty.value = true
    }
  }

  function removeQuestion(tempId) {
    const index = questions.value.findIndex(q => 
      q.temp_id === tempId || q.id === tempId
    )
    if (index !== -1) {
      questions.value.splice(index, 1)
      // Reordenar
      questions.value.forEach((q, i) => q.display_order = i)
      isDirty.value = true
    }
  }

  function moveQuestion(fromIndex, toIndex) {
    if (fromIndex === toIndex) return
    const [moved] = questions.value.splice(fromIndex, 1)
    questions.value.splice(toIndex, 0, moved)
    questions.value.forEach((q, i) => q.display_order = i)
    isDirty.value = true
  }

  function duplicateQuestion(tempId) {
    const original = questions.value.find(q => 
      q.temp_id === tempId || q.id === tempId
    )
    if (!original) return

    const duplicate = {
      ...JSON.parse(JSON.stringify(original)),
      id: undefined,
      temp_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question_text: `${original.question_text} (copia)`,
      display_order: questions.value.length,
      options: original.options?.map((opt, i) => ({
        ...opt,
        id: undefined,
        temp_id: `opt_${Date.now()}_${i}`
      })) || []
    }

    questions.value.push(duplicate)
    isDirty.value = true
    return duplicate
  }

  function addOption(questionTempId) {
    const question = questions.value.find(q => 
      q.temp_id === questionTempId || q.id === questionTempId
    )
    if (!question || !question.has_options) return

    const newOption = {
      temp_id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      option_text: `Opción ${question.options.length + 1}`,
      option_value: '',
      display_order: question.options.length,
      is_correct: false,
      points: 0
    }

    question.options.push(newOption)
    isDirty.value = true
    return newOption
  }

  function updateOption(questionTempId, optionTempId, updates) {
    const question = questions.value.find(q => 
      q.temp_id === questionTempId || q.id === questionTempId
    )
    if (!question) return

    const optIndex = question.options.findIndex(o => 
      o.temp_id === optionTempId || o.id === optionTempId
    )
    if (optIndex !== -1) {
      question.options[optIndex] = { ...question.options[optIndex], ...updates }
      isDirty.value = true
    }
  }

  function removeOption(questionTempId, optionTempId) {
    const question = questions.value.find(q => 
      q.temp_id === questionTempId || q.id === questionTempId
    )
    if (!question) return

    const optIndex = question.options.findIndex(o => 
      o.temp_id === optionTempId || o.id === optionTempId
    )
    if (optIndex !== -1) {
      question.options.splice(optIndex, 1)
      question.options.forEach((o, i) => o.display_order = i)
      isDirty.value = true
    }
  }

  async function saveForm() {
    saving.value = true
    try {
      const payload = {
        title: form.value.title,
        description: form.value.description,
        form_type: form.value.form_type,
        course_id: form.value.course_id,
        settings: form.value.settings,
        sections: sections.value,
        questions: questions.value.map(q => ({
          ...q,
          id: q.id || undefined, // Solo enviar si existe
          temp_id: q.temp_id
        }))
      }

      const response = await formService.create(payload)
      if (response.ok) {
        isDirty.value = false
        return response.data
      }
      throw new Error(response.error || 'Error al guardar')
    } finally {
      saving.value = false
    }
  }

  async function loadForm(uuid) {
    loading.value = true
    try {
      const response = await formService.getByUuid(uuid)
      if (response.ok) {
        const { form: formData, sections: secs, questions: qs } = response.data
        
        form.value = {
          id: formData.id,
          uuid: formData.uuid,
          title: formData.title,
          description: formData.description,
          form_type: formData.form_type,
          course_id: formData.course_id,
          settings: {
            is_active: !!formData.is_active,
            is_public: !!formData.is_public,
            requires_login: !!formData.requires_login,
            available_from: formData.available_from,
            available_until: formData.available_until,
            time_limit_minutes: formData.time_limit_minutes,
            allow_multiple_responses: !!formData.allow_multiple_responses,
            show_progress_bar: !!formData.show_progress_bar,
            shuffle_questions: !!formData.shuffle_questions,
            passing_score: formData.passing_score,
            show_score_after_submit: !!formData.show_score_after_submit,
            show_correct_answers: !!formData.show_correct_answers,
            welcome_message: formData.welcome_message || '',
            submit_message: formData.submit_message || ''
          }
        }
        
        sections.value = secs || []
        questions.value = qs.map(q => ({
          ...q,
          has_options: !!q.has_options
        }))
        
        isDirty.value = false
        return true
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateForm(uuid) {
    saving.value = true
    try {
      const payload = {
        title: form.value.title,
        description: form.value.description,
        settings: form.value.settings,
        sections: sections.value,
        questions: questions.value
      }

      const response = await formService.update(uuid, payload)
      if (response.ok) {
        isDirty.value = false
        return true
      }
      throw new Error(response.error || 'Error al actualizar')
    } finally {
      saving.value = false
    }
  }

  return {
    // State
    questionTypes,
    form,
    sections,
    questions,
    loading,
    saving,
    isDirty,
    // Getters
    hasQuestions,
    questionsCount,
    isExam,
    // Actions
    loadQuestionTypes,
    resetForm,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    removeOption,
    saveForm,
    loadForm,
    updateForm
  }
})