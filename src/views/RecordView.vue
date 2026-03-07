<template>
  <div class="record-view">
    <SpinnerLoad v-if="loading" class="loading text-brand-500 w-32 h-32" />
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="page">
      <div class="record-card">
        <!-- Шапка карточки и детали услуги -->
        <Header 
          :firstLetter="firstLetter"
          :staff="staff"
          :visit="visit"
          :service="service"
        />

        <!-- Статус записи -->
        <Status 
          :visit="visit"
        />

        <!-- Показываем элементы только если запись НЕ в статусе 'Оплачено' -->
        <div v-if="visit.status !== 'success'">
          <!-- Плашка: Я точно приду -->
          <VisitConfirm 
            :isOld="isOld"
            :willCome="willCome"
            :processing="processing"
            :delete_="delete_"
            :onWillComeChange="onWillComeChange"
          />

          <!-- Плашка: Оплата -->
          <Payment 
            :isOld="isOld"
            :willCome="willCome"
            :delete_="delete_"
          />
          
          <!-- Кнопка переноса записи -->
          <button 
            v-if="!isOld"
            class="tc_button tc_button--ok"
            @click="goToDatetime"
            :disabled="willCome || processing || delete_"
          >
            Перенести запись
          </button>

          <!-- Кнопка отмены записи -->
          <!-- Показываем кнопку только если запись НЕ в статусе 'Оплачено' -->
          <button 
            v-if="!isOld" 
            class="tc_button tc_button--cancel"
            @click="openCancelModal"
            :disabled="willCome || deleting || processing || delete_"
          >
            Отменить запись
          </button>
        </div>

        <!-- Кнопка повторной записи -->
        <button 
          v-if="isOld" 
          class="tc_button tc_button--ok"
          @click="goToDatetime"
        >
          Записаться повторно
        </button>

        <div v-if="visitError" class="visit-error">{{ visitError }}</div>
      </div>

      <!-- Модалки -->
      <!-- Подтверждение визита -->
      <RecordModal 
        v-if="showConfirmModal"
        :hText="'Подтверждение визита'"
        :pText="'Вы действительно хотите подтвердить, что придёте на приём?'"
        :yesText="'Да, подтверждаю'"
        :noText="'Отмена'"
        :yesAction="executeConfirmAction"
        :modalVisibilityUpdate="closeConfirmModal"
        :yesDisabledCondition="processing"
        :noDisabledCondition="processing"
      />

      <!-- Отмена записи -->
      <RecordModal 
        v-if="showCancelModal"
        :hText="'Отмена визита'"
        :pText="'Вы уверены, что хотите отменить запись на приём?'"
        :yesText="'Да, отменить'"
        :noText="'Отмена'"
        :yesAction="executeCancelAction"
        :modalVisibilityUpdate="closeCancelModal"
        :yesDisabledCondition="deleting"
        :noDisabledCondition="deleting"
      />

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
import { getErrorMessage } from '../utils/apiError'
import { logger } from '../utils/logger'
import Header from '../components/record/Header.vue'
import Status from '../components/record/Status.vue'
import VisitConfirm from '../components/record/VisitConfirm.vue'
import Payment from '../components/record/Payment.vue'
import RecordModal from '../components/Modal/RecordModal.vue'
import SpinnerLoad from '../components/ui/SpinnerLoad.vue'

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

function executeConfirmAction() {
  if (confirmAction) {
    confirmAction.value()
  }
}

function executeCancelAction() {
  if (cancelAction) {
    cancelAction.value()
  }
}

function openCancelModal() {
  cancelAction.value = cancelVisit
  showCancelModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
}

function closeCancelModal() {
  showCancelModal.value = false
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
@config "../tailwind.config.js";
*, *::before, *::after { box-sizing: border-box; }

/* 1) Контейнер страницы + палитра */
.record-view{
  @apply bg-neutral-100;
  --card:#FFFFFF;
  --text:#1C2534;
  --muted:#8A95A6;
  --divider:#ECEFF5;
  --green:linear-gradient(45deg, #69FFDB, #69FF03);       
  --shadow:0 8px 20px rgba(23,35,68,.08);

  min-height:100vh;
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

/* Кнопки внизу страницы */
.action-buttons{
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

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

/* 11) Служебные состояния */
.loading {
  margin-top: 48px;
}
.error {color: #d9534f}
.visit-error {
  color: #d9534f;
  font-size: 13px;
  margin-top: 6px
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

.tc_button{
  overflow: hidden;
}
.tc_button--ok{
  margin-bottom: 12px;
}
</style>