<template>
  <div class="reports-page">
    <!-- Loading -->
    <div v-if="loading" class="state-container">
      <div class="loader"></div>
      <p>Cargando reportes...</p>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Header -->
      <header class="page-header">
        <div class="header-top">
          <router-link :to="`/admin/forms/${formUuid}/responses`" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </router-link>
          <div class="header-badges">
            <span class="badge" :class="form?.form_type?.toLowerCase()">
              {{ form?.form_type === 'EXAM' ? 'Examen' : 'Encuesta' }}
            </span>
          </div>
        </div>

        <div class="header-main">
          <div class="header-info">
            <h1>Reportes y Análisis</h1>
            <p class="form-title">{{ form?.title }}</p>
          </div>
          <div class="header-actions">
          </div>
        </div>
      </header>

      <!-- Stats Overview -->
      <section class="stats-overview">
        <div class="stat-card highlight">
          <div class="stat-ring">
            <svg viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="ring-fill" :stroke-dasharray="`${completionRate}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <span class="ring-value">{{ completionRate }}%</span>
          </div>
          <div class="stat-meta">
            <span class="stat-title">Tasa de Completado</span>
            <span class="stat-desc">{{ stats.completed }}/{{ stats.total }} respuestas</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">Total Respuestas</span>
          </div>
        </div>

        <div v-if="form?.form_type === 'EXAM'" class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.avgScore }}<small>%</small></span>
            <span class="stat-label">Promedio General</span>
          </div>
        </div>

        <div v-if="form?.form_type === 'EXAM'" class="stat-card">
          <div class="stat-icon orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.passed || 0 }}</span>
            <span class="stat-label">Aprobados</span>
          </div>
        </div>
      </section>

      <!-- Charts Grid -->
      <section class="charts-grid">
        <!-- Responses Over Time -->
        <div class="chart-card wide">
          <div class="chart-header">
            <h3>Respuestas en el Tiempo</h3>
            <div class="chart-controls">
              <button :class="['chip', { active: timeRange === '7d' }]" @click="timeRange = '7d'">7 días</button>
              <button :class="['chip', { active: timeRange === '30d' }]" @click="timeRange = '30d'">30 días</button>
              <button :class="['chip', { active: timeRange === 'all' }]" @click="timeRange = 'all'">Todo</button>
            </div>
          </div>
          <div class="chart-body">
            <div class="line-chart" ref="timeChartRef">
              <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="xMidYMid meet">
                <!-- Grid Lines -->
                <g class="grid-lines">
                  <line v-for="i in 5" :key="i" :x1="padding" :x2="chartWidth - padding" 
                        :y1="padding + (i-1) * gridStep" :y2="padding + (i-1) * gridStep"/>
                </g>
                <!-- Area -->
                <path :d="areaPath" class="chart-area"/>
                <!-- Line -->
                <path :d="linePath" class="chart-line"/>
                <!-- Points -->
                <g class="chart-points">
                  <circle v-for="(point, i) in chartPoints" :key="i" 
                          :cx="point.x" :cy="point.y" r="5"
                          @mouseenter="showTooltip($event, point)"
                          @mouseleave="hideTooltip"/>
                </g>
              </svg>
              <div class="chart-labels">
                <span v-for="(label, i) in timeLabels" :key="i">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Score Distribution (Solo Exámenes) -->
        <div v-if="form?.form_type === 'EXAM'" class="chart-card">
          <div class="chart-header">
            <h3>Distribución de Notas</h3>
          </div>
          <div class="chart-body">
            <div class="bar-chart">
              <div v-for="(bar, i) in scoreDistribution" :key="i" class="bar-group">
                <span class="bar-count">{{ bar.count }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ height: bar.percent + '%' }" :class="bar.class"></div>
                </div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pass/Fail Ratio (Solo Exámenes) -->
        <div v-if="form?.form_type === 'EXAM'" class="chart-card">
          <div class="chart-header">
            <h3>Aprobados vs Reprobados</h3>
          </div>
          <div class="chart-body centered">
            <div class="donut-chart">
              <svg viewBox="0 0 42 42">
                <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954"/>
                <circle class="donut-segment passed" cx="21" cy="21" r="15.91549430918954"
                        :stroke-dasharray="`${passedPercent} ${100 - passedPercent}`"
                        stroke-dashoffset="25"/>
                <circle class="donut-segment failed" cx="21" cy="21" r="15.91549430918954"
                        :stroke-dasharray="`${failedPercent} ${100 - failedPercent}`"
                        :stroke-dashoffset="`${25 - passedPercent}`"/>
              </svg>
              <div class="donut-center">
                <span class="donut-value">{{ passedPercent }}%</span>
                <span class="donut-label">Aprobados</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item">
                <span class="legend-dot passed"></span>
                <span>Aprobados: {{ stats.passed || 0 }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot failed"></span>
                <span>Reprobados: {{ stats.failed || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Question Analysis -->
        <div class="chart-card" :class="{ wide: form?.form_type !== 'EXAM' }">
          <div class="chart-header">
            <h3>Análisis por Pregunta</h3>
          </div>
          <div class="chart-body">
            <div class="questions-analysis">
              <div v-for="(q, i) in questionsStats" :key="i" class="question-row">
                <div class="question-info">
                  <span class="question-num">{{ i + 1 }}</span>
                  <span class="question-text">{{ truncate(q.text, 40) }}</span>
                </div>
                <div class="question-bar-container" style="margin-right: 50px;">
                  <div class="question-bar" :style="{ width: q.correctPercent + '%' }"></div>
                  <span class="question-percent">{{ q.correctPercent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Performers (Solo Exámenes) -->
        <div v-if="form?.form_type === 'EXAM'" class="chart-card">
          <div class="chart-header">
            <h3>Mejores Resultados</h3>
          </div>
          <div class="chart-body">
            <div class="top-performers">
              <div v-for="(user, i) in topPerformers" :key="i" class="performer-row">
                <div class="performer-rank" :class="getRankClass(i)">{{ i + 1 }}</div>
                <div class="performer-info">
                  <span class="performer-name">{{ user.name || 'Anónimo' }}</span>
                  <span class="performer-email">{{ user.email }}</span>
                </div>
                <div class="performer-score">{{ user.score }}%</div>
              </div>
              <div v-if="topPerformers.length === 0" class="empty-performers">
                Sin datos aún
              </div>
            </div>
          </div>
        </div>

        <!-- Response Time Analysis -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Tiempo de Respuesta</h3>
          </div>
          <div class="chart-body centered">
            <div class="time-stats">
              <div class="time-stat">
                <span class="time-value">{{ stats.avgDuration || 0 }}</span>
                <span class="time-unit">min</span>
                <span class="time-label">Promedio</span>
              </div>
              <div class="time-divider"></div>
              <div class="time-stat">
                <span class="time-value">{{ stats.minDuration || 0 }}</span>
                <span class="time-unit">min</span>
                <span class="time-label">Mínimo</span>
              </div>
              <div class="time-divider"></div>
              <div class="time-stat">
                <span class="time-value">{{ stats.maxDuration || 0 }}</span>
                <span class="time-unit">min</span>
                <span class="time-label">Máximo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tooltip -->
      <div v-if="tooltip.show" class="chart-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
        <strong>{{ tooltip.date }}</strong>
        <span>{{ tooltip.value }} respuestas</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import formService from '@/services/form.service'

const route = useRoute()
const formUuid = computed(() => route.params.id)

// State
const form = ref(null)
const stats = ref({ total: 0, completed: 0, avgScore: 0, passed: 0, failed: 0 })
const responses = ref([])
const dailyData = ref([])
const loading = ref(true)
const timeRange = ref('7d')

// Chart dimensions
const chartWidth = 600
const chartHeight = 200
const padding = 30
const gridStep = (chartHeight - padding * 2) / 4

// Tooltip
const tooltip = ref({ show: false, x: 0, y: 0, date: '', value: 0 })

// Computed
const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.completed / stats.value.total) * 100)
})

const passedPercent = computed(() => {
  const total = (stats.value.passed || 0) + (stats.value.failed || 0)
  if (total === 0) return 0
  return Math.round((stats.value.passed / total) * 100)
})

const failedPercent = computed(() => 100 - passedPercent.value)

// Chart Data
const chartPoints = computed(() => {
  const data = dailyData.value.length ? dailyData.value : generateMockData()
  const maxVal = Math.max(...data.map(d => d.count), 1)
  const points = []
  const stepX = (chartWidth - padding * 2) / Math.max(data.length - 1, 1)
  
  data.forEach((d, i) => {
    points.push({
      x: padding + i * stepX,
      y: chartHeight - padding - (d.count / maxVal) * (chartHeight - padding * 2),
      date: d.date,
      value: d.count
    })
  })
  return points
})

const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  return chartPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})

const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  const points = chartPoints.value
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath.value} L ${last.x} ${chartHeight - padding} L ${first.x} ${chartHeight - padding} Z`
})

const timeLabels = computed(() => {
  const data = dailyData.value.length ? dailyData.value : generateMockData()
  return data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map(d => formatShortDate(d.date))
})

const scoreDistribution = computed(() => {
  const ranges = [
    { label: '0-20', min: 0, max: 20, class: 'danger' },
    { label: '21-40', min: 21, max: 40, class: 'warning' },
    { label: '41-60', min: 41, max: 60, class: 'info' },
    { label: '61-80', min: 61, max: 80, class: 'success-light' },
    { label: '81-100', min: 81, max: 100, class: 'success' }
  ]
  
  // Calcular conteos
  const withCounts = ranges.map(r => ({
    ...r,
    count: responses.value.filter(res => 
      res.percentage_score !== null && 
      res.percentage_score >= r.min && 
      res.percentage_score <= r.max
    ).length
  }))
  
  // Encontrar el máximo para calcular porcentajes relativos
  const maxCount = Math.max(...withCounts.map(r => r.count), 1)
  
  return withCounts.map(r => ({
    ...r,
    percent: r.count > 0 ? (r.count / maxCount) * 100 : 0
  }))
})

const questionsStats = computed(() => {
  // Mock data - reemplazar con datos reales
  return [
    { text: '¿Cuál es el principio de responsabilidad única?', correctPercent: 85 },
    { text: '¿Qué patrón de diseño se utiliza para...?', correctPercent: 72 },
    { text: 'Explique el concepto de inversión de control', correctPercent: 58 },
    { text: '¿Cuándo usar composición vs herencia?', correctPercent: 45 },
    { text: 'Defina SOLID y sus principios', correctPercent: 91 }
  ]
})

const topPerformers = computed(() => {
  return responses.value
    .filter(r => r.percentage_score !== null)
    .sort((a, b) => b.percentage_score - a.percentage_score)
    .slice(0, 5)
    .map(r => ({
      name: r.respondent_name,
      email: r.respondent_email,
      score: r.percentage_score
    }))
})

// Methods
function generateMockData() {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    data.push({ date: d.toISOString().split('T')[0], count: Math.floor(Math.random() * 10) + 1 })
  }
  return data
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.substring(0, len) + '...' : str
}

function getRankClass(index) {
  return ['gold', 'silver', 'bronze'][index] || ''
}

function showTooltip(event, point) {
  tooltip.value = {
    show: true,
    x: event.clientX + 10,
    y: event.clientY - 30,
    date: formatShortDate(point.date),
    value: point.value
  }
}

function hideTooltip() {
  tooltip.value.show = false
}

async function loadData() {
  loading.value = true
  try {
    const [formRes, statsRes, responsesRes] = await Promise.all([
      formService.get(formUuid.value),
      formService.getStats(formUuid.value),
      formService.getResponses(formUuid.value, { limit: 100 })
    ])
    
    form.value = formRes.data?.form || formRes.data || formRes
    stats.value = statsRes.data || statsRes || {}
    responses.value = responsesRes.data?.responses || responsesRes.responses || []
    dailyData.value = statsRes.data?.dailyResponses || []
  } catch (err) {
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
  }
}

function exportPDF() {
  alert('Funcionalidad de exportar PDF próximamente')
}

function exportExcel() {
  alert('Funcionalidad de exportar Excel próximamente')
}

onMounted(() => loadData())
</script>

<style scoped>
.reports-page {
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
  
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--gray-light);
}

/* ========== STATES ========== */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  background: var(--white);
  border-radius: var(--radius);
}
.loader {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--celeste);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ========== HEADER ========== */
.page-header {
  background: var(--white);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-light);
  border-radius: 10px;
  color: var(--text-light);
  transition: all 0.2s;
  text-decoration: none;
}
.back-btn:hover { background: var(--gray); color: var(--text); }
.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge.exam { background: #fef3c7; color: #d97706; }
.badge.survey { background: #dbeafe; color: #1d4ed8; }
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}
.header-info h1 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--blue);
}
.form-title {
  margin: 0;
  font-size: 14px;
  color: var(--text-light);
}
.header-actions {
  display: flex;
  gap: 12px;
}

/* ========== BUTTONS ========== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.btn-primary { background: var(--blue); color: var(--white); }
.btn-primary:hover { background: #001a7a; }
.btn-outline { background: var(--white); color: var(--text); border: 1px solid var(--border); }
.btn-outline:hover { background: var(--gray-light); }

/* ========== STATS OVERVIEW ========== */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.stat-card.highlight {
  background: linear-gradient(135deg, var(--blue) 0%, var(--celeste) 100%);
  color: var(--white);
}
.stat-ring {
  position: relative;
  width: 70px;
  height: 70px;
}
.stat-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.ring-bg {
  fill: none;
  stroke: rgba(255,255,255,0.2);
  stroke-width: 3;
}
.ring-fill {
  fill: none;
  stroke: var(--white);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}
.ring-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}
.stat-meta { display: flex; flex-direction: column; }
.stat-title { font-size: 14px; font-weight: 600; opacity: 0.9; }
.stat-desc { font-size: 12px; opacity: 0.7; }
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon.blue { background: #dbeafe; color: #2563eb; }
.stat-icon.green { background: #d1fae5; color: #059669; }
.stat-icon.orange { background: #fef3c7; color: #d97706; }
.stat-content { display: flex; flex-direction: column; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--blue); }
.stat-value small { font-size: 18px; }
.stat-label { font-size: 13px; color: var(--text-muted); }

/* ========== CHARTS GRID ========== */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.chart-card {
  background: var(--white);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.chart-card.wide { grid-column: span 2; }
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}
.chart-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.chart-controls { display: flex; gap: 8px; }
.chip {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--white);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}
.chip:hover { border-color: var(--celeste); color: var(--celeste); }
.chip.active { background: var(--blue); border-color: var(--blue); color: var(--white); }
.chart-body { padding: 20px; }
.chart-body.centered { display: flex; flex-direction: column; align-items: center; justify-content: center; }

/* ========== LINE CHART ========== */
.line-chart svg { width: 100%; height: 180px; }
.grid-lines line { stroke: var(--border); stroke-width: 1; }
.chart-area { fill: url(#areaGradient); opacity: 0.3; }
.chart-line { fill: none; stroke: var(--celeste); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.chart-points circle {
  fill: var(--white);
  stroke: var(--celeste);
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s;
}
.chart-points circle:hover { r: 7; fill: var(--celeste); }
.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-muted);
}

/* ========== BAR CHART ========== */
.bar-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 220px;
  gap: 16px;
  padding: 0 10px;
}
.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 8px;
}
.bar-count {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  min-height: 20px;
}
.bar-track {
  width: 100%;
  height: 150px;
  background: var(--gray-light);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}
.bar-fill {
  width: 100%;
  border-radius: 8px 8px 0 0;
  min-height: 4px;
  transition: height 0.5s ease;
}
.bar-fill.danger { background: linear-gradient(180deg, #fca5a5 0%, #ef4444 100%); }
.bar-fill.warning { background: linear-gradient(180deg, #fcd34d 0%, #f59e0b 100%); }
.bar-fill.info { background: linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%); }
.bar-fill.success-light { background: linear-gradient(180deg, #86efac 0%, #22c55e 100%); }
.bar-fill.success { background: linear-gradient(180deg, #6ee7b7 0%, #10b981 100%); }
.bar-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

/* ========== DONUT CHART ========== */
.donut-chart {
  position: relative;
  width: 160px;
  height: 160px;
}
.donut-chart svg { width: 100%; height: 100%; }
.donut-ring { fill: none; stroke: var(--border); stroke-width: 3; }
.donut-segment {
  fill: none;
  stroke-width: 5;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}
.donut-segment.passed { stroke: var(--success); }
.donut-segment.failed { stroke: var(--danger); }
.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.donut-value { font-size: 28px; font-weight: 800; color: var(--blue); }
.donut-label { font-size: 12px; color: var(--text-muted); }
.donut-legend { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-light); }
.legend-dot { width: 12px; height: 12px; border-radius: 3px; }
.legend-dot.passed { background: var(--success); }
.legend-dot.failed { background: var(--danger); }

/* ========== QUESTIONS ANALYSIS ========== */
.questions-analysis { display: flex; flex-direction: column; gap: 12px; }
.question-row { display: flex; align-items: center; gap: 12px; }
.question-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.question-num {
  width: 24px;
  height: 24px;
  background: var(--gray);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-light);
  flex-shrink: 0;
}
.question-text { font-size: 13px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.question-bar-container {
  width: 120px;
  height: 8px;
  background: var(--gray);
  border-radius: 4px;
  position: relative;
  display: flex;
  align-items: center;
}
.question-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--celeste), var(--success));
  border-radius: 4px;
  transition: width 0.5s ease;
}
.question-percent {
  position: absolute;
  right: -40px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

/* ========== TOP PERFORMERS ========== */
.top-performers { display: flex; flex-direction: column; gap: 10px; }
.performer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--gray-light);
  border-radius: 10px;
  transition: all 0.2s;
}
.performer-row:hover { background: var(--gray); }
.performer-rank {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--gray);
  color: var(--text-light);
}
.performer-rank.gold { background: linear-gradient(135deg, #fcd34d, #f59e0b); color: var(--white); }
.performer-rank.silver { background: linear-gradient(135deg, #e2e8f0, #94a3b8); color: var(--white); }
.performer-rank.bronze { background: linear-gradient(135deg, #fed7aa, #ea580c); color: var(--white); }
.performer-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.performer-name { font-size: 13px; font-weight: 600; color: var(--text); }
.performer-email { font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.performer-score { font-size: 16px; font-weight: 800; color: var(--success); }
.empty-performers { text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px; }

/* ========== TIME STATS ========== */
.time-stats { display: flex; align-items: center; gap: 30px; padding: 20px 0; }
.time-stat { text-align: center; }
.time-value { font-size: 36px; font-weight: 800; color: var(--blue); }
.time-unit { font-size: 16px; font-weight: 600; color: var(--text-muted); margin-left: 4px; }
.time-label { display: block; font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.time-divider { width: 1px; height: 50px; background: var(--border); }

/* ========== TOOLTIP ========== */
.chart-tooltip {
  position: fixed;
  background: var(--blue);
  color: var(--white);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.chart-tooltip strong { font-size: 11px; opacity: 0.8; }

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .charts-grid { grid-template-columns: 1fr; }
  .chart-card.wide { grid-column: span 1; }
}
@media (max-width: 768px) {
  .reports-page { padding: 16px; }
  .header-main { flex-direction: column; }
  .header-actions { width: 100%; }
  .header-actions .btn { flex: 1; justify-content: center; }
  .stats-overview { grid-template-columns: repeat(2, 1fr); }
  .time-stats { flex-wrap: wrap; justify-content: center; }
}
</style>