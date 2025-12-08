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
        <!-- Убрано отображение description, так как его нет в API -->
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
        <span class="client-name">{{ clientNameFromAPI }}</span>
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
        </button>``

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
            ✏️ <strong>{{ clientNameFromAPI }}</strong>, Вы успешно записаны на услугу <strong>{{ summary.service?.name }}</strong>
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
import { getEnv } from '../config'

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'
const router = useRouter()

const summary = reactive({ date: '', time: '', staff: null, service: null })
const salonInfo = reactive({ name: 'Загрузка...', description: '' })

const adminContactUrl = getEnv('ADMIN_CONTACT_URL', '#'); 

// Добавляем реактивное состояние для данных клиента
const clientData = ref(null)

const comment = ref('')
const remindLeadHours = ref(0) 
const submitting = ref(false)
const errorMsg = ref('')
const showSuccessModal = ref(false)
const accepted = ref(false)
const showTerms = ref(false)

const staffId = ref(null)
const serviceId = ref(null)
const visitDate = ref(null)

// Заменяем computed на вызов API
const clientNameFromAPI = computed(() => {
  return clientData.value?.name || '—'
})

// Функция для загрузки данных клиента
async function loadClientData() {
  try {
    const { data } = await api.get('/auth/me/', {
      headers: { Accept: 'application/json' },
      withCredentials: true
    })
    clientData.value = data
  } catch (error) {
    console.error('Ошибка загрузки данных клиента:', error)
    clientData.value = null
  }
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
  window.dispatchEvent(new CustomEvent('local-storage-changed'))
  document.cookie = `${VISIT_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
}

async function loadSalonInfo() {
  try {
    const { data } = await api.get('/salon/info/')
    salonInfo.name = data.name || 'Название салона'
    salonInfo.description = data.description || 'тип заведения'
  } catch (e) {
    console.error('[LoadSalon] Ошибка:', e)
    salonInfo.name = 'Название салона'
    salonInfo.description = 'тип заведения'
  }
}

onMounted(async () => {
  // Загружаем данные клиента
  await loadClientData()
  
  // Загружаем информацию о салоне
  await loadSalonInfo()
  
  try {
    const raw = localStorage.getItem(VISIT_KEY)
    if (!raw) { errorMsg.value = 'Не выбраны данные для записи.'; return }
    const v = JSON.parse(raw)

    comment.value = v.comment || ''
    staffId.value = v.staff_id ?? null
    // serviceId.value = Array.isArray(v.services_id) ? v.services_id : (v.services_id ?? null)
    serviceId.value = v.services_id ?? null

    visitDate.value = v.visit_time?.start_time ?? null

    if (staffId.value) {
      try { 
        const { data: staff } = await api.get(`/staff/${staffId.value}`)
        // Исправляем структуру данных сотрудника
        summary.staff = {
          id: staff.id,
          name: staff.name,
          photo: staff.photo,
          specialization: staff.specializations?.[0] || 'мастер' // берем первую специализацию
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

    const h = humanize(visitDate.value)
    summary.date = h.d; summary.time = h.t
  } catch (e) {
    console.error('[Init] Ошибка:', e)
    errorMsg.value = 'Ошибка инициализации формы.'
  }
})

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
      staff_id:        staffId.value,
      service_id:      serviceId.value,
      visit_date_time: visitDate.value,
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
  // const botLink = 'https://t.me/CheckAuthorization_bot'
  // window.open(botLink, '_blank')
  if (adminContactUrl && adminContactUrl !== '#') {
    window.open(adminContactUrl, '_blank');
  } else {
    alert('Ссылка для связи с администратором не настроена.');
  }
}
</script>

<style scoped>
.visit-create-view{
  --sidebar-mobile:64px;
  --gutter-mobile:12px;
  --top-gap-mobile:12px;
  --brand:#666FE8;
  --text:#454558;
  --muted:#7c8499;
  --bg:#F6F9FC;
  --card:#FFFFFF;
  --stroke:#E6EAF2;
  --soft:#EBEEF6;

  background:var(--bg);
  color:var(--text);
  max-width:720px;
  margin:24px auto;
  padding:0 12px;
  box-sizing:border-box;
}

.visit-summary,
.visit-form{
  background:var(--card);
  border-radius:12px;
  padding:16px;
  box-shadow:0 1px 3px rgba(0,0,0,.06);
  margin-bottom:12px;
}

/* Summary */
.date-row{
  display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;
}
.date-cell .date{font-weight:600}
.time-cell{font-weight:600}

.staff-block{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;background:#eee}
.staff-info{min-width:0}
.staff-name{font-weight:700}
.staff-role{color:var(--muted);font-size:14px}

/* Обновленная сетка для service-block - убрана строка с description */
.service-block{display:grid;grid-template-columns:1fr auto;gap:6px 12px;margin-bottom:10px}
.service-name{grid-column:1/-1;font-weight:600}
.service-duration{color:var(--muted)}
.service-price{font-weight:700}

.total-block{display:flex;justify-content:space-between;align-items:center;background:#E7EDF9;border-radius:10px;padding:10px 12px;font-weight:700}

/* Form */
.form-label{font-size:12px;font-weight:700;color:var(--muted);margin:12px 0 6px;letter-spacing:.02em}
.client-block{display:flex;align-items:center;gap:8px;background:#f6f9fc;border-radius:10px;padding:10px 12px;font-weight:600;margin-bottom:10px}
.client-icon{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:8px;background:#6267ee;color:#fff}

.form-section{margin-bottom:12px}
textarea{width:95%;min-height:96px;border:1px solid #D3D3D3;border-radius:10px;padding:10px 12px;font-size:14px;resize:vertical}
select{width:100%;border:1px solid #D3D3D3;border-radius:10px;padding:10px 12px;font-size:14px;background:#fff}

.legal-row{display:flex;align-items:center;gap:8px;margin:10px 0}
.legal-row input{width:36px;height:36px}
.legal-row a{color:#3471D6;text-decoration:underline}

.btn-submit{width:100%;height:52px;border:none;border-radius:12px;background:var(--brand);color:#fff;font-weight:700;font-size:16px;cursor:pointer}
.btn-submit[disabled]{background:#C4CDD5;cursor:not-allowed}

.error-msg{text-align:center;color:#C00;margin-top:10px}

/* Success modal */
.modal-overlay{position:fixed;inset:0;background:rgba(69,69,88,.52);display:flex;align-items:center;justify-content:center;z-index:9999}
.success-modal{position:relative;width:905px;max-width:90%;background:#fff;border-radius:12px;box-sizing:border-box}
.modal-content{display:flex;flex-direction:column;padding:48px 0 60px}
.close-btn{position:absolute;top:28px;right:54px;background:transparent;border:none;cursor:pointer;width:21px;height:20px}
.close-btn:hover{opacity:.7}

.salon-card{display:flex;align-items:center;gap:16px;padding:16px 0 16px 41px;background:#fff;border-radius:10px;margin:0 33px 71px 39px}
.salon-logo{width:64px;height:64px;border-radius:50%;background:var(--brand);display:flex;align-items:center;justify-content:center}
.salon-info{display:flex;flex-direction:column}
.salon-name{font-weight:500;font-size:24px;line-height:28px}
.salon-type{font-weight:400;font-size:20px;line-height:24px}

.success-text{font-weight:400;font-size:24px;line-height:29px;margin:0 116px 57px 80px}
.success-text strong{font-weight:500}

.btn-my-records,
.btn-ask-admin{width:745px;height:56px;margin:0 80px 20px;background:var(--brand);color:#fff;border:none;border-radius:10px;font-weight:500;font-size:20px;display:flex;align-items:center;justify-content:center}
.btn-ask-admin{background:#EBEEF6;color:var(--text);margin-bottom:0}
.btn-my-records:hover{filter:brightness(.95)}
.btn-ask-admin:hover{filter:brightness(.97)}

/* Mobile / mini-app (Pixel-класс) */
@media (max-width: 768px){
  .visit-create-view{
    margin:0;
    padding-top:var(--top-gap-mobile);
    padding-left:calc(var(--sidebar-mobile) + var(--gutter-mobile));
    padding-right:var(--gutter-mobile);
    max-width:100vw;
  }

  .visit-summary,.visit-form{padding:12px;border-radius:12px}
  .date-row{gap:8px}
  .staff-role{font-size:13px}
  .service-block{grid-template-columns:1fr auto;gap:4px 10px}
  .total-block{padding:10px}

  .client-block{padding:10px}
  textarea{min-height:90px;
      width: 90%;}
  select{font-size:15px}

  .btn-submit{height:50px}

  .success-modal{
    width:calc(100vw - (var(--sidebar-mobile) + 2*var(--gutter-mobile)));
    max-width:none;
    border-radius:12px;
  }
  .modal-content{padding:28px 0 36px}
  .close-btn{top:16px;right:16px}

  .salon-card{margin:0 16px 28px 16px;gap:12px;padding:12px 0 12px 16px}
  .salon-logo{width:48px;height:48px}
  .salon-name{font-size:18px;line-height:22px}
  .salon-type{font-size:16px;line-height:20px}

  .success-text{font-size:16px;line-height:22px;margin:0 20px 24px 20px}

  .btn-my-records,.btn-ask-admin{
    width:calc(100% - 40px);
    margin:0 20px 12px;
    height:48px;
    font-size:16px;
  }
}

@media (max-width:360px){
  .visit-create-view{--gutter-mobile:10px}
  .success-text{font-size:15px}
}
</style>
