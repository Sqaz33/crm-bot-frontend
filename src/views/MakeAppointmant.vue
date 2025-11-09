<template>
<div class="booking-view">
  <ul class="steps-list">
    <li class="step-item" @click="goTo('choicestaff')">
      <img src="../assets/staffIcon.svg" alt="" class="step-icon" />
      <div class="label">Сотрудник: {{ summary.staffName }}</div>
      <div class="arrow">›</div>
    </li>
    <li class="step-item" @click="goTo('datetime')">
      <img src="../assets/calendarIcon.svg" alt="" class="step-icon" />
      <div class="label">Дата и время: {{ summary.visitTime }}</div>
      <div class="arrow">›</div>
    </li>
    <li class="step-item" @click="goTo('services')">
      <img src="../assets/servicesIcon.svg" alt="" class="step-icon" />
      <div class="label">
        Услуги:
        {{ summary.totalPrice !== null
          ? (summary.totalPrice > 0 ? summary.totalPrice + ' ₽' : '0 ₽')
          : '—'
        }}
      </div>
      <div class="arrow">›</div>
    </li>
  </ul>
</div>

  <button class="btn-submit"
    :disabled="!canSubmit"
    @click="openProfileModal">
    Оформить запись
  </button>

  <!-- Модалка для редактирования профиля -->
  <div v-if="showProfileModal" class="modal-overlay">
    <div class="modal">
      <h3>Проверьте данные</h3>

      <div class="field">
        <div class="header-field">
          <label class="label" for="firstName">Имя</label>
        </div>
        <input id="firstName" v-model="form.firstName" />
      </div>

      <div class="field">
        <div class="header-field">
          <label class="label" for="lastName">Фамилия</label>
        </div>
        <input id="lastName" v-model="form.lastName" />
      </div>

      <div class="field">
        <div class="header-field">
          <label class="label" for="middleName">Отчество</label>
        </div>
        <input id="middleName" v-model="form.middleName" />
      </div>

      <div class="field">
        <div class="header-field">
          <label class="label" for="phone">Телефон</label>
        </div>
        <input id="phone" v-model="form.phone" readonly />
      </div>

      <div class="field">
        <div class="header-field">
          <label class="label" for="email">E-mail</label>
        </div>
        <input id="email" v-model="form.email" readonly />
      </div>

      <div class="modal-buttons">
        <button @click="confirmProfile">Продолжить</button>
        <button @click="showProfileModal = false">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'


const STORAGE_KEY = 'profile_data'
const COOKIE_KEY  = 'profile_data'
const router = useRouter()
const VISIT_KEY = 'visit_data'
const summary = ref({
  staffName: null,
  visitTime: null,
  totalPrice: null,
  staff_id: null,
  visit_time: null,
  services_id: []
})

function readProfileStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function writeProfileStorage(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

function writeProfileCookie(obj) {
  const json = encodeURIComponent(JSON.stringify(obj))
  document.cookie =
    `${COOKIE_KEY}=${json}` +
    `; path=/; max-age=${365*24*60*60}`
}

const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

const showProfileModal = ref(false)

async function loadSummary() {
  const raw = localStorage.getItem(VISIT_KEY)
  if (!raw) return

  const data = JSON.parse(raw)
  const { staff_id, services_id = [], visit_time = {} } = data

  // Дата и время
  const visitTime = visit_time.start_time
    ? new Date(visit_time.start_time).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  // Имя сотрудника
  let staffName = null
  if (staff_id) {
    try {
      const { data: staff } = await api.get(`/salon/staff/${staff_id}`)
      staffName = staff.name
    } catch {
      staffName = '—'
    }
  }

  // Сумма услуг
  let totalPrice = null
  if (services_id.length) {
    try {
      const prices = await Promise.all(
        services_id.map(async id => {
          const { data } = await api.get('/services/', { params: { service_id: id } })
          return data[0]?.price || 0
        })
      )
      totalPrice = prices.reduce((sum, p) => sum + p, 0)
    } catch {
      totalPrice = 0
    }
  } else if (services_id.length === 0) {
    totalPrice = 0
  }

  summary.value = {
    staffName,
    visitTime,
    totalPrice,
    staff_id,
    visit_time,
    services_id
  }
}

// Доступность кнопки
const canSubmit = computed(() =>
  !!summary.value.staff_id &&
  !!summary.value.visitTime &&
  Array.isArray(summary.value.services_id) && summary.value.services_id.length > 0
)

function goTo(stepName) {
  router.push({ name: stepName })
}

function submitBooking() {
  if (!canSubmit.value) return
  router.push({ name: 'createvisit' })
}

onMounted(() => {
  loadSummary()
  const saved = readProfileStorage()
  form.firstName = saved.firstName ?? ''
  form.lastName = saved.lastName ?? ''
  form.middleName = saved.middleName ?? ''
  form.phone = saved.phone ?? ''
  form.email = saved.email ?? ''
})

function saveProfile() {
  const payload = {
    firstName: form.firstName,
    lastName: form.lastName,
    middleName: form.middleName,
    phone: form.phone,
    email: form.email
  }
  writeProfileStorage(payload)
  writeProfileCookie(payload)
}

function openProfileModal() {
  showProfileModal.value = true
}

function confirmProfile() {
  saveProfile()
  showProfileModal.value = false
  submitBooking() 
}

</script>


<style scoped>
.step-icon {
  width: 30px;
  height: 30px;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.booking-view {
  max-width:  clamp(300px, 90%, 1140px);
  margin: clamp(0.5rem, 2vw, 2rem) auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.steps-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.step-item {
  display: flex;
  align-items: center;
  padding: clamp(0.3rem, 2vw, 1rem);
  border-bottom: 1px solid #ececec;
  cursor: pointer;
}

.step-item:last-of-type {
  border-bottom: none;
}

.checkbox {
  width: clamp(20px, 5vw, 35px);
  height: clamp(20px, 5vw, 35px);
  background: #dadada;
  border-radius: 4px;
  flex-shrink: 0;
}

.label {
  margin: 0 clamp(0.3rem, 2vw, 0.8rem);
  flex: 1;
  font-size: clamp(0.85rem, 3vw, 1rem);
  width: 176px;
  color: var(--Color-Basic-Black, #454558);
  font-weight: 500;
  text-align: left;
}

.arrow, .arrow-back {
  display: flex;
  color: #999;
  font-size: clamp(0.7rem, 5vw, 1.4rem);
  font-family: var(--font-primary);

  width: clamp(30px, 10vw, 40px);
  height: clamp(30px, 10vw, 40px);

  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-item .checkbox { 
  display: none;
}

.back-item .arrow-back {
  display: flex;
}

@media (max-width: 992px){
  .back-item {
      display: none;
  }
}

.btn-submit {
  display: block;
  width:  clamp(150px, 80%, 380px);
  margin: clamp(1rem, 3vw, 1.5rem) auto;
  padding: clamp(0.5rem, 2vw, 0.75rem);
  background: #2F80EC;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: clamp(1rem, 3vw, 1.1rem);
  cursor: pointer;
}

.btn-submit:hover {
  background: #0056b3;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 80%;
	max-height: 80vh;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	overflow: hidden;
}

.modal h3 {
  color: var(--Color-Basic-Black, #454558);
  font-size: 24px;
  font-weight: 500;
  line-height: 28px;
  text-align: center;
}

.field {
  width: 100%;
  height: auto;
  padding: 14px 0;
  background: transparent;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.field .label {
  width: 176px;
  color: var(--Color-Basic-Black, #454558);
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  text-align: left;
  margin: 0;
}

.field input {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--Color-Grey-Grey-200, #E5E7EB);
  box-sizing: border-box;
  color: var(--Color-Basic-Black, #454558);
  font-size: 16px;
  font-family: 'Geometria', sans-serif;
  font-weight: 400;
  line-height: 20px;
  outline: none;
}

.modal-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 12px;
}

.modal-buttons button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.modal-buttons button:first-child {
  background: var(--Color-Brand-Brand-500, #666FE8);
  color: white;
}

.modal-buttons button:first-child:hover {
  background: #5a63d4;
}

.modal-buttons button:last-child {
  background: #f5f5f5;
  color: #454558;
  border: 1px solid #E5E7EB;
}

.modal-buttons button:last-child:hover {
  background: #e8e8e8;
}

@media (max-width: 480px) {
  .modal {
    padding: 20px;
    width: 350px;
  }
  
  .modal h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .field {
    padding: 6px 0;
    margin-bottom: 10px;
  }
  
  .field input {
    height: 36px;
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-buttons button {
    width: 100%;
    min-width: auto;
  }
}
</style>
