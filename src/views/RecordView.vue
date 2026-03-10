<template>
  <div class="bg-neutral-100 min-h-screen flex justify-center">
    <SpinnerLoad v-if="loading" class="text-brand-500" />
    <div v-else-if="error" class="text-red-700">{{ error }}</div>

    <div v-else class="w-full max-w-lg mx-auto pt-4 pb-6 px-4 sm:px-safe overflow-x-clip">
      <div class="sm:px-16 overflow-hidden max-w-full">
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
            class="tc_button tc_button--ok mb-3"
            @click="goToDatetime"
            :disabled="willCome || processing || delete_"
          >
            Перенести запись
          </button>

          <!-- Кнопка отмены записи -->
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
        <!--
        <button 
          v-if="isOld" 
          class="tc_button tc_button--ok"
          @click="goToDatetime"
        >
          Записаться повторно
        </button>
        -->

        <div v-if="visitError" class="text-red-700 text-[13px] mt-1.5">{{ visitError }}</div>
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
</style>