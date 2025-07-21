<template>
  <div class="booking-view">
    <ul class="steps-list">
      <li class="step-item" @click="goTo('choicestaff')">
        <div class="checkbox"></div>
        <div class="label">Сотрудник: {{ summary.staffName }}</div>
        <div class="arrow">›</div>
      </li>
      <li class="step-item" @click="goTo('datetime')">
        <div class="checkbox"></div>
        <div class="label">Дата и время: {{ summary.visitTime}}</div>
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
  </div>
  <button class="btn-submit" @click="submitBooking">
      Оформить запись
  </button>
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

  // Правильно читаем дату
  const visitTime = visit_time.start_time
    ? new Date(visit_time.start_time).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
  max-width:  clamp(300px, 90%, 1140px);
  margin: clamp(0.5rem, 2vw, 2rem) auto;
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
  padding: clamp(0.3rem, 2vw, 1rem);
  border-bottom: 1px solid #ececec;
  cursor: pointer;
}

.step-item:last-of-type {
  border-bottom: none;
}

.checkbox {
  width: clamp(20px, 5vw, 35px);
  height: clamp(20px, 5vw, 35px);
  background: #dadada;
  border-radius: 4px;
  flex-shrink: 0;
}

.label {
  margin: 0 clamp(0.5rem, 2vw, 1rem);
  flex: 1;
  font-size: clamp(0.85rem, 3vw, 1rem);
  font-family: var(--font-primary);
}

.arrow, .arrow-back {
  display: flex;
  color: #999;
  font-size: clamp(0.7rem, 5vw, 1.4rem);
  font-family: var(--font-primary);

  width: clamp(30px, 10vw, 40px);
  height: clamp(30px, 10vw, 40px);

  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-item .checkbox { 
  display: none;
}

.back-item .arrow-back {
  display: flex;
}

@media (max-width: 992px){
  .back-item {
      display: none;
  }
}

.btn-submit {
  display: block;
  width:  clamp(150px, 80%, 380px);
  margin: clamp(1rem, 3vw, 1.5rem) auto;
  padding: clamp(0.5rem, 2vw, 0.75rem);
  background: #2F80EC;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: clamp(1rem, 3vw, 1.1rem);
  cursor: pointer;
}

.btn-submit:hover {
  background: #0056b3;
}
</style>
