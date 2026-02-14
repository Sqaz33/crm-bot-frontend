<template>
  <div class="record-view">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="page">
      <div class="record-card">
        <!-- Шапка карточки -->
        <div class="header">
          <div class="who">
            <div class="avatar">{{ firstLetter }}</div>
            <div class="info">
              <div class="name">
              {{ staff.name }}
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

        <!-- Статус записи -->
        <div class="card-status">
          <div class="status-info">
            <img
              :src="statusMessage[visit.status]?.icon || clockIcon"
              :alt="statusMessage[visit.status]?.title || 'Статус'"
              :class="['status-icon', statusMessage[visit.status]?.bgClass || 'status-icon-waiting']"
            />
            <div class="status-badge-reason">
              <span class="status-badge">
                {{ statusMessage[visit.status]?.title || 'Ожидание' }}
              </span>
              <div class="status-reason">
                {{ statusMessage[visit.status]?.subtitle || 'Ждем вас в салоне' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Плашка: Я точно приду -->
        <div v-if="!isOld" class="section" :class="{ 'section-disabled': willCome || delete_ }">
          <div class="section-bar">Я точно приду</div>
          <div class="toggle-row">
            <div class="hint">Нажимая, вы подтверждаете свой визит</div>
            <label class="toggle">
              <input
                type="checkbox"
                :checked="willCome"
                @change="onWillComeChange"
                :disabled="willCome || processing || delete_"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <!-- Плашка: Оплата -->
        <div v-if="!isOld" class="section" :class="{ 'section-disabled': willCome || delete_ }">
          <div class="section-bar">Оплата</div>
          <div class="list">
            <div class="list-item disabled" tabindex="-1" aria-disabled="true">
              <span class="icon-circle lock-icon" aria-hidden="true"><img src="../assets/castle.svg" alt="" class="icon-14" /></span>
              <span class="text">Оплата недоступна</span>
              <span class="chevron">›</span>
            </div>
          </div>
        </div>

        <!-- Плашка: Перенос записи -->
        <div v-if="!isOld" class="section" :class="{ 'section-disabled': willCome || processing || delete_ }">
          <div class="list">
            <button
              class="list-item"
              @click="goToDatetime"
              :disabled="willCome || processing || delete_"
            >
              <span class="icon-circle neutral-icon">⤴</span>
              <span class="text">Перенести запись</span>
              <span class="chevron">›</span>
            </button>
          </div>
        </div>

        <!-- Плашка: Отмена записи -->
        <div v-if="!isOld" class="section" :class="{ 'section-disabled': willCome || deleting || processing || delete_ }">
          <div class="list">
            <button
              class="list-item danger"
              @click="openCancelModal"
              :disabled="willCome || deleting || processing || delete_"
            >
              <span class="icon-circle danger-icon">✖</span>
              <span class="text">Отменить запись</span>
              <span class="chevron">›</span>
            </button>
          </div>
        </div>

        <!-- Кнопки для прошедших записей -->
        <div v-if="isOld" class="action-buttons">
          <button class="btn-secondary" @click="goToDatetime">
            <span class="btn-icon">⤴</span>
            Записаться повторно
          </button>
        </div>

        <div v-if="visitError" class="visit-error">{{ visitError }}</div>

      </div>

      <!-- Модалки -->
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

      <!-- Модалка отзыва (временно скрыта) -->
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
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import { getStaff, getService } from '../utils/staffServiceCache'
import { readVisit, writeVisit, clearVisit, waitForVisitTime } from '../utils/visitStorage'
import { formatDate } from '../utils/dateFormatters'
import { getErrorMessage } from '../utils/apiError'
import { logger } from '../utils/logger'
import crossIcon from '../assets/crossIcon.svg'
import checkmarkIcon from '../assets/checkmarkIcon.svg'
import clockIcon from '../assets/clockIcon.svg'

// --- ROUTER --- //
const route = useRoute()
const router = useRouter()
const visitId = route.params.id
const isOld = route.query.isOld === 'true'

// --- STATE --- //
const loading = ref(true)
const deleting = ref(false)
const processing = ref(false)
const delete_ = ref(true)
const error = ref('')
const visit = ref(null)
const staff = ref({})
const service = ref({})
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const showCancelModal = ref(false)
const cancelAction = ref(null)

const willCome = ref(false)

// -- MODULE VARS -- //
let service_id = null
let staff_id = null
// AbortController для отмены запросов
let currentAbortController = null

/* Преобразование статуса в сообщение пользователю */
const statusMessage = {
  "waiting": { icon: clockIcon, bgClass: 'status-icon-waiting', title: "Ожидание", subtitle: "Ждем вас в салоне" },
  "confirmed": { icon: checkmarkIcon, bgClass: 'status-icon-confirmed', title: "Подтверждено", subtitle: "Ждем вас в салон" },
  "missing": { icon: crossIcon, bgClass: 'status-icon-unpaid', title: "Не оплачено", subtitle: "Визит отменен / клиент не пришел" },
  "success": { icon: checkmarkIcon, bgClass: 'status-icon-paid', title: "Оплачено", subtitle: "Визит прошел успешно" },
}

function openCancelModal() {
  cancelAction.value = cancelVisit
  showCancelModal.value = true
}

// --- API: Загрузка данных --- //
async function loadVisit() {
  // Отменяем предыдущий запрос, если он ещё выполняется
  loading.value = true
  error.value = ''
  logger.info('loadVisit: загрузка данных о визите', { visitId })

  try {
    const { data } = await api.get(`/visits/${visitId}`)
    visit.value = data
    staff.value = await getStaff(data.staff_id)
    service.value = await getService(data.service_id)
    staff_id = data.staff_id
    service_id = data.service_id
    willCome.value = data.status === 'confirmed'
    delete_.value = data.status === 'missing'
    logger.info('loadVisit: данные загружены', { 
      visitId, 
      status: data.status,
      staffName: staff.value?.name,
      serviceName: service.value?.name 
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      logger.debug('loadVisit: запрос отменён')
      return
    }
    logger.error('loadVisit: ошибка загрузки', { error: err?.message || String(err), visitId })
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
  logger.info('toggleWillCome: подтверждение визита', { visitId })
  
  try {
    await api.patch(`/visits/${visitId}/confirm`)
    willCome.value = true
    logger.info('toggleWillCome: визит подтверждён', { visitId })
  } catch (err) {
    logger.error('toggleWillCome: ошибка', { error: err?.message || String(err), visitId })
    visitError.value = getErrorMessage(err, 'Ошибка при обновлении статуса визита.')
  } finally {
    processing.value = false
  }
}

// --- Отмена визита --- //
async function cancelVisit() {
  deleting.value = true
  visitError.value = ''
  logger.info('cancelVisit: отмена визита', { visitId })
  
  try {
    await api.delete(`/visits/${visitId}`)
    logger.info('cancelVisit: визит отменён', { visitId })
    router.push('/records')
  } catch (err) {
    logger.error('cancelVisit: ошибка', { error: err?.message || String(err), visitId })
    visitError.value = getErrorMessage(err, 'Не удалось отменить запись.')
  } finally {
    deleting.value = false
  }
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
  try {
    const params = readVisit()
    params.staff_id = staff_id
    params.services_id = service_id
    writeVisit(params)
    logger.info('goToDatetime: переход к выбору даты', { visitId })
    router.push({
      path: '/datetime',
      query: { redirect: router.currentRoute.value.fullPath, moveVisit: visitId }
    })
  } catch (err) {
    logger.error('goToDatetime', { error: err?.message || String(err) })
    visitError.value = 'Ошибка при переходе к выбору даты.'
  }
}


// Обработка возврата со страницы выбора даты/времени
async function handleMoveVisitReturn() {
  processing.value = true
  visitError.value = ''
  logger.info('handleMoveVisitReturn: обработка возврата', { visitId })
  
  try {
    if (!visit.value) await loadVisit()
    const visitTime = await waitForVisitTime()
    logger.debug('handleMoveVisitReturn: обновление времени визита', { visitId, newTime: visitTime })
    await api.patch(`/visits/${visitId}`, {
      visit_date_time: visitTime
    })
    clearVisit()
    await loadVisit()
    logger.info('handleMoveVisitReturn: визит обновлён', { visitId })
  } catch (err) {
    logger.error('handleMoveVisitReturn: ошибка', { error: err?.message || String(err), visitId })
    visitError.value = 'Не удалось обновить дату и время визита.'
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  loadVisit()
  if (route.query.fromDatetime === 'true') {
    handleMoveVisitReturn()
    router.replace({ path: route.path, query: { isOld: route.query.isOld } })
  }
})
</script>


<style scoped>

*, *::before, *::after { box-sizing: border-box; }

/* 1) Контейнер страницы + палитра */
.record-view{
  --bg:#F6F7FB;
  --card:#FFFFFF;
  --text:#1C2534;
  --muted:#8A95A6;
  --divider:#ECEFF5;
  --green:linear-gradient(45deg, #69FFDB, #69FF03);       
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

  padding-top:16px;
  padding-bottom:24px;
  padding-inline:16px;  
  padding-inline: max(16px, max(env(safe-area-inset-left), env(safe-area-inset-right)));
  
  overflow-x:clip;     
}

/* 2) Центрированный заголовок */
.page-title{
  text-align:center;
  font-weight:700;
  color:#5C6676;
  padding:12px 0;
  margin-bottom:12px;
  border-radius:12px;
}

/* 3) Карточка записи */
.record-card{
  border-radius:16px;
  padding-right:64px; padding-left:64px;
  margin:0;
  overflow:hidden; 
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
.header > *{ min-width:0; }    

.who{display:flex;align-items:center;gap:10px;min-width:0;}
.avatar{
  width:24px;height:40px;border-radius:50%;
  background:var(--green);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:16px;flex:0 0 40px;
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
  font-size:12px;color:#6f7a87;
  overflow:hidden;text-overflow:ellipsis;max-width:40%;
}

/* 5) Детали услуги */
.details{
  background:#F3F5F8;border-radius:12px;padding:10px 12px;margin-bottom:12px;
  overflow:hidden;max-width:100%;
}

/* 5a) Статус записи */
.card-status{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  background: #fff;
  border: 1px solid var(--divider);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  max-width: 100%;
}

.status-info{
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.status-icon{
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.status-icon-paid {
  background-color: #00BB83;
}

.status-icon-unpaid {
  background-color: #DE5D93;
}

.status-icon-confirmed {
  background-color: #6dadff;
}

.status-icon-waiting {
  background-color: #f3a950;
}

.status-badge-reason{
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge{
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: rgba(69, 69, 88, 1);
}

.status-reason{
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5rem;
  color: rgba(69, 69, 88, 1);
}

/* Кнопки внизу страницы */
.action-buttons{
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary{
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary{
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover{
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary{
  background: #fff;
  color: #5073f0;
  border: 2px solid #5073f0;
}

.btn-secondary:hover{
  background: #f0f4ff;
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
.section-disabled{
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.section-bar{
  background:var(--primary);color:#8097B1;font-weight:400;
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
.list-item{border:none}
.list-item .text{
  flex:1 1 auto;color:var(--text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.list-item .chevron{font-size:18px;opacity:.4}
.list-item.disabled{opacity:.55;pointer-events:none}
.list-item.danger .text{color:#d9534f}

/* 9) Круглые иконки */
.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}
.danger-icon {
  background-color: #DE5D93; 
  color: white;
}
.neutral-icon {
  background-color: #0098B3; 
  color: white;
}
.lock-icon {
  background-color: #7F8287; 
  color: #020202;
}

/* 10) Модалки */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.4);
  display:flex;justify-content:center;align-items:center;z-index: 999999;
}
.modal{
  background:#fff;padding:16px;border-radius:12px;
  width:auto;max-width:min(90vw, 360px);
  box-shadow:0 10px 30px rgba(0,0,0,.2);
}
.modal-buttons{display:flex;justify-content:flex-end;gap:8px}
.modal-buttons button{padding:8px 12px;border:none;border-radius:10px;cursor:pointer}
.modal-buttons button:first-child{background:#666FE8;color:#fff}
.modal-buttons button:last-child{background:#e7e9ee}
/* 11) Служебные состояния */
.loading{font-size:16px;color:#555}
.error{color:#d9534f}
.visit-error{color:#d9534f;font-size:13px;margin-top:6px}
.icon-14 {max-width: 60%;}

@media (max-width: 768px){
  .header{ padding:10px 12px; }
  .details{ padding:10px 12px; }
  .list-item{ padding:12px; }
}
@media (max-width: 412px) {
  .record-card{
    border-radius:16px;
    padding-right:64px; padding-left:64px;
    width:85%;
    margin:0;
    overflow:hidden; 
    max-width:100%;
  }
}

img, svg, video{ max-width:100%; height:auto; }
.header-row > *{ min-width:0; }
</style>