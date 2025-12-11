<!-- src/components/public/QuestionBankBadge.vue -->
<template>
  <div v-if="show" class="bank-badge">
    <i class="bi bi-shuffle"></i>
    <span>
      {{ questionsShowing }} preguntas aleatorias
      <small v-if="showTotal">(de {{ totalInBank }} en banco)</small>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalInBank: {
    type: Number,
    default: 0
  },
  questionsShowing: {
    type: Number,
    default: 0
  },
  showTotal: {
    type: Boolean,
    default: false
  }
})

const show = computed(() => props.totalInBank > props.questionsShowing)
</script>

<style scoped>
.bank-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  border: 1px solid #93c5fd;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #1e40af;
  font-weight: 500;
}

.bank-badge i {
  font-size: 0.9rem;
}

.bank-badge small {
  font-weight: 400;
  opacity: 0.8;
}
</style>