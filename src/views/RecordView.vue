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
          <input type="checkbox" :checked="visit.will_come" @change="onWillComeChange"
            :disabled="visit.will_come || processing" />
        </div>

        <div class="buttons">
          <button class="cancel-btn" @click="openCancelModal" :disabled="visit.will_come || deleting || processing">
            Отменить запись
          </button>

          <button class="move-btn" @click="goToDatetime" :disabled="visit.will_come || processing">
            Перенести запись
          </button>
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

      <!-- Модалка для подтверждения визита -->
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

function formatDate(iso) {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');

  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
.record-view {
  display: flex;
  justify-content: center;
  align-items: start;
  padding: 1rem;
  background-color: #f6f9fc;
  min-height: 100vh;
  font-family: var(--font-primary);
  margin: 0;
}

.record-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 320px;
  padding:clamp(0.6rem, 1.2vw, 1.5rem);
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.avatar {
  width: 45px;
  height: 45px;
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
  background-color: #007bff;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  width: 320px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.stars {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.star {
  cursor: pointer;
  color: #ccc;
}

.star.filled {
  color: #fbc02d;
}

textarea {
  width: 100%;
  min-height: 80px;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  resize: none;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.modal-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background-color: #1e88e5;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #ccc;
}

.modal-error {
  color: red;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

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
  background-color: #007bff;
}

.confirm-btn {
  background-color: #43a047;
}

button:disabled,
input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.visit-error {
  color: red;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.modal p {
  margin-bottom: 1rem;
  color: #444;
}

@media (max-width: 765px) {
  .name {
    font-size: 0.75rem;
}
.datetime {
  font-size: 0.7rem;
}
}
</style>
