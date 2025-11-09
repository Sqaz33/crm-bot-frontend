<template>
  <div class="record-view">
    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="page-wrap">
      <!-- Верхняя карточка: мастер + дата/время + услуга/стоимость -->
      <section class="card header-card">
        <div class="header-line">
          <div class="left">
            <div class="avatar"></div>
            <div class="info">
              <div class="name">{{ staff.name }}</div>
              <div class="spec">{{ staff.specializations?.join(', ') }}</div>
            </div>
          </div>
          <div class="datetime">
            <div class="date">{{ formatDate(visit.visit_date_time, 'date') }}</div>
            <div class="time">{{ formatDate(visit.visit_date_time, 'time') }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="svc-head row2">
          <div>Услуга</div>
          <div class="tr">Стоимость</div>
        </div>
        <div class="svc-row row2">
          <div class="svc-name">{{ service.name }}</div>
          <div class="price">{{ service.price }} ₽</div>
        </div>
      </section>

      <!-- Панель подтверждения визита -->
      <section class="card confirm-card" v-if="!isOld">
        <div class="confirm-left">
          <div class="confirm-title">Я точно приду</div>
          <div class="confirm-sub">Нажимая, вы подтверждаете свой визит</div>
        </div>

        <label class="switch">
          <input
            type="checkbox"
            :checked="visit.will_come"
            @change="onWillComeChange"
            :disabled="visit.will_come || processing"
          />
          <span class="slider"></span>
        </label>

        <div v-if="visitError" class="visit-error">{{ visitError }}</div>
      </section>

      <!-- Раздел «ИЗМЕНЕНИЯ» -->
      <div class="section-title">ИЗМЕНЕНИЯ</div>

      <button
        class="list-item danger"
        @click="openCancelModal"
        :disabled="visit.will_come || deleting || processing"
        type="button"
        v-if="!isOld"
      >
        <span class="icon pill pink">✕</span>
        <span class="text">Удалить запись</span>
        <span class="chev">›</span>
      </button>

      <button
        class="list-item"
        @click="goToDatetime"
        :disabled="visit.will_come || processing"
        type="button"
        v-if="!isOld"
      >
        <span class="icon pill teal">✎</span>
        <span class="text">Перенести запись</span>
        <span class="chev">›</span>
      </button>

      <!-- Раздел «ОПЛАТА» -->
      <div class="section-title">ОПЛАТА</div>
      <button class="list-item disabled" type="button" disabled>
        <span class="icon pill gray">🔒</span>
        <span class="text">Оплата недоступна</span>
        <span class="chev">›</span>
      </button>

      <!-- Кнопка оставить отзыв для прошедшего визита -->
      <!-- <button v-else-if="isOld" class="review-btn" @click="showReviewModal = true">
        Оставить отзыв
      </button> -->
    </div>

    <!-- Модалка для отзыва -->
    <!-- <div v-if="showReviewModal" class="modal-overlay">
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

        <textarea v-model="review.comment" placeholder="Напишите ваш комментарий..."></textarea>

        <div class="modal-buttons">
          <button @click="submitReview" :disabled="sending">
            {{ sending ? 'Отправка...' : 'Отправить' }}
          </button>
          <button @click="showReviewModal = false" :disabled="sending">Отмена</button>
        </div>

        <div v-if="reviewError" class="modal-error">{{ reviewError }}</div>
      </div>
    </div> -->

    <!-- Модалка подтверждения визита -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h3>Подтверждение визита</h3>
        <p>Вы действительно хотите подтвердить, что придёте на приём?</p>
        <div class="modal-buttons">
          <button @click="confirmAction(); showConfirmModal = false" :disabled="processing">
            Да, подтверждаю
          </button>
          <button @click="showConfirmModal = false" :disabled="processing">Отмена</button>
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
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const showCancelModal = ref(false)
const cancelAction = ref(null)

// -- MODULE VARS -- //
let service_id = null
let staff_id = null;

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

// --- STATE --- //
const visitError = ref('')

// --- PATCH переключатель --- //
async function toggleWillCome() {
  processing.value = true
  visitError.value = ''
  try {
    let iso = visit.value.visit_date_time
    let d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
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
  const VISIT_KEY = 'visit_data';
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const raw = localStorage.getItem(VISIT_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.visit_time) {
          return new Date(data.visit_time.start_time); // дата найдена, возвращаем
        }
      } catch (e) {
        console.error('Ошибка парсинга localStorage:', e);
      }
    }
    // ждем intervalMs миллисекунд перед следующей проверкой
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  // если дата не появилась за timeoutMs
  throw new Error('Дата визита не появилась в localStorage за отведенное время.');
}

function onWillComeChange(event) {
  const newValue = event.target.checked

  // если пользователь поставил галочку
  if (newValue) {
    confirmAction.value = async () => {
      visit.value.will_come = true
      await toggleWillCome()
    }
    // откатываем галочку до подтверждения
    event.target.checked = false
    showConfirmModal.value = true
  }
}

// --- Перенос визита --- //
function goToDatetime() {
  const VISIT_KEY = 'visit_data';

  try {
    // очищаем значение для редиректа
    localStorage.removeItem(VISIT_KEY);

    // добавить значения для получения свободного времени
    if (staff_id && service_id) {
      let params = { staff_id: '', services_id: [], visit_time: { start_time: '', end: '' }, comment: '' }
      params.staff_id = staff_id
      params.services_id = service_id
      localStorage.setItem(VISIT_KEY, JSON.stringify(params));
    }

    // переходим на страницу выбора даты и времени с флагом переноса
    router.push({
      path: '/datetime',
      query: {
        redirect: router.currentRoute.value.fullPath,
        moveVisit: visitId
      }
    });

  } catch (err) {
    console.error(err);
    visitError.value = 'Ошибка при переходе к выбору даты.';
  }
}

// Обработка возврата со страницы выбора даты/времени
async function handleMoveVisitReturn() {
  const VISIT_KEY = 'visit_data';
  processing.value = true;
  visitError.value = '';

  try {
    // сначала загружаем текущий визит, если его ещё нет
    if (!visit.value) {
      await loadVisit();
    }

    // ждем, пока в localStorage появится новое время визита
    const visitTime = await waitForVisitTime();

    // когда дата появится, отправляем на сервер
    const visitDateISO = visitTime.toISOString();
    await api.patch(`/visits/${visitId}`, {
      visit_date_time: visitDateISO,
      will_come: visit.value?.will_come || false
    });

    // очищаем localStorage
    localStorage.removeItem(VISIT_KEY);

    // перезагружаем данные визита
    await loadVisit();

  } catch (err) {
    console.error(err);
    visitError.value = 'Не удалось обновить дату и время визита.';
  } finally {
    processing.value = false;
  }
}

// форматирование даты/времени (обновлено под дизайн)
function formatDate(iso, part = 'full') {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
  if (part === 'date') {
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  if (part === 'time') {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleString('ru-RU', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadVisit();

  // проверяем, вернулись ли мы со страницы выбора даты/времени
  if (route.query.fromDatetime === 'true') {
    handleMoveVisitReturn();

    // очищаем query параметр из URL
    router.replace({
      path: route.path,
      query: { isOld: route.query.isOld }
    });
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
    const review_obj = {
      staff_id: staff.value.id,
      rating: review.value.rating,
      comment: review.value.comment
    }
    console.log("Отзыв: ")
    console.log(review_obj)
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
.record-view{
  --sidebar-mobile:64px;
  --gutter-mobile:16px;
  --brand:#666FE8;
  --text:#454558;
  --muted:#8D99AD;
  --bg:#F6F9FC;
  --card:#FFFFFF;
  --soft:#EBEEF6;
  --stroke:#E6EAF2;

  min-height:100vh;
  background:var(--bg);
  display:flex;
  justify-content:center;
  box-sizing:border-box;
  padding:24px;
  font-family: var(--font-primary, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif);
}

.page-wrap{
  width: clamp(320px, 92vw, 900px);
}

.card{
  background:var(--card);
  border-radius:12px;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
  padding:16px;
  margin-bottom:12px;
}

/* Header card */
.header-card .header-line{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
.header-card .left{display:flex;align-items:center;gap:12px;min-width:0}
.avatar{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#69FFDB,#69FF03)}
.info{min-width:0}
.name{font-weight:700;color:var(--text);font-size:16px;line-height:1.2}
.spec{color:#7E889E;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.datetime{display:flex;flex-direction:column;align-items:flex-end;color:#7E889E;font-size:13px}

.divider{height:1px;background:var(--stroke);margin:12px 0}

.row2{display:grid;grid-template-columns:1fr auto;gap:6px}
.svc-head{color:#7E889E;font-weight:700;font-size:13px;margin-bottom:6px}
.svc-row .price{font-weight:700;color:var(--text)}
.svc-name{color:var(--text)}

/* Confirm card */
.confirm-card{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
.confirm-title{font-weight:700;color:var(--text)}
.confirm-sub{color:#6F85C1;font-size:13px}

/* switch */
.switch{position:relative;display:inline-block;width:48px;height:28px;flex-shrink:0}
.switch input{opacity:0;width:0;height:0}
.slider{position:absolute;inset:0;background:#DDE3EF;border-radius:999px;transition:.2s}
.slider:before{content:"";position:absolute;height:22px;width:22px;left:3px;top:3px;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:.2s}
.switch input:checked + .slider{background:#CFE0FF}
.switch input:checked + .slider:before{transform:translateX(20px);background:#5C6CF0}

/* Sections */
.section-title{
  margin:14px 8px 8px;
  color:#9BA7BD;
  font-weight:700;
  font-size:12px;
  letter-spacing:.04em;
}

.list-item{
  width:100%;
  background:var(--card);
  border:1px solid var(--stroke);
  border-radius:12px;
  padding:12px 14px;
  display:flex;
  align-items:center;
  gap:12px;
  color:var(--text);
  cursor:pointer;
  transition:background .15s ease;
  margin-bottom:10px;
}
.list-item:hover{background:#FAFBFE}
.list-item.disabled{opacity:.7;cursor:not-allowed}
.list-item .text{flex:1;text-align:left}
.chev{font-weight:700;color:#9BA7BD}

.icon.pill{
  width:32px;height:32px;border-radius:999px;display:inline-grid;place-items:center;font-size:16px;
}
.icon.pill.pink{background:#FFE6EF;color:#E5486E}
.icon.pill.teal{background:#E7FBF7;color:#10A38E}
.icon.pill.gray{background:#ECEFF6;color:#6F7380}

/* Review button for past visits */
.review-btn{
  width:100%;
  height:48px;
  border:none;border-radius:12px;
  background:#1E88E5;color:#fff;font-weight:700;cursor:pointer;
}

/* Modals */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:100}
.modal{background:#fff;padding:16px;border-radius:12px;width:min(420px,92vw);box-shadow:0 2px 10px rgba(0,0,0,.2)}
.modal-buttons{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
.modal-buttons button{border:none;border-radius:10px;padding:10px 16px;cursor:pointer}
.modal-buttons button:first-child{background:#5C6CF0;color:#fff}
.modal-buttons button:last-child{background:#D9DCE5}

/* Errors / states */
.loading{font-size:16px;color:#555;padding:16px}
.error{color:#C00;font-size:14px;padding:16px}
.visit-error{color:#C00;font-size:13px;margin-top:8px}

/* ---------- Мобильные отступы с учётом бокового меню ---------- */
@media (max-width:430px){
  .record-view{
    padding:0;
    padding-top:12px;
    padding-left:calc(var(--sidebar-mobile) + var(--gutter-mobile));
    padding-right:var(--gutter-mobile);
  }
  .page-wrap{width:calc(100vw - (var(--sidebar-mobile) + 2*var(--gutter-mobile)))}
  .card{padding:14px;border-radius:12px}
  .name{font-size:15px}
  .spec{font-size:12px}
  .datetime{font-size:12px}
}

/* Узкие экраны */
@media (max-width:360px){
  .record-view{--gutter-mobile:12px}
  .switch{width:44px;height:26px}
  .slider:before{height:20px;width:20px}
  .switch input:checked + .slider:before{transform:translateX(18px)}
}
</style>
