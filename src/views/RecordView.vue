<template>
  <div class="record-view">
    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="record-card">
      <!-- Верхняя карточка -->
      <div class="header">
        <div class="avatar"></div>
        <div class="info">
          <div class="name">{{ staff.name }}</div>
          <div class="spec">{{ staff.specializations?.join(', ') }}</div>
        </div>
        <div class="datetime">
          {{ formatDate(visit.visit_date_time) }}
        </div>
      </div>

      <!-- Детали -->
      <div class="details">
        <div class="row header-row">
          <div>Услуга</div>
          <div>Количество</div>
          <div>Стоимость</div>
        </div>
        <div class="row">
          <div>{{ service.name }}</div>
          <div>1</div>
          <div>{{ service.price }} ₽</div>
        </div>
      </div>

      <!-- Кнопка -->
      <button
        v-if="!isOld"
        class="cancel-btn"
        @click="cancelVisit"
        :disabled="deleting"
      >
        {{ deleting ? 'Отмена...' : 'Отменить запись' }}
      </button>

      <button
        v-else
        class="review-btn"
      >
        Оставить отзыв
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

// --- КЭШ --- //
const staffCache = {}
const servicesCache = {}

async function getStaff(staff_id) {
  if (staffCache[staff_id]) return staffCache[staff_id]
  const { data } = await api.get(`/salon/staff/${staff_id}`)
  staffCache[staff_id] = data
  return data
}

async function getService(service_id) {
  if (servicesCache[service_id]) return servicesCache[service_id]
  if (Object.keys(servicesCache).length === 0) {
    const { data: arr } = await api.get(`/services/`)
    arr.forEach(s => { servicesCache[s.id] = s })
  }
  return servicesCache[service_id]
}

// --- ROUTER --- //
const route = useRoute()
const router = useRouter()
const visitId = route.params.id
const isOld = route.query.isOld === 'true'

// --- STATE --- //
const loading = ref(true)
const deleting = ref(false)
const error = ref('')
const visit = ref(null)
const staff = ref({})
const service = ref({})

// --- API: Загрузка данных --- //
async function loadVisit() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.post(`/visits/${visitId}`)
    visit.value = data

    staff.value = await getStaff(data.staff_id)
    service.value = await getService(data.service_id)
  } catch (err) {
    console.error(err)
    error.value = 'Ошибка при загрузке данных о визите'
  } finally {
    loading.value = false
  }
}

// --- API: Отмена визита --- //
async function cancelVisit() {
  if (!confirm('Вы уверены, что хотите отменить запись?')) return
  deleting.value = true
  try {
    await api.delete(`/visits/${visitId}`)
    alert('Запись успешно отменена.')
    router.push('/records')
  } catch (err) {
    console.error(err)
    alert('Не удалось отменить запись.')
  } finally {
    deleting.value = false
  }
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(loadVisit)
</script>

<style scoped>
.record-view {
  display: flex;
  justify-content: center;
  align-items: start;
  padding: 2rem;
  background-color: #f6f9fc;
  min-height: 100vh;
  font-family: var(--font-primary);
}

.record-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 360px;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ccc;
}

.info {
  flex: 1;
  margin-left: 10px;
  text-align: left;
}

.name {
  font-weight: 600;
  font-size: 1rem;
}

.spec {
  font-size: 0.85rem;
  color: #777;
}

.datetime {
  font-size: 0.85rem;
  color: #555;
}

.details {
  background-color: #f1f3f5;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.header-row {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.cancel-btn,
.review-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background-color: #e53935;
}

.review-btn {
  background-color: #1e88e5;
}

.loading {
  font-size: 1.2rem;
  color: #555;
}

.error {
  color: red;
  font-size: 1rem;
}
</style>
