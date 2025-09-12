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
import { parseTelegramLaunchData, getInitDataString } from './utils/telegram'
import { useAuthStore } from './stores/auth'

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'

const loading   = ref(true)
const authError = ref(false)
const errorText = ref('Ошибка авторизации. Пожалуйста, попробуйте ещё раз.')
const router    = useRouter()
const store     = useAuthStore()

const form = reactive({ firstName:'', lastName:'', middleName:'', phone:'', email:'' })

function saveVisit(silent = false) {
  const visitData = { staff_id:'', services_id:'', visit_time:{ start_time:'' }, comment:'' }
  localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
  if (!silent) console.log('[App] Visit draft saved:', visitData)
}
function saveProfile(silent = false) {
  const profileData = {
    firstName: form.firstName, lastName: form.lastName,
    middleName: form.middleName, phone: form.phone, email: form.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  if (!silent) console.log('[App] Profile (local) saved:', profileData)
}

// ===== DEBUG helpers =====
function mask(str, keep = 300) {
  if (typeof str !== 'string') return str
  if (str.length <= keep) return str
  return str.slice(0, keep) + '…(' + str.length + ')'
}
function debugDumpInitData(initStr) {
  console.groupCollapsed('[LOGIN] init_data RAW preview')
  console.log('length:', initStr?.length || 0)
  console.log('startsWith "query_id=":', initStr?.startsWith('query_id='))
  console.log('includes "hash=":', initStr?.includes('hash='))
  console.log('raw head:', mask(initStr, 200))
  console.groupEnd()

  try {
    const usp = new URLSearchParams(initStr)
    console.group('[LOGIN] init_data parsed keys')
    const keys = Array.from(usp.keys())
    console.log('keys:', keys)
    const view = {}
    for (const k of keys) view[k] = mask(usp.get(k), 160)
    console.log('values (masked):', view)
    const userRaw = usp.get('user')
    if (userRaw) {
      try { console.log('user parsed:', JSON.parse(userRaw)) } catch { console.warn('user JSON parse failed') }
    }
    console.groupEnd()
  } catch (e) {
    console.warn('[LOGIN] URLSearchParams parse FAILED:', e)
  }
}

async function doTelegramLogin() {
  console.group('[LOGIN] Start')
  const initStr = getInitDataString()
  console.log('[LOGIN] from WebApp?', !!window.Telegram?.WebApp?.initData)
  console.log('[LOGIN] has init_data?', !!initStr)
  if (!initStr) {
    console.groupEnd()
    throw new Error('init_data отсутствует (запустите внутри Telegram)')
  }

  // важное: теперь initStr — сырой query-string. Логируем и проверяем наличие hash=
  debugDumpInitData(initStr)
  console.log('[LOGIN] POST payload.init_data:', mask(initStr, 400))

  const { data } = await loginViaTelegram(initStr) // ожидаем { access_token }
  console.log('[LOGIN] Response:', data)
  const access = data?.access_token
  if (!access) {
    console.groupEnd()
    throw new Error('access_token отсутствует в ответе /auth/telegram/login')
  }
  store.setAccess(access)
  console.log('[LOGIN] access_token stored, len=', access.length)
  console.groupEnd()
}

async function initAuthAndProfile() {
  try {
    saveVisit(true)

    store.initFromSession()
    if (!store.accessToken) {
      await doTelegramLogin()
    }

    // локальная автоподстановка по tgData
    const { tgData } = parseTelegramLaunchData()
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''
    if (user.id && store.setTelegramId) store.setTelegramId(user.id)

    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''
    saveProfile(true)

  } catch (e) {
    console.error('[App] Ошибка авторизации:', e)
    const status = e?.response?.status
    if (status === 400)      errorText.value = 'Некорректная подпись или телефон не найден.'
    else if (status === 422) errorText.value = 'Validation Error: проверьте корректность init_data.'
    else if (status === 500) errorText.value = 'Серверная ошибка при разборе init_data (500).'
    else                     errorText.value = e?.message || 'Ошибка авторизации.'
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
