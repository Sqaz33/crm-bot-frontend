<template>
  <div class="min-h-screen bg-neutral-100 p-3">
    <!-- Visit Summary Card -->
    <VisitSummary 
      :summary="summary" 
      :client-name="clientNameFromAPI" 
    />

    <!-- Your Wishes Label -->
    <div class="text-xs font-bold text-neutral-500 mb-2 tracking-wide mt-3">ВАШИ ПОЖЕЛАНИЯ</div>
    
    <!-- Visit Form (comment textarea) -->
    <VisitForm
      v-model="comment"
    />

    <!-- Legal Agreement -->
    <LegalAgreement
      v-model="accepted"
      @show-terms="showTerms = true"
    />

    <!-- Submit Button -->
    <div class="flex justify-center mt-4">
      <button
        type="button"
        class="r_button"
        :disabled="submitting || !accepted"
        @click="submitVisit"
      >
        {{ submitting ? 'Запись...' : 'Записаться' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMsg" class="text-center text-red-700 mt-2.5 text-sm">
      {{ errorMsg }}
    </div>

    <!-- License Agreement Modal -->
    <LicenseAgreementSheet v-model="showTerms" />

    <!-- Success Modal -->
    <SuccessModal
      v-model="showSuccessModal"
      :client-name="clientNameFromAPI"
      :summary="summary"
      :salon-info="salonInfo"
      @go-to-records="goToRecords"
      @ask-admin="askAdmin"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'
import LicenseAgreementSheet from '../components/Modal/TermsBottomSheet.vue'
import { getEnv } from '../config'
import { getRawVisit, readVisit, clearVisit } from '../utils/visitStorage'
import { humanizeDateTime } from '../utils/dateFormatters'
import { logger } from '../utils/logger'

// Components
import VisitSummary from '../components/VisitSummary.vue'
import VisitForm from '../components/VisitForm.vue'
import LegalAgreement from '../components/LegalAgreement.vue'
import SuccessModal from '../components/SuccessModal.vue'

const router = useRouter()

// Reactive state
const summary = reactive({ 
  rawDate: '',
  date: '', 
  time: '', 
  staff: null, 
  service: null 
})
const salonInfo = reactive({ 
  name: 'Загрузка...', 
  description: '' 
})
const adminContactUrl = getEnv('ADMIN_CONTACT_URL', '#')
const clientData = ref(null)
const comment = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const showSuccessModal = ref(false)
const accepted = ref(false)
const showTerms = ref(false)
const staffId = ref(null)
const serviceId = ref(null)
const visitDate = ref(null)

// Computed
const clientNameFromAPI = computed(() => {
  return clientData.value?.name || '—'
})

// Load client data
async function loadClientData() {
  try {
    const { data } = await api.get('/auth/me/', {
      headers: { Accept: 'application/json' },
      withCredentials: true
    })
    clientData.value = data
  } catch (error) {
    logger.error('CreateVisitView: ошибка загрузки данных клиента', { error: error?.message || String(error) })
    clientData.value = null
  }
}

// Clear visit data
function clearVisitData() {
  clearVisit()
}

// Load salon info
async function loadSalonInfo() {
  try {
    const { data } = await api.get('/salon/info/')
    salonInfo.name = data.name || 'Название салона'
    salonInfo.description = data.description || 'тип заведения'
  } catch (e) {
    logger.error('CreateVisitView: ошибка загрузки информации о салоне', { error: e?.message || String(e) })
    salonInfo.name = 'Название салона'
    salonInfo.description = 'тип заведения'
  }
}

// Initialize on mount
onMounted(async () => {
  // Load client data
  await loadClientData()
  
  // Load salon info
  await loadSalonInfo()
  
  try {
    const raw = getRawVisit()
    if (!raw) {
      errorMsg.value = 'Не выбраны данные для записи.'
      return
    }
    const v = readVisit()

    comment.value = v.comment || ''
    staffId.value = v.staff_id ?? null
    serviceId.value = v.services_id ?? null
    visitDate.value = v.visit_time?.start_time ?? null

    if (staffId.value) {
      try { 
        const { data: staff } = await api.get(`/staff/${staffId.value}`)
        summary.staff = {
          id: staff.id,
          name: staff.name,
          photo: staff.photo,
          specialization: staff.specializations?.[0] || 'мастер'
        }
      } catch { 
        summary.staff = null 
      }
    }
    
    if (serviceId.value) {
      try { 
        const { data: list } = await api.get('/services/', { params: { service_id: serviceId.value } })
        summary.service = list?.[0] ?? null 
      } catch { 
        summary.service = null 
      }
    }

    const h = humanizeDateTime(visitDate.value)
    summary.rawDate = visitDate.value
    summary.date = h.d
    summary.time = h.t
  } catch (e) {
    logger.error('CreateVisitView: ошибка инициализации формы', { error: e?.message || String(e) })
    errorMsg.value = 'Ошибка инициализации формы.'
  }
})

// Submit visit
async function submitVisit() {
  if (!staffId.value || !serviceId.value || !visitDate.value) {
    errorMsg.value = 'Заполните сотрудника, услугу и дату.'
    return
  }
  if (!accepted.value) {
    errorMsg.value = 'Необходимо принять условия использования.'
    return
  }

  submitting.value = true
  errorMsg.value = ''

  try {
    const payload = {
      staff_id: staffId.value,
      service_id: serviceId.value,
      visit_date_time: visitDate.value,
      comment: comment.value || ''
    }

    logger.info('CreateVisitView: создание записи', { payload })
    const res = await api.post('/visits/', payload)
    logger.info('CreateVisitView: запись успешно создана', { status: res.status, data: res.data })

    showSuccessModal.value = true
    clearVisitData()
  } catch (e) {
    logger.error('CreateVisitView: ошибка создания записи', { error: e?.message || String(e) })
    const s = e?.response?.status
    const detail = e?.response?.data?.detail
    errorMsg.value =
      s === 401 ? 'Сессия истекла. Перезайдите.' :
      s === 403 ? 'Недостаточно прав.' :
      s === 422 ? (Array.isArray(detail) ? JSON.stringify(detail) : (detail || 'Некорректные данные (422).')) :
      'Не удалось создать запись. Попробуйте ещё раз.'
  } finally {
    submitting.value = false
  }
}

// Navigation
function closeSuccessModal() {
  showSuccessModal.value = false
  router.push({ name: 'home' })
}

function goToRecords() {
  showSuccessModal.value = false
  router.push('/records')
}

function askAdmin() {
  if (adminContactUrl && adminContactUrl !== '#') {
    window.open(adminContactUrl, '_blank')
  } else {
    alert('Ссылка для связи с администратором не настроена.')
  }
}
</script>