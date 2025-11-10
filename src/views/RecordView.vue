<template>
  <div class="record-view">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="page-wrap">
      <!-- Верхняя карточка -->
      <section class="card header-card">
        <div class="header-line">
          <div class="left">
            <!-- АВАТАР -->
            <AppAvatar
              :src="avatarUrl(staff)"
              :name="staff.name"
              :alt="`Фото ${staff.name || 'сотрудника'}`"
              :size="48"
            />
            <div class="info">
              <div class="name">{{ staff.name }}</div>
              <div class="spec">{{ (staff.specializations || []).join(', ') }}</div>

              <!-- РЕЙТИНГ СКРЫТ ПО ТРЕБОВАНИЮ -->
              <!--
              <div class="rating">
                ★ {{ staff.rating?.toFixed?.(1) || '—' }}
              </div>
              -->
            </div>
          </div>

          <div class="datetime">
            <div class="date">{{ formatDate(visit.visit_date_time, 'date') }}</div>
            <div class="time">{{ formatDate(visit.visit_date_time, 'time') }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="svc-head row2">
          <div>Услуга</div>
          <div class="tr">Стоимость</div>
        </div>
        <div class="svc-row row2">
          <div class="svc-name">{{ service.name }}</div>
          <div class="price">{{ service.price }} ₽</div>
        </div>
      </section>

      <!-- Подтверждение визита -->
      <section class="card confirm-card" v-if="!isOld">
        <div class="confirm-left">
          <div class="confirm-title">Я точно приду</div>
          <div class="confirm-sub">Нажимая, вы подтверждаете свой визит</div>
        </div>

        <label class="switch">
          <input
            type="checkbox"
            :checked="visit.will_come"
            @change="onWillComeChange"
            :disabled="visit.will_come || processing"
          />
          <span class="slider"></span>
        </label>

        <div v-if="visitError" class="visit-error">{{ visitError }}</div>
      </section>

      <!-- ИЗМЕНЕНИЯ -->
      <div class="section-title">ИЗМЕНЕНИЯ</div>

      <button
        class="list-item danger"
        @click="openCancelModal"
        :disabled="visit.will_come || deleting || processing"
        type="button"
        v-if="!isOld"
      >
        <span class="icon pill pink">✕</span>
        <span class="text">Удалить запись</span>
        <span class="chev">›</span>
      </button>

      <button
        class="list-item"
        @click="goToDatetime"
        :disabled="visit.will_come || processing"
        type="button"
        v-if="!isOld"
      >
        <span class="icon pill teal">✎</span>
        <span class="text">Перенести запись</span>
        <span class="chev">›</span>
      </button>

      <!-- ОПЛАТА -->
      <div class="section-title">ОПЛАТА</div>
      <button class="list-item disabled" type="button" disabled>
        <span class="icon pill gray">🔒</span>
        <span class="text">Оплата недоступна</span>
        <span class="chev">›</span>
      </button>
    </div>

    <!-- Модалки -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <h3>Подтверждение визита</h3>
        <p>Вы действительно хотите подтвердить, что придёте на приём?</p>
        <div class="modal-buttons">
          <button @click="confirmAction(); showConfirmModal = false" :disabled="processing">Да, подтверждаю</button>
          <button @click="showConfirmModal = false" :disabled="processing">Отмена</button>
        </div>
      </div>
    </div>

    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal">
        <h3>Отмена визита</h3>
        <p>Вы уверены, что хотите отменить запись на приём?</p>
        <div class="modal-buttons">
          <button @click="cancelAction(); showCancelModal = false" :disabled="deleting">Да, отменить</button>
          <button @click="showCancelModal = false" :disabled="deleting">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppAvatar from '@/components/AppAvatar.vue'
import api from '../api'

/* --- кэш --- */
const staffCache = {}
const servicesCache = {}

async function getStaff(staff_id) {
  if (staffCache[staff_id]) return staffCache[staff_id]
  const { data } = await api.get(`/salon/staff/${staff_id}`)
  staffCache[staff_id] = data
  return data
}
async function getService(service_id) {
  if (servicesCache[service_id]) return servicesCache[service_id]
  if (Object.keys(servicesCache).length === 0) {
    const { data: arr } = await api.get(`/services/`)
    arr.forEach(s => { servicesCache[s.id] = s })
  }
  return servicesCache[service_id]
}

/* --- router --- */
const route = useRoute()
const router = useRouter()
const visitId = route.params.id
const isOld = route.query.isOld === 'true'

/* --- state --- */
const loading = ref(true)
const deleting = ref(false)
const processing = ref(false)
const error = ref('')
const visit = ref(null)
const staff = ref({})
const service = ref({})
const showConfirmModal = ref(false)
const confirmAction = ref(null)
const showCancelModal = ref(false)
const cancelAction = ref(null)

let service_id = null
let staff_id = null

function openCancelModal() {
  cancelAction.value = cancelVisit
  showCancelModal.value = true
}

/* --- helpers --- */
function avatarUrl(s) {
  return s?.photo_url || s?.photo || s?.avatar_url || s?.avatar || ''
}

/* --- api загрузка --- */
async function loadVisit() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get(`/visits/${visitId}`)
    visit.value = data
    staff.value = await getStaff(data.staff_id)
    service.value = await getService(data.service_id)
    staff_id = data.staff_id
    service_id = data.service_id
  } catch (err) {
    console.error(err)
    error.value = 'Ошибка при загрузке данных о визите'
  } finally {
    loading.value = false
  }
}

/* --- toggle --- */
const visitError = ref('')
async function toggleWillCome() {
  processing.value = true
  visitError.value = ''
  try {
    const iso = visit.value.visit_date_time
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z')
    await api.patch(`/visits/${visitId}`, {
      visit_date_time: d.toISOString(),
      will_come: visit.value.will_come
    })
  } catch (err) {
    console.error('Ошибка toggleWillCome:', err)
    visitError.value = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.detail || err.message || 'Ошибка при обновлении статуса визита.'
  } finally {
    processing.value = false
  }
}

/* --- отмена визита --- */
async function cancelVisit() {
  deleting.value = true
  visitError.value = ''
  try {
    await api.delete(`/visits/${visitId}`)
    router.push('/records')
  } catch (err) {
    console.error('Ошибка cancelVisit:', err)
    visitError.value = typeof err.response?.data === 'string'
      ? err.response.data
      : err.response?.data?.detail || err.message || 'Не удалось отменить запись.'
  } finally {
    deleting.value = false
  }
}

async function waitForVisitTime(timeoutMs = 300000, intervalMs = 120) {
  const VISIT_KEY = 'visit_data'
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const raw = localStorage.getItem(VISIT_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data.visit_time?.start_time) return new Date(data.visit_time.start_time)
      } catch (e) { /* noop */ }
    }
    await new Promise(r => setTimeout(r, intervalMs))
  }
  throw new Error('Дата визита не появилась в localStorage за отведённое время.')
}

function onWillComeChange(e) {
  const newValue = e.target.checked
  if (newValue) {
    confirmAction.value = async () => {
      visit.value.will_come = true
      await toggleWillCome()
    }
    e.target.checked = false
    showConfirmModal.value = true
  }
}

/* --- перенос визита --- */
function goToDatetime() {
  const VISIT_KEY = 'visit_data'
  try {
    localStorage.removeItem(VISIT_KEY)
    if (staff_id && service_id) {
      // исправлено: массив услуг
      const params = { staff_id, services_id: [service_id], visit_time: { start_time:'', end:'' }, comment:'' }
      localStorage.setItem(VISIT_KEY, JSON.stringify(params))
    }
    router.push({ path: '/datetime', query: { redirect: router.currentRoute.value.fullPath, moveVisit: visitId } })
  } catch (err) {
    console.error(err)
    visitError.value = 'Ошибка при переходе к выбору даты.'
  }
}

async function handleMoveVisitReturn() {
  const VISIT_KEY = 'visit_data'
  processing.value = true
  visitError.value = ''
  try {
    if (!visit.value) await loadVisit()
    const visitTime = await waitForVisitTime()
    await api.patch(`/visits/${visitId}`, {
      visit_date_time: visitTime.toISOString(),
      will_come: visit.value?.will_come || false
    })
    localStorage.removeItem(VISIT_KEY)
    await loadVisit()
  } catch (err) {
    console.error(err)
    visitError.value = 'Не удалось обновить дату и время визита.'
  } finally {
    processing.value = false
  }
}

/* --- формат даты --- */
function formatDate(iso, part='full') {
  const d = new Date(iso?.endsWith?.('Z') ? iso : iso + 'Z')
  if (part === 'date') return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' })
  if (part === 'time') return d.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })
  return d.toLocaleString('ru-RU', { year:'numeric', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

onMounted(() => {
  loadVisit()
  if (route.query.fromDatetime === 'true') {
    handleMoveVisitReturn()
    router.replace({ path: route.path, query: { isOld: route.query.isOld } })
  }
})

/* --- модалки отзыва (рейтинг закомментирован/не используется) --- */
// const showReviewModal = ref(false)
// const review = ref({ rating: 0, comment: '' })
// const sending = ref(false)
// const reviewError = ref('')
// async function submitReview(){ /* скрыт по требованию */ }
</script>

<style scoped>
/* ======= Токены нового дизайна ======= */
.record-view{
  --sidebar-mobile:64px;
  --gutter-mobile:16px;
  --brand:#676FEA;
  --text:#2B2C39;
  --muted:#7C879B;
  --bg:#F5F7FB;
  --card:#FFFFFF;
  --soft:#EEF2F9;
  --stroke:#E8ECF3;
  --success:#22C55E;

  min-height:100vh;
  background:var(--bg);
  display:flex;
  justify-content:center;
  box-sizing:border-box;
  padding:24px;
  font-family: var(--font-primary, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif);
}

.page-wrap{ width: clamp(320px, 92vw, 900px); }

.card{
  background:var(--card);
  border-radius:16px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, .05);
  padding:16px;
  margin-bottom:12px;
}

/* Header */
.header-card .header-line{
  display:grid;
  grid-template-columns: 1fr auto;
  align-items:center;
  gap:12px;
}
.header-card .left{display:flex;align-items:center;gap:12px;min-width:0}
.info{min-width:0}
.name{font-weight:800;color:var(--text);font-size:16px;line-height:1.25}
.spec{color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}
.datetime{display:flex;flex-direction:column;align-items:flex-end;color:var(--muted);font-size:13px}
.rating{color:var(--muted);font-size:12px;display:none;} /* на случай, если забыли закомментировать */

.divider{height:1px;background:var(--stroke);margin:12px 0}

.row2{display:grid;grid-template-columns:1fr auto;gap:6px}
.svc-head{color:var(--muted);font-weight:800;font-size:13px;margin-bottom:6px}
.svc-row .price{font-weight:800;color:var(--text)}
.svc-name{color:var(--text)}

/* Confirm */
.confirm-card{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
}
.confirm-title{font-weight:800;color:var(--text)}
.confirm-sub{color:#6F85C1;font-size:13px}

/* switch (под новый стиль) */
.switch{position:relative;display:inline-block;width:50px;height:30px;flex-shrink:0}
.switch input{opacity:0;width:0;height:0}
.slider{position:absolute;inset:0;background:#E5EAF5;border-radius:999px;transition:.2s}
.slider:before{
  content:""; position:absolute; height:24px; width:24px; left:3px; top:3px;
  background:#fff; border-radius:50%; box-shadow:0 1px 3px rgba(2,6,23,.15); transition:.2s
}
.switch input:checked + .slider{background:#cfd5ff}
.switch input:checked + .slider:before{transform:translateX(20px); background:#5C6CF0}

/* Sections & list */
.section-title{
  margin:14px 8px 8px;
  color:#9BA7BD;
  font-weight:800;
  font-size:12px;
  letter-spacing:.04em;
}

.list-item{
  width:100%;
  background:var(--card);
  border:1px solid var(--stroke);
  border-radius:14px;
  padding:14px 16px;
  display:flex; align-items:center; gap:12px;
  color:var(--text);
  cursor:pointer;
  transition:transform .06s ease, background .15s ease, border-color .15s ease;
  margin-bottom:10px; min-height:52px;
}
.list-item:hover{background:#FAFBFE; border-color:#e1e6f2}
.list-item:active{transform:scale(.995)}
.list-item.disabled{opacity:.7;cursor:not-allowed}
.list-item .text{flex:1;text-align:left}
.chev{font-weight:800;color:#9BA7BD; font-size:18px; line-height:1}

.icon.pill{
  width:34px;height:34px;border-radius:999px;display:inline-grid;place-items:center;font-size:16px;
}
.icon.pill.pink{background:#FFE6EF;color:#E5486E}
.icon.pill.teal{background:#E7FBF7;color:#10A38E}
.icon.pill.gray{background:#ECEFF6;color:#6F7380}

/* Modals */
.modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:100}
.modal{background:#fff;padding:16px;border-radius:16px;width:min(420px,92vw);box-shadow:0 6px 30px rgba(15,23,42,.2)}
.modal-buttons{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
.modal-buttons button{border:none;border-radius:12px;padding:12px 16px;cursor:pointer}
.modal-buttons button:first-child{background:#5C6CF0;color:#fff}
.modal-buttons button:last-child{background:#E9EDF6}

/* Состояния */
.loading{font-size:16px;color:#555;padding:16px}
.error{color:#C00;font-size:14px;padding:16px}
.visit-error{color:#C00;font-size:13px;margin-top:8px}

/* ======= Мобайл-фиксы ======= */
@media (max-width:430px){
  .record-view{
    padding:12px var(--gutter-mobile) 16px calc(var(--sidebar-mobile) + var(--gutter-mobile));
  }
  .page-wrap{ width:calc(100vw - (var(--sidebar-mobile) + 2*var(--gutter-mobile))) }
  .card{ padding:14px; border-radius:14px }
  .header-card .header-line{
    grid-template-columns: 1fr; gap:10px;
  }
  .datetime{ align-items:flex-start; font-size:12px; }
  .name{ font-size:15px }
  .spec{ font-size:12px }
  .list-item{ padding:12px 14px; min-height:48px }
}

@media (max-width:360px){
  .record-view{ --gutter-mobile:12px }
  .switch{ width:46px; height:28px }
  .slider:before{ height:22px; width:22px }
  .switch input:checked + .slider:before{ transform:translateX(18px) }
}
</style>
