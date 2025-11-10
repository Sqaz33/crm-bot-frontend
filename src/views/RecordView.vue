<template>
  <div class="record-view">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="page">
      <!-- Верхний инфоблок (название заведения может приходить сверху страницы) -->
      <div class="page-title">Просмотр записи</div>

      <div class="record-card">
        <!-- Шапка карточки -->
        <div class="header">
          <div class="who">
            <div class="avatar">{{ firstLetter }}</div>
            <div class="info">
              <div class="name">
                {{ staff.name }}
                <!-- <span class="rating">★ 4.7</span> -->
              </div>
              <div class="spec">{{ staff.specializations?.join(', ') }}</div>
            </div>
          </div>
          <div class="datetime">{{ formatDate(visit.visit_date_time) }}</div>
        </div>

        <!-- Детали услуги -->
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

        <!-- Плашка: Я точно приду -->
        <div v-if="!isOld" class="section">
          <div class="section-bar">Я точно приду</div>
          <div class="toggle-row">
            <div class="hint">Нажимая, вы подтверждаете свой визит</div>
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

        <!-- Плашка: Изменения -->
        <div v-if="!isOld" class="section">
          <div class="section-bar">Изменения</div>
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

        <!-- Плашка: Оплата -->
        <div v-if="!isOld" class="section">
          <div class="section-bar">Оплата</div>
          <div class="list">
            <div class="list-item disabled" tabindex="-1" aria-disabled="true">
              <span class="icon">🔒</span>
              <span class="text">Оплата недоступна</span>
              <span class="chevron">›</span>
            </div>
          </div>
        </div>

        <div v-if="visitError" class="visit-error">{{ visitError }}</div>

        <!-- Кнопка отзыва для прошедшей записи -->
        <button v-else class="review-btn" @click="showReviewModal = true">Оставить отзыв</button>
      </div>

 
      <div v-if="showReviewModal" class="modal-overlay">
        <div class="modal">
          <h3>Отзыв для {{ staff.name }}</h3>
          <div class="stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }"
              @click="review.rating = n">★</span>
          </div>
          <textarea v-model="review.comment" placeholder="Напишите ваш комментарий..."></textarea>
          <div class="modal-buttons">
            <button @click="submitReview" :disabled="sending">{{ sending ? 'Отправка...' : 'Отправить' }}</button>
            <button @click="showReviewModal = false" :disabled="sending">Отмена</button>
          </div>
          <div v-if="reviewError" class="modal-error">{{ reviewError }}</div>
        </div>
      </div>

      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="modal">
          <h3>Подтверждение визита</h3>
          <p>Вы действительно хотите подтвердить, что придёте на приём?</p>
          <div class="modal-buttons">
            <button @click="confirmAction(); showConfirmModal = false" :disabled="processing">Да, подтверждаю</button>
            <button @click="showConfirmModal = false" :disabled="processing">Отмена</button>
          </div>
        </div>
      </div>

      <div v-if="showCancelModal" class="modal-overlay">
        <div class="modal">
          <h3>Отмена визита</h3>
          <p>Вы уверены, что хотите отменить запись на приём?</p>
          <div class="modal-buttons">
            <button @click="cancelAction(); showCancelModal = false" :disabled="deleting">Да, отменить</button>
            <button @click="showCancelModal = false" :disabled="deleting">Отмена</button>
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

<style>
:root { /* при необходимости добавишь переменные */ }
html, body, #app { overflow-x: hidden; }
</style>

<style scoped>
/* 0) Базовая геометрия */
*, *::before, *::after { box-sizing: border-box; }

/* 1) Контейнер страницы + палитра */
.record-view{
  --bg:#F6F7FB;
  --card:#FFFFFF;
  --primary:#2F80ED;      /* синяя плашка */
  --text:#1C2534;
  --muted:#8A95A6;
  --divider:#ECEFF5;
  --green:#20C776;        /* зелёный аватар */
  --shadow:0 8px 20px rgba(23,35,68,.08);

  min-height:100vh;
  background:var(--bg);
  display:flex;
  justify-content:center;
}

.page{
  width:100%;
  max-width:640px;
  margin:0 auto;

  /* равные поля + учёт safe-area */
  padding-top:16px;
  padding-bottom:24px;
  padding-left:max(16px, env(safe-area-inset-left));
  padding-right:max(16px, env(safe-area-inset-right));

  /* никаких горизонтальных сюрпризов */
  overflow-x: clip;
  max-width:100%;
}

/* 2) Центрированный заголовок */
.page-title{
  text-align:center;
  font-weight:700;
  color:#5C6676;
  padding:12px 0;
  border-top:1px solid var(--divider);
  border-bottom:1px solid var(--divider);
  margin-bottom:12px;
  background:#fff;
  border-radius:12px;
}

/* 3) Карточка записи */
.record-card{
  background:var(--card);
  border-radius:16px;
  box-shadow:var(--shadow);
  padding:12px;
  width:100%;
  margin:0;
  overflow:hidden; /* радиусы/тени не выходят за края */
  max-width:100%;
}

/* 4) Шапка карточки */
.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  background:#EEF3FF;
  border-radius:12px;
  padding:10px 12px;
  margin-bottom:12px;
  max-width:100%;
}
.header > *{ min-width:0; }     /* ключ к анти-оверфлоу */

.who{display:flex;align-items:center;gap:10px;min-width:0;}
.avatar{
  width:24px;height:24px;border-radius:50%;
  background:var(--green);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:12px;flex:0 0 24px;
}
.info{min-width:0;}
.name{
  font-weight:800;font-size:14px;color:var(--text);line-height:1.1;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.spec{
  font-size:12px;color:var(--muted);margin-top:2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.datetime{
  font-size:12px;color:#6f7a87;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis;max-width:40%;
}

/* 5) Детали услуги */
.details{
  background:#F3F5F8;border-radius:12px;padding:10px 12px;margin-bottom:12px;
  overflow:hidden;max-width:100%;
}
.row{
  display:flex;justify-content:space-between;gap:8px;min-width:0;max-width:100%;
}
.row > *{ min-width:0; }
.header-row{
  font-weight:700;color:#647089;
  padding-bottom:8px;border-bottom:1px solid #e6e9f0;margin-bottom:8px;
}
.service-name{
  min-width:0;max-width:70%;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.price{font-weight:700;color:var(--text);}

/* 6) Секции */
.section{margin-bottom:12px;max-width:100%;}
.section-bar{
  background:var(--primary);color:#fff;font-weight:800;
  padding:10px 12px;border-radius:10px 10px 0 0;
  letter-spacing:.02em;text-transform:uppercase;
}
.toggle-row{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  background:#fff;border:1px solid var(--divider);border-top:none;
  border-radius:0 0 12px 12px;padding:12px;max-width:100%;
}
.hint{
  font-size:13px;color:#6f7a87;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}

/* 7) iOS-переключатель */
.toggle{position:relative;display:inline-block;width:46px;height:28px;flex:0 0 auto}
.toggle input{opacity:0;width:0;height:0}
.slider{
  position:absolute;inset:0;background:#D9DDE4;border-radius:999px;transition:.2s;
  overflow:clip; /* не даём тени кружка выходить */
}
.slider:before{
  content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;background:#fff;border-radius:50%;
  box-shadow:0 1px 3px rgba(0,0,0,.2);transition:.2s
}
.toggle input:checked + .slider{background:#3ccb78}
.toggle input:checked + .slider:before{transform:translateX(18px)}

/* 8) Список действий */
.list{
  background:#fff;border:1px solid var(--divider);border-top:none;
  border-radius:0 0 12px 12px;overflow:hidden;max-width:100%;
}
.list-item{
  display:flex;align-items:center;gap:10px;padding:14px 12px;width:100%;
  border-top:1px solid var(--divider);background:#fff;text-align:left;
}
.list-item:first-child{border-top:none}
.list-item .icon{font-size:16px;opacity:.9}
.list-item .text{
  flex:1 1 auto;color:var(--text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.list-item .chevron{font-size:18px;opacity:.4}
.list-item.disabled{opacity:.55;pointer-events:none}
.list-item.danger .icon,.list-item.danger .text{color:#d9534f}

/* 9) Кнопка «Оставить отзыв» */
.review-btn{
  width:100%;padding:12px;border:none;border-radius:12px;margin-top:8px;
  background:#1e88e5;color:#fff;font-weight:800;
}

/* 10) Модалки */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.4);
  display:flex;justify-content:center;align-items:center;z-index:100;
}
.modal{
  background:#fff;padding:16px;border-radius:12px;
  width:auto;max-width:min(90vw, 360px);
  box-shadow:0 10px 30px rgba(0,0,0,.2);
}
.stars{font-size:22px;margin-bottom:8px}
.star{cursor:pointer;color:#d9d9d9}
.star.filled{color:#f6c21c}
textarea{
  width:100%;min-height:90px;margin-bottom:12px;padding:8px;border-radius:10px;
  border:1px solid #e2e6ec;resize:none;
}
.modal-buttons{display:flex;justify-content:flex-end;gap:8px}
.modal-buttons button{padding:8px 12px;border:none;border-radius:10px;cursor:pointer}
.modal-buttons button:first-child{background:#1e88e5;color:#fff}
.modal-buttons button:last-child{background:#e7e9ee}
.modal-error{color:#d9534f;margin-top:6px;font-size:13px}

/* 11) Служебные состояния */
.loading{font-size:16px;color:#555}
.error{color:#d9534f}
.visit-error{color:#d9534f;font-size:13px;margin-top:6px}

/* 12) Медиа */
@media (max-width: 480px){
  .header{ padding:10px 12px; }
  .details{ padding:10px 12px; }
  .list-item{ padding:12px; }
}

/* 13) Универсальные страховки */
img, svg, video{ max-width:100%; height:auto; }
.header-row > *{ min-width:0; }
</style>
