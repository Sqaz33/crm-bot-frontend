<template>
  <div class="visit-create-view">
    <div class="visit-summary">
      <div class="date-row">
        <div class="date-cell"><div class="date">{{ summary.date || '—' }}</div></div>
        <div class="time-cell">{{ summary.time || '—' }}</div>
      </div>

      <div class="staff-block" v-if="summary.staff">
        <img :src="summary.staff.photo" class="avatar" v-if="summary.staff.photo" />
        <div class="staff-info">
          <div class="staff-name">{{ summary.staff.name }}</div>
          <div class="staff-role">{{ summary.staff.specialization }}</div>
        </div>
      </div>

      <div class="service-block" v-if="summary.service">
        <div class="service-name">{{ summary.service.name }}</div>
        <div class="service-desc">{{ summary.service.description }}</div>
        <div class="service-duration">{{ summary.service.duration }} мин</div>
        <div class="service-price">{{ summary.service.price }} ₽</div>
      </div>

      <div class="total-block" v-if="summary.service">
        <span>Итого к оплате:</span>
        <span class="total-price">{{ summary.service.price }} ₽</span>
      </div>
    </div>

    <form class="visit-form" @submit.prevent="submitVisit">
      <div class="form-label">ПРОФИЛЬ КЛИЕНТА</div>
      <div class="client-block">
        <span class="client-icon">👤</span>
        <span class="client-name">{{ clientName }}</span>
      </div>

      <div class="form-label">НАПОМИНАНИЕ О ВИЗИТЕ</div>
      <div class="form-section">
        <select v-model.number="remindLeadHours">
          <option :value="0">Не напоминать</option>
          <option :value="1">1 час</option>
          <option :value="2">2 часа</option>
          <option :value="4">4 часа</option>
          <option :value="24">24 часа</option>
        </select>
      </div>

      <div class="form-label">ВАШИ ПОЖЕЛАНИЯ</div>
      <div class="form-section">
        <textarea v-model="comment" placeholder="Ваши пожелания"></textarea>
      </div>

      <div class="legal-row">
        <input type="checkbox" id="accept" v-model="accepted" />
        <label for="accept">
          <span>Я принимаю <a href="#" @click.prevent="showTerms = true">условия использования</a></span>
        </label>
      </div>

      <button class="btn-submit" type="submit" :disabled="submitting || !accepted">Записаться</button>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    </form>

    <TermsModal :visible="showTerms" @close="showTerms = false" />
    
    <!-- Модальное окно успешной записи -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
      <div class="success-modal">
        <!-- Крестик закрытия -->
        <button class="close-btn" @click="closeSuccessModal">
          <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 5L5.5 15M5.5 5L15.5 15" stroke="#454558" stroke-width="1.5286" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Контент модального окна -->
        <div class="modal-content">
          <!-- Карточка салона -->
          <div class="salon-card">
            <div class="salon-logo">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#666FE8"/>
                  <path d="M28.858 39.71V36.4899C28.858 35.6709 29.5608 35.0054 30.4316 34.9999H33.6215C34.4965 34.9999 35.2058 35.667 35.2058 36.4899V39.72C35.2056 40.4154 35.7958 40.9837 36.5349 41H38.6615C40.7815 41 42.5 39.3837 42.5 37.3899V28.2297C42.4887 27.4454 42.0971 26.7088 41.4367 26.2297L34.1638 20.7196C32.8897 19.7601 31.0784 19.7601 29.8043 20.7196L22.5633 26.2397C21.9004 26.7169 21.5082 27.4546 21.5 28.2397V37.3899C21.5 39.3837 23.2185 41 25.3385 41H27.4651C28.2226 41 28.8367 40.4224 28.8367 39.71" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M42.4133 44.0304H44.5399C46.6598 44.0304 48.3784 42.4141 48.3784 40.4203V33.5001C48.3671 32.7158 47.9755 31.9792 47.3151 31.5001L45.9275 30.25" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21.4651 44.0304H19.3385C17.2186 44.0304 15.5 42.4141 15.5 40.4203V33.5001C15.5113 32.7158 15.9029 31.9792 16.5633 31.5001L17.9509 30.25" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="salon-info">
              <div class="salon-name">{{ salonInfo.name }}</div>
              <div class="salon-type">{{ salonInfo.description }}</div>
            </div>
          </div>

          <!-- Основной текст -->
          <div class="success-text">
            ✏️ <strong>{{ clientName }}</strong>, Вы успешно записаны на <strong>{{ summary.service?.name }}</strong>
            <br>
            👤 К специалисту - <strong>{{ summary.staff?.name }}</strong>
            <br>
            ⏰ Дата и время: <strong>{{ summary.date }}, {{ summary.time }}</strong>
          </div>

          <!-- Кнопки -->
          <button class="btn-my-records" @click="goToRecords">
            Мои записи
          </button>
          
          <button class="btn-ask-admin" @click="askAdmin">
            Задать вопрос администратору
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'
import TermsModal from '../components/TermsModal.vue'

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'
const router = useRouter()

const summary = reactive({ date: '', time: '', staff: null, service: null })
const salonInfo = reactive({ name: 'Загрузка...', description: '' })

const comment = ref('')
const remindLeadHours = ref(0) 
const submitting = ref(false)
const errorMsg = ref('')
const showSuccessModal = ref(false)
const accepted = ref(false)
const showTerms = ref(false)

const staffId = ref(null)
const serviceId = ref(null)
const visitDateISO = ref(null)

const clientName = computed(() => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return '—'
    const p = JSON.parse(raw)
    return [p.firstName, p.lastName].filter(Boolean).join(' ') || '—'
  } catch { return '—' }
})

function toISO(value) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const d = new Date(value); return isNaN(d) ? null : d.toISOString()
  }
  if (typeof value === 'number') {
    const d = new Date(value); return isNaN(d) ? null : d.toISOString()
  }
  const ddmmyy = /^(\d{2})\.(\d{2})\.(\d{4})(?:[ T](\d{2}):(\d{2}))?$/
  if (ddmmyy.test(value)) {
    const [, dd, mm, yyyy, hh='00', mi='00'] = value.match(ddmmyy)
    const d = new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:00`)
    return isNaN(d) ? null : d.toISOString()
  }
  const d = new Date(value); return isNaN(d) ? null : d.toISOString()
}

function humanize(iso) {
  if (!iso) return { d:'', t:'' }
  const d = new Date(iso); if (isNaN(d)) return { d:'', t:'' }
  return {
    d: d.toLocaleDateString('ru-RU', { day:'2-digit', month:'long', weekday:'long' }),
    t: d.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })
  }
}

function clearVisitData() {
  localStorage.removeItem(VISIT_KEY)
  document.cookie = `${VISIT_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
}

async function loadSalonInfo() {
  try {
    const { data } = await api.get('/salon/info')
    salonInfo.name = data.name || 'Название салона'
    salonInfo.description = data.description || 'тип заведения'
  } catch (e) {
    console.error('[LoadSalon] Ошибка:', e)
    salonInfo.name = 'Название салона'
    salonInfo.description = 'тип заведения'
  }
}

onMounted(async () => {
  // Загружаем информацию о салоне
  await loadSalonInfo()
  
  try {
    const raw = localStorage.getItem(VISIT_KEY)
    if (!raw) { errorMsg.value = 'Не выбраны данные для записи.'; return }
    const v = JSON.parse(raw)

    comment.value = v.comment || ''
    staffId.value = v.staff_id ?? null
    serviceId.value = Array.isArray(v.services_id) ? v.services_id[0] : (v.services_id ?? null)

    visitDateISO.value =
      toISO(v.visit_time?.start_time) ??
      toISO(router.currentRoute.value.query.date) ??
      toISO(router.currentRoute.value.query.datetime) ??
      null

    if (staffId.value) {
      try { const { data: staff } = await api.get(`/salon/staff/${staffId.value}`); summary.staff = staff } catch { summary.staff = null }
    }
    if (serviceId.value) {
      try { const { data: list } = await api.get('/services/', { params: { service_id: serviceId.value } }); summary.service = list?.[0] ?? null } catch { summary.service = null }
    }

    const h = humanize(visitDateISO.value)
    summary.date = h.d; summary.time = h.t
  } catch (e) {
    console.error('[Init] Ошибка:', e)
    errorMsg.value = 'Ошибка инициализации формы.'
  }
})

async function submitVisit() {
  if (!staffId.value || !serviceId.value || !visitDateISO.value) {
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
      staff_id:        staffId.value,
      service_id:      serviceId.value,
      visit_date_time: visitDateISO.value,
      comment:         comment.value || '',
      remind_lead_hours: Number(remindLeadHours.value) || 0, 
    }

    console.log('[VisitCreate] POST /visits/ payload →', payload)
    const res = await api.post('/visits/', payload)
    console.log('[VisitCreate] OK', res.status, res.data)

    // Показываем модальное окно вместо редиректа
    showSuccessModal.value = true
    clearVisitData()
  } catch (e) {
    console.error('[VisitCreate] Ошибка:', e)
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

function closeSuccessModal() {
  showSuccessModal.value = false
  router.push({ name: 'home' })
}

function goToRecords() {
  showSuccessModal.value = false
  router.push('/records')
}

function askAdmin() {
  // Открываем Telegram бота для вопросов
  const botLink = 'https://t.me/CheckAuthorization_bot'
  window.open(botLink, '_blank')
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

.staff-name {
  font-weight: bold; 
}

.staff-role { 
  font-size: .92em; 
  color: #888; 
}

.service-block, .total-block { 
  margin-bottom: 1rem; 
}

.service-price, .total-price { 
  font-weight: bold; 
  font-size: 1.2em; 
  float: right; 
}

.total-block { 
  background: #a3ddff; 
  border-radius: 6px; 
  padding: .7em 1em; 
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
  font-size: .88em; 
  font-weight: bold; 
  color: #7c8499; 
  margin: 1.1em 0 .4em; 
  letter-spacing: .03em; 
}

.client-block { 
  background: #e5f5ff; 
  padding: .6em 1em; 
  border-radius: 7px; 
  display: flex; 
  align-items: center; 
  font-weight: bold; 
  margin-bottom: 1em; 
  gap: .7em; 
}

.client-icon { 
  font-size: 1.25em; 
  background: #00b172; 
  color: #fff; 
  padding: .2em .45em; 
  border-radius: 6px; 
}

.client-name { 
  font-size: 1em; 
}

.form-section { 
  margin-bottom: 1.1rem;
}

textarea { 
  width: 100%; 
  border-radius: 6px; 
  border: 1px solid #d3d3d3; 
  min-height: 50px; 
  padding: .5em; 
  font-size: 1em; 
}

select { 
  border-radius: 4px; 
  padding: .3em; 
  margin-top: .2em; 
  font-size: 1em; 
  width: 100%; 
}

.legal-row { 
  display: flex;
  align-items: center; 
  font-size: .98em; 
  gap: .5em; 
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
  padding: .9em; 
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

/* МОДАЛЬНОЕ ОКНО УСПЕШНОЙ ЗАПИСИ - FLEXBOX + РАЗМЕРЫ ИЗ FIGMA */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(69, 69, 88, 0.525);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.success-modal {
  position: relative;
  width: 905px;
  max-width: 90%;
  background: #FFFFFF;
  border-radius: 12px;
  box-sizing: border-box;
}

.modal-content {
  display: flex;
  flex-direction: column;
  padding: 48px 0 60px 0;
  gap: 0;
}

.close-btn {
  position: absolute;
  top: 28px;
  right: 54px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 21px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.close-btn:hover {
  opacity: 0.7;
}

.salon-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 16px 0 16px 41px;
  background: #FFFFFF;
  border-radius: 10px;
  margin-left: 39px;
  margin-right: 33px;
  margin-bottom: 71px;
}

.salon-logo {
  width: 64px;
  height: 64px;
  background: #666FE8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.salon-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.salon-name {
  font-family: 'Geometria', 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  color: #454558;
}

.salon-type {
  font-family: 'Geometria', 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
}

.success-text {
  font-family: 'Geometria', 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 29px;
  color: #454558;
  margin-left: 80px;
  margin-right: 116px;
  margin-bottom: 57px;
}

.success-text strong {
  font-weight: 500;
  font-family: 'Geometria', 'Inter', sans-serif;
}

.btn-my-records {
  width: 745px;
  height: 56px;
  margin-left: 80px;
  margin-right: 80px;
  margin-bottom: 20px;
  padding: 16px;
  background: #666FE8;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Geometria', 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  color: #FFFFFF;
  transition: background 0.2s;
  box-sizing: border-box;
}

.btn-my-records:hover {
  background: #5459c9;
}

.btn-ask-admin {
  width: 745px;
  height: 56px;
  margin-left: 80px;
  margin-right: 80px;
  padding: 16px;
  background: #EBEEF6;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Geometria', 'Inter', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
  transition: background 0.2s;
  box-sizing: border-box;
}

.btn-ask-admin:hover {
  background: #dde0e8;
}

/* Адаптивность для планшетов */
@media (max-width: 920px) {
  .success-modal {
    width: 95%;
    max-width: 700px;
  }
  
  .modal-content {
    padding: 40px 0 50px 0;
  }
  
  .salon-card {
    margin-left: 20px;
    margin-right: 20px;
    padding-left: 20px;
  }
  
  .salon-name {
    font-size: 22px;
    line-height: 26px;
  }
  
  .salon-type {
    font-size: 18px;
    line-height: 22px;
  }
  
  .success-text {
    margin-left: 30px;
    margin-right: 30px;
    font-size: 20px;
    line-height: 26px;
    margin-bottom: 40px;
  }
  
  .btn-my-records {
    width: calc(100% - 60px);
    margin-left: 30px;
    margin-right: 30px;
    margin-bottom: 16px;
    font-size: 18px;
  }
  
  .btn-ask-admin {
    width: calc(100% - 60px);
    margin-left: 30px;
    margin-right: 30px;
    font-size: 18px;
  }
  
  .close-btn {
    right: 30px;
  }
}

/* Адаптивность для мобильных */
@media (max-width: 600px) {
  .success-modal {
    width: 95%;
    max-width: 100%;
  }
  
  .modal-content {
    padding: 32px 0 40px 0;
  }
  
  .salon-card {
    margin-left: 16px;
    margin-right: 16px;
    gap: 12px;
    padding: 12px 0 12px 16px;
    margin-bottom: 40px;
  }
  
  .salon-logo {
    width: 48px;
    height: 48px;
  }
  
  .salon-logo svg {
    width: 28px;
    height: 28px;
  }
  
  .salon-name {
    font-size: 18px;
    line-height: 22px;
  }
  
  .salon-type {
    font-size: 16px;
    line-height: 20px;
  }
  
  .success-text {
    font-size: 16px;
    line-height: 22px;
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 30px;
  }
  
  .btn-my-records {
    margin-left: 20px;
    margin-right: 20px;
    width: calc(100% - 40px);
    height: 48px;
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .btn-ask-admin {
    margin-left: 20px;
    margin-right: 20px;
    width: calc(100% - 40px);
    height: 48px;
    font-size: 16px;
  }
  
  .close-btn {
    top: 16px;
    right: 16px;
  }
}
</style>