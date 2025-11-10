<template>
  <div class="record-view">
    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="record-card">
      <!-- Верхняя карточка -->
      <div class="header">
        <div class="who">
          <!-- Зелёный круг с инициалом -->
          <div class="avatar" aria-hidden="true">{{ firstLetter }}</div>

          <div class="info">
            <div class="name">
              {{ staff.name }}
              <!-- рейтинг сотрудника скрыт в новом дизайне -->
              <!-- <span class="rating">★ 4.7</span> -->
            </div>
            <div class="spec">{{ staff.specializations?.join(', ') }}</div>
          </div>
        </div>

        <div class="datetime">
          {{ formatDate(visit.visit_date_time) }}
        </div>
      </div>

      <!-- Детали -->
      <div class="details">
        <div class="row header-row">
          <div>Услуга</div>
          <div>Стоимость</div>
        </div>
        <div class="row">
          <div class="service-name">{{ service.name }}</div>
          <div class="price">{{ service.price }} ₽</div>
        </div>
      </div>

      <!-- Панель управления визитом -->
      <div v-if="!isOld" class="panel">
        <div class="section">
          <div class="section-title">Я точно приду</div>
          <div class="toggle-row">
            <div class="hint">Нажимая, вы подтверждаете свой визит</div>

            <!-- iOS-переключатель -->
            <label class="toggle">
              <input
                type="checkbox"
                :checked="visit.will_come"
                @change="onWillComeChange"
                :disabled="visit.will_come || processing"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Изменения</div>
          <div class="list">
            <button
              class="list-item danger"
              @click="openCancelModal"
              :disabled="visit.will_come || deleting || processing"
            >
              <span class="icon">✖</span>
              <span class="text">Удалить запись</span>
              <span class="chevron">›</span>
            </button>

            <button
              class="list-item"
              @click="goToDatetime"
              :disabled="visit.will_come || processing"
            >
              <span class="icon">⤴</span>
              <span class="text">Перенести запись</span>
              <span class="chevron">›</span>
            </button>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Оплата</div>
          <div class="list">
            <div class="list-item disabled" tabindex="-1" aria-disabled="true">
              <span class="icon">🔒</span>
              <span class="text">Оплата недоступна</span>
              <span class="chevron">›</span>
            </div>
          </div>
        </div>

        <div v-if="visitError" class="visit-error">{{ visitError }}</div>
      </div>

      <!-- Кнопка оставить отзыв -->
      <button v-else-if="isOld" class="review-btn" @click="showReviewModal = true">
        Оставить отзыв
      </button>

      <!-- Модалка для отзыва -->
      <div v-if="showReviewModal" class="modal-overlay">
        <div class="modal">
          <h3>Отзыв для {{ staff.name }}</h3>

          <!-- Это форма оценки пользователем, не «рейтинг сотрудника» на карточках. Оставляем. -->
          <div class="stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }"
                  @click="review.rating = n">★</span>
          </div>

          <textarea v-model="review.comment" placeholder="Напишите ваш комментарий..."></textarea>

          <div class="modal-buttons">
            <button @click="submitReview" :disabled="sending">
              {{ sending ? 'Отправка...' : 'Отправить' }}
            </button>
            <button @click="showReviewModal = false" :disabled="sending">Отмена</button>
          </div>

          <div v-if="reviewError" class="modal-error">{{ reviewError }}</div>
        </div>
      </div>

      <!-- Модалка подтверждения визита -->
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal">
          <h3>Подтверждение визита</h3>
          <p>Вы действительно хотите подтвердить, что придёте на приём?</p>
          <div class="modal-buttons">
            <button @click="confirmAction(); showConfirmModal = false" :disabled="processing">
              Да, подтверждаю
            </button>
            <button @click="showConfirmModal = false" :disabled="processing">
              Отмена
            </button>
          </div>
        </div>
      </div>

      <!-- Модалка отмены визита -->
      <div v-if="showCancelModal" class="modal-overlay">
        <div class="modal">
          <h3>Отмена визита</h3>
          <p>Вы уверены, что хотите отменить запись на приём?</p>
          <div class="modal-buttons">
            <button @click="cancelAction(); showCancelModal = false" :disabled="deleting">
              Да, отменить
            </button>
            <button @click="showCancelModal = false" :disabled="deleting">
              Отмена
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const showCancelModal = ref(false)
const cancelAction = ref(null)

// -- MODULE VARS -- //
let service_id = null
let staff_id = null

function openCancelModal() {
  cancelAction.value = cancelVisit
  showCancelModal.value = true
}

// --- API: Загрузка данных --- //
async function loadVisit() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/visits/${visitId}`)
    visit.value = data
    staff.value = await getStaff(data.staff_id)
    service.value = await getService(data.service_id)
    staff_id = data.staff_id
    service_id = data.service_id
  } catch (err) {
    console.error(err)
    error.value = 'Ошибка при загрузке данных о визите'
  } finally {
    loading.value = false
  }
}

// Буква для аватара
const firstLetter = computed(() => {
  const nm = (staff.value?.name || '').trim()
  if (!nm) return '—'
  return nm[0].toUpperCase()
})

// --- STATE --- //
const visitError = ref('')

// --- PATCH переключатель --- //
async function toggleWillCome() {
  processing.value = true
  visitError.value = ''
  try {
    let iso = visit.value.visit_date_time
    let d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
    const visitDateISO = d.toISOString()
    await api.patch(`/visits/${visitId}`, {
      visit_date_time: visitDateISO,
      will_come: visit.value.will_come
    })
  } catch (err) {
    console.error('Ошибка toggleWillCome:', err)
    visitError.value = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.detail || err.message || 'Ошибка при обновлении статуса визита.'
  } finally {
    processing.value = false
  }
}

// --- Отмена визита --- //
async function cancelVisit() {
  deleting.value = true
  visitError.value = ''
  try {
    await api.delete(`/visits/${visitId}`)
    router.push('/records')
  } catch (err) {
    console.error('Ошибка cancelVisit:', err)
    visitError.value = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.detail || err.message || 'Не удалось отменить запись.'
  } finally {
    deleting.value = false
  }
}

async function waitForVisitTime(timeoutMs = 300000, intervalMs = 100) {
  const VISIT_KEY = 'visit_data'
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const raw = localStorage.getItem(VISIT_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.visit_time) {
          return new Date(data.visit_time.start_time)
        }
      } catch (e) {
        console.error('Ошибка парсинга localStorage:', e)
      }
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
  throw new Error('Дата визита не появилась в localStorage за отведенное время.')
}

function onWillComeChange(event) {
  const newValue = event.target.checked
  if (newValue) {
    confirmAction.value = async () => {
      visit.value.will_come = true
      await toggleWillCome()
    }
    event.target.checked = false
    showConfirmModal.value = true
  }
}

// --- Перенос визита --- //
function goToDatetime() {
  const VISIT_KEY = 'visit_data'
  try {
    localStorage.removeItem(VISIT_KEY)
    if (staff_id && service_id) {
      let params = { staff_id: '', services_id: [], visit_time: { start_time: '', end: '' }, comment: '' }
      params.staff_id = staff_id
      params.services_id = service_id
      localStorage.setItem(VISIT_KEY, JSON.stringify(params))
    }
    router.push({
      path: '/datetime',
      query: { redirect: router.currentRoute.value.fullPath, moveVisit: visitId }
    })
  } catch (err) {
    console.error(err)
    visitError.value = 'Ошибка при переходе к выбору даты.'
  }
}

// Обработка возврата со страницы выбора даты/времени
async function handleMoveVisitReturn() {
  const VISIT_KEY = 'visit_data'
  processing.value = true
  visitError.value = ''
  try {
    if (!visit.value) await loadVisit()
    const visitTime = await waitForVisitTime()
    const visitDateISO = visitTime.toISOString()
    await api.patch(`/visits/${visitId}`, {
      visit_date_time: visitDateISO,
      will_come: visit.value?.will_come || false
    })
    localStorage.removeItem(VISIT_KEY)
    await loadVisit()
  } catch (err) {
    console.error(err)
    visitError.value = 'Не удалось обновить дату и время визита.'
  } finally {
    processing.value = false
  }
}

function formatDate(iso) {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadVisit()
  if (route.query.fromDatetime === 'true') {
    handleMoveVisitReturn()
    router.replace({ path: route.path, query: { isOld: route.query.isOld } })
  }
})

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
    console.error('Ошибка submitReview:', err)
    reviewError.value = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.detail || err.message || 'Ошибка при отправке отзыва'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
:root {}
.record-view{
  display:flex;
  justify-content:center;
  align-items:flex-start;
  padding:clamp(12px,4vw,32px);
  background:#f7f8fb;
  min-height:100vh;
  font-family:var(--font-primary);
}

.record-card{
  background:#fff;
  border-radius:16px;
  box-shadow:0 2px 10px rgba(23,35,68,.06);
  width:min(840px,100%);
  padding:clamp(14px,2.2vw,20px);
}

/* Header */
.header{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  margin-bottom:12px;
}
.who{display:flex;align-items:center;gap:12px;min-width:0;}

.avatar{
  --green:#3ccb78;
  width:40px;height:40px;border-radius:50%;
  background:var(--green);
  color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-weight:700;font-size:18px;flex:0 0 40px;
}

.info{min-width:0;}
.name{font-weight:700;font-size:15px;line-height:1.1;color:#1c2534}
.spec{font-size:12px;color:#6f7a87;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.datetime{font-size:12px;color:#6f7a87;white-space:nowrap}

/* Details */
.details{
  background:#f3f5f8;
  border-radius:12px;
  padding:12px;
  margin:8px 0 16px;
}
.row{display:flex;justify-content:space-between;gap:8px;font-size:14px}
.header-row{font-weight:600;color:#647089;margin-bottom:6px}
.service-name{max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.price{font-weight:600;color:#1c2534}

/* Sections */
.panel{display:flex;flex-direction:column;gap:16px}
.section{background:#fff;border-radius:12px;padding:0}
.section-title{
  font-size:11px;font-weight:700;color:#9aa3b2;
  text-transform:uppercase;letter-spacing:.06em;
  padding:10px 12px;
}

/* Toggle row */
.toggle-row{
  display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:8px 12px 14px;
}
.hint{font-size:13px;color:#6f7a87}

/* iOS toggle */
.toggle{position:relative;display:inline-block;width:46px;height:28px;flex:0 0 auto}
.toggle input{opacity:0;width:0;height:0}
.slider{
  position:absolute;cursor:pointer;inset:0;background:#d9dde4;border-radius:999px;
  transition:.2s ease;
}
.slider:before{
  content:"";position:absolute;height:22px;width:22px;left:3px;top:3px;
  background:white;border-radius:50%;transition:.2s ease;
  box-shadow:0 1px 3px rgba(0,0,0,.2);
}
.toggle input:checked + .slider{background:#3ccb78}
.toggle input:checked + .slider:before{transform:translateX(18px)}

/* List actions */
.list{display:flex;flex-direction:column}
.list-item{
  display:flex;align-items:center;gap:10px;
  padding:14px 12px;border-top:1px solid #eff1f5;background:#fff;
  font-size:14px;text-align:left;width:100%;
}
.list-item:first-child{border-top:none}
.list-item .icon{font-size:16px;opacity:.9}
.list-item .text{flex:1 1 auto;color:#1c2534}
.list-item .chevron{font-size:18px;opacity:.4}
.list-item:disabled{opacity:.55;cursor:not-allowed}
.list-item.disabled{opacity:.55;pointer-events:none}
.list-item.danger .icon{color:#d9534f}
.list-item.danger .text{color:#d9534f}

/* Buttons (only for "Оставить отзыв") */
.review-btn{
  width:100%;padding:12px 14px;border:none;border-radius:10px;
  background:#1e88e5;color:#fff;font-weight:700;cursor:pointer;
}

/* Modals */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.4);
  display:flex;justify-content:center;align-items:center;z-index:100;
}
.modal{
  background:#fff;padding:16px;border-radius:12px;width:320px;max-width:90%;
  box-shadow:0 10px 30px rgba(0,0,0,.2);
}
.stars{font-size:22px;margin-bottom:8px}
.star{cursor:pointer;color:#d9d9d9}
.star.filled{color:#f6c21c}
textarea{
  width:100%;min-height:90px;margin-bottom:12px;padding:8px;border-radius:10px;
  border:1px solid #e2e6ec;resize:none
}
.modal-buttons{display:flex;justify-content:flex-end;gap:8px}
.modal-buttons button{
  padding:8px 12px;border:none;border-radius:10px;cursor:pointer
}
.modal-buttons button:first-child{background:#1e88e5;color:#fff}
.modal-buttons button:last-child{background:#e7e9ee}
.modal-error{color:#d9534f;margin-top:6px;font-size:13px}

.loading{font-size:16px;color:#555}
.error{color:#d9534f;font-size:14px}
.visit-error{color:#d9534f;font-size:13px;margin-top:6px}


@media (max-width: 768px){
  .record-view{padding:12px}
  .avatar{width:36px;height:36px;font-size:16px}
  .name{font-size:14px}
  .spec,.datetime{font-size:12px}
  .details{padding:10px}
  .row{font-size:13px}
}
</style>
