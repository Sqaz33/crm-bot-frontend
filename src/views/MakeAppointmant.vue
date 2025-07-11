<template>
  <div class="booking-view">
    <ul class="steps-list">
      <li class="step-item" @click="goTo('choicestaff')">
        <div class="checkbox"></div>
        <div class="label">Сотрудник: {{ summary.staffName || '—' }}</div>
        <div class="arrow">›</div>
      </li>
      <li class="step-item" @click="goTo('datetime')">
        <div class="checkbox"></div>
        <div class="label">Дата и время: {{ summary.visitTime || '—' }}</div>
        <div class="arrow">›</div>
      </li>
      <li class="step-item" @click="goTo('services')">
        <div class="checkbox"></div>
        <div class="label">
          Услуги: 
          {{ summary.totalPrice !== null 
             ? (summary.totalPrice > 0 ? summary.totalPrice + ' ₽' : '0 ₽') 
             : '—' 
          }}
        </div>
        <div class="arrow">›</div>
      </li>
      <li class="step-item back-item" @click="goBack">
        <div class="arrow-back">‹</div>
        <div class="label">Назад</div>
      </li>
    </ul>

    <button class="btn-submit" @click="submitBooking">
      Оформить запись
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const VISIT_KEY = 'visit_data'
const summary = ref({
  staffName: null,
  visitTime: null,
  totalPrice: null
})

async function loadSummary() {
  const raw = localStorage.getItem(VISIT_KEY)
  if (!raw) return

  const data = JSON.parse(raw)
  const { staff_id, services_id = [], visit_time = {} } = data

  // Формат даты
  const visitTime = visit_time.start
    ? new Date(visit_time.start).toLocaleString()
    : null

  // Имя сотрудника
  let staffName = null
  if (staff_id) {
    try {
      const { data: staff } = await api.get(`/salon/staff/${staff_id}`)
      staffName = staff.name
    } catch {
      staffName = '—'
    }
  }

  // Сумма услуг
  let totalPrice = null
  if (services_id.length) {
    try {
      const prices = await Promise.all(
        services_id.map(id =>
          api.get(`/salon/services/${id}`)
            .then(r => r.data.price || 0)
            .catch(() => 0)
        )
      )
      totalPrice = prices.reduce((sum, p) => sum + p, 0)
    } catch {
      totalPrice = 0
    }
  } else if (services_id.length === 0) {
    totalPrice = 0
  }

  summary.value = { staffName, visitTime, totalPrice }
}

function goTo(stepName) {
  router.push({ name: stepName })
}

function goBack() {
  router.back()
}

function submitBooking() {
  console.log('Booking submitted')
}

onMounted(loadSummary)
</script>

<style scoped>
.booking-view {
  max-width: 400px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.steps-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ececec;
  cursor: pointer;
}

.step-item:last-of-type {
  border-bottom: none;
}

.checkbox {
  width: 20px;
  height: 20px;
  background: #ececec;
  border-radius: 4px;
  flex-shrink: 0;
}

.label {
  margin: 0 1rem;
  flex: 1;
  font-size: 0.95rem;
}

.arrow, .arrow-back {
  color: #999;
  font-size: 1.2rem;
}

.back-item .checkbox {
  display: none;
}

.back-item .arrow-back {
  display: block;
}

.btn-submit {
  display: block;
  width: calc(100% - 2rem);
  margin: 1.5rem auto;
  padding: 0.75rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-submit:hover {
  background: #0056b3;
}
</style>
