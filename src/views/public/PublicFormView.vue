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
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
        </svg>
      </div>
      <h2 class="state-title">{{ error }}</h2>
      <p class="state-text">No se pudo cargar el formulario.</p>
    </div>

    <template v-else-if="form">
      <!-- ═══════════════════════════════════════════════════════════
           PASO 0: VALIDACIÓN ODOO (si requiere)
           ═══════════════════════════════════════════════════════════ -->
      <div v-if="requiresOdooValidation && !odooValidated && !started" class="odoo-validation-screen">
        <div class="validation-card">
          <img src="@/assets/images/weonline.png" alt="WE Online" class="brand-logo" />
          
          <h1 class="validation-title">{{ form.title }}</h1>
          <p class="validation-subtitle">Para iniciar el examen, ingresa tu correo registrado en WE Online</p>
          
          <form @submit.prevent="validateOdooEmail" class="validation-form">
            <div class="input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input 
                type="email" 
                v-model="odooEmail"
                placeholder="tucorreo@ejemplo.com"
                :disabled="validatingOdoo"
                required
                autofocus
              />
            </div>
            
            <div v-if="odooError" class="validation-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {{ odooError }}
            </div>
            
            <button type="submit" class="btn-validate" :disabled="validatingOdoo || !odooEmail">
              <span v-if="validatingOdoo">
                <span class="btn-loader"></span>
                Verificando...
              </span>
              <span v-else>Verificar y continuar</span>
            </button>
          </form>
          
          <p class="validation-help">
            ¿No tienes cuenta? 
            <a href="https://we-educacion.com/registro" target="_blank">Regístrate aquí</a>
          </p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════
           PASO 1: BIENVENIDA (si ya validó Odoo o no requiere)
           ═══════════════════════════════════════════════════════════ -->
      <div v-else-if="!started && form.welcome_message" class="welcome-screen">
        <div class="welcome-content">
          <img src="@/assets/images/weonline.png" alt="WE Online" class="brand-logo" />
          
          <h1 class="welcome-title">{{ form.title }}</h1>
          <p v-if="form.description" class="welcome-subtitle">{{ form.description }}</p>
          
          <!-- Info del estudiante validado -->
          <div v-if="odooStudent" class="student-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <div class="student-info">
              <strong>{{ odooStudent.full_name }}</strong>
              <span>{{ odooStudent.email }}</span>
            </div>
            <svg class="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          
          <p class="welcome-message">{{ form.welcome_message }}</p>

          <div v-if="isExam" class="exam-meta">
            <div class="meta-item" v-if="form.time_limit_minutes">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ form.time_limit_minutes }} min
            </div>
            <div class="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              {{ questions.length }} preguntas
            </div>
            <div class="meta-item" v-if="form.passing_score">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ form.passing_score }}% mínimo
            </div>
          </div>
          
          <button @click="startForm" class="btn-primary">
            {{ isExam ? 'Comenzar examen' : 'Empezar' }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          
          <p class="welcome-hint">Presiona <kbd>Enter ↵</kbd> para continuar</p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════
           PASO 2: QUIZ / EXAMEN
           ═══════════════════════════════════════════════════════════ -->
      <div v-else-if="!submitted" class="quiz-screen">
        <!-- Timer Header -->
        <header v-if="isExam && form.time_limit_minutes" class="exam-header">
          <div class="exam-header-content">
            <span class="exam-title">{{ form.title }}</span>
            <div class="timer-container" :class="{ warning: timerWarning, critical: timerCritical }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="timer-value">{{ formattedTime }}</span>
            </div>
          </div>
        </header>

        <!-- Navigation -->
        <nav class="quiz-nav">
          <button @click="goBack" class="nav-btn" :disabled="currentIndex === 0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <div class="progress-container">
            <span class="nav-counter">{{ currentIndex + 1 }}<span class="nav-total"> de {{ questions.length }}</span></span>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>
          
          <button v-if="canSkip" @click="skipQuestion" class="nav-btn skip" :disabled="isLastQuestion">
            Saltar
          </button>
          <div v-else class="nav-spacer"></div>
        </nav>

        <!-- Question Area -->
        <main class="question-area">
          <div class="question-wrapper" :key="currentQuestion.id">
            <span class="question-number">{{ currentIndex + 1 }}</span>
            
            <h2 class="question-text">
              {{ currentQuestion.question_text }}
              <span v-if="currentQuestion.is_required" class="required">*</span>
            </h2>
            
            <p v-if="currentQuestion.help_text" class="question-hint">{{ currentQuestion.help_text }}</p>

            <div class="answer-area">
              <!-- TEXT -->
              <input v-if="isType('TEXT')" type="text" v-model="answers[currentQuestion.id]"
                :placeholder="currentQuestion.placeholder || 'Escribe aquí...'" class="input-field" @keyup.enter="nextQuestion"/>

              <!-- TEXTAREA -->
              <textarea v-else-if="isType('TEXTAREA')" v-model="answers[currentQuestion.id]"
                :placeholder="currentQuestion.placeholder || 'Escribe tu respuesta...'" class="input-field textarea" rows="4"></textarea>

              <!-- EMAIL -->
              <input v-else-if="isType('EMAIL')" type="email" v-model="answers[currentQuestion.id]"
                :placeholder="currentQuestion.placeholder || 'correo@ejemplo.com'" class="input-field" @keyup.enter="nextQuestion"/>

              <!-- NUMBER -->
              <input v-else-if="isType('NUMBER')" type="number" v-model="answers[currentQuestion.id]"
                :placeholder="currentQuestion.placeholder || '0'" class="input-field" @keyup.enter="nextQuestion"/>

              <!-- DATE -->
              <input v-else-if="isType('DATE')" type="date" v-model="answers[currentQuestion.id]" class="input-field"/>

              <!-- RADIO / SINGLE_CHOICE -->
              <div v-else-if="isType('RADIO') || isType('SINGLE_CHOICE')" class="options-list">
                <button v-for="(option, idx) in currentQuestion.options" :key="option.id" type="button"
                  class="option-btn" :class="{ selected: answers[currentQuestion.id] === option.id }"
                  @click="selectRadio(currentQuestion.id, option.id)">
                  <span class="option-key">{{ String.fromCharCode(65 + idx) }}</span>
                  <span class="option-text">{{ option.option_text }}</span>
                  <span class="option-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                </button>
              </div>

              <!-- CHECKBOX / MULTIPLE_CHOICE -->
              <div v-else-if="isType('CHECKBOX') || isType('MULTIPLE_CHOICE')" class="options-list">
                <button v-for="(option, idx) in currentQuestion.options" :key="option.id" type="button"
                  class="option-btn checkbox" :class="{ selected: answers[currentQuestion.id]?.includes(option.id) }"
                  @click="toggleCheckbox(currentQuestion.id, option.id)">
                  <span class="option-key">{{ String.fromCharCode(65 + idx) }}</span>
                  <span class="option-text">{{ option.option_text }}</span>
                  <span class="option-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                </button>
              </div>

              <!-- SELECT / DROPDOWN -->
              <select v-else-if="isType('SELECT') || isType('DROPDOWN')" v-model="answers[currentQuestion.id]" class="input-field select">
                <option value="" disabled>Selecciona una opción</option>
                <option v-for="option in currentQuestion.options" :key="option.id" :value="option.id">{{ option.option_text }}</option>
              </select>

              <!-- TRUE_FALSE -->
              <div v-else-if="isType('TRUE_FALSE')" class="options-list">
                <button type="button" class="option-btn" 
                  :class="{ selected: answers[currentQuestion.id] === true }"
                  @click="answers[currentQuestion.id] = true">
                  <span class="option-key">V</span>
                  <span class="option-text">Verdadero</span>
                  <span class="option-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
                </button>
                <button type="button" class="option-btn"
                  :class="{ selected: answers[currentQuestion.id] === false }"
                  @click="answers[currentQuestion.id] = false">
                  <span class="option-key">F</span>
                  <span class="option-text">Falso</span>
                  <span class="option-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
                </button>
              </div>

              <!-- RATING -->
              <div v-else-if="isType('RATING')" class="rating-row">
                <button v-for="n in (currentQuestion.config?.max_stars || 5)" :key="n" type="button"
                  class="star-btn" :class="{ active: answers[currentQuestion.id] >= n }" @click="answers[currentQuestion.id] = n">
                  <svg width="28" height="28" viewBox="0 0 24 24" :fill="answers[currentQuestion.id] >= n ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>

              <!-- SCALE -->
              <div v-else-if="isType('SCALE')" class="scale-container">
                <div class="scale-labels">
                  <span>{{ currentQuestion.config?.min_label || currentQuestion.config?.min || 1 }}</span>
                  <span>{{ currentQuestion.config?.max_label || currentQuestion.config?.max || 10 }}</span>
                </div>
                <div class="scale-row">
                  <button v-for="n in getScaleRange(currentQuestion)" :key="n" type="button"
                    class="scale-btn" :class="{ active: answers[currentQuestion.id] === n }" @click="answers[currentQuestion.id] = n">
                    {{ n }}
                  </button>
                </div>
              </div>

              <!-- FILE -->
              <label v-else-if="isType('FILE')" class="file-drop">
                <input type="file" @change="handleFileChange($event, currentQuestion.id)" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span v-if="answers[currentQuestion.id]">{{ answers[currentQuestion.id] }}</span>
                <span v-else>Selecciona archivo</span>
              </label>

              <!-- DEFAULT -->
              <input v-else type="text" v-model="answers[currentQuestion.id]"
                :placeholder="currentQuestion.placeholder || 'Escribe aquí...'" class="input-field" @keyup.enter="nextQuestion"/>
            </div>

            <p v-if="currentError" class="field-error">{{ currentError }}</p>
          </div>
        </main>

        <!-- Footer -->
        <footer class="quiz-footer">
          <button @click="nextQuestion" class="btn-continue" :class="{ submit: isLastQuestion }" :disabled="submitting">
            <span v-if="submitting">Enviando...</span>
            <span v-else-if="isLastQuestion">{{ isExam ? 'Enviar examen' : 'Enviar' }}</span>
            <span v-else>Continuar</span>
            <svg v-if="!submitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <template v-if="isLastQuestion"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></template>
              <template v-else><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></template>
            </svg>
          </button>
          <span class="footer-hint">o presiona <kbd>Enter ↵</kbd></span>
        </footer>
      </div>

      <!-- ═══════════════════════════════════════════════════════════
           PASO 3: RESULTADOS
           ═══════════════════════════════════════════════════════════ -->
      <div v-else class="result-screen">
        <div class="result-layout">
          <!-- LEFT COLUMN -->
          <div class="result-main">
            <!-- Header con score -->
            <div class="result-header" :class="{ passed: examResult?.passed, failed: examResult && !examResult.passed }">
              <div class="result-header-content">
                <img src="@/assets/images/weonline.png" alt="WE Online" class="result-logo" />
                <h1 class="result-exam-title">{{ form.title }}</h1>
                
                <!-- Exam Score -->
                <div v-if="isExam && examResult" class="score-section">
                  <div class="score-badge" :class="{ passed: examResult.passed }">
                    <span class="score-number">{{ examResult.percentage }}</span>
                    <span class="score-percent">%</span>
                  </div>
                  <p class="score-status">{{ examResult.passed ? '¡Aprobado!' : 'No aprobado' }}</p>
                  <div class="score-stats">
                    <span><strong>{{ examResult.correct_count }}</strong> correctas</span>
                    <span class="separator">•</span>
                    <span><strong>{{ examResult.total_questions - examResult.correct_count }}</strong> incorrectas</span>
                    <span v-if="examResult.passing_score" class="separator">•</span>
                    <span v-if="examResult.passing_score">Mínimo: <strong>{{ examResult.passing_score }}%</strong></span>
                  </div>
                  
                  <!-- Estudiante -->
                  <div v-if="odooStudent" class="result-student">
                    <span>Estudiante:  <strong>{{ odooStudent.full_name }}</strong></span>
                  </div>
                </div>

                <!-- Survey Success -->
                <div v-else class="survey-success">
                  <div class="success-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p>{{ form.submit_message || 'Tu respuesta ha sido registrada correctamente.' }}</p>
                </div>
              </div>
            </div>

            <!-- ★★★ CERTIFICADO ODOO ★★★ -->
            <div v-if="examResult?.odoo?.pdf_url" class="odoo-certificate-section">
              <div class="certificate-banner">
                <div class="certificate-icon">🎓</div>
                <div class="certificate-info">
                  <h3>¡Certificado Generado!</h3>
                  <p>{{ examResult.odoo.message || 'Ya puedes verlo en la intranet de W|E' }}</p>
                </div>
              </div>
              
              <!-- QR Code -->
              <div class="qr-wrapper">
                <canvas ref="qrCanvas" class="qr-code"></canvas>
                <span class="qr-label">Escanea para ver tu certificado</span>
              </div>
            </div>

            <!-- Error de certificación -->
            <div v-else-if="examResult?.odoo?.error" class="certificate-error-banner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1"/>
              </svg>
              <p>{{ examResult.odoo.message }}</p>
            </div>

            <!-- Answers Review -->
            <div v-if="isExam && examResult?.details?.length" class="answers-section">
              <h2 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Revisión de respuestas
              </h2>
              
              <div class="answers-list">
                <div v-for="(item, index) in examResult.details" :key="index"
                  class="answer-card" :class="{ correct: item.is_correct, wrong: item.is_correct === false, neutral: item.is_correct === null }">
                  
                  <div class="answer-card-header">
                    <span class="answer-num">{{ index + 1 }}</span>
                    <span class="answer-status-icon">
                      <template v-if="item.is_correct === true">✓</template>
                      <template v-else-if="item.is_correct === false">✗</template>
                      <template v-else>—</template>
                    </span>
                    <span class="answer-points">{{ item.points_earned || 0 }}/{{ item.points_possible || 0 }} pts</span>
                  </div>
                  
                  <p class="answer-question">{{ item.question_text }}</p>
                  
                  <div class="answer-comparison">
                    <div class="your-answer">
                      <span class="label">Tu respuesta:</span>
                      <span class="value" :class="{ wrong: item.is_correct === false }">
                        {{ item.user_answer || '(Sin respuesta)' }}
                      </span>
                    </div>
                    
                    <div v-if="item.is_correct === false && item.correct_answer" class="correct-answer">
                      <span class="label">Correcta:</span>
                      <span class="value">{{ item.correct_answer }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN - Sidebar -->
          <div class="result-sidebar">
            <div class="sidebar-card">
              <h3>Descargas</h3>
              <p class="sidebar-text">Descarga tus documentos o comparte en redes.</p>
              
              <!-- Botón PDF Odoo (si existe) -->
              <a v-if="examResult?.odoo?.pdf_url" 
                 :href="examResult.odoo.pdf_url" 
                 target="_blank" 
                 class="btn-action btn-certificate"
                 style="color:white;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                </svg>
                Certificado Oficial (PDF)
              </a>
              
              <!-- Botón Constancia Local -->
              <button @click="downloadTicket" class="btn-action btn-download">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Constancia de Examen
              </button>

              <button @click="shareLinkedIn" class="btn-action btn-linkedin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Compartir en LinkedIn
              </button>

              <div class="sidebar-info">
                <div class="info-item">
                  <span class="info-label">Fecha</span>
                  <span class="info-value">{{ formatDate(new Date()) }}</span>
                </div>
                <div class="info-item" v-if="examResult?.total_score !== undefined">
                  <span class="info-label">Puntaje</span>
                  <span class="info-value">{{ examResult.total_score }} / {{ examResult.max_score }} pts</span>
                </div>
                <div class="info-item" v-if="odooStudent">
                  <span class="info-label">Estudiante</span>
                  <span style="font-size: 10px;" class="info-value">{{ odooStudent.full_name }}</span>
                </div>
              </div>
            </div>

            <!-- Brand -->
            <div class="sidebar-brand">
              <img src="@/assets/images/weonline.png" alt="WE Online" />
              <span>Educación Ejecutiva</span>
            </div>
          </div>
        </div>
      </div>

        <div v-if="showLinkedInModal" class="linkedin-modal-overlay" @click.self="closeLinkedInModal">
          <div class="linkedin-modal">
            <div class="linkedin-modal-header">
              <div class="linkedin-user">
                <div class="linkedin-avatar">
                  {{ (odooStudent?.full_name || 'U').charAt(0) }}
                </div>
                <div class="linkedin-user-info">
                  <strong>{{ odooStudent?.full_name || 'Usuario' }}</strong>
                  <span>Ahora • 🌐</span>
                </div>
              </div>
              <svg class="linkedin-logo" width="24" height="24" viewBox="0 0 24 24" fill="#0077b5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            
            <div class="linkedin-modal-body">
              <textarea 
                v-model="linkedInPostText" 
                class="linkedin-textarea"
                rows="6"
                placeholder="Escribe tu publicación..."
              ></textarea>
              
              <!-- Preview del certificado -->
              <div class="certificate-preview">
                <div class="certificate-preview-inner">
                  <div class="cert-logo">W | E</div>
                  <div class="cert-subtitle">CONSTANCIA DE EVALUACIÓN</div>
                  <div class="cert-title">{{ form.title }}</div>
                  <div class="cert-score">{{ examResult?.percentage || 0 }}%</div>
                  <div class="cert-status">{{ examResult?.passed ? 'APROBADO' : 'NO APROBADO' }}</div>
                  <div class="cert-details">{{ examResult?.correct_count || 0 }} de {{ examResult?.total_questions || 0 }} correctas</div>
                </div>
              </div>
              
              <!-- Acciones del post -->
              <div class="linkedin-actions-preview">
                <span>👍 Me gusta</span>
                <span>💬 Comentar</span>
                <span>🔁 Compartir</span>
                <span>📤 Enviar</span>
              </div>
            </div>
            
            <div class="linkedin-modal-footer">
              <button @click="closeLinkedInModal" class="btn-cancel">Cancelar</button>
              <button @click="postToLinkedIn" class="btn-linkedin-post" :disabled="postingToLinkedIn">
                <template v-if="postingToLinkedIn || generatingImage">
                  <span class="btn-loader"></span>
                  {{ generatingImage ? 'Generando imagen...' : 'Conectando...' }}
                </template>
                <template v-else>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Publicar en LinkedIn
                </template>
              </button>
            </div>
            
            <p class="linkedin-hint">💡 Puedes modificar el texto. El certificado se adjuntará automáticamente.</p>
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

// Odoo State
const requiresOdooValidation = ref(false)
const odooValidated = ref(false)
const odooStudent = ref(null)
const odooEmail = ref('')
const odooError = ref('')
const validatingOdoo = ref(false)

// QR Canvas ref
const qrCanvas = ref(null)

//Linkedin
const generatingImage = ref(false)
const postingToLinkedIn = ref(false)

// Computed
const isExam = computed(() => form.value?.form_type === 'EXAM')
const canSkip = computed(() => !isExam.value || !currentQuestion.value?.is_required)
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})
const currentError = computed(() => errors[currentQuestion.value?.id])
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)
const progressPercent = computed(() => questions.value.length ? Math.round(((currentIndex.value + 1) / questions.value.length) * 100) : 0)

const timerPercent = computed(() => {
  if (!form.value?.time_limit_minutes) return 100
  return (timeRemaining.value / (form.value.time_limit_minutes * 60)) * 100
})
const timerWarning = computed(() => form.value?.time_limit_minutes && timerPercent.value <= 25 && timerPercent.value > 10)
const timerCritical = computed(() => form.value?.time_limit_minutes && timerPercent.value <= 10)
const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
})

// Methods
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

// ═══════════════════════════════════════
// VALIDACIÓN ODOO
// ═══════════════════════════════════════
async function validateOdooEmail() {
  if (!odooEmail.value) return
  
  validatingOdoo.value = true
  odooError.value = ''
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const res = await fetch(`${API_URL}/public/validate-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: odooEmail.value.trim().toLowerCase(),
        form_uuid: form.value.uuid
      })
    })
    
    const data = await res.json()
    
    if (!data.ok) {
      odooError.value = data.error || 'Error al validar'
      return
    }
    
    if (data.validated && data.student) {
      odooValidated.value = true
      odooStudent.value = data.student
    } else {
      // No requiere validación, continuar
      odooValidated.value = true
    }
  } catch (err) {
    odooError.value = 'Error de conexión. Intenta de nuevo.'
    console.error('Odoo validation error:', err)
  } finally {
    validatingOdoo.value = false
  }
}

// ═══════════════════════════════════════
// CARGAR FORMULARIO
// ═══════════════════════════════════════
async function loadForm() {
  try {
    loading.value = true
    const uuid = route.params.uuid
    if (!uuid) { error.value = 'URL inválida'; return }
    
    const res = await formService.getPublic(uuid)
    let formData, questionsData = []
    
    if (res.data?.ok && res.data?.data) {
      formData = res.data.data.form
      questionsData = res.data.data.questions || []
    } else if (res.data?.data) {
      formData = res.data.data.form || res.data.data
      questionsData = res.data.data.questions || []
    } else if (res.data?.form) {
      formData = res.data.form
      questionsData = res.data.questions || []
    } else throw new Error('Respuesta inválida')
    
    form.value = formData
    requiresOdooValidation.value = !!formData.requires_odoo_validation
    
    if (formData.shuffle_questions) questionsData = questionsData.sort(() => Math.random() - 0.5)
    questions.value = questionsData
    
    questionsData.forEach(q => {
      const t = (q.type || q.type_code || q.question_type || '').toUpperCase()
      if (t === 'CHECKBOX' || t === 'MULTIPLE_CHOICE') {
        answers[q.id] = []
      } else if (t === 'RATING') {
        answers[q.id] = 0
      } else {
        answers[q.id] = null
      }
    })
    
    // Si no requiere validación Odoo y no hay welcome_message, iniciar directamente
    if (!requiresOdooValidation.value && !formData.welcome_message) {
      started.value = true
      startTimer()
    }
  } catch (e) {
    error.value = e.response?.data?.error || e.message || 'Error al cargar'
  } finally {
    loading.value = false
  }
}

function startForm() {
  started.value = true
  startTimer()
}

function startTimer() {
  if (!isExam.value || !form.value?.time_limit_minutes) return
  timeRemaining.value = form.value.time_limit_minutes * 60
  timerInterval.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval.value)
      submitForm(true)
    }
  }, 1000)
}

function selectRadio(qid, oid) {
  answers[qid] = oid
  delete errors[qid]
}

function toggleCheckbox(qid, oid) {
  if (!answers[qid]) answers[qid] = []
  const i = answers[qid].indexOf(oid)
  i > -1 ? answers[qid].splice(i, 1) : answers[qid].push(oid)
  delete errors[qid]
}

function validateCurrent() {
  const q = currentQuestion.value
  if (!q.is_required) return true
  const a = answers[q.id]
  const empty = a === null || a === undefined || a === '' || a === 0 || (Array.isArray(a) && !a.length)
  if (empty) { errors[q.id] = 'Campo requerido'; return false }
  delete errors[q.id]
  return true
}

function goBack() { if (currentIndex.value > 0) currentIndex.value-- }
function skipQuestion() { if (!isLastQuestion.value) currentIndex.value++ }
function nextQuestion() { if (validateCurrent()) isLastQuestion.value ? submitForm() : currentIndex.value++ }

// ═══════════════════════════════════════
// SUBMIT FORM
// ═══════════════════════════════════════
async function submitForm(auto = false) {
  if (!auto && !validateAll()) return
  submitting.value = true
  if (timerInterval.value) clearInterval(timerInterval.value)
  
  try {
    const formatted = questions.value.map(q => {
      const t = (q.type || q.type_code || q.question_type || '').toUpperCase()
      let val = answers[q.id]
      
      return {
        question_id: q.id,
        answer_value: val
      }
    })
    
    const timeSpent = form.value.time_limit_minutes 
      ? (form.value.time_limit_minutes * 60) - timeRemaining.value 
      : null
    
    // Payload con datos Odoo
    const payload = {
      form_uuid: form.value.uuid,
      answers: formatted,
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
    
    const res = await responseService.submit(payload)
    
    console.log('📦 Response from server:', res.data)
    
    if (isExam.value && res.data?.data) {
      const data = res.data.data
      examResult.value = {
        percentage: data.score || 0,
        passed: data.passed,
        correct_count: data.correct_count || 0,
        total_questions: data.total_questions || questions.value.length,
        total_score: data.total_score || 0,
        max_score: data.max_score || 0,
        passing_score: data.passing_score,
        details: data.details || [],
        odoo: data.odoo || null // ★ Datos de Odoo (certificate_id, pdf_url)
      }
      console.log('📊 Exam result:', examResult.value)
    }
    
    submitted.value = true
    
    // Generar QR después de mostrar resultados
    await nextTick()
    generateQR()
    
  } catch (e) {
    console.error('Error submitting:', e)
    alert(auto ? 'Tiempo agotado. Error al enviar.' : 'Error al enviar.')
  } finally {
    submitting.value = false
  }
}

function validateAll() {
  let ok = true
  questions.value.forEach((q, i) => {
    if (q.is_required) {
      const a = answers[q.id]
      if (a === null || a === undefined || a === '' || a === 0 || (Array.isArray(a) && !a.length)) {
        errors[q.id] = 'Campo requerido'
        if (ok) currentIndex.value = i
        ok = false
      }
    }
  })
  return ok
}

function handleFileChange(e, qid) {
  const f = e.target.files[0]
  if (f) answers[qid] = f.name
}

// ═══════════════════════════════════════
// GENERAR QR
// ═══════════════════════════════════════
async function generateQR() {
  if (!examResult.value?.odoo?.pdf_url || !qrCanvas.value) return
  
  try {
    await QRCode.toCanvas(qrCanvas.value, examResult.value.odoo.pdf_url, {
      width: 140,
      margin: 2,
      color: { dark: '#001845', light: '#ffffff' }
    })
  } catch (err) {
    console.error('QR generation error:', err)
  }
}

// ═══════════════════════════════════════
// DOWNLOAD CONSTANCIA LOCAL
// ═══════════════════════════════════════
function downloadTicket() {
  const result = examResult.value
  const student = odooStudent.value
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Constancia - ${form.value.title}</title>
      <style>
        @page { size: 80mm 240mm; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; width: 80mm; padding: 8mm; background: #fff; }
        .ticket { text-align: center; }
        .logo { font-size: 18px; font-weight: bold; color: #001845; margin-bottom: 4mm; letter-spacing: 2px; }
        .title { font-size: 10px; color: #666; margin-bottom: 6mm; border-bottom: 1px dashed #ccc; padding-bottom: 4mm; text-transform: uppercase; letter-spacing: 1px; }
        .exam-name { font-size: 12px; font-weight: 600; color: #001845; margin-bottom: 6mm; line-height: 1.4; }
        .student-name { font-size: 11px; color: #333; margin-bottom: 6mm; padding: 3mm; background: #f5f5f5; border-radius: 2mm; }
        .score-box { background: ${result?.passed ? '#ecfdf5' : '#fef2f2'}; padding: 6mm; border-radius: 3mm; margin-bottom: 5mm; }
        .score { font-size: 36px; font-weight: bold; color: ${result?.passed ? '#059669' : '#dc2626'}; }
        .status { font-size: 11px; font-weight: 600; color: ${result?.passed ? '#059669' : '#dc2626'}; margin-top: 2mm; text-transform: uppercase; letter-spacing: 1px; }
        .details { text-align: left; font-size: 10px; color: #333; margin: 5mm 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 4mm 0; }
        .row { display: flex; justify-content: space-between; margin: 2mm 0; }
        .row .label { color: #666; }
        .row .value { font-weight: 600; }
        .footer { font-size: 8px; color: #999; margin-top: 5mm; }
        .odoo-note { font-size: 9px; color: #059669; margin-top: 4mm; padding: 3mm; background: #ecfdf5; border-radius: 2mm; }
        .barcode { font-family: monospace; font-size: 9px; letter-spacing: 3px; margin-top: 3mm; color: #333; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="logo">W | E</div>
        <div class="title">Constancia de Evaluación</div>
        <div class="exam-name">${form.value.title}</div>
        ${student ? `<div class="student-name">${student.full_name}</div>` : ''}
        <div class="score-box">
          <div class="score">${result?.percentage || 0}%</div>
          <div class="status">${result?.passed ? 'APROBADO' : 'NO APROBADO'}</div>
        </div>
        <div class="details">
          <div class="row"><span class="label">Correctas:</span><span class="value">${result?.correct_count || 0} de ${result?.total_questions || 0}</span></div>
          <div class="row"><span class="label">Puntaje:</span><span class="value">${result?.total_score || 0} / ${result?.max_score || 0}</span></div>
          ${result?.passing_score ? `<div class="row"><span class="label">Mínimo requerido:</span><span class="value">${result.passing_score}%</span></div>` : ''}
          <div class="row"><span class="label">Fecha:</span><span class="value">${formatDate(new Date())}</span></div>
        </div>
        ${result?.odoo?.pdf_url ? '<div class="odoo-note">✓ Certificado disponible en la intranet de W|E</div>' : ''}
        <div class="footer">WE | Educación Ejecutiva<br>www.weonline.pe</div>
        <div class="barcode">■■■ ${Date.now().toString(36).toUpperCase()} ■■■</div>
      </div>
    </body>
    </html>
  `
  const win = window.open('', '_blank', 'width=320,height=700')
  win.document.write(content)
  win.document.close()
  setTimeout(() => win.print(), 300)
}

// ═══════════════════════════════════════
// SHARE LINKEDIN
// ═══════════════════════════════════════
async function shareLinkedIn() {
  const result = examResult.value
  
  // Generar texto del post con timestamp para evitar duplicados
  const timestamp = new Date().toLocaleString('es-PE', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const postText = `🎓 ¡Completé la evaluación "${form.value.title}"!\n\n` +
    `📊 Resultado: ${result?.percentage || 0}% ${result?.passed ? '✅ APROBADO' : ''}\n` +
    `✔️ ${result?.correct_count || 0}/${result?.total_questions || 0} respuestas correctas\n\n` +
    `Gracias a @WE Online por esta oportunidad de aprendizaje.\n\n` +
    `📅 ${timestamp}\n\n` +
    `#WEOnline #EducaciónEjecutiva #Certificación #DesarrolloProfesional`
  
  // Generar imagen del certificado
  generatingImage.value = true
  const imageBlob = await generateCertificateImage()
  generatingImage.value = false
  
  if (!imageBlob) {
    alert('Error al generar la imagen del certificado')
    return
  }
  
  // Datos del examen
  const examData = {
    title: form.value.title,
    percentage: result?.percentage || 0,
    passed: result?.passed,
    correct: result?.correct_count || 0,
    total: result?.total_questions || 0,
    formUuid: form.value.uuid,
    studentName: odooStudent.value?.full_name || '',
    pdfUrl: result?.odoo?.pdf_url || null
  }
  
  // Guardar datos
  localStorage.setItem('linkedin_exam_data', JSON.stringify(examData))
  localStorage.setItem('linkedin_post_text', postText)
  
  // Convertir imagen a base64
  const reader = new FileReader()
  reader.readAsDataURL(imageBlob)
  reader.onloadend = async () => {
    const base64Image = reader.result.split(',')[1]
    localStorage.setItem('linkedin_certificate_image', base64Image)
    
    // State para seguridad
    const state = btoa(JSON.stringify({ formUuid: form.value.uuid, ts: Date.now() }))
    
    // Configuración OAuth
    const clientId = '78grbv4vc7hu8f'
    const redirectUri = encodeURIComponent(`${window.location.origin}/linkedin/callback`)
    const scope = encodeURIComponent('openid profile email w_member_social')
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `state=${encodeURIComponent(state)}&` +
      `scope=${scope}`
    
    // Redirigir a LinkedIn directamente
    window.location.href = authUrl
  }
}

// Generar imagen del certificado
async function generateCertificateImage() {
  const result = examResult.value
  const student = odooStudent.value
  
  // Crear elemento temporal para el certificado
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = `
    <div style="
      width: 600px;
      padding: 40px;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      border-radius: 16px;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: white;
      text-align: center;
    ">
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin-bottom: 8px;">W | E</div>
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; margin-bottom: 24px;">Constancia de Evaluación</div>
      
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 32px; line-height: 1.4;">${form.value.title}</div>
      
      ${student ? `<div style="font-size: 14px; opacity: 0.9; margin-bottom: 24px;">${student.full_name}</div>` : ''}
      
      <div style="
        background: rgba(255,255,255,0.2);
        padding: 24px 40px;
        border-radius: 12px;
        display: inline-block;
        margin-bottom: 24px;
      ">
        <div style="font-size: 64px; font-weight: 700; line-height: 1;">${result?.percentage || 0}%</div>
        <div style="font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px;">
          ${result?.passed ? 'APROBADO' : 'NO APROBADO'}
        </div>
      </div>
      
      <div style="font-size: 14px; opacity: 0.9;">
        ${result?.correct_count || 0} de ${result?.total_questions || 0} correctas
      </div>
      
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8;">
        ${formatDate(new Date())} • WE | Educación Ejecutiva
      </div>
    </div>
  `
  
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  document.body.appendChild(tempDiv)
  
  try {
    const canvas = await html2canvas(tempDiv.firstElementChild, {
      scale: 2,
      backgroundColor: null,
      logging: false
    })
    
    document.body.removeChild(tempDiv)
    
    // Convertir a blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png', 1.0)
    })
  } catch (err) {
    document.body.removeChild(tempDiv)
    console.error('Error generating image:', err)
    return null
  }
}

// Manejar callback de LinkedIn
async function handleLinkedInCallback() {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (!code) return false
  
  try {
    // Recuperar datos guardados
    const examData = JSON.parse(localStorage.getItem('linkedin_exam_data') || '{}')
    const postText = localStorage.getItem('linkedin_post_text') || ''
    const certificateImage = localStorage.getItem('linkedin_certificate_image')
    
    if (!examData.title) {
      console.error('No se encontraron datos del examen')
      cleanupLinkedIn()
      return true
    }
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const redirectUri = `${window.location.origin}/linkedin/callback`
    
    // Intercambiar código por token
    const tokenResponse = await fetch(`${API_URL}/linkedin/exchange-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri })
    })
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenData.ok) {
      alert('Error al autorizar con LinkedIn: ' + (tokenData.error || ''))
      cleanupLinkedIn()
      return true
    }
    
    // Publicar en LinkedIn CON IMAGEN
    const postResponse = await fetch(`${API_URL}/linkedin/post-with-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: tokenData.data.access_token,
        user_id: tokenData.data.user.id,
        text: postText,
        image_base64: certificateImage
      })
    })
    
    const postData = await postResponse.json()
    
    if (postData.ok) {
      alert('✅ ¡Publicado exitosamente en LinkedIn con tu certificado!')
    } else {
      alert('Error al publicar: ' + (postData.error || 'Intenta de nuevo'))
    }
    
    // Restaurar estado del examen
    examResult.value = {
      percentage: examData.percentage,
      passed: examData.passed,
      correct_count: examData.correct,
      total_questions: examData.total,
      odoo: examData.pdfUrl ? { pdf_url: examData.pdfUrl } : null
    }
    submitted.value = true
    
    cleanupLinkedIn()
    return true
    
  } catch (error) {
    console.error('Error en callback LinkedIn:', error)
    alert('Error al procesar la autorización')
    cleanupLinkedIn()
    return true
  }
}

function cleanupLinkedIn() {
  localStorage.removeItem('linkedin_exam_data')
  localStorage.removeItem('linkedin_post_text')
  localStorage.removeItem('linkedin_certificate_image')
  window.history.replaceState({}, document.title, window.location.pathname)
}

// Lifecycle
onMounted(() => {
  loadForm()
})

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})

watch(answers, () => {
  if (errors[currentQuestion.value?.id]) {
    const a = answers[currentQuestion.value.id]
    if (a !== null && a !== undefined && a !== '' && a !== 0) {
      delete errors[currentQuestion.value.id]
    }
  }
}, { deep: true })
</script>

<style scoped>
.form-view {
  --primary: #001845;
  --primary-light: #002d6d;
  --accent: #00b4d8;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --text: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --bg: #ffffff;
  --bg-subtle: #f8fafc;
  --border: #e2e8f0;
  --radius: 12px;
  min-height: 100vh;
  background: var(--bg);
  font-family: 'Inter', -apple-system, sans-serif;
  color: var(--text);
}

/* Brand */
.brand-logo { height: 40px; margin-bottom: 24px; }

/* States */
.state-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; text-align: center; }
.loader { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
.state-icon.error { background: #fef2f2; color: var(--danger); }
.state-title { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
.state-text { font-size: 14px; color: var(--text-secondary); margin: 0; }

/* Welcome */
.welcome-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px 24px; }
.welcome-content { max-width: 480px; text-align: center; }
.welcome-title { font-size: 28px; font-weight: 600; margin: 0 0 8px; }
.welcome-subtitle { font-size: 15px; color: var(--text-secondary); margin: 0 0 24px; }
.welcome-message { font-size: 15px; line-height: 1.7; margin: 0 0 32px; padding: 20px 24px; background: var(--bg-subtle); border-radius: var(--radius); text-align: left; }
.exam-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-bottom: 32px; padding: 16px; background: #fef9c3; border-radius: var(--radius); }
.meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: #92400e; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--primary); color: #fff; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 500; cursor: pointer; }
.btn-primary:hover { background: var(--primary-light); }
.welcome-hint { margin: 20px 0 0; font-size: 12px; color: var(--text-muted); }
.welcome-hint kbd, .footer-hint kbd { padding: 2px 6px; background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 4px; font-size: 11px; }

/* Quiz */
.quiz-screen { min-height: 100vh; display: flex; flex-direction: column; }
.exam-header { background: var(--primary); padding: 12px 20px; }
.exam-header-content { display: flex; align-items: center; justify-content: space-between; max-width: 800px; margin: 0 auto; }
.exam-title { color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; }
.timer-container { display: flex; align-items: center; gap: 8px; color: #fff; }
.timer-value { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
.timer-container.warning { color: var(--warning); }
.timer-container.critical { color: var(--danger); animation: pulse 0.5s infinite; }
@keyframes pulse { 50% { opacity: 0.6; } }

.quiz-nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; }
.nav-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: none; border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); cursor: pointer; }
.nav-btn:hover:not(:disabled) { border-color: var(--text-muted); color: var(--text); }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.nav-btn.skip { width: auto; padding: 0 14px; font-size: 13px; border: none; color: var(--accent); }
.progress-container { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; max-width: 300px; }
.nav-counter { font-size: 13px; font-weight: 600; }
.nav-total { color: var(--text-muted); font-weight: 400; }
.progress-track { width: 100%; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s; }
.nav-spacer { width: 60px; }

.question-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px 20px 100px; }
.question-wrapper { width: 100%; max-width: 560px; animation: fadeUp 0.25s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.question-number { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--primary); color: #fff; font-size: 13px; font-weight: 600; border-radius: 50%; margin-bottom: 16px; }
.question-text { font-size: 22px; font-weight: 500; line-height: 1.4; margin: 0 0 8px; }
.required { color: var(--danger); }
.question-hint { font-size: 14px; color: var(--text-muted); margin: 0 0 24px; }
.answer-area { margin-top: 28px; }

.input-field { width: 100%; padding: 16px 0; background: none; border: none; border-bottom: 2px solid var(--border); font-size: 18px; color: var(--text); }
.input-field:focus { outline: none; border-color: var(--accent); }
.input-field::placeholder { color: var(--text-muted); }
.input-field.textarea { border: 2px solid var(--border); border-radius: var(--radius); padding: 16px; resize: none; }
.input-field.select { appearance: none; cursor: pointer; }

.options-list { display: flex; flex-direction: column; gap: 10px; }
.option-btn { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--radius); text-align: left; cursor: pointer; transition: all 0.15s; }
.option-btn:hover { border-color: var(--text-muted); background: var(--bg-subtle); }
.option-btn.selected { border-color: var(--accent); background: rgba(0, 180, 216, 0.08); }
.option-key { width: 26px; height: 26px; background: #e0e7ff; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--primary); }
.option-btn.selected .option-key { background: var(--accent); color: #fff; }
.option-text { flex: 1; font-size: 15px; }
.option-check { opacity: 0; color: var(--accent); }
.option-btn.selected .option-check { opacity: 1; }

.rating-row { display: flex; gap: 8px; justify-content: center; }
.star-btn { background: none; border: none; padding: 4px; color: var(--border); cursor: pointer; }
.star-btn:hover, .star-btn.active { color: #fbbf24; transform: scale(1.1); }

.scale-labels { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
.scale-row { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.scale-btn { width: 44px; height: 44px; border: 1.5px solid var(--border); border-radius: 8px; background: var(--bg); font-size: 14px; font-weight: 600; color: var(--text-secondary); cursor: pointer; }
.scale-btn:hover { border-color: var(--accent); color: var(--accent); }
.scale-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.file-drop { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px; border: 2px dashed var(--border); border-radius: var(--radius); color: var(--text-muted); font-size: 14px; cursor: pointer; }
.file-drop:hover { border-color: var(--accent); color: var(--accent); }
.file-drop input { display: none; }

.field-error { margin: 16px 0 0; font-size: 13px; color: var(--danger); }

.quiz-footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 16px 20px; background: linear-gradient(to top, var(--bg) 80%, transparent); display: flex; flex-direction: column; align-items: center; gap: 8px; }
.btn-continue { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 500; cursor: pointer; }
.btn-continue:hover:not(:disabled) { background: #0090b0; }
.btn-continue:disabled { opacity: 0.5; }
.btn-continue.submit { background: var(--success); }
.btn-continue.submit:hover:not(:disabled) { background: #059669; }
.footer-hint { font-size: 11px; color: var(--text-muted); }

/*═══════════════════════════════════════════════════════════
   LINKEDIN MODAL
   ═══════════════════════════════════════════════════════════*/
   .linkedin-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.linkedin-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.linkedin-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.linkedin-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.linkedin-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0077b5, #005885);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
}

.linkedin-user-info {
  display: flex;
  flex-direction: column;
}

.linkedin-user-info strong {
  font-size: 15px;
  color: #111827;
}

.linkedin-user-info span {
  font-size: 12px;
  color: #6b7280;
}

.linkedin-modal-body {
  padding: 20px 24px;
}

.linkedin-textarea {
  width: 100%;
  border: none;
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  color: #111827;
  outline: none;
  font-family: inherit;
  margin-bottom: 16px;
}

.linkedin-textarea::placeholder {
  color: #9ca3af;
}

/* Certificate Preview */
.certificate-preview {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.certificate-preview-inner {
  padding: 32px;
  text-align: center;
  color: white;
}

.cert-logo {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 4px;
  margin-bottom: 4px;
}

.cert-subtitle {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.cert-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  line-height: 1.4;
}

.cert-score {
  font-size: 52px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.cert-status {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.cert-details {
  font-size: 13px;
  opacity: 0.9;
}

.linkedin-actions-preview {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
}

.linkedin-modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  flex: 1;
  padding: 14px 24px;
  background: #f3f4f6;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-linkedin-post {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  background: #0077b5;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  cursor: pointer;
}

.btn-linkedin-post:hover:not(:disabled) {
  background: #005885;
}

.btn-linkedin-post:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.btn-linkedin-post .btn-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.linkedin-hint {
  text-align: center;
  padding: 0 24px 20px;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* ═══════════════════════════════════════════════════════════
   RESULTS
   ═══════════════════════════════════════════════════════════ */
.result-screen { min-height: 100vh; background: var(--bg-subtle); }
.result-layout { display: grid; grid-template-columns: 1fr 340px; min-height: 100vh; }

/* Left Column */
.result-main { background: var(--bg); }
.result-header { padding: 40px; background: linear-gradient(135deg, var(--primary) 0%, #002d6d 100%); color: #fff; }
.result-header.passed { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
.result-header.failed { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); }
.result-header-content { max-width: 700px; }
.result-logo { height: 32px; filter: brightness(0) invert(1); margin-bottom: 24px; }
.result-exam-title { font-size: 24px; font-weight: 600; margin: 0 0 24px; opacity: 0.95; }

.score-section { text-align: left; }
.score-badge { display: inline-flex; align-items: baseline; background: rgba(255,255,255,0.2); padding: 16px 24px; border-radius: 16px; margin-bottom: 16px; }
.score-number { font-size: 56px; font-weight: 700; line-height: 1; }
.score-percent { font-size: 24px; font-weight: 500; margin-left: 4px; }
.score-status { font-size: 20px; font-weight: 600; margin: 0 0 12px; }
.score-stats { display: flex; flex-wrap: wrap; gap: 8px; font-size: 14px; opacity: 0.9; }
.score-stats .separator { opacity: 0.5; }

.survey-success { text-align: center; padding: 40px 0; }
.success-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.survey-success p { font-size: 16px; opacity: 0.9; margin: 0; }

/* ★★★ ANSWERS SECTION ★★★ */
.answers-section { padding: 32px 40px; }
.section-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; margin: 0 0 24px; color: var(--text); }
.answers-list { display: flex; flex-direction: column; gap: 16px; }

.answer-card { 
  background: var(--bg); 
  border: 1px solid var(--border); 
  border-radius: var(--radius); 
  padding: 20px; 
  border-left: 4px solid var(--border);
  transition: all 0.2s;
}
.answer-card.correct { border-left-color: var(--success); background: #f0fdf4; }
.answer-card.wrong { border-left-color: var(--danger); background: #fef2f2; }
.answer-card.neutral { border-left-color: var(--text-muted); background: var(--bg-subtle); }

.answer-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.answer-num { 
  width: 28px; height: 28px; 
  background: var(--bg-subtle); border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 12px; font-weight: 600; color: var(--text-secondary); 
}
.answer-status-icon { font-size: 18px; font-weight: bold; }
.answer-card.correct .answer-status-icon { color: var(--success); }
.answer-card.wrong .answer-status-icon { color: var(--danger); }
.answer-card.neutral .answer-status-icon { color: var(--text-muted); }
.answer-points { margin-left: auto; font-size: 12px; font-weight: 600; color: var(--text-muted); background: var(--bg); padding: 4px 10px; border-radius: 20px; }

.answer-question { font-size: 15px; font-weight: 500; margin: 0 0 16px; line-height: 1.5; color: var(--text); }

.answer-comparison { display: flex; flex-direction: column; gap: 8px; }
.your-answer, .correct-answer { 
  display: flex; gap: 8px; 
  font-size: 13px; 
  padding: 12px 14px; 
  border-radius: 8px; 
  background: rgba(0,0,0,0.03); 
}
.correct-answer { background: #ecfdf5; }
.your-answer .label, .correct-answer .label { color: var(--text-muted); flex-shrink: 0; min-width: 100px; }
.your-answer .value { color: var(--text); font-weight: 500; }
.your-answer .value.wrong { color: var(--danger); }
.correct-answer .value { color: var(--success); font-weight: 600; }

/* Right Column - Sidebar */
.result-sidebar { background: var(--bg); border-left: 1px solid var(--border); padding: 32px 24px; display: flex; flex-direction: column; }
.sidebar-card { background: var(--bg-subtle); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; }
.sidebar-card h3 { font-size: 16px; font-weight: 600; margin: 0 0 8px; }
.sidebar-text { font-size: 13px; color: var(--text-secondary); margin: 0 0 20px; line-height: 1.5; }

.btn-action { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px 20px; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; }
.btn-download { background: var(--primary); color: #fff; }
.btn-download:hover { background: var(--primary-light); }
.btn-linkedin { background: #0077b5; color: #fff; }
.btn-linkedin:hover { background: #006097; }

.sidebar-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
.info-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
.info-label { color: var(--text-muted); }
.info-value { font-weight: 500; color: var(--text); }

.sidebar-brand { margin-top: auto; display: flex; align-items: center; gap: 12px; padding-top: 24px; border-top: 1px solid var(--border); }
.sidebar-brand img { height: 24px; }
.sidebar-brand span { font-size: 12px; color: var(--text-muted); }

/* Debug */
.debug-info { padding: 20px; background: #fffbeb; border: 1px dashed #fbbf24; margin: 20px; border-radius: 8px; }

/* Responsive */
@media (max-width: 900px) {
  .result-layout { grid-template-columns: 1fr; }
  .result-sidebar { border-left: none; border-top: 1px solid var(--border); }
  .result-header { padding: 32px 24px; }
  .answers-section { padding: 24px; }
  .score-number { font-size: 40px; }
}

/* Odoo Validation Screen */
.odoo-validation-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.validation-card {
  background: white;
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.validation-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.validation-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 32px;
  line-height: 1.5;
}

.validation-form {
  text-align: left;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 0.2s;
  margin-bottom: 16px;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
}

.input-wrapper svg {
  color: #9ca3af;
  flex-shrink: 0;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #111827;
  background: transparent;
}

.input-wrapper input::placeholder {
  color: #9ca3af;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 16px;
}

.btn-validate {
  width: 100%;
  padding: 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-validate:hover:not(:disabled) {
  background: var(--primary-light);
}

.btn-validate:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.validation-help {
  margin-top: 24px;
  font-size: 14px;
  color: #64748b;
}

.validation-help a {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}

.validation-help a:hover {
  text-decoration: underline;
}

/* Student Badge (en welcome screen) */
.student-badge {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: left;
}

.student-badge > svg {
  color: #059669;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
}

.student-info strong {
  display: block;
  color: #111827;
  font-size: 15px;
}

.student-info span {
  font-size: 13px;
  color: #64748b;
}

.check-icon {
  color: #059669;
}

/* Result Student */
.result-student {
  margin-top: 16px;
  font-size: 14px;
  opacity: 0.9;
}

/* Odoo Certificate Section */
.odoo-certificate-section {
  padding: 32px 40px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-bottom: 1px solid #a7f3d0;
}

.certificate-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.certificate-icon {
  font-size: 48px;
}

.certificate-info h3 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #065f46;
}

.certificate-info p {
  margin: 0;
  font-size: 14px;
  color: #047857;
}

.qr-wrapper {
  text-align: center;
}

.qr-code {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.qr-label {
  display: block;
  margin-top: 12px;
  font-size: 13px;
  color: #047857;
}

/* Certificate Error Banner */
.certificate-error-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 40px;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
}

.certificate-error-banner svg {
  color: #dc2626;
  flex-shrink: 0;
}

.certificate-error-banner p {
  margin: 0;
  color: #991b1b;
  font-size: 14px;
}

/* Button Certificate (para el PDF de Odoo) */
.btn-certificate {
  background: #960505 !important;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-certificate:hover {
  background: #960505 !important;
}

/* Responsive para Odoo */
@media (max-width: 640px) {
  .validation-card {
    padding: 32px 24px;
  }
  
  .odoo-certificate-section {
    padding: 24px;
  }
  
  .certificate-banner {
    flex-direction: column;
    text-align: center;
  }
}
</style>