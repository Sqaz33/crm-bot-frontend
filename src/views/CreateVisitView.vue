<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'
import TermsModal from '../components/TermsModal.vue'

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'
const router = useRouter()

const summary = reactive({
  date: '',
  time: '',
  staff: null,
  service: null,
})
const comment = ref('')
const remindLeadDays = ref(0)
const submitting = ref(false)
const errorMsg = ref('')
const success = ref(false)
const accepted = ref(false)
const showTerms = ref(false)

// Получаем имя клиента
const clientName = computed(() => {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return '—'
  try {
    const obj = JSON.parse(raw)
    return [obj.firstName, obj.lastName].filter(Boolean).join(' ')
  } catch {
    return '—'
  }
})

// Получаем актуальный токен
function getToken() {
  const fromStorage = localStorage.getItem('access_token')
  if (fromStorage) return fromStorage
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

function clearVisitData() {
  localStorage.removeItem(VISIT_KEY)
  document.cookie = `${VISIT_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
}

// Загружаем данные визита
onMounted(async () => {
  const raw = localStorage.getItem(VISIT_KEY)
  if (!raw) {
    errorMsg.value = 'Не выбраны данные для записи.'
    return
  }
  const data = JSON.parse(raw)
  comment.value = data.comment || ''

  if (data.visit_time?.start_time) {
    const dt = new Date(data.visit_time.start_time)
    summary.date = dt.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', weekday: 'long' })
    summary.time = dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  if (data.staff_id) {
    try {
      const { data: staff } = await api.get(`/salon/staff/${data.staff_id}`)
      summary.staff = staff
    } catch { summary.staff = null }
  }

  const serviceId = Array.isArray(data.services_id) ? data.services_id[0] : data.services_id
  if (serviceId) {
    try {
      const { data: serviceList } = await api.get('/services/', { params: { service_id: serviceId } })
      summary.service = serviceList[0]
    } catch { summary.service = null }
  }
})

async function submitVisit() {
  if (!summary.staff || !summary.service || !summary.time) {
    errorMsg.value = 'Не заполнены обязательные поля.'
    return
  }
  if (!accepted.value) {
    errorMsg.value = 'Необходимо принять условия использования.'
    return
  }

  const token = getToken()
  console.log('[CreateVisit] Токен перед отправкой:', token ? token.slice(0, 25) + '...' : 'нет')
  if (!token) {
    errorMsg.value = 'Нет токена. Авторизуйтесь заново.'
    return
  }

  submitting.value = true
  errorMsg.value = ''

  try {
    const res = await api.post('/visits/', {
      staff_id: summary.staff.id,
      service_id: summary.service.id,
      visit_date_time: new Date().toISOString(),
      comment: comment.value,
      remind_lead_days: remindLeadDays.value,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    console.log('[CreateVisit] Ответ сервера:', res.status, res.data)

    success.value = true
    clearVisitData()
    setTimeout(() => router.push({ name: 'home' }), 1500)
  } catch (e) {
    console.error('[CreateVisit] Ошибка при POST /visits/:', e)
    errorMsg.value = 'Ошибка (401). Токен просрочен или неверный. Перезайдите.'
  } finally {
    submitting.value = false
  }
}
</script>



<style scoped>
.visit-create-view {
  max-width: 500px;
  margin: 2rem auto;
  background: #f5f8ff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.visit-summary {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.date-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.staff-block {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 0.8rem;
  object-fit: cover;
  background: #eee;
}
.staff-info {
  flex: 1;
}
.staff-name { font-weight: bold; }
.staff-role { font-size: 0.92em; color: #888; }
.service-block, .total-block { margin-bottom: 1rem; }
.service-price, .total-price { font-weight: bold; font-size: 1.2em; float: right; }
.total-block {
  background: #a3ddff;  /* синий */
  border-radius: 6px;
  padding: 0.7em 1em;
  font-weight: bold;
  font-size: 1.13em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.visit-form {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
}
.form-label {
  font-size: 0.88em;
  font-weight: bold;
  color: #7c8499;
  margin: 1.1em 0 0.4em 0;
  letter-spacing: 0.03em;
}
.client-block {
  background: #e5f5ff;
  padding: 0.6em 1em;
  border-radius: 7px;
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 1em;
  gap: 0.7em;
}
.client-icon {
  font-size: 1.25em;
  background: #00b172;
  color: #fff;
  padding: 0.2em 0.45em;
  border-radius: 6px;
}
.client-name { font-size: 1em; }
.form-section {
  margin-bottom: 1.1rem;
}
textarea {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #d3d3d3;
  min-height: 50px;
  padding: 0.5em;
  font-size: 1em;
}
select {
  border-radius: 4px;
  padding: 0.3em;
  margin-top: 0.2em;
  font-size: 1em;
  width: 100%;
}
.legal-row {
  display: flex;
  align-items: center;
  font-size: 0.98em;
  gap: 0.5em;
  margin-bottom: 1.1em;
}
.legal-row input[type="checkbox"] {
  width: 1.1em;
  height: 1.1em;
}
.legal-row a {
  color: #3471d6;
  text-decoration: underline;
  cursor: pointer;
}
.btn-submit {
  width: 100%;
  background: #2F80EC;
  color: #fff;
  padding: 0.9em;
  font-size: 1.11em;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1em;
}
.btn-submit[disabled] {
  background: #ccc;
  cursor: not-allowed;
}
.error-msg {
  color: #c00;
  margin-top: 1em;
  text-align: center;
}
.success-msg {
  color: #2d9400;
  margin-top: 1em;
  text-align: center;
}
</style>
