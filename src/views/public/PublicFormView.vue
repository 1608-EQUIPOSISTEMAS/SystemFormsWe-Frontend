<template>
  <div class="form-view" :class="{ 'exam-mode': isExam }">
    <!-- Loading -->
    <div v-if="loading" class="state-screen">
      <div class="loader"></div>
      <p class="state-text">Cargando formulario...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-screen">
      <div class="state-icon error">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
        </svg>
      </div>
      <h2 class="state-title">{{ error }}</h2>
      <p class="state-text">No se pudo cargar el formulario.</p>
    </div>

    <template v-else-if="form">
      <!-- PASO 0: VALIDACIÓN ODOO -->
      <div v-if="requiresOdooValidation && !odooValidated && !started" class="validation-screen">
        <div class="validation-card">
          <img src="@/assets/images/weonline.png" alt="WE Online" class="brand-logo" />
          <h1 class="validation-title">{{ form.title }}</h1>
          <p class="validation-subtitle">Ingresa tu correo registrado en el Intranet</p>
          <form @submit.prevent="validateOdooEmail" class="validation-form">
            <div class="input-group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input type="email" v-model="odooEmail" placeholder="tucorreo@ejemplo.com" :disabled="validatingOdoo" required autofocus />
            </div>
            <div v-if="odooError" class="error-msg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {{ odooError }}
            </div>
            <button type="submit" class="btn-primary" :disabled="validatingOdoo || !odooEmail">
              <span v-if="validatingOdoo" class="btn-loader"></span>
              {{ validatingOdoo ? 'Verificando...' : 'Continuar' }}
            </button>
          </form>
        </div>
      </div>

      <!-- PASO 1: BIENVENIDA -->
      <div v-else-if="!started && form.welcome_message" class="welcome-screen">
        <div class="welcome-card">
          <img src="@/assets/images/weonline.png" alt="WE Online" class="brand-logo" />
          <h1 class="welcome-title">{{ form.title }}</h1>
          <p v-if="form.description" class="welcome-desc">{{ form.description }}</p>
          <div v-if="odooStudent" class="student-card">
            <div class="student-avatar">{{ odooStudent.full_name.charAt(0) }}</div>
            <div class="student-data">
              <strong>{{ odooStudent.full_name }}</strong>
              <span>{{ odooStudent.email }}</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p class="welcome-msg">{{ form.welcome_message }}</p>
          <div v-if="isExam" class="exam-info">
            <div class="info-chip" v-if="form.time_limit_minutes">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ form.time_limit_minutes }} min
            </div>
            <div class="info-chip">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              {{ questions.length }} preguntas
            </div>
            <div class="info-chip" v-if="calculatedMaxScore > questions.length">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Máx: {{ calculatedMaxScore }} pts
            </div>
            <div class="info-chip" v-if="form.passing_score">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Nota mínima: 11
            </div>
          </div>
          <button @click="startForm" class="btn-start">
            {{ isExam ? 'Comenzar examen' : 'Empezar' }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- PASO 2: QUIZ / EXAMEN - Layout 70/30 en PC -->
      <div v-else-if="!submitted" class="quiz-screen">
        <header class="quiz-header">
          <div class="header-left">
            <img src="@/assets/images/weonline.png" alt="WE" class="header-logo" />
            <span class="header-title">{{ form.title }}</span>
          </div>
          <div class="header-right">
            <div v-if="isExam && form.time_limit_minutes" class="timer" :class="{ warning: timerWarning, critical: timerCritical }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formattedTime }}
            </div>
            <!-- Botón toggle solo visible en móvil -->
            <button @click="showNavPanel = !showNavPanel" class="btn-nav-toggle mobile-only">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span class="nav-count-badge">{{ answeredCount }}/{{ questions.length }}</span>
            </button>
          </div>
        </header>
        <div class="quiz-progress"><div class="progress-bar" :style="{ width: progressPercent + '%' }"></div></div>
        
        <!-- Layout 70/30 -->
        <div class="quiz-layout">
          <!-- LEFT: Question Area (70%) -->
          <main class="quiz-main">
            <div class="question-card" :key="currentQuestion.id">
              <div class="question-header">
                <span class="question-badge">Pregunta {{ currentIndex + 1 }}</span>
                <span v-if="currentQuestion.points" class="question-points">{{ currentQuestion.points }} pts</span>
              </div>
              <h2 class="question-text">{{ currentQuestion.question_text }}</h2>
              <p v-if="currentQuestion.help_text" class="question-help">{{ currentQuestion.help_text }}</p>
              <div class="answer-container">
                <input v-if="isType('TEXT')" type="text" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'Escribe aquí...'" class="input-text" @keyup.enter="nextQuestion"/>
                <textarea v-else-if="isType('TEXTAREA')" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'Escribe tu respuesta...'" class="input-textarea" rows="4"></textarea>
                <input v-else-if="isType('EMAIL')" type="email" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'correo@ejemplo.com'" class="input-text" @keyup.enter="nextQuestion"/>
                <input v-else-if="isType('NUMBER')" type="number" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || '0'" class="input-text" @keyup.enter="nextQuestion"/>
                <input v-else-if="isType('DATE')" type="date" v-model="answers[currentQuestion.id]" class="input-text"/>
                <div v-else-if="isType('RADIO') || isType('SINGLE_CHOICE')" class="options-list">
                  <button v-for="option in currentQuestion.options" :key="option.id" type="button" class="option-card" :class="{ selected: answers[currentQuestion.id] === option.id }" @click="selectRadio(currentQuestion.id, option.id)">
                    <span class="option-marker"><svg v-if="answers[currentQuestion.id] === option.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
                    <span class="option-label">{{ option.option_text }}</span>
                  </button>
                </div>
                <div v-else-if="isType('CHECKBOX') || isType('MULTIPLE_CHOICE')" class="options-list">
                  <button v-for="option in currentQuestion.options" :key="option.id" type="button" class="option-card checkbox" :class="{ selected: answers[currentQuestion.id]?.includes(option.id) }" @click="toggleCheckbox(currentQuestion.id, option.id)">
                    <span class="option-marker checkbox"><svg v-if="answers[currentQuestion.id]?.includes(option.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
                    <span class="option-label">{{ option.option_text }}</span>
                  </button>
                </div>
                <select v-else-if="isType('SELECT') || isType('DROPDOWN')" v-model="answers[currentQuestion.id]" class="input-select">
                  <option value="" disabled>Selecciona una opción</option>
                  <option v-for="option in currentQuestion.options" :key="option.id" :value="option.id">{{ option.option_text }}</option>
                </select>
                <div v-else-if="isType('TRUE_FALSE')" class="tf-options">
                  <button type="button" class="tf-btn" :class="{ selected: answers[currentQuestion.id] === true }" @click="answers[currentQuestion.id] = true"><span class="tf-marker">V</span>Verdadero</button>
                  <button type="button" class="tf-btn" :class="{ selected: answers[currentQuestion.id] === false }" @click="answers[currentQuestion.id] = false"><span class="tf-marker">F</span>Falso</button>
                </div>
                <div v-else-if="isType('RATING')" class="rating-container">
                  <button v-for="n in (currentQuestion.config?.max_stars || 5)" :key="n" type="button" class="star" :class="{ active: answers[currentQuestion.id] >= n }" @click="answers[currentQuestion.id] = n">
                    <svg width="32" height="32" viewBox="0 0 24 24" :fill="answers[currentQuestion.id] >= n ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                </div>
                <div v-else-if="isType('SCALE')" class="scale-container">
                  <div class="scale-labels"><span>{{ currentQuestion.config?.min_label || currentQuestion.config?.min || 1 }}</span><span>{{ currentQuestion.config?.max_label || currentQuestion.config?.max || 10 }}</span></div>
                  <div class="scale-buttons"><button v-for="n in getScaleRange(currentQuestion)" :key="n" type="button" class="scale-btn" :class="{ active: answers[currentQuestion.id] === n }" @click="answers[currentQuestion.id] = n">{{ n }}</button></div>
                </div>
                <label v-else-if="isType('FILE')" class="file-upload">
                  <input type="file" @change="handleFileChange($event, currentQuestion.id)" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>{{ answers[currentQuestion.id] || 'Selecciona archivo' }}</span>
                </label>
                <input v-else type="text" v-model="answers[currentQuestion.id]" :placeholder="currentQuestion.placeholder || 'Escribe aquí...'" class="input-text" @keyup.enter="nextQuestion"/>
              </div>
              <p v-if="currentError" class="error-field">{{ currentError }}</p>
            </div>
            <div class="question-nav">
              <button @click="goBack" class="nav-btn" :disabled="currentIndex === 0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>Anterior
              </button>
              <button @click="nextQuestion" class="nav-btn primary" :class="{ finish: isLastQuestion }" :disabled="submitting">
                <span v-if="submitting">Enviando...</span>
                <span v-else-if="isLastQuestion">Finalizar examen</span>
                <span v-else>Siguiente</span>
                <svg v-if="!submitting && !isLastQuestion" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                <svg v-if="!submitting && isLastQuestion" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </button>
            </div>
          </main>

          <!-- RIGHT: Navigation Sidebar (30%) - Visible en PC -->
          <aside class="quiz-sidebar desktop-only">
            <div class="sidebar-nav-header">
              <h3>Navegación</h3>
            </div>
            <div class="nav-legend">
              <span class="legend-item answered"><span class="dot"></span> Respondidas {{ answeredCount }}</span>
              <span class="legend-item pending"><span class="dot"></span> Sin responder {{ questions.length - answeredCount }}</span>
            </div>
            <div class="nav-grid">
              <button v-for="(q, idx) in questions" :key="q.id" class="nav-cell" :class="{ active: currentIndex === idx, answered: isAnswered(q.id) }" @click="goToQuestion(idx)">{{ idx + 1 }}</button>
            </div>

          </aside>

          <!-- Mobile Nav Panel (mantiene comportamiento anterior) -->
          <aside class="nav-panel mobile-panel" :class="{ open: showNavPanel }">
            <div class="nav-panel-header"><h3>Navegación</h3><button @click="showNavPanel = false" class="close-panel"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <div class="nav-legend"><span class="legend-item answered"><span class="dot"></span> Respondidas {{ answeredCount }}</span><span class="legend-item pending"><span class="dot"></span> Sin responder {{ questions.length - answeredCount }}</span></div>
            <div class="nav-grid"><button v-for="(q, idx) in questions" :key="q.id" class="nav-cell" :class="{ active: currentIndex === idx, answered: isAnswered(q.id) }" @click="goToQuestion(idx)">{{ idx + 1 }}</button></div>
          </aside>
          <div v-if="showNavPanel" class="nav-overlay" @click="showNavPanel = false"></div>
        </div>
      </div>

      <div v-else-if="!isExam" class="survey-result-screen">
        <div class="survey-result-card">
          <!-- Logo -->
          <div class="survey-logo-wrapper">
            <img src="@/assets/images/weonline.png" alt="WE Online" class="survey-result-logo" />
          </div>
          
          <!-- Success Animation -->
          <div class="success-badge">
            <div class="success-icon-wrapper">
              <svg class="success-check" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="success-rings">
              <span class="ring ring-1"></span>
              <span class="ring ring-2"></span>
            </div>
          </div>
          
          <!-- Content -->
          <div class="survey-result-content">
            <h1 class="survey-result-title">¡Gracias por tu respuesta!</h1>
            
            <p class="survey-result-message">
              {{ form.submit_message || 'Tu respuesta ha sido registrada correctamente.' }}
            </p>
          </div>
          
          <!-- Form Badge -->
          <div class="survey-form-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>{{ form.title }}</span>
          </div>
          
          <!-- Info Pills -->
          <div class="survey-info-pills">
            <div class="info-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{{ formatDate(new Date()) }}</span>
            </div>
            <div class="info-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>{{ questions.length }} respuestas</span>
            </div>
          </div>
          
          <!-- Divider -->
          <div class="survey-divider"></div>
          
          <!-- Action Button -->
          <button @click="goHome" class="btn-survey-home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Volver al inicio</span>
          </button>
          
          <!-- Footer Text -->
          <p class="survey-footer-text">
            Puedes cerrar esta ventana de forma segura
          </p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════
           PASO 3: RESULTADOS - Layout 70/30 con Puntuación Real
           ═══════════════════════════════════════════════════════════ -->
      <div v-else class="result-screen">
        <div class="result-layout">
          <!-- LEFT COLUMN (70%) - Score, Stats & Review -->
          <div class="result-left">
            <!-- Mobile Header with Back Button -->
            <div class="result-mobile-header">
              <button @click="scrollToReview" class="mobile-nav-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                Ver respuestas
              </button>
              <button @click="scrollToTop" class="mobile-nav-btn back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
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

              <!-- Score Display - Usa puntos si están disponibles -->
              <div class="score-main">
                <div class="score-number">
                  <span class="score-obtained">{{ displayScore }}</span>
                  <span class="score-separator">/</span>
                  <span class="score-total">{{ displayMaxScore }}</span>
                </div>
                <span class="score-label">{{ hasPointsSystem ? 'Puntos obtenidos' : 'Respuestas correctas' }}</span>
              </div>

              <!-- Stats Row -->
              <div class="score-stats">
                <div class="stat-box correct">
                  <span class="stat-num">{{ examResult?.correct_count || 0 }}</span>
                  <span class="stat-label">CORRECTAS</span>
                </div>
                <div class="stat-box wrong">
                  <span class="stat-num">{{ (examResult?.total_questions || 0) - (examResult?.correct_count || 0) }}</span>
                  <span class="stat-label">INCORRECTAS</span>
                </div>
                <div class="stat-box" v-if="hasPointsSystem">
                  <span class="stat-num">{{ examResult?.total_score || 0 }}</span>
                  <span class="stat-label">PUNTOS</span>
                </div>
                <div class="stat-box" v-else>
                  <span class="stat-num">{{ examResult?.total_questions || 0 }}</span>
                  <span class="stat-label">TOTAL</span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="score-progress">
                <div class="progress-track">
                  <div class="progress-fill" :class="{ passed: examResult?.passed }" :style="{ width: (examResult?.percentage || 0) + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="section-divider">
              <span class="divider-line"></span>
              <span class="divider-text">Revisión</span>
              <span class="divider-line"></span>
            </div>

            <!-- Answers Review -->
            <div v-if="isExam && examResult?.details?.length" class="review-section" ref="reviewSection">
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
                    <span v-if="currentReview.points" class="review-points">{{ currentReview.points }} pts</span>
                    <span class="review-status" :class="{ correct: currentReview.is_correct, wrong: currentReview.is_correct === false }">
                      {{ currentReview.is_correct ? 'Correcta' : currentReview.is_correct === false ? 'Incorrecta' : 'Sin calificar' }}
                    </span>
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
          </div>

          <!-- RIGHT COLUMN (30%) - Sidebar -->
          <div class="result-right" ref="sidebarSection">
            <div class="sidebar-logo"><img src="@/assets/images/weonline.png" alt="WE Online" /></div>
            <div v-if="odooStudent" class="sidebar-student">
              <div class="student-avatar-lg">{{ odooStudent.full_name.charAt(0) }}</div>
              <div class="student-details">
                <strong>{{ odooStudent.full_name }}</strong>
                <span>{{ odooStudent.email }}</span>
              </div>
            </div>
            <div class="sidebar-exam">
              <h4>{{ form.title }}</h4>
              <div class="exam-details">
                <div class="detail-row"><span class="detail-label">Fecha</span><span class="detail-value">{{ formatDate(new Date()) }}</span></div>
                <div class="detail-row" v-if="hasPointsSystem">
                  <span class="detail-label">Puntaje</span>
                  <span class="detail-value">{{ examResult?.total_score || 0 }} / {{ examResult?.max_score || 0 }} pts</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Aciertos</span>
                  <span class="detail-value">{{ examResult?.correct_count || 0 }} / {{ examResult?.total_questions || 0 }}</span>
                </div>
                <div class="detail-row" v-if="examResult?.passing_score">
                  <span class="detail-label">Nota mínima</span>
                  <span class="detail-value">11 ({{ examResult.passing_score }}%)</span>
                </div>
              </div>
            </div>
            <div v-if="examResult?.odoo?.pdf_url" class="sidebar-certificate">
              <div class="cert-header">
                <span class="cert-icon">🎓</span>
                <div class="cert-text"><strong>¡Certificado disponible!</strong><span>Escanea el QR o descarga</span></div>
              </div>
              <div class="cert-qr"><canvas ref="qrCanvas" class="qr-canvas"></canvas></div>
            </div>
            <div class="sidebar-actions">
              <a v-if="examResult?.odoo?.pdf_url" :href="examResult.odoo.pdf_url" target="_blank" class="action-btn pdf">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Certificado oficial (PDF)
              </a>
              <button @click="downloadTicket" class="action-btn download">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar constancia
              </button>
              <button @click="shareLinkedIn" class="action-btn linkedin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Compartir en LinkedIn
              </button>
            </div>
            <div class="sidebar-footer"><span>Educación Ejecutiva</span></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import formService from '@/services/form.service'
import responseService from '@/services/response.service'

const route = useRoute()

// State
const form = ref(null)
const questions = ref([])
const loading = ref(true)
const error = ref(null)
const started = ref(false)
const submitted = ref(false)
const submitting = ref(false)
const answers = reactive({})
const errors = reactive({})
const currentIndex = ref(0)
const examResult = ref(null)
const timeRemaining = ref(0)
const timerInterval = ref(null)
const reviewIndex = ref(0)
const showNavPanel = ref(false)

// Odoo State
const requiresOdooValidation = ref(false)
const odooValidated = ref(false)
const odooStudent = ref(null)
const odooEmail = ref('')
const odooError = ref('')
const validatingOdoo = ref(false)

// Refs
const qrCanvas = ref(null)
const reviewSection = ref(null)
const sidebarSection = ref(null)

// Computed - Básicos
const isExam = computed(() => form.value?.form_type === 'EXAM')
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const currentError = computed(() => errors[currentQuestion.value?.id])
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)
const progressPercent = computed(() => questions.value.length ? Math.round(((currentIndex.value + 1) / questions.value.length) * 100) : 0)
const currentReview = computed(() => examResult.value?.details?.[reviewIndex.value] || null)
const answeredCount = computed(() => questions.value.filter(q => isAnswered(q.id)).length)
const allAnswered = computed(() => answeredCount.value === questions.value.length)


function goHome() {
  window.location.href = '/'
}
// ═══════════════════════════════════════════════════════════════
// COMPUTED - Sistema de Puntuación
// ═══════════════════════════════════════════════════════════════

// Calcula el máximo puntaje basado en los puntos de cada pregunta
const calculatedMaxScore = computed(() => {
  const totalPoints = questions.value.reduce((sum, q) => sum + (q.points || 1), 0)
  return totalPoints
})

// Determina si el sistema usa puntos (cuando max_score > total_questions)
const hasPointsSystem = computed(() => {
  if (examResult.value) {
    return (examResult.value.max_score || 0) > (examResult.value.total_questions || 0)
  }
  return calculatedMaxScore.value > questions.value.length
})

// Score a mostrar (puntos o correctas)
const displayScore = computed(() => {
  if (hasPointsSystem.value) {
    return examResult.value?.total_score || 0
  }
  return examResult.value?.correct_count || 0
})

// Max score a mostrar
const displayMaxScore = computed(() => {
  if (hasPointsSystem.value) {
    return examResult.value?.max_score || calculatedMaxScore.value
  }
  return examResult.value?.total_questions || questions.value.length
})

// Calcula nota mínima para aprobar
const calculatedMinScore = computed(() => {
  if (!form.value?.passing_score) return 0
  const max = hasPointsSystem.value ? calculatedMaxScore.value : questions.value.length
  return Math.round(form.value.passing_score * max / 100)
})

// Nota mínima basada en resultados
const calculatedMinScoreResult = computed(() => {
  if (!examResult.value?.passing_score) return 0
  const max = displayMaxScore.value
  return Math.round(examResult.value.passing_score * max / 100)
})

// Timer
const timerPercent = computed(() => form.value?.time_limit_minutes ? (timeRemaining.value / (form.value.time_limit_minutes * 60)) * 100 : 100)
const timerWarning = computed(() => form.value?.time_limit_minutes && timerPercent.value <= 25 && timerPercent.value > 10)
const timerCritical = computed(() => form.value?.time_limit_minutes && timerPercent.value <= 10)
const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
})

// Methods
function isAnswered(qid) {
  const a = answers[qid]
  return a !== null && a !== undefined && a !== '' && a !== 0 && !(Array.isArray(a) && !a.length)
}

function isType(type) {
  const t = currentQuestion.value.type || currentQuestion.value.type_code || currentQuestion.value.question_type || ''
  return t.toUpperCase() === type
}

function getScaleRange(q) {
  const min = q.config?.min || 1
  const max = q.config?.max || 10
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function goToQuestion(idx) { currentIndex.value = idx; showNavPanel.value = false }
function scrollToReview() { reviewSection.value?.scrollIntoView({ behavior: 'smooth' }) }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

async function validateOdooEmail() {
  if (!odooEmail.value) return
  validatingOdoo.value = true
  odooError.value = ''
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const res = await fetch(`${API_URL}/public/validate-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: odooEmail.value.trim().toLowerCase(), form_uuid: form.value.uuid })
    })
    const data = await res.json()
    if (!data.ok) { odooError.value = data.error || 'Error al validar'; return }
    if (data.validated && data.student) { odooValidated.value = true; odooStudent.value = data.student }
    else { odooValidated.value = true }
  } catch (err) { odooError.value = 'Error de conexión. Intenta de nuevo.' }
  finally { validatingOdoo.value = false }
}

async function loadForm() {
  try {
    loading.value = true
    const uuid = route.params.uuid
    if (!uuid) { error.value = 'URL inválida'; return }
    const res = await formService.getPublic(uuid)
    let formData, questionsData = []
    if (res.data?.ok && res.data?.data) { formData = res.data.data.form; questionsData = res.data.data.questions || [] }
    else if (res.data?.data) { formData = res.data.data.form || res.data.data; questionsData = res.data.data.questions || [] }
    else if (res.data?.form) { formData = res.data.form; questionsData = res.data.questions || [] }
    else throw new Error('Respuesta inválida')
    
    form.value = formData
    requiresOdooValidation.value = !!formData.requires_odoo_validation
    if (formData.shuffle_questions) questionsData = questionsData.sort(() => Math.random() - 0.5)
    questions.value = questionsData
    
    questionsData.forEach(q => {
      const t = (q.type || q.type_code || q.question_type || '').toUpperCase()
      if (t === 'CHECKBOX' || t === 'MULTIPLE_CHOICE') answers[q.id] = []
      else if (t === 'RATING') answers[q.id] = 0
      else answers[q.id] = null
    })
    if (!requiresOdooValidation.value && !formData.welcome_message) { started.value = true; startTimer() }
  } catch (e) { error.value = e.response?.data?.error || e.message || 'Error al cargar' }
  finally { loading.value = false }
}

function startForm() { started.value = true; startTimer() }

function startTimer() {
  if (!isExam.value || !form.value?.time_limit_minutes) return
  timeRemaining.value = form.value.time_limit_minutes * 60
  timerInterval.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) { clearInterval(timerInterval.value); submitForm(true) }
  }, 1000)
}

function selectRadio(qid, oid) { answers[qid] = oid; delete errors[qid] }
function toggleCheckbox(qid, oid) {
  if (!answers[qid]) answers[qid] = []
  const i = answers[qid].indexOf(oid)
  i > -1 ? answers[qid].splice(i, 1) : answers[qid].push(oid)
  delete errors[qid]
}

function validateCurrent() {
  const q = currentQuestion.value
  if (!q.is_required && !isExam.value) return true
  const a = answers[q.id]
  const empty = a === null || a === undefined || a === '' || a === 0 || (Array.isArray(a) && !a.length)
  if (empty && isExam.value) { errors[q.id] = 'Debes responder esta pregunta'; return false }
  if (empty && q.is_required) { errors[q.id] = 'Campo requerido'; return false }
  delete errors[q.id]
  return true
}

function goBack() { if (currentIndex.value > 0) currentIndex.value-- }
function nextQuestion() { if (validateCurrent()) isLastQuestion.value ? submitForm() : currentIndex.value++ }

async function submitForm(auto = false) {
  if (!auto && !validateAll()) return
  submitting.value = true
  if (timerInterval.value) clearInterval(timerInterval.value)
  try {
    const formatted = questions.value.map(q => ({ question_id: q.id, answer_value: answers[q.id] }))
    const timeSpent = form.value.time_limit_minutes ? (form.value.time_limit_minutes * 60) - timeRemaining.value : null
    const payload = {
      form_uuid: form.value.uuid,
      answers: formatted,
      time_spent: timeSpent,
      respondent_email: odooStudent.value?.email || null,
      respondent_name: odooStudent.value?.full_name || null
    }
    if (odooValidated.value && odooStudent.value) {
      payload.odoo_partner_id = odooStudent.value.partner_id
      payload.odoo_student_names = odooStudent.value.names
      payload.odoo_student_surnames = odooStudent.value.surnames
    }
    const res = await responseService.submit(payload)
    if (isExam.value && res.data?.data) {
      const data = res.data.data
      examResult.value = {
        percentage: data.score || 0,
        passed: data.passed,
        correct_count: data.correct_count || 0,
        total_questions: data.total_questions || questions.value.length,
        total_score: data.total_score || 0,
        max_score: data.max_score || calculatedMaxScore.value,
        passing_score: data.passing_score,
        details: data.details || [],
        odoo: data.odoo || null
      }
    }
    submitted.value = true
    await nextTick()
    generateQR()
  } catch (e) { alert(auto ? 'Tiempo agotado. Error al enviar.' : 'Error al enviar.') }
  finally { submitting.value = false }
}

function validateAll() {
  let ok = true
  questions.value.forEach((q, i) => {
    const a = answers[q.id]
    const empty = a === null || a === undefined || a === '' || a === 0 || (Array.isArray(a) && !a.length)
    if ((isExam.value || q.is_required) && empty) { errors[q.id] = 'Campo requerido'; if (ok) currentIndex.value = i; ok = false }
  })
  return ok
}

function handleFileChange(e, qid) { const f = e.target.files[0]; if (f) answers[qid] = f.name }

async function generateQR() {
  if (!examResult.value?.odoo?.pdf_url || !qrCanvas.value) return
  try { await QRCode.toCanvas(qrCanvas.value, examResult.value.odoo.pdf_url, { width: 120, margin: 2, color: { dark: '#000F5A', light: '#ffffff' } }) }
  catch (err) { console.error('QR error:', err) }
}

function downloadTicket() {
  const result = examResult.value
  const student = odooStudent.value
  const scoreDisplay = hasPointsSystem.value ? `${result?.total_score||0}/${result?.max_score||0} pts` : `${result?.correct_count||0}/${result?.total_questions||0}`
  const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Constancia</title><style>@page{size:80mm 240mm;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;width:80mm;padding:8mm;background:#fff}.ticket{text-align:center}.logo{font-size:18px;font-weight:bold;color:#000F5A;margin-bottom:4mm;letter-spacing:2px}.title{font-size:10px;color:#666;margin-bottom:6mm;border-bottom:1px dashed #ccc;padding-bottom:4mm;text-transform:uppercase;letter-spacing:1px}.exam-name{font-size:12px;font-weight:600;color:#000F5A;margin-bottom:6mm;line-height:1.4}.student-name{font-size:11px;color:#333;margin-bottom:6mm;padding:3mm;background:#f5f5f5;border-radius:2mm}.score-box{background:${result?.passed?'#ecfdf5':'#fef2f2'};padding:6mm;border-radius:3mm;margin-bottom:5mm}.score{font-size:28px;font-weight:bold;color:${result?.passed?'#059669':'#dc2626'}}.status{font-size:11px;font-weight:600;color:${result?.passed?'#059669':'#dc2626'};margin-top:2mm;text-transform:uppercase;letter-spacing:1px}.details{text-align:left;font-size:10px;color:#333;margin:5mm 0;border-top:1px dashed #ccc;border-bottom:1px dashed #ccc;padding:4mm 0}.row{display:flex;justify-content:space-between;margin:2mm 0}.row .label{color:#666}.row .value{font-weight:600}.footer{font-size:8px;color:#999;margin-top:5mm}.barcode{font-family:monospace;font-size:9px;letter-spacing:3px;margin-top:3mm;color:#333}</style></head><body><div class="ticket"><div class="logo">W | E</div><div class="title">Constancia de Evaluación</div><div class="exam-name">${form.value.title}</div>${student?`<div class="student-name">${student.full_name}</div>`:''}<div class="score-box"><div class="score">${scoreDisplay}</div><div class="status">${result?.passed?'APROBADO':'NO APROBADO'}</div></div><div class="details"><div class="row"><span class="label">Correctas:</span><span class="value">${result?.correct_count||0} de ${result?.total_questions||0}</span></div>${hasPointsSystem.value?`<div class="row"><span class="label">Puntos:</span><span class="value">${result?.total_score||0} de ${result?.max_score||0}</span></div>`:''}<div class="row"><span class="label">Porcentaje:</span><span class="value">${result?.percentage||0}%</span></div><div class="row"><span class="label">Fecha:</span><span class="value">${formatDate(new Date())}</span></div></div><div class="footer">WE | Educación Ejecutiva<br>www.weonline.pe</div><div class="barcode">■■■ ${Date.now().toString(36).toUpperCase()} ■■■</div></div></body></html>`
  const win = window.open('', '_blank', 'width=320,height=700')
  win.document.write(content)
  win.document.close()
  setTimeout(() => win.print(), 300)
}

async function shareLinkedIn() {
  const result = examResult.value
  const student = odooStudent.value
  const timestamp = new Date().toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const scoreText = hasPointsSystem.value ? `${result?.total_score||0}/${result?.max_score||0} puntos` : `${result?.correct_count||0}/${result?.total_questions||0}`
  let postText = `🎓 ¡Completé la evaluación "${form.value.title}"!\n\n📊 Resultado: ${scoreText} (${result?.percentage||0}%) ${result?.passed ? '✅ APROBADO' : ''}\n\n`
  if (student?.full_name) postText += `👤 ${student.full_name}\n\n`
  postText += `Gracias a @WE Online por esta oportunidad.\n\n📅 ${timestamp}\n\n#WEOnline #EducaciónEjecutiva #Certificación`
  const imageBlob = await generateCertificateImage()
  if (!imageBlob) { alert('Error al generar imagen'); return }
  const examData = { title: form.value.title, percentage: result?.percentage || 0, passed: result?.passed, correct: result?.correct_count || 0, total: result?.total_questions || 0, totalScore: result?.total_score || 0, maxScore: result?.max_score || 0, formUuid: form.value.uuid, studentName: student?.full_name || '', certificateId: result?.odoo?.certificate_id || null, pdfUrl: result?.odoo?.pdf_url || null, returnUrl: window.location.pathname }
  localStorage.setItem('linkedin_exam_data', JSON.stringify(examData))
  localStorage.setItem('linkedin_post_text', postText)
  const reader = new FileReader()
  reader.readAsDataURL(imageBlob)
  reader.onloadend = async () => {
    localStorage.setItem('linkedin_certificate_image', reader.result.split(',')[1])
    const state = btoa(JSON.stringify({ formUuid: form.value.uuid, ts: Date.now() }))
    const clientId = '78grbv4vc7hu8f'
    const redirectUri = encodeURIComponent(`${window.location.origin}/linkedin/callback`)
    const scope = encodeURIComponent('openid profile email w_member_social')
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}&scope=${scope}`
  }
}

async function generateCertificateImage() {
  const result = examResult.value
  const student = odooStudent.value
  const scoreText = hasPointsSystem.value ? `${result?.total_score||0}/${result?.max_score||0}` : `${result?.correct_count||0}/${result?.total_questions||0}`
  const scoreLabel = hasPointsSystem.value ? 'puntos' : 'respuestas correctas'
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = `<div style="width:600px;padding:40px;background:linear-gradient(135deg,#000F5A 0%,#0499D5 100%);border-radius:16px;font-family:'Segoe UI',Arial,sans-serif;color:white;text-align:center;"><div style="font-size:28px;font-weight:bold;letter-spacing:4px;margin-bottom:8px;">W | E</div><div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;opacity:0.9;margin-bottom:24px;">Constancia de Evaluación</div><div style="font-size:18px;font-weight:600;margin-bottom:32px;line-height:1.4;">${form.value.title}</div>${student?`<div style="font-size:14px;opacity:0.9;margin-bottom:24px;">${student.full_name}</div>`:''}<div style="background:rgba(255,255,255,0.2);padding:24px 40px;border-radius:12px;display:inline-block;margin-bottom:24px;"><div style="font-size:64px;font-weight:700;line-height:1;">${scoreText}</div><div style="font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-top:8px;">${result?.passed?'APROBADO':'NO APROBADO'}</div></div><div style="font-size:14px;opacity:0.9;">${result?.percentage||0}% - ${scoreLabel}</div><div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.2);font-size:12px;opacity:0.8;">${formatDate(new Date())} • WE | Educación Ejecutiva</div></div>`
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  document.body.appendChild(tempDiv)
  try {
    const canvas = await html2canvas(tempDiv.firstElementChild, { scale: 2, backgroundColor: null, logging: false })
    document.body.removeChild(tempDiv)
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png', 1.0))
  } catch (err) { document.body.removeChild(tempDiv); return null }
}

onMounted(() => loadForm())
onUnmounted(() => { if (timerInterval.value) clearInterval(timerInterval.value) })

watch(answers, () => {
  if (errors[currentQuestion.value?.id]) {
    const a = answers[currentQuestion.value.id]
    if (a !== null && a !== undefined && a !== '' && a !== 0) delete errors[currentQuestion.value.id]
  }
}, { deep: true })
</script>

<style scoped>
/* ========== SURVEY RESULT SCREEN ========== */
.survey-result-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

/* Background decoration */
.survey-result-screen::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(4, 153, 213, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.survey-result-screen::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 15, 90, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* ========== CARD ========== */
.survey-result-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  box-shadow: 
    0 4px 6px -1px rgba(0, 15, 90, 0.05),
    0 10px 15px -3px rgba(0, 15, 90, 0.08),
    0 20px 25px -5px rgba(0, 15, 90, 0.05);
  position: relative;
  z-index: 1;
  animation: cardEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========== LOGO ========== */
.survey-logo-wrapper {
  margin-bottom: 32px;
}

.survey-result-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

/* ========== SUCCESS BADGE ========== */
.success-badge {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 28px;
}

.success-icon-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  z-index: 2;
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.success-check {
  color: #ffffff;
  animation: checkDraw 0.4s ease-out 0.5s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes checkDraw {
  from {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  to {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
}

/* Animated rings */
.success-rings {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid #10b981;
  border-radius: 50%;
  animation: ringPulse 2s ease-out infinite;
}

.ring-1 {
  animation-delay: 0.6s;
}

.ring-2 {
  animation-delay: 1s;
}

@keyframes ringPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* ========== CONTENT ========== */
.survey-result-content {
  margin-bottom: 24px;
}

.survey-result-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.3;
}

.survey-result-message {
  margin: 0;
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
}

/* ========== FORM BADGE ========== */
.survey-form-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #000F5A 0%, #001a7a 100%);
  border-radius: 100px;
  margin-bottom: 20px;
}

.survey-form-badge svg {
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.survey-form-badge span {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

/* ========== INFO PILLS ========== */
.survey-info-pills {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
}

.info-pill svg {
  color: #94a3b8;
  flex-shrink: 0;
}

/* ========== DIVIDER ========== */
.survey-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin-bottom: 28px;
}

/* ========== BUTTON ========== */
.btn-survey-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-survey-home:hover {
  background: #f8fafc;
  border-color: #0499D5;
  color: #0499D5;
}

.btn-survey-home:active {
  transform: scale(0.98);
}

.btn-survey-home svg {
  transition: transform 0.2s ease;
}

.btn-survey-home:hover svg {
  transform: translateY(-1px);
}

/* ========== FOOTER TEXT ========== */
.survey-footer-text {
  margin: 20px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 520px) {
  .survey-result-screen {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }
  
  .survey-result-card {
    padding: 36px 24px;
    border-radius: 20px;
  }
  
  .survey-result-logo {
    height: 32px;
  }
  
  .success-badge {
    width: 70px;
    height: 70px;
  }
  
  .success-icon-wrapper svg {
    width: 28px;
    height: 28px;
  }
  
  .survey-result-title {
    font-size: 20px;
  }
  
  .survey-result-message {
    font-size: 14px;
  }
  
  .survey-form-badge {
    padding: 8px 14px;
  }
  
  .survey-form-badge span {
    font-size: 12px;
    max-width: 200px;
  }
  
  .info-pill {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .btn-survey-home {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>

<style scoped>
/* ════════════════════════════════════════════════════════════════
   VARIABLES
   ════════════════════════════════════════════════════════════════ */
.form-view {
  --blue: #000F5A;
  --celeste: #0499D5;
  --gray: #EEEEEE;
  --gray-light: #F8F9FA;
  --white: #FFFFFF;
  --text: #1a1a2e;
  --text-light: #64748b;
  --text-muted: #94a3b8;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --border: #e2e8f0;
  --radius: 12px;
  --shadow: 0 4px 20px rgba(0, 15, 90, 0.08);
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--white);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text);
}

/* ════════════════════════════════════════════════════════════════
   COMMON
   ════════════════════════════════════════════════════════════════ */
.brand-logo { height: 36px; margin-bottom: 20px; }
.btn-loader { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* State, Validation, Welcome - (condensed) */
.state-screen { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; }
.loader { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
.state-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.state-icon.error { background: #fef2f2; color: var(--danger); }
.state-title { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
.state-text { font-size: 14px; color: var(--text-light); margin: 0; }

.validation-screen, .welcome-screen { min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--gray-light); }
.validation-card, .welcome-card { background: var(--white); border-radius: 20px; padding: 40px 32px; max-width: 420px; width: 100%; text-align: center; box-shadow: var(--shadow); }
.validation-title, .welcome-title { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: var(--blue); }
.validation-subtitle, .welcome-desc { font-size: 14px; color: var(--text-light); margin: 0 0 24px; }
.validation-form { text-align: left; }
.input-group { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 2px solid var(--border); border-radius: var(--radius); margin-bottom: 16px; transition: border-color 0.2s; }
.input-group:focus-within { border-color: var(--celeste); }
.input-group svg { color: var(--text-muted); flex-shrink: 0; }
.input-group input { flex: 1; border: none; outline: none; font-size: 15px; color: var(--text); background: transparent; }
.error-msg { display: flex; align-items: center; gap: 8px; padding: 12px; background: #fef2f2; border-radius: 8px; color: var(--danger); font-size: 13px; margin-bottom: 16px; }
.btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 24px; background: var(--blue); color: var(--white); border: none; border-radius: var(--radius); font-size: 15px; font-weight: 600; cursor: pointer; }
.btn-primary:hover:not(:disabled) { background: #001a7a; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.help-text { margin-top: 20px; font-size: 13px; color: var(--text-light); }
.help-text a { color: var(--celeste); font-weight: 600; text-decoration: none; }
.student-card { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius); margin-bottom: 20px; text-align: left; }
.student-avatar { width: 40px; height: 40px; background: var(--blue); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 16px; flex-shrink: 0; }
.student-data { flex: 1; min-width: 0; }
.student-data strong { display: block; font-size: 14px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.student-data span { font-size: 12px; color: var(--text-light); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.welcome-msg { font-size: 14px; line-height: 1.7; color: var(--text-light); margin: 0 0 24px; padding: 16px; background: var(--gray); border-radius: var(--radius); text-align: left; }
.exam-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 24px; }
.info-chip { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fef3c7; border-radius: 100px; font-size: 12px; font-weight: 500; color: #92400e; }
.btn-start { display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: var(--blue); color: white; border: none; border-radius: var(--radius); font-size: 16px; font-weight: 600; cursor: pointer; }
.btn-start:hover { background: #001a7a; }

/* ════════════════════════════════════════════════════════════════
   QUIZ SCREEN
   ════════════════════════════════════════════════════════════════ */
.quiz-screen { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; background: var(--gray-light); }
.quiz-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-logo { height: 28px; }
.header-title { font-size: 14px; font-weight: 600; color: var(--text); display: none; }
.header-right { display: flex; align-items: center; gap: 12px; }
.timer { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--blue); color: white; border-radius: 8px; font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; }
.timer.warning { background: var(--warning); }
.timer.critical { background: var(--danger); animation: pulse 0.5s infinite; }
@keyframes pulse { 50% { opacity: 0.7; } }
.btn-nav-toggle { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--gray); border: none; border-radius: 8px; color: var(--text); font-size: 13px; font-weight: 600; cursor: pointer; }
.nav-count-badge { background: var(--celeste); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.quiz-progress { height: 4px; background: var(--border); }
.quiz-progress .progress-bar { height: 100%; background: var(--celeste); transition: width 0.3s ease; }

/* Quiz Layout 70/30 */
.quiz-layout { flex: 1; display: flex; position: relative; }
.quiz-main { flex: 1; display: flex; flex-direction: column; padding: 24px 16px; max-width: 700px; margin: 0 auto; width: 100%; }

/* Mobile/Desktop visibility */
.mobile-only { display: flex; }
.desktop-only { display: none; }

/* Desktop Sidebar */
.quiz-sidebar { display: none; }

/* Mobile Panel */
.nav-panel.mobile-panel { display: flex; }
.question-card { flex: 1; background: var(--white); border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.question-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.question-badge { font-size: 12px; font-weight: 700; color: var(--celeste); background: rgba(4, 153, 213, 0.1); padding: 6px 14px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.question-points { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.question-text { font-size: 18px; font-weight: 600; line-height: 1.5; margin: 0 0 8px; color: var(--blue); }
.question-help { font-size: 13px; color: var(--text-muted); margin: 0 0 20px; }
.answer-container { margin-top: 20px; }
.input-text, .input-textarea, .input-select { width: 100%; padding: 14px 16px; font-size: 15px; color: var(--text); background: var(--white); border: 2px solid var(--border); border-radius: 10px; transition: border-color 0.2s; }
.input-text:focus, .input-textarea:focus, .input-select:focus { outline: none; border-color: var(--celeste); }
.input-textarea { resize: none; min-height: 100px; }
.input-select { appearance: none; cursor: pointer; }
.options-list { display: flex; flex-direction: column; gap: 10px; }
.option-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--white); border: 2px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.15s; text-align: left; }
.option-card:hover { border-color: var(--celeste); background: rgba(4, 153, 213, 0.02); }
.option-card.selected { border-color: var(--celeste); background: rgba(4, 153, 213, 0.06); }
.option-marker { width: 24px; height: 24px; border: 2px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
.option-marker.checkbox { border-radius: 6px; }
.option-card.selected .option-marker { background: var(--celeste); border-color: var(--celeste); color: white; }
.option-label { flex: 1; font-size: 15px; color: var(--text); line-height: 1.4; }
.tf-options { display: flex; gap: 12px; }
.tf-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; background: var(--white); border: 2px solid var(--border); border-radius: 10px; font-size: 15px; font-weight: 500; color: var(--text); cursor: pointer; transition: all 0.15s; }
.tf-btn:hover { border-color: var(--celeste); }
.tf-btn.selected { border-color: var(--celeste); background: rgba(4, 153, 213, 0.06); }
.tf-marker { width: 32px; height: 32px; background: var(--gray); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--text-light); }
.tf-btn.selected .tf-marker { background: var(--celeste); color: white; }
.rating-container { display: flex; justify-content: center; gap: 8px; }
.star { background: none; border: none; padding: 4px; color: var(--border); cursor: pointer; transition: all 0.15s; }
.star:hover, .star.active { color: #fbbf24; transform: scale(1.1); }
.scale-labels { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
.scale-buttons { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.scale-btn { width: 40px; height: 40px; border: 2px solid var(--border); border-radius: 8px; background: var(--white); font-size: 13px; font-weight: 600; color: var(--text-light); cursor: pointer; transition: all 0.15s; }
.scale-btn:hover { border-color: var(--celeste); color: var(--celeste); }
.scale-btn.active { background: var(--celeste); border-color: var(--celeste); color: white; }
.file-upload { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px; border: 2px dashed var(--border); border-radius: 10px; color: var(--text-muted); font-size: 14px; cursor: pointer; }
.file-upload:hover { border-color: var(--celeste); color: var(--celeste); }
.file-upload input { display: none; }
.error-field { margin-top: 12px; font-size: 13px; color: var(--danger); }
.question-nav { display: flex; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
.nav-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; border: 2px solid var(--border); border-radius: 10px; background: var(--white); font-size: 14px; font-weight: 600; color: var(--text-light); cursor: pointer; transition: all 0.15s; }
.nav-btn:hover:not(:disabled) { border-color: var(--text-light); color: var(--text); }
.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.nav-btn.primary { flex: 1; background: var(--celeste); border-color: var(--celeste); color: white; }
.nav-btn.primary:hover:not(:disabled) { background: #0380b8; border-color: #0380b8; }
.nav-btn.finish { background: var(--success); border-color: var(--success); }
.nav-btn.finish:hover:not(:disabled) { background: #059669; border-color: #059669; }
.nav-panel { position: fixed; top: 0; right: -320px; width: 300px; height: 100%; background: var(--white); box-shadow: -4px 0 20px rgba(0,0,0,0.1); z-index: 200; display: flex; flex-direction: column; transition: right 0.3s ease; }
.nav-panel.open { right: 0; }
.nav-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.nav-panel-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text); }
.close-panel { background: none; border: none; padding: 4px; color: var(--text-light); cursor: pointer; }
.nav-legend { display: flex; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-light); }
.legend-item .dot { width: 10px; height: 10px; border-radius: 3px; }
.legend-item.answered .dot { background: var(--celeste); }
.legend-item.pending .dot { background: var(--border); }
.nav-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; padding: 20px; flex: 1; overflow-y: auto; align-content: start; }
.nav-cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: var(--gray); border: 2px solid transparent; border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--text-light); cursor: pointer; transition: all 0.15s; }
.nav-cell:hover { border-color: var(--celeste); }
.nav-cell.active { border-color: var(--blue); background: var(--blue); color: white; }
.nav-cell.answered { background: var(--celeste); color: white; }
.nav-cell.answered.active { background: var(--blue); }
.btn-finish-panel { margin: 16px 20px 20px; padding: 14px; background: var(--success); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-finish-panel:hover:not(:disabled) { background: #059669; }
.btn-finish-panel:disabled { opacity: 0.6; }
.nav-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 150; }

/* ════════════════════════════════════════════════════════════════
   RESULT SCREEN - Layout 70/30
   ════════════════════════════════════════════════════════════════ */
.result-screen { min-height: 100vh; min-height: 100dvh; background: var(--gray-light); }
.result-layout { display: flex; flex-direction: column; min-height: 100vh; }

/* Mobile Header con navegación */
.result-mobile-header { display: flex; justify-content: space-between; padding: 12px 16px; background: var(--white); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; }
.mobile-nav-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--gray); border: none; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text); cursor: pointer; }
.mobile-nav-btn:hover { background: var(--border); }
.mobile-nav-btn.back { background: var(--blue); color: white; }
.mobile-nav-btn.back:hover { background: #001a7a; }

/* LEFT COLUMN */
.result-left { flex: 1; padding: 20px; background: var(--white); }

/* Score Card */
.score-card { max-width: 500px; margin: 0 auto; text-align: center; padding: 20px 16px; }
.score-card.passed .score-status { color: var(--success); }
.score-card:not(.passed) .score-status { color: var(--danger); }
.score-status { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; }
.status-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.score-card.passed .status-icon { background: #d1fae5; color: var(--success); }
.score-card:not(.passed) .status-icon { background: #fee2e2; color: var(--danger); }
.status-text { font-size: 18px; font-weight: 700; }
.score-main { margin-bottom: 20px; }
.score-number { display: flex; align-items: baseline; justify-content: center; gap: 4px; margin-bottom: 6px; }
.score-obtained { font-size: 56px; font-weight: 800; color: var(--blue); line-height: 1; }
.score-separator { font-size: 32px; font-weight: 300; color: var(--text-muted); }
.score-total { font-size: 32px; font-weight: 600; color: var(--text-muted); }
.score-label { font-size: 13px; color: var(--text-light); }
.score-stats { display: flex; justify-content: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.stat-box { text-align: center; padding: 12px 16px; background: var(--gray-light); border-radius: 10px; min-width: 80px; }
.stat-box.correct .stat-num { color: var(--success); }
.stat-box.wrong .stat-num { color: var(--danger); }
.stat-num { display: block; font-size: 22px; font-weight: 700; line-height: 1.2; color: var(--text); }
.stat-label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; display: block; }
.score-progress { position: relative; max-width: 400px; margin: 0 auto 20px; }
.progress-track { height: 10px; background: var(--gray); border-radius: 5px; overflow: visible; }
.progress-fill { height: 100%; background: var(--danger); border-radius: 5px; transition: width 0.8s ease; }
.progress-fill.passed { background: var(--celeste); }
.passing-marker { position: absolute; top: 0; transform: translateX(-50%); }
.marker-line { display: block; width: 3px; height: 20px; background: var(--blue); margin: 0 auto; border-radius: 2px; }
.min-score-wrapper { text-align: center; }
.min-score-compact { 
  display: inline-flex; 
  align-items: center; 
  gap: 10px; 
  padding: 10px 20px; 
  background: var(--blue); 
  border-radius: 50px; 
}
.min-compact-label { font-size: 12px; color: rgba(255,255,255,0.85); font-weight: 500; }
.min-compact-number { font-size: 24px; font-weight: 800; color: var(--white); line-height: 1; }

/* Section Divider */
.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 32px auto 24px;
  max-width: 500px;
  padding: 0 16px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}
.divider-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  white-space: nowrap;
}

/* Review Section */
.review-section { max-width: 500px; margin: 0 auto; padding: 0 16px 32px; }
.review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.review-header h3 { margin: 0; font-size: 18px; font-weight: 600; color: var(--text); }
.review-summary { display: flex; gap: 16px; font-size: 13px; font-weight: 500; }
.summary-correct { color: var(--success); }
.summary-wrong { color: var(--danger); }
.review-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.pill { width: 36px; height: 36px; border: 2px solid var(--border); border-radius: 8px; background: var(--white); font-size: 13px; font-weight: 600; color: var(--text-light); cursor: pointer; transition: all 0.15s; }
.pill:hover { border-color: var(--celeste); }
.pill.active { border-color: var(--blue); background: var(--blue); color: white; }
.pill.correct { border-color: var(--success); background: #ecfdf5; color: var(--success); }
.pill.correct.active { background: var(--success); color: white; }
.pill.wrong { border-color: var(--danger); background: #fef2f2; color: var(--danger); }
.pill.wrong.active { background: var(--danger); color: white; }
.review-card { background: var(--gray-light); border-radius: 16px; padding: 24px; }
.review-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.review-number { font-size: 13px; font-weight: 700; color: var(--celeste); text-transform: uppercase; letter-spacing: 0.5px; }
.review-meta { display: flex; align-items: center; gap: 10px; }
.review-points { font-size: 11px; font-weight: 600; padding: 4px 10px; background: #fef3c7; border-radius: 6px; color: #92400e; }
.review-status { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.review-status.correct { background: #d1fae5; color: var(--success); }
.review-status.wrong { background: #fee2e2; color: var(--danger); }
.review-question { font-size: 16px; font-weight: 500; color: var(--text); margin: 0 0 20px; line-height: 1.6; }
.review-answers { display: flex; flex-direction: column; gap: 12px; }
.review-answer { padding: 16px; background: var(--white); border-radius: 10px; border-left: 4px solid var(--border); }
.review-answer.user.wrong { border-left-color: var(--danger); }
.review-answer.correct { background: #ecfdf5; border-left-color: var(--success); }
.answer-label { display: block; font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.answer-text { font-size: 15px; color: var(--text); line-height: 1.5; }
.review-answer.correct .answer-text { color: #065f46; font-weight: 500; }
.review-answer.user.wrong .answer-text { color: var(--danger); }
.review-nav { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
.review-arrow { width: 40px; height: 40px; border: 2px solid var(--border); border-radius: 10px; background: var(--white); color: var(--text-light); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.review-arrow:hover:not(:disabled) { border-color: var(--celeste); color: var(--celeste); }
.review-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
.review-counter { font-size: 14px; color: var(--text-light); font-weight: 500; }

/* RIGHT COLUMN - Sidebar */
.result-right { padding: 24px 20px; background: var(--gray-light); border-top: 1px solid var(--border); }
.sidebar-logo { text-align: center; margin-bottom: 24px; }
.sidebar-logo img { height: 32px; }
.sidebar-student { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--white); border-radius: 14px; margin-bottom: 16px; }
.student-avatar-lg { width: 48px; height: 48px; background: var(--blue); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; flex-shrink: 0; }
.student-details { flex: 1; min-width: 0; }
.student-details strong { display: block; font-size: 15px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.student-details span { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.sidebar-exam { background: var(--white); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
.sidebar-exam h4 { margin: 0 0 16px; font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.4; }
.exam-details { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; justify-content: space-between; font-size: 13px; }
.detail-label { color: var(--text-muted); }
.detail-value { font-weight: 600; color: var(--text); }
.sidebar-certificate { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
.cert-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.cert-icon { font-size: 32px; }
.cert-text strong { display: block; font-size: 14px; color: #065f46; margin-bottom: 2px; }
.cert-text span { font-size: 12px; color: #047857; }
.cert-qr { text-align: center; }
.qr-canvas { width: 120px !important; height: 120px !important; border-radius: 10px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.sidebar-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.action-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; }
.action-btn.pdf { background: #dc2626; color: white; }
.action-btn.pdf:hover { background: #b91c1c; }
.action-btn.download { background: var(--blue); color: white; }
.action-btn.download:hover { background: #001a7a; }
.action-btn.linkedin { background: #0077b5; color: white; }
.action-btn.linkedin:hover { background: #006097; }
.sidebar-footer { text-align: center; padding-top: 16px; border-top: 1px solid var(--border); }
.sidebar-footer span { font-size: 12px; color: var(--text-muted); }

/* ════════════════════════════════════════════════════════════════
   RESPONSIVE - Desktop 70/30 Layout
   ════════════════════════════════════════════════════════════════ */
@media (min-width: 768px) {
  .header-title { display: block; }
  .quiz-main { padding: 40px 24px; }
  .question-card { padding: 32px; }
  .question-text { font-size: 22px; }
}

@media (min-width: 1024px) {
  /* Quiz Screen - Layout 70/30 en PC */
  .mobile-only { display: none !important; }
  .desktop-only { display: flex !important; }
  .nav-panel.mobile-panel { display: none !important; }
  
  .quiz-layout { 
    max-width: 100%; 
    margin: 0;
    gap: 0;
  }
  
  .quiz-main { 
    flex: 0 0 70%; 
    max-width: 70%; 
    padding: 32px 40px;
    margin: 0;
  }
  
  .quiz-sidebar { 
    display: flex !important;
    flex-direction: column;
    flex: 0 0 30%; 
    max-width: 30%; 
    background: var(--white);
    border-left: 1px solid var(--border);
    padding: 24px;
    position: sticky;
    top: 60px;
    height: calc(100vh - 64px);
    overflow-y: auto;
  }
  
  .sidebar-nav-header { margin-bottom: 16px; }
  .sidebar-nav-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--text); }
  
  .quiz-sidebar .nav-legend { 
    display: flex; 
    gap: 16px; 
    padding-bottom: 16px; 
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border); 
  }
  
  .quiz-sidebar .nav-grid { 
    display: grid; 
    grid-template-columns: repeat(5, 1fr); 
    gap: 8px; 
    margin-bottom: 20px;
  }
  
  /* Exam Info en sidebar */
  .sidebar-exam-info {
    background: var(--gray-light);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .exam-info-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 8px 0;
  }
  .exam-info-row:not(:last-child) {
    border-bottom: 1px solid var(--border);
  }
  .info-label { color: var(--text-muted); }
  .info-value { font-weight: 600; color: var(--text); }
  
  /* Min Score Box - Simple */
  .min-score-box {
    background: var(--blue);
    border-radius: 12px;
    padding: 24px 20px;
    text-align: center;
    margin-bottom: 16px;
  }
  .min-score-number {
    display: block;
    font-size: 56px;
    font-weight: 800;
    color: white;
    line-height: 1;
    margin-bottom: 8px;
  }
  .min-score-label {
    font-size: 11px;
    color: rgba(255,255,255,0.8);
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  
  .btn-finish-sidebar {
    margin-top: auto;
    padding: 14px;
    background: var(--success);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-finish-sidebar:hover:not(:disabled) { background: #059669; }
  .btn-finish-sidebar:disabled { opacity: 0.6; }

  /* Result Screen */
  .result-layout { flex-direction: row; }
  .result-mobile-header { display: none; }
  
  .result-left { 
    flex: 0 0 70%; 
    max-width: 70%; 
    padding: 40px;
    border-right: 1px solid var(--border);
    overflow-y: auto;
    max-height: 100vh;
  }
  
  .result-right { 
    flex: 0 0 30%; 
    max-width: 30%; 
    padding: 32px 24px;
    border-top: none;
    background: var(--white);
    overflow-y: auto;
    max-height: 100vh;
    position: sticky;
    top: 0;
  }
  
  .score-card { padding: 32px 24px; }
  .score-obtained { font-size: 72px; }
  .score-separator { font-size: 40px; }
  .score-total { font-size: 40px; }
  .stat-box { padding: 14px 24px; min-width: 100px; }
  .stat-num { font-size: 26px; }
  
  .section-divider { max-width: 500px; margin: 40px auto 32px; }
  
  .review-section { padding: 0 0 40px; max-width: 600px; }
  .pill { width: 38px; height: 38px; font-size: 14px; }
  
  .qr-canvas { width: 130px !important; height: 130px !important; }
  
  .sidebar-logo { margin-bottom: 28px; }
  .sidebar-logo img { height: 36px; }
}

/* Min Score Box for Mobile Panel */
.nav-panel .min-score-box {
  background: var(--blue);
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  margin: 16px 20px;
}
.nav-panel .min-score-number {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 6px;
}
.nav-panel .min-score-label {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Larger screens */
@media (min-width: 1280px) {
  .result-left { padding: 48px 56px; }
  .result-right { padding: 40px 32px; }
  .score-obtained { font-size: 80px; }
  .score-separator { font-size: 44px; }
  .score-total { font-size: 44px; }
  
  .quiz-main { padding: 40px 56px; }
  .quiz-sidebar { padding: 32px; }
  .min-score-number { font-size: 64px; }
  .min-compact-number { font-size: 28px; }
  .section-divider { margin: 44px auto 36px; }
}
</style>