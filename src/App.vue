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
import { useRouter } from 'vue-router'
import { loginViaTelegram } from './api/auth'
import { getClientByTelegramId } from './api/clients'
import { getInitData } from './utils/telegram'
import { useAuthStore } from './stores/auth'

const VISIT_KEY   = 'visit_data'
const PROFILE_KEY = 'profile_data'

const loading   = ref(true)
const authError = ref(false)
const errorText = ref('Ошибка авторизации. Пожалуйста, попробуйте ещё раз.')
const router    = useRouter()
const store     = useAuthStore()

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


function extractUserFromInitData(id) {
  try {
    const usp = new URLSearchParams(id)
    const rawUser = usp.get('user')
    if (!rawUser) return null

    let s1 = rawUser; try { s1 = decodeURIComponent(rawUser) } catch {}
    let s2 = s1;     try { s2 = decodeURIComponent(s1) }     catch {}

    let obj = null
    try { obj = JSON.parse(s2) } catch { try { obj = JSON.parse(s1) } catch {} }
    if (!obj) return null

    return {
      firstName: obj.first_name || '',
      lastName:  obj.last_name  || '',
      tg_id:     obj.id ?? null,
    }
  } catch {
    return null
  }
}


function splitFullNameIfNeeded(fullName, fallback = {}) {
  if (!fullName || typeof fullName !== 'string') return {}
  const trimmed = fullName.trim().replace(/\s+/g, ' ')
  if (!trimmed) return {}

  const parts = trimmed.split(' ')
  if (parts.length === 1) {
    return {
      firstName: fallback.firstName || parts[0],
      lastName:  fallback.lastName  || ''
    }
  }
  return {
    firstName: fallback.firstName || parts.slice(0, -1).join(' '),
    lastName:  fallback.lastName  || parts.slice(-1)[0]
  }
}


async function fetchAndApplyClientByTelegramId(tg_id) {
  if (!tg_id && tg_id !== 0) return

  try {
    const { data } = await getClientByTelegramId(tg_id) 
    const { name, telephone } = data || {}

    const namePatch = splitFullNameIfNeeded(name, {
      firstName: form.firstName,
      lastName:  form.lastName
    })

    mergeSaveProfile({
      ...namePatch,
      phone: telephone || form.phone,
      tg_id
    }, true)

    console.log('[App] CRM client applied →', { name, telephone, tg_id })
  } catch (e) {
    const s = e?.response?.status
    if (s !== 404) console.warn('[App] getClientByTelegramId failed:', e)
  }
}

async function doTelegramLogin(initData) {
  const { data } = await loginViaTelegram(initData) 
  const access = data?.access_token
  if (!access) throw new Error('access_token отсутствует')

  store.setAccess(access)

  const u = extractUserFromInitData(initData)
  if (u) {
    mergeSaveProfile(u, true)          
    await fetchAndApplyClientByTelegramId(u.tg_id) 
  }
}

async function initAuthAndProfile() {
  try {
    saveVisit(true)

    const initData = getInitData()
    if (!initData) throw new Error('init_data отсутствует (WebApp/hash/query)')

    store.initFromSession?.()
    if (!store.accessToken) {
      await doTelegramLogin(initData)
    } else {
      const u = extractUserFromInitData(initData)
      if (u) {
        mergeSaveProfile(u, true)
        await fetchAndApplyClientByTelegramId(u.tg_id)
      }
    }

    let saved = {}
    try { saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') } catch {}
    mergeSaveProfile(saved, true)

  } catch (e) {
    console.error('[App] Ошибка авторизации:', e)
    const status = e?.response?.status
    const detail = e?.response?.data?.detail
    if (status === 401 && /client not found/i.test(String(detail))) {
      errorText.value = 'Клиент не найден в CRM. Нужна привязка/создание клиента.'
    } else if (status === 400) {
      errorText.value = 'Некорректная подпись или бизнес-правило не выполнено.'
    } else if (status === 422) {
      errorText.value = 'Validation Error: проверьте корректность init_data.'
    } else if (status === 500) {
      errorText.value = 'Серверная ошибка при разборе init_data.'
    } else {
      errorText.value = e?.message || 'Ошибка авторизации.'
    }
    authError.value = true
  } finally {
    loading.value = false
    setTimeout(() => { authError.value = false }, 2000)
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
</style>
