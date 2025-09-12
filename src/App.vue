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
import { parseTelegramLaunchData, getInitData } from './utils/telegram'
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


function mask(str, keep = 280) {
  if (typeof str !== 'string') return str
  return str.length <= keep ? str : str.slice(0, keep) + '…(' + str.length + ')'
}

function logFullInitData(id) {
  console.log('-----INIT_DATA-----')
  console.log(id) 

  console.log('Длина:', id.length)
  console.groupEnd()

  try { localStorage.setItem('DEBUG_INIT_DATA', id) } catch {}
  try { window.__INIT_DATA = id } catch {}
}

function debugInitData(id) {
  console.group('init_data')
  console.log('length:', id?.length || 0)
  console.log('startsWith "query_id="? ', id?.startsWith('query_id='))
  console.log('includes "hash="? ', !!id?.includes('hash='))
  console.log('head:', mask(id, 220))
  console.log(id) 
  try {
    const usp = new URLSearchParams(id)
    console.log('keys:', Array.from(usp.keys()))
    console.log('user(masked):', mask(usp.get('user') || '', 200))
  } catch (e) { console.warn('URLSearchParams failed:', e) }
  console.groupEnd()
}



async function initAuthAndProfile() {
  try {
    saveVisit(true)

    store.initFromSession()
    if (!store.accessToken) {
      await doTelegramLogin()
    }

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
    else if (status === 500) errorText.value = 'Серверная ошибка при разборе init_data.'
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
