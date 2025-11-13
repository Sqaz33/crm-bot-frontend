<template>
  <div class="booking-view">
    <ul class="steps-list">
      <li 
        class="step-item" 
        @click="goTo('services')"
      >
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

      <li 
        class="step-item" 
        :class="{ 'step-disabled': !hasServices }"
        @click="hasServices && goTo('choicestaff')"
      >
        <img src="../assets/staffIcon.svg" alt="" class="step-icon" />
        <div class="label">Сотрудник: {{ summary.staffName || '—' }}</div>
        <div class="arrow">›</div>
      </li>

      <li 
        class="step-item" 
        :class="{ 'step-disabled': !hasServices || !hasStaff }"
        @click="(hasServices && hasStaff) && goTo('datetime')"
      >
        <img src="../assets/calendarIcon.svg" alt="" class="step-icon" />
        <div class="label">Дата и время: {{ summary.visitTime || '—' }}</div>
        <div class="arrow">›</div>
      </li>
      
      <li 
        class="step-item back-item"
        @click="goHome"
      >
        <div class="arrow-back">‹</div>
        <div class="label">На главную</div>
      </li>
    </ul>

    <button class="btn-submit"
      :disabled="!canSubmit"
      @click="openProfileModal">
      Оформить запись
    </button>

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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

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

const hasServices = computed(() => 
  Array.isArray(summary.value.services_id) && summary.value.services_id.length > 0
)

const hasStaff = computed(() => 
  !!summary.value.staff_id
)

const hasDateTime = computed(() => 
  !!summary.value.visitTime
)

async function readProfile() {
  try {
    const response = await api.get("/auth/me");
    const profile = response.data;
    
    return {
      firstName: profile.name?.split(' ')[0] || '', 
      lastName: profile.name?.split(' ')[1] || '', 
      middleName: profile.name?.split(' ')[2] || '', 
      phone: profile.phone || '',
      email: profile.email || ''
    };
  } catch {
    return {
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      email: ''
    };
  }
}

async function writeProfile(obj) {
  try {
    await api.put("/auth/me", obj);
  } catch (error) {
    console.error("Ошибка при сохранении профиля:", error);
  }
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

  const visitTime = visit_time.start_time
    ? new Date(visit_time.start_time).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  let staffName = null
  if (staff_id) {
    try {
      const { data: staff } = await api.get(`/staff/${staff_id}`)
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
          const { data } = await api.get('/services', { params: { service_id: id } })
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

const canSubmit = computed(() =>
  hasServices.value && hasStaff.value && hasDateTime.value
)

function goTo(stepName) {
  router.push({ name: stepName })
}

function submitBooking() {
  if (!canSubmit.value) return
  router.push({ name: 'createvisit' })
}
function goHome() {
  router.push({ name: 'home' })
}

onMounted(async () => {
  await loadSummary()
  const saved = await readProfile()
  form.firstName = saved.firstName ?? ''
  form.lastName = saved.lastName ?? ''
  form.middleName = saved.middleName ?? ''
  form.phone = saved.phone ?? ''
  form.email = saved.email ?? ''
})

function saveProfile() {
  const n = `${form.lastName} ${form.firstName} ${form.middleName}`
  const payload = { name: n, email: form.email }
  writeProfile(payload)
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
  transition: all 0.2s ease;
}

.step-item:last-of-type {
  border-bottom: none;
}

.step-item:hover:not(.step-disabled) {
  background: #f8f9fa;
}

.step-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.step-disabled .label {
  color: #999;
}

.checkbox {
  width: clamp(20px, 5vw, 35px);
  height: clamp(20px, 5vw, 35px);
  background: #dadada;
  border-radius: 4px;
  flex-shrink: 0;
}

.label {
  margin: 0 clamp(0.2rem, 2vw, 0.5rem);
  flex: 1;
  font-size: clamp(0.7rem, 3vw, 0.8rem);
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

.step-disabled .arrow {
  color: #ccc;
}


.back-item {
  display: flex;
  align-items: center;
}

.back-item .arrow-back {
  margin-right: 0.75rem;
  font-size: clamp(1rem, 5vw, 1.8rem);
}

.back-item .label {
  margin-left: 0;
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
  transition: background 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #666FE8;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
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
	max-height: 90vh;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	overflow: hidden;
}

.modal h3 {
  color: var(--Color-Basic-Black, #454558);
  font-size: 24px;
  font-weight: 500;
  line-height: 26px;
  text-align: center;
	margin: 0;
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
  gap: 5px;
  overflow: hidden;
  margin-bottom: 0px;
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
  width: 45%;
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
    gap: 8px;
  }
  
  .modal-buttons button {
    width: 100%;
    min-width: auto;
  }
}
</style>