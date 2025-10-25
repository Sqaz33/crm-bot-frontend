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
      <div v-if="success" class="success-msg">Запись успешно создана!</div>
    </form>

    <TermsModal :visible="showTerms" @close="showTerms = false" />
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

const comment = ref('')
const remindLeadHours = ref(0) 
const submitting = ref(false)
const errorMsg = ref('')
const success = ref(false)
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

onMounted(async () => {
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

    success.value = true
    clearVisitData()
    setTimeout(() => router.push({ name: 'home' }), 1200)
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
  min-height: 50px; padding: .5em; 
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
  height: 1.1em; }
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
.success-msg { 
  color: #2d9400; 
  margin-top: 1em; 
  text-align: center; 
  }
</style>
