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

      <!-- Панель управления визитом -->
      <div v-if="!isOld" class="control-panel">
        <div class="switch-row">
          <label class="switch-label">Подтверждаю визит</label>
          <input
            type="checkbox"
            v-model="visit.will_come"
            @change="toggleWillCome"
            :disabled="visit.will_come || processing"
          />
        </div>

        <div class="buttons">
          <button
            class="cancel-btn"
            @click="cancelVisit"
            :disabled="visit.will_come || deleting || processing"
          >
            Отменить запись
          </button>

          <button
            class="move-btn"
            @click="goToDatetime"
            :disabled="visit.will_come || processing"
          >
            Перенести запись
          </button>
        </div>
      </div>


      <!-- Кнопка оставить отзыв -->
      <button
        v-else
        class="review-btn"
        @click="showReviewModal = true"
      >
        Оставить отзыв
      </button>

      <!-- Модалка для отзыва (без изменений) -->
      <div v-if="showReviewModal" class="modal-overlay">
        <div class="modal">
          <h3>Отзыв для {{ staff.name }}</h3>

          <div class="stars">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ filled: n <= review.rating }"
              @click="review.rating = n"
            >★</span>
          </div>

          <textarea
            v-model="review.comment"
            placeholder="Напишите ваш комментарий..."
          ></textarea>

          <div class="modal-buttons">
            <button @click="submitReview" :disabled="sending">
              {{ sending ? 'Отправка...' : 'Отправить' }}
            </button>
            <button @click="showReviewModal = false" :disabled="sending">Отмена</button>
          </div>

          <div v-if="reviewError" class="modal-error">{{ reviewError }}</div>
        </div>
      </div>
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
const processing = ref(false)
const error = ref('')
const visit = ref(null)
const staff = ref({})
const service = ref({})

// --- API: Загрузка данных --- //
async function loadVisit() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/visits/${visitId}`)
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

// --- PATCH переключатель --- //
async function toggleWillCome() {
  processing.value = true
  try {
    const visitDateISO = new Date(visit.value.visit_date_time).toISOString()

    await api.patch(`/visits/${visitId}`, {
      visit_date_time: visitDateISO,
      will_come: visit.value.will_come // берём текущее состояние чекбокса
    })
  } catch (err) {
    console.error(err)
    alert('Ошибка при обновлении статуса визита.')
  } finally {
    processing.value = false
  }
}

// --- Отмена визита --- //
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

// --- Перенос визита --- //
async function goToDatetime() {
  try {
    // Переходим на страницу выбора даты/времени
    await router.push('/datetime')

    // После перехода читаем visit_time из localStorage
    const VISIT_KEY = 'visit_data'
    const raw = localStorage.getItem(VISIT_KEY)
    if (!raw) return

    const data = JSON.parse(raw)
    const visit_time = data.visit_time
    if (!visit_time) return

    processing.value = true
    const visitDateISO = new Date(visit_time).toISOString()

    await api.patch(`/visits/${visitId}`, {
      visit_date_time: visitDateISO,
      will_come: visit.value.will_come
    })

    alert('Дата и время визита обновлены.')
  } catch (err) {
    console.error(err)
    alert('Не удалось обновить дату и время визита.')
  } finally {
    processing.value = false
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

// --- Модалка отзыва --- //
const showReviewModal = ref(false)
const review = ref({ rating: 0, comment: '' })
const sending = ref(false)
const reviewError = ref('')

async function submitReview() {
  if (review.value.rating === 0) {
    reviewError.value = 'Пожалуйста, выберите количество звезд'
    return
  }
  sending.value = true
  reviewError.value = ''
  try {
    await api.post('/salon/reviews', {
      staff_id: staff.value.id,
      rating: review.value.rating,
      comment: review.value.comment
    })
    alert('Спасибо за ваш отзыв!')
    showReviewModal.value = false
    review.value = { rating: 0, comment: '' }
  } catch (err) {
    console.error(err)
    if (err.response?.status === 400 && err.response?.data?.detail)
      reviewError.value = err.response.data.detail
    else
      reviewError.value = 'Ошибка при отправке отзыва'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
/* ... остальной стиль без изменений ... */

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f3f5;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.switch-label {
  font-weight: 500;
  color: #333;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.move-btn,
.confirm-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.move-btn {
  background-color: #8e24aa;
}

.confirm-btn {
  background-color: #43a047;
}

button:disabled,
input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
