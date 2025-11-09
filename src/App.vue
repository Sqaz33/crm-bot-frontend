<template>
  <div>
    <transition name="fade">
      <div v-if="authError" class="auth-error-banner">{{ errorText }}</div>
    </transition>

    <div v-if="loading" class="loading-container">Загрузка...</div>
    <div v-else><router-view/></div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ensureSession } from './auth/ensureSession'
import { getClientByTelegramId } from './api/clients'
import { useAuthStore } from './stores/auth'
import { splitFullNameIfNeeded } from './utils/telegram'

const VISIT_KEY   = 'visit_data'
const PROFILE_KEY = 'profile_data'

const loading   = ref(true)
const authError = ref(false)
const errorText = ref('Ошибка авторизации. Пожалуйста, попробуйте ещё раз.')
const store     = useAuthStore()


let mountedOnce = false

const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

function saveVisit(silent = false) {
  const visitData = { staff_id: '', services_id: '', visit_time: { start_time: '' }, comment: '' }
  localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
  if (!silent) console.log('[App] Visit draft saved:', visitData)
}

function mergeSaveProfile(partial = {}, silent = false) {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') } catch {}

  const val = (v) => (typeof v === 'string' ? v.trim() : v)
  const next = {
    tg_id:      partial.tg_id ?? saved.tg_id ?? null,
    firstName:  val(partial.firstName)  ?? saved.firstName  ?? form.firstName  ?? '',
    lastName:   val(partial.lastName)   ?? saved.lastName   ?? form.lastName   ?? '',
    middleName: val(partial.middleName) ?? saved.middleName ?? form.middleName ?? '',
    phone:      val(partial.phone)      ?? saved.phone      ?? form.phone      ?? '',
    email:      val(partial.email)      ?? saved.email      ?? form.email      ?? '',
  }

  localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
  if (!silent) console.log('[App] Profile merged & saved:', next)

  form.firstName  = next.firstName
  form.lastName   = next.lastName
  form.middleName = next.middleName
  form.phone      = next.phone
  form.email      = next.email

  if (next.tg_id && store.setTelegramId) {
    try { store.setTelegramId(next.tg_id) } catch {}
  }
}

async function fetchAndApplyClientByTelegramId(tg_id) {
  if (tg_id === undefined || tg_id === null) return
  try {
    const { data } = await getClientByTelegramId(tg_id)
    const { name, telephone } = data || {}
    const namePatch = splitFullNameIfNeeded(name, { firstName: form.firstName, lastName: form.lastName })
    mergeSaveProfile({ ...namePatch, phone: telephone || form.phone, tg_id }, true)
    console.log('[App] CRM client applied →', { name, telephone, tg_id })
  } catch (e) {
    const s = e?.response?.status
    if (s !== 404) console.warn('[App] getClientByTelegramId failed:', e)
  }
}

async function initAuthAndProfile() {
  if (mountedOnce) return
  mountedOnce = true

  try {
    saveVisit(true)


    const me = await ensureSession() 
    mergeSaveProfile({ tg_id: me.telegram_id, phone: me.telephone }, true)

    await fetchAndApplyClientByTelegramId(me.telegram_id)

  } catch (e) {
    console.error('[App] Ошибка авторизации:', e)
    const status = e?.response?.status
    const detail = e?.response?.data?.detail
    if (e?.code === 'NO_INIT_DATA') {
      errorText.value = 'Приложение открыто не из Telegram WebApp: нет init_data.'
    } else if (status === 401 && /client not found/i.test(String(detail))) {
      errorText.value = 'Клиент не найден в CRM. Нужна привязка/создание клиента.'
    } else if (status === 400) {
      errorText.value = 'Некорректная подпись или бизнес-правило не выполнено.'
    } else if (status === 422) {
      errorText.value = 'Validation Error: проверьте корректность init_data.'
    } else if (status === 500) {
      errorText.value = 'Серверная ошибка при разборе init_data.'
    } else if (status === 401) {
      errorText.value = 'Сессия отсутствует: проверьте Set-Cookie (SameSite=None; Secure; Domain).'
    } else {
      errorText.value = e?.message || 'Ошибка авторизации.'
    }
    authError.value = true
  } finally {
    loading.value = false
    setTimeout(() => { authError.value = false }, 2500)
  }
}

onMounted(initAuthAndProfile)
</script>

<style scoped>
.loading-container{ text-align:center; margin:2rem 0; font-size:1.1rem; }
.auth-error-banner{
  position:fixed; top:0; left:0; right:0;
  background:#e53935; color:#fff; padding:1rem; text-align:center; z-index:1000;
}
.fade-enter-active,.fade-leave-active{ transition:opacity .5s; }
.fade-enter-from,.fade-leave-to{ opacity:0; }
@media (max-width: 430px) {
  ::v-deep(.modal-content) {
    width: 85% !important;
  }
}
</style>