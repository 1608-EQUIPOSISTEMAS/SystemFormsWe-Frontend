<!-- frontend/src/views/admin/forms/FormCreateView.vue -->
<template>
  <div class="form-editor">
    
    <!-- ═══════════════════════════════════════════
         HEADER — Paso 1: Tipo + Título + Acciones
         ═══════════════════════════════════════════ -->
    <header class="editor-header">
      <div class="header-left">
        <button class="btn-back" @click="handleBack" title="Volver">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Type Toggle -->
        <div class="type-toggle">
          <button 
            :class="['toggle-opt', { active: store.form.form_type === 'SURVEY' }]"
            @click="store.form.form_type = 'SURVEY'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            Encuesta
          </button>
          <button 
            :class="['toggle-opt', { active: store.form.form_type === 'EXAM' }]"
            @click="store.form.form_type = 'EXAM'"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            Examen
          </button>
        </div>

        <span class="header-divider"></span>

        <!-- Title inline -->
        <input
          type="text"
          class="title-input"
          placeholder="Título del formulario..."
          v-model="store.form.title"
        />
      </div>

      <div class="header-actions">
        <!-- Bank badge (si activo) -->
        <span v-if="store.form.settings?.use_question_bank" class="badge-bank">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          {{ store.form.settings.questions_to_show }}/{{ store.questions?.length }}
        </span>

        <button class="btn-icon" @click="showSettings = true" title="Configuración">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
        <button class="btn-icon" @click="showPreview = true" title="Vista previa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button 
          class="btn-save" 
          @click="handleSave"
          :disabled="!canSave || store.isSaving"
        >
          <svg v-if="store.isSaving" class="spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          {{ store.isSaving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════
         CONTEXT BAR — Paso 2: Curso + Config rápida (Exam)
         ═══════════════════════════════════════════════════ -->
    <Transition name="slide-down">
      <div v-if="store.form.form_type === 'EXAM'" class="context-bar">
        <div class="context-bar-inner">
          
          <!-- Curso asociado — PROMINENTE -->
          <div class="context-field course-field">
            <label>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              Curso
            </label>
            <select v-model="store.form.course_id" class="context-select">
              <option value="">Seleccionar curso...</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
            <span v-if="!store.form.course_id" class="field-hint warning">Requerido para certificados</span>
          </div>

          <span class="context-divider"></span>

          <!-- Quick configs -->
          <div class="context-field">
            <label>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Tiempo
            </label>
            <div class="inline-input-group">
              <input 
                type="number" 
                v-model.number="store.form.settings.time_limit_minutes"
                min="1"
                placeholder="∞"
                class="context-input"
              >
              <span class="input-suffix">min</span>
            </div>
          </div>

          <div class="context-field">
            <label>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Aprobación
            </label>
            <div class="inline-input-group">
              <input 
                type="number" 
                v-model.number="store.form.settings.passing_score"
                min="0"
                max="100"
                placeholder="70"
                class="context-input"
              >
              <span class="input-suffix">%</span>
            </div>
          </div>

          <!-- Odoo toggle rápido -->
          <div class="context-field">
            <label class="context-toggle" title="Genera certificado automáticamente al aprobar">
              <input type="checkbox" v-model="store.form.settings.requires_odoo_validation">
              <span class="mini-toggle"></span>
              <span>Certificado auto</span>
            </label>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════
         BODY — Sidebar + Canvas
         ═══════════════════════════════════════════ -->
    <div class="editor-body">
      
      <!-- Sidebar: Solo tipos de pregunta -->
      <aside class="editor-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">Preguntas</span>
        </div>
        <div class="question-types">
          <button 
            v-for="type in store.questionTypes" 
            :key="type.id"
            class="type-btn"
            @click="addQuestion(type.id)"
            :title="type.description"
          >
            <i :class="getTypeIcon(type.code)"></i>
            <span>{{ type.name }}</span>
          </button>
        </div>
      </aside>

      <!-- Canvas principal -->
      <main class="editor-canvas">
        
        <!-- Descripción colapsable -->
        <div class="description-section" :class="{ collapsed: !showDescription && !store.form.description }">
          <button 
            v-if="!showDescription && !store.form.description" 
            class="btn-add-description"
            @click="showDescription = true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar descripción
          </button>
          <div v-else class="description-editor">
            <textarea
              v-model="store.form.description"
              placeholder="Descripción para los participantes..."
              rows="2"
              ref="descriptionRef"
            ></textarea>
            <button 
              v-if="!store.form.description" 
              class="btn-remove-desc" 
              @click="showDescription = false"
              title="Quitar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Banco de preguntas alert (si activo) -->
        <Transition name="fade">
          <div v-if="store.form.settings?.use_question_bank" class="bank-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            <span>
              Banco activo — <strong>{{ store.form.settings.questions_to_show }}</strong> de 
              <strong>{{ store.questions?.length }}</strong> preguntas se mostrarán aleatoriamente
            </span>
            <button class="btn-text" @click="showSettings = true; settingsTab = 'exam'">
              Configurar
            </button>
          </div>
        </Transition>

        <!-- Empty State -->
        <div v-if="!store.hasQuestions" class="empty-state">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <p class="empty-title">Agrega tu primera pregunta</p>
          <p class="empty-subtitle">Selecciona un tipo desde el panel izquierdo</p>
        </div>

        <!-- Questions List -->
        <TransitionGroup v-else name="list" tag="div" class="questions-list">
          <QuestionCard
            v-for="(question, index) in store.questions"
            :key="question.temp_id || question.id"
            :question="question"
            :index="index"
            :is-exam="store.isExam"
            @update="(updates) => store.updateQuestion(question.temp_id || question.id, updates)"
            @remove="store.removeQuestion(question.temp_id || question.id)"
            @duplicate="store.duplicateQuestion(question.temp_id || question.id)"
            @move-up="moveUp(index)"
            @move-down="moveDown(index)"
            @add-option="store.addOption(question.temp_id || question.id)"
            @update-option="(optId, updates) => store.updateOption(question.temp_id || question.id, optId, updates)"
            @remove-option="(optId) => store.removeOption(question.temp_id || question.id, optId)"
          />
        </TransitionGroup>
      </main>
    </div>

    <!-- ═══════════════════════════════════════════
         BOTTOM BAR — Resumen flotante
         ═══════════════════════════════════════════ -->
    <Transition name="slide-up">
      <div v-if="store.hasQuestions" class="bottom-bar">
        <div class="bottom-bar-inner">
          <div class="stats-row">
            <div class="stat-chip">
              <span class="stat-num">{{ store.questions?.length || 0 }}</span>
              <span class="stat-txt">{{ store.form.settings?.use_question_bank ? 'en banco' : 'preguntas' }}</span>
            </div>
            <div v-if="store.form.settings?.use_question_bank" class="stat-chip accent">
              <span class="stat-num">{{ store.form.settings.questions_to_show || 0 }}</span>
              <span class="stat-txt">se muestran</span>
            </div>
            <div v-if="store.form.form_type === 'EXAM'" class="stat-chip">
              <span class="stat-num">{{ totalPoints }}</span>
              <span class="stat-txt">puntos</span>
            </div>
          </div>

          <!-- Validación rápida -->
          <div v-if="!canSave" class="save-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span v-if="!store.form?.title?.trim()">Falta el título</span>
            <span v-else-if="!store.hasQuestions">Agrega al menos una pregunta</span>
            <span v-else-if="!questionBankValid">Configura el banco de preguntas</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════
         SETTINGS MODAL
         ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
          <div class="modal-panel settings-panel">
            <div class="modal-top">
              <h2>Configuración</h2>
              <button class="btn-close" @click="showSettings = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-tabs">
              <button 
                :class="{ active: settingsTab === 'general' }"
                @click="settingsTab = 'general'"
              >General</button>
              <button 
                :class="{ active: settingsTab === 'access' }"
                @click="settingsTab = 'access'"
              >Acceso</button>
              <button 
                v-if="store.form.form_type === 'EXAM'"
                :class="{ active: settingsTab === 'exam' }"
                @click="settingsTab = 'exam'"
              >Examen</button>
              <button 
                v-if="store.form.form_type === 'EXAM'"
                :class="{ active: settingsTab === 'odoo' }"
                @click="settingsTab = 'odoo'"
              >Certificados</button>
              <button 
                :class="{ active: settingsTab === 'messages' }"
                @click="settingsTab = 'messages'"
              >Mensajes</button>
            </div>

            <div class="modal-scroll">
              
              <!-- General -->
              <div v-show="settingsTab === 'general'" class="tab-content">
                <div class="field-toggle">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.is_active">
                    <span class="toggle-track"></span>
                    Formulario activo
                  </label>
                  <p class="field-hint">Cuando está desactivado, nadie puede responder</p>
                </div>
                <div class="field-toggle">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.show_progress_bar">
                    <span class="toggle-track"></span>
                    Barra de progreso
                  </label>
                </div>
                <div class="field-toggle">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.shuffle_questions">
                    <span class="toggle-track"></span>
                    Mezclar orden de preguntas
                  </label>
                  <p class="field-hint">Orden diferente en cada intento</p>
                </div>
              </div>

              <!-- Acceso -->
              <div v-show="settingsTab === 'access'" class="tab-content">
                <div class="field-toggle">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.requires_login">
                    <span class="toggle-track"></span>
                    Requiere inicio de sesión
                  </label>
                </div>
                <div class="field-toggle" v-if="store.form.form_type === 'SURVEY'">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.is_public">
                    <span class="toggle-track"></span>
                    Formulario público
                  </label>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label>Disponible desde</label>
                    <input type="datetime-local" v-model="store.form.settings.available_from">
                  </div>
                  <div class="field-group">
                    <label>Disponible hasta</label>
                    <input type="datetime-local" v-model="store.form.settings.available_until">
                  </div>
                </div>
              </div>

              <!-- Examen -->
              <div v-show="settingsTab === 'exam'" class="tab-content">
                <p class="tab-note">Tiempo y puntaje también se pueden editar desde la barra superior.</p>

                <div class="field-group">
                  <label>Tiempo límite</label>
                  <div class="input-with-suffix">
                    <input 
                      type="number" 
                      v-model.number="store.form.settings.time_limit_minutes"
                      min="1"
                      placeholder="Sin límite"
                    >
                    <span>minutos</span>
                  </div>
                </div>

                <div class="field-group">
                  <label>Puntaje mínimo para aprobar</label>
                  <div class="input-with-suffix">
                    <input 
                      type="number" 
                      v-model.number="store.form.settings.passing_score"
                      min="0" max="100"
                      placeholder="70"
                    >
                    <span>%</span>
                  </div>
                </div>

                <hr class="divider">

                <!-- Banco de preguntas -->
                <div class="bank-section">
                  <div class="bank-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                    Banco de preguntas aleatorias
                  </div>

                  <div class="field-toggle">
                    <label>
                      <input 
                        type="checkbox" 
                        v-model="store.form.settings.use_question_bank"
                        @change="onQuestionBankToggle"
                      >
                      <span class="toggle-track"></span>
                      Selección aleatoria
                    </label>
                    <p class="field-hint">Cada intento recibe preguntas diferentes</p>
                  </div>

                  <Transition name="fade">
                    <div v-if="store.form.settings.use_question_bank" class="bank-config">
                      <div class="bank-flow">
                        <div class="bank-num">
                          <span class="bank-value">{{ store.questions?.length || 0 }}</span>
                          <span class="bank-label">en banco</span>
                        </div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="bank-arrow"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        <div class="bank-num highlight">
                          <input 
                            type="number"
                            v-model.number="store.form.settings.questions_to_show"
                            :max="store.questions?.length || 0"
                            min="1"
                            class="bank-input"
                          >
                          <span class="bank-label">se muestran</span>
                        </div>
                      </div>

                      <div v-if="!questionBankValid" class="inline-warning">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <span v-if="!store.form.settings.questions_to_show">Ingresa cuántas preguntas mostrar</span>
                        <span v-else>No puedes mostrar más de las que hay en el banco</span>
                      </div>
                    </div>
                  </Transition>
                </div>

                <hr class="divider">

                <div class="field-toggle">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.show_score_after_submit">
                    <span class="toggle-track"></span>
                    Mostrar puntaje al finalizar
                  </label>
                </div>
                <div class="field-toggle">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.show_correct_answers">
                    <span class="toggle-track"></span>
                    Mostrar respuestas correctas
                  </label>
                </div>
              </div>

              <!-- Certificados / Odoo -->
              <div v-show="settingsTab === 'odoo'" class="tab-content">
                <div class="field-toggle">
                  <label>
                    <input type="checkbox" v-model="store.form.settings.requires_odoo_validation" @change="markDirty">
                    <span class="toggle-track"></span>
                    Validación y certificado automático
                  </label>
                  <p class="field-hint">
                    El alumno ingresa su correo del campus virtual. Al aprobar, se genera el certificado en Odoo automáticamente.
                  </p>
                </div>

                <Transition name="fade">
                  <div v-if="store.form.settings.requires_odoo_validation" class="info-box">
                    <div class="info-box-title">Flujo automático</div>
                    <ol>
                      <li>Sistema busca el curso en Odoo por el título del examen</li>
                      <li>Alumno ingresa correo → se valida en el campus</li>
                      <li>Al aprobar → certificado generado automáticamente</li>
                    </ol>
                  </div>
                </Transition>
              </div>

              <!-- Mensajes -->
              <div v-show="settingsTab === 'messages'" class="tab-content">
                <div class="field-group">
                  <label>Mensaje de bienvenida</label>
                  <textarea 
                    v-model="store.form.settings.welcome_message"
                    rows="3"
                    placeholder="Se muestra antes de comenzar..."
                  ></textarea>
                </div>
                <div class="field-group">
                  <label>Mensaje al enviar</label>
                  <textarea 
                    v-model="store.form.settings.submit_message"
                    rows="3"
                    placeholder="Gracias por completar el formulario."
                  ></textarea>
                </div>
              </div>

            </div>

            <div class="modal-bottom">
              <button class="btn-secondary" @click="showSettings = false">Cerrar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══════════════════════════════════════════
         PREVIEW MODAL
         ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPreview" class="modal-overlay" @click.self="showPreview = false">
          <div class="modal-panel preview-panel">
            <div class="modal-top">
              <h2>Vista previa</h2>
              <button class="btn-close" @click="showPreview = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-scroll preview-scroll">
              <div class="preview-wrapper">
                <div v-if="store.form.settings?.use_question_bank" class="preview-bank-note">
                  Vista previa muestra todas. En el examen real: {{ store.form.settings.questions_to_show }} aleatorias.
                </div>
                <div class="preview-form">
                  <h1>{{ store.form.title || 'Sin título' }}</h1>
                  <p v-if="store.form.description" class="preview-desc">{{ store.form.description }}</p>
                  <div 
                    v-for="(q, i) in store.questions" 
                    :key="q.temp_id || q.id"
                    class="preview-q"
                  >
                    <div class="pq-header">
                      <span class="pq-num">{{ i + 1 }}</span>
                      <span class="pq-text">{{ q.question_text || 'Pregunta sin texto' }}</span>
                      <span v-if="q.is_required" class="pq-required">*</span>
                    </div>
                    <div class="pq-input">
                      <template v-if="['TEXT', 'EMAIL'].includes(q.type_code)">
                        <input type="text" :placeholder="q.placeholder || 'Tu respuesta'" disabled>
                      </template>
                      <template v-else-if="q.type_code === 'TEXTAREA'">
                        <textarea :placeholder="q.placeholder || 'Tu respuesta'" disabled></textarea>
                      </template>
                      <template v-else-if="q.type_code === 'RADIO'">
                        <div v-for="opt in q.options" :key="opt.temp_id || opt.id" class="pq-option">
                          <input type="radio" disabled>
                          <span>{{ opt.option_text }}</span>
                        </div>
                      </template>
                      <template v-else-if="q.type_code === 'CHECKBOX'">
                        <div v-for="opt in q.options" :key="opt.temp_id || opt.id" class="pq-option">
                          <input type="checkbox" disabled>
                          <span>{{ opt.option_text }}</span>
                        </div>
                      </template>
                      <template v-else-if="q.type_code === 'SELECT'">
                        <select disabled>
                          <option>Seleccionar...</option>
                          <option v-for="opt in q.options" :key="opt.temp_id || opt.id">{{ opt.option_text }}</option>
                        </select>
                      </template>
                      <template v-else>
                        <input type="text" placeholder="Respuesta" disabled>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Unsaved Changes -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showUnsavedModal" class="modal-overlay">
          <div class="modal-panel unsaved-panel">
            <div class="modal-top">
              <h2>Cambios sin guardar</h2>
            </div>
            <div class="unsaved-body">
              <p>¿Qué deseas hacer con los cambios pendientes?</p>
            </div>
            <div class="modal-bottom">
              <button class="btn-secondary" @click="discardAndLeave">Descartar</button>
              <button class="btn-primary" @click="saveAndLeave">Guardar y salir</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useFormBuilderStore } from '@/stores/formBuilder'
import QuestionCard from '@/components/forms/QuestionCard.vue'
import { courseService } from '@/services/course.service'

const router = useRouter()
const store = useFormBuilderStore()

// State
const courses = ref([])
const showSettings = ref(false)
const showPreview = ref(false)
const showUnsavedModal = ref(false)
const showDescription = ref(false)
const settingsTab = ref('general')
const toast = ref({ show: false, message: '', type: 'success' })
const descriptionRef = ref(null)

let pendingNavigation = null

// Computed
const canSave = computed(() => {
  if (!store.form?.title?.trim() || !store.hasQuestions) return false
  if (store.form.settings?.use_question_bank && !questionBankValid.value) return false
  return true
})

const totalPoints = computed(() => {
  if (!store.questions) return 0
  return store.questions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0)
})

const questionBankValid = computed(() => {
  if (!store.form.settings?.use_question_bank) return true
  const toShow = store.form.settings.questions_to_show
  if (!toShow || toShow < 1) return false
  return toShow <= (store.questions?.length || 0)
})

// Methods
function onQuestionBankToggle() {
  if (store.form.settings.use_question_bank && !store.form.settings.questions_to_show) {
    store.form.settings.questions_to_show = Math.min(10, store.questions?.length || 10)
  }
  if (!store.form.settings.use_question_bank) {
    store.form.settings.questions_to_show = null
  }
}

function getTypeIcon(code) {
  const icons = {
    TEXT: 'bi bi-fonts',
    TEXTAREA: 'bi bi-text-paragraph',
    SELECT: 'bi bi-chevron-down',
    RADIO: 'bi bi-circle',
    CHECKBOX: 'bi bi-check-square',
    NUMBER: 'bi bi-123',
    EMAIL: 'bi bi-envelope',
    DATE: 'bi bi-calendar',
    TIME: 'bi bi-clock',
    DATETIME: 'bi bi-calendar-event',
    FILE: 'bi bi-paperclip',
    RATING: 'bi bi-star',
    SCALE: 'bi bi-sliders'
  }
  return icons[code] || 'bi bi-question-circle'
}

function addQuestion(typeId) {
  store.addQuestion(typeId)
}

function moveUp(index) {
  if (index > 0) store.moveQuestion(index, index - 1)
}

function moveDown(index) {
  if (index < store.questions.length - 1) store.moveQuestion(index, index + 1)
}

function markDirty() {
  store.isDirty = true
}

async function handleSave() {
  if (!canSave.value) {
    showToast('Completa el título y agrega al menos una pregunta', 'error')
    return
  }
  const emptyQuestion = store.questions.find(q => !q.question_text.trim())
  if (emptyQuestion) {
    showToast('Todas las preguntas deben tener texto', 'error')
    return
  }
  try {
    const result = await store.saveForm()
    showToast('Formulario guardado', 'success')
    setTimeout(() => { router.push(`/admin/forms/${result.uuid}`) }, 1500)
  } catch (error) {
    showToast(error.message || 'Error al guardar', 'error')
  }
}

function handleBack() {
  if (store.isDirty) {
    showUnsavedModal.value = true
    pendingNavigation = () => router.push('/admin/forms')
  } else {
    router.push('/admin/forms')
  }
}

async function saveAndLeave() {
  await handleSave()
  showUnsavedModal.value = false
  if (pendingNavigation) { pendingNavigation(); pendingNavigation = null }
}

function discardAndLeave() {
  store.isDirty = false
  showUnsavedModal.value = false
  if (pendingNavigation) { pendingNavigation(); pendingNavigation = null }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function handleBeforeUnload(e) {
  if (store.isDirty) { e.preventDefault(); e.returnValue = '' }
}

onBeforeRouteLeave((to, from, next) => {
  if (store.isDirty) {
    showUnsavedModal.value = true
    pendingNavigation = () => next()
    next(false)
  } else { next() }
})

onMounted(async () => {
  store.resetForm()
  await store.loadQuestionTypes()
  try {
    const response = await courseService.list()
    courses.value = response.data?.courses || []
  } catch (error) {
    console.error('Error cargando cursos:', error)
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
/* ══════════════════════════════════════
   Design Tokens
   ══════════════════════════════════════ */
:root {
  --c-bg: #fafafa;
  --c-surface: #ffffff;
  --c-border: #e8e8e8;
  --c-border-subtle: #f0f0f0;
  --c-text-1: #111111;
  --c-text-2: #555555;
  --c-text-3: #888888;
  --c-primary: #111111;
  --c-primary-soft: #f5f5f5;
  --c-accent: #4f46e5;
  --c-accent-soft: #eef2ff;
  --c-warning: #f59e0b;
  --c-warning-soft: #fffbeb;
  --c-danger: #ef4444;
  --c-success: #10b981;
  --radius-s: 6px;
  --radius-m: 8px;
  --radius-l: 12px;
}

* { box-sizing: border-box; }

.form-editor {
  min-height: 100vh;
  background: var(--c-bg);
  color: var(--c-text-1);
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
}

/* ══════════════════════════════════════
   Header
   ══════════════════════════════════════ */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.btn-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-m);
  background: transparent;
  color: var(--c-text-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}
.btn-back:hover { background: var(--c-primary-soft); color: var(--c-text-1); }

.type-toggle {
  display: flex;
  background: #f0f0f0;
  border-radius: var(--radius-m);
  padding: 3px;
  flex-shrink: 0;
  border: 1px solid var(--c-border);
}

.toggle-opt {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  border-radius: var(--radius-s);
  background: transparent;
  color: var(--c-text-3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.toggle-opt.active {
  background: var(--c-primary);
  color: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.toggle-opt:not(.active):hover { color: var(--c-text-1); background: rgba(0,0,0,0.04); }

.header-divider {
  width: 1px;
  height: 24px;
  background: var(--c-border);
  flex-shrink: 0;
}

.title-input {
  border: none;
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-1);
  background: transparent;
  outline: none;
  width: 100%;
  min-width: 0;
}
.title-input::placeholder { color: var(--c-text-3); font-weight: 400; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.badge-bank {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--c-accent-soft);
  color: var(--c-accent);
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  color: var(--c-text-3);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-icon:hover { color: var(--c-text-1); border-color: var(--c-text-3); }

.btn-save {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border: none;
  border-radius: var(--radius-m);
  background: var(--c-primary);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-save:hover:not(:disabled) { opacity: 0.85; }
.btn-save:disabled { opacity: 0.35; cursor: not-allowed; }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════
   Context Bar (Exam Config)
   ══════════════════════════════════════ */
.context-bar {
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  padding: 0 20px;
}

.context-bar-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
  max-width: 1320px;
  margin: 0 auto;
  overflow-x: auto;
}

.context-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.context-field > label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-3);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.course-field {
  flex: 1;
  min-width: 200px;
}

.context-select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-s);
  font-size: 13px;
  background: var(--c-surface);
  color: var(--c-text-1);
  min-width: 180px;
}
.context-select:focus { outline: none; border-color: var(--c-text-3); }

.field-hint {
  font-size: 11px;
  color: var(--c-text-3);
  margin: 0;
}
.field-hint.warning { color: var(--c-warning); }

.context-divider {
  width: 1px;
  height: 28px;
  background: var(--c-border);
  flex-shrink: 0;
}

.inline-input-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-s);
  overflow: hidden;
}

.context-input {
  width: 56px;
  padding: 5px 8px;
  border: none;
  font-size: 13px;
  text-align: center;
  background: transparent;
  color: var(--c-text-1);
}
.context-input:focus { outline: none; }
.context-input::placeholder { color: var(--c-text-3); }

.input-suffix {
  padding: 5px 8px;
  font-size: 12px;
  color: var(--c-text-3);
  background: var(--c-primary-soft);
  border-left: 1px solid var(--c-border);
}

.context-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--c-text-2);
  white-space: nowrap;
}
.context-toggle input { display: none; }

.mini-toggle {
  width: 36px;
  height: 20px;
  background: #c5c9d0;
  border-radius: 10px;
  position: relative;
  transition: background 0.25s ease;
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}
.mini-toggle::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
.context-toggle input:checked + .mini-toggle { background: #10b981; }
.context-toggle input:checked + .mini-toggle::after { transform: translateX(16px); }

/* Slide transitions */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 80px; }

/* ══════════════════════════════════════
   Body Layout
   ══════════════════════════════════════ */
.editor-body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0;
  max-width: 1320px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
}

/* ══════════════════════════════════════
   Sidebar
   ══════════════════════════════════════ */
.editor-sidebar {
  border-right: 1px solid var(--c-border);
  background: var(--c-surface);
  padding: 16px;
  position: sticky;
  top: 57px;
  height: calc(100vh - 57px);
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 12px;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.question-types {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-s);
  background: transparent;
  color: var(--c-text-2);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.12s;
}
.type-btn:hover { background: var(--c-primary-soft); color: var(--c-text-1); }
.type-btn i { width: 18px; color: var(--c-text-3); font-size: 14px; }
.type-btn:hover i { color: var(--c-text-1); }

/* ══════════════════════════════════════
   Canvas (Main)
   ══════════════════════════════════════ */
.editor-canvas {
  padding: 24px 32px;
  max-width: 780px;
}

/* Description */
.description-section.collapsed { margin-bottom: 0; }

.btn-add-description {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px dashed var(--c-border);
  border-radius: var(--radius-m);
  background: transparent;
  color: var(--c-text-3);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 16px;
}
.btn-add-description:hover { border-color: var(--c-text-3); color: var(--c-text-2); }

.description-editor {
  position: relative;
  margin-bottom: 16px;
}

.description-editor textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-m);
  font-family: inherit;
  font-size: 14px;
  color: var(--c-text-2);
  resize: vertical;
  background: var(--c-surface);
  transition: border-color 0.15s;
}
.description-editor textarea:focus { outline: none; border-color: var(--c-text-3); }
.description-editor textarea::placeholder { color: var(--c-text-3); }

.btn-remove-desc {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--c-text-3);
  cursor: pointer;
}
.btn-remove-desc:hover { background: var(--c-primary-soft); color: var(--c-text-1); }

/* Bank Notice */
.bank-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--c-accent-soft);
  border: 1px solid #c7d2fe;
  border-radius: var(--radius-m);
  font-size: 13px;
  color: var(--c-accent);
  margin-bottom: 16px;
}
.bank-notice strong { font-weight: 600; }

.btn-text {
  border: none;
  background: none;
  color: var(--c-accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}
.empty-icon { color: var(--c-border); margin-bottom: 16px; }
.empty-title { margin: 0 0 4px; font-size: 15px; font-weight: 500; color: var(--c-text-2); }
.empty-subtitle { margin: 0; font-size: 13px; color: var(--c-text-3); }

/* Questions list */
.questions-list { display: flex; flex-direction: column; gap: 12px; }

.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from { opacity: 0; transform: translateY(-12px); }
.list-leave-to { opacity: 0; transform: translateX(12px); }
.list-move { transition: transform 0.25s ease; }

/* ══════════════════════════════════════
   Bottom Bar
   ══════════════════════════════════════ */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
  padding: 8px 20px;
}

.bottom-bar-inner {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stat-chip {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.stat-num { font-size: 16px; font-weight: 700; color: var(--c-text-1); }
.stat-txt { font-size: 12px; color: var(--c-text-3); }
.stat-chip.accent .stat-num { color: var(--c-accent); }

.save-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--c-warning);
}

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(100%); }

/* ══════════════════════════════════════
   Modal System
   ══════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-panel {
  background: #ffffff;
  border-radius: var(--radius-l);
  width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.2);
  border: 1px solid var(--c-border);
}

.settings-panel { max-width: 560px; }
.preview-panel { max-width: 720px; }
.unsaved-panel { max-width: 380px; }

.modal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}
.modal-top h2 { margin: 0; font-size: 16px; font-weight: 600; }

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-s);
  background: transparent;
  color: var(--c-text-3);
  cursor: pointer;
}
.btn-close:hover { background: var(--c-primary-soft); color: var(--c-text-1); }

.modal-tabs {
  display: flex;
  gap: 0;
  padding: 0 20px;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
  overflow-x: auto;
}
.modal-tabs button {
  padding: 10px 14px;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--c-text-3);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.modal-tabs button:hover { color: var(--c-text-2); }
.modal-tabs button.active {
  color: var(--c-text-1);
  border-bottom-color: var(--c-primary);
}

.modal-scroll {
  overflow-y: auto;
  padding: 20px;
  flex: 1;
}

.modal-bottom {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--c-border);
  flex-shrink: 0;
}

.unsaved-body { padding: 20px; }
.unsaved-body p { margin: 0; font-size: 14px; color: var(--c-text-2); }

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-m);
  background: var(--c-surface);
  color: var(--c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.btn-secondary:hover { border-color: var(--c-text-3); }

.btn-primary {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-m);
  background: var(--c-primary);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.btn-primary:hover { opacity: 0.85; }

/* Settings tabs content */
.tab-content { display: flex; flex-direction: column; gap: 16px; }

.tab-note {
  font-size: 12px;
  color: var(--c-text-3);
  margin: 0;
  padding: 8px 12px;
  background: var(--c-primary-soft);
  border-radius: var(--radius-s);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-group > label {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-2);
}

.field-group input[type="text"],
.field-group input[type="number"],
.field-group input[type="datetime-local"],
.field-group textarea,
.field-group select {
  padding: 8px 12px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-m);
  font-family: inherit;
  font-size: 14px;
  color: var(--c-text-1);
  background: var(--c-surface);
  transition: border-color 0.15s;
}
.field-group input:focus,
.field-group textarea:focus,
.field-group select:focus { outline: none; border-color: var(--c-text-3); }

.input-with-suffix {
  display: flex;
  align-items: center;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-m);
  overflow: hidden;
}
.input-with-suffix input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  font-size: 14px;
  color: var(--c-text-1);
}
.input-with-suffix input:focus { outline: none; }
.input-with-suffix span {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--c-text-3);
  background: var(--c-primary-soft);
}

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.field-toggle { display: flex; flex-direction: column; gap: 4px; }
.field-toggle label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-1);
}
.field-toggle input { display: none; }

.toggle-track {
  width: 44px;
  height: 24px;
  background: #c5c9d0;
  border-radius: 12px;
  position: relative;
  transition: background 0.25s ease;
  flex-shrink: 0;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}
.toggle-track::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.field-toggle input:checked + .toggle-track { background: #10b981; }
.field-toggle input:checked + .toggle-track::after { transform: translateX(20px); }

.divider { border: none; border-top: 1px solid var(--c-border-subtle); margin: 4px 0; }

/* Bank section in settings */
.bank-section {
  background: var(--c-accent-soft);
  padding: 16px;
  border-radius: var(--radius-m);
  border: 1px solid #c7d2fe;
}

.bank-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-accent);
  margin-bottom: 12px;
}

.bank-config {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #c7d2fe;
}

.bank-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px;
  background: white;
  border-radius: var(--radius-m);
}

.bank-num { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.bank-value { font-size: 24px; font-weight: 700; color: var(--c-text-1); }
.bank-label { font-size: 11px; color: var(--c-text-3); text-transform: uppercase; letter-spacing: 0.03em; }
.bank-num.highlight .bank-label { color: var(--c-accent); font-weight: 600; }
.bank-arrow { color: var(--c-text-3); }

.bank-input {
  width: 64px;
  font-size: 24px;
  font-weight: 700;
  color: var(--c-accent);
  text-align: center;
  border: 2px solid #c7d2fe;
  border-radius: var(--radius-s);
  padding: 4px;
  background: transparent;
}
.bank-input:focus { outline: none; border-color: var(--c-accent); }

.inline-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--c-warning-soft);
  border: 1px solid #fde68a;
  border-radius: var(--radius-s);
  color: #92400e;
  font-size: 13px;
}

/* Info box (Odoo) */
.info-box {
  padding: 14px 16px;
  background: var(--c-accent-soft);
  border: 1px solid #c7d2fe;
  border-radius: var(--radius-m);
}
.info-box-title { font-size: 13px; font-weight: 600; color: var(--c-accent); margin-bottom: 8px; }
.info-box ol { margin: 0; padding-left: 18px; font-size: 13px; color: var(--c-text-2); }
.info-box li { margin-bottom: 4px; }

/* ══════════════════════════════════════
   Preview
   ══════════════════════════════════════ */
.preview-scroll { background: var(--c-bg); }
.preview-wrapper { max-width: 560px; margin: 0 auto; }

.preview-bank-note {
  padding: 10px 14px;
  background: var(--c-warning-soft);
  border: 1px solid #fde68a;
  border-radius: var(--radius-m);
  margin-bottom: 16px;
  font-size: 13px;
  color: #92400e;
}

.preview-form {
  background: var(--c-surface);
  border-radius: var(--radius-l);
  padding: 28px;
}
.preview-form h1 { margin: 0 0 6px; font-size: 20px; }
.preview-desc { margin: 0 0 20px; color: var(--c-text-3); font-size: 14px; }

.preview-q { padding: 16px 0; border-bottom: 1px solid var(--c-border-subtle); }
.preview-q:last-child { border-bottom: none; }

.pq-header { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; }
.pq-num {
  width: 22px;
  height: 22px;
  background: var(--c-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.pq-text { font-size: 14px; font-weight: 500; color: var(--c-text-1); }
.pq-required { color: var(--c-danger); }

.pq-input input, .pq-input textarea, .pq-input select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-s);
  background: var(--c-primary-soft);
  font-size: 14px;
}
.pq-option { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 14px; }

/* ══════════════════════════════════════
   Toast
   ══════════════════════════════════════ */
.toast {
  position: fixed;
  bottom: 60px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-m);
  font-size: 13px;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.toast.success { background: #065f46; color: white; }
.toast.error { background: #991b1b; color: white; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }

/* Modal transitions */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel, .modal-leave-to .modal-panel { transform: scale(0.96) translateY(8px); }

.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ══════════════════════════════════════
   Responsive
   ══════════════════════════════════════ */
@media (max-width: 1024px) {
  .editor-body { grid-template-columns: 1fr; }
  .editor-sidebar {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--c-border);
    padding: 12px 16px;
  }
  .question-types { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 4px; }
  .editor-canvas { padding: 16px; max-width: 100%; }
}

@media (max-width: 640px) {
  .editor-header { padding: 10px 12px; gap: 8px; }
  .header-divider { display: none; }
  .type-toggle { order: 3; }
  .header-left { flex-wrap: wrap; }
  .title-input { font-size: 16px; order: 2; width: 100%; }
  .context-bar-inner { flex-wrap: wrap; gap: 12px; }
  .course-field { flex-basis: 100%; }
  .field-row { grid-template-columns: 1fr; }
  .bank-flow { flex-direction: column; gap: 8px; }
  .bank-arrow { transform: rotate(90deg); }
  .modal-tabs { padding: 0 12px; }
  .modal-tabs button { padding: 8px 10px; font-size: 12px; }
}
</style>