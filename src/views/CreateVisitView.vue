<template>
  <div class="visit-create-view">
    <div class="visit-summary">
      <div class="date-row">
        <div class="date-cell">
          <div class="date">{{ summary.date }}</div>
        </div>
        <div class="time-cell">{{ summary.time }}</div>
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
      <div class="form-section">
        <label>Комментарий к визиту:</label>
        <textarea v-model="comment" placeholder="Ваши пожелания"></textarea>
      </div>
      <div class="form-section">
        <label>Напомнить за</label>
        <select v-model="remindLeadDays">
          <option :value="0">Не напоминать</option>
          <option :value="1">1 день</option>
          <option :value="2">2 дня</option>
          <option :value="3">3 дня</option>
          <option :value="7">7 дней</option>
        </select>
      </div>
      <button class="btn-submit" type="submit" :disabled="submitting">Записаться</button>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div v-if="success" class="success-msg">Запись успешно создана!</div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const VISIT_KEY = 'visit_data'
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

function clearVisitData() {
  localStorage.removeItem(VISIT_KEY)
  document.cookie = `${VISIT_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
}

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
  errorMsg.value = ''
  submitting.value = true

  try {
    await api.post('/visits/', {
      staff_id: summary.staff.id,
      service_id: summary.service.id,
      visit_date_time: new Date().toISOString(), 
      comment: comment.value,
      remind_lead_days: remindLeadDays.value,
    })
    success.value = true
    clearVisitData()
    setTimeout(() => router.push({ name: 'home' }), 1500)
  } catch (e) {
    errorMsg.value = 'Ошибка при записи. Проверьте данные и попробуйте ещё раз.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.visit-create-view {
  max-width: 500px;
  margin: 2rem auto;
  background: #fafbfc;
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
  background: #ffe6a3;
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
