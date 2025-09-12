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
import { getInitData } from './utils/telegram'
import { useAuthStore } from './stores/auth'

const VISIT_KEY   = 'visit_data'
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
    firstName:  form.firstName ?? '',
    lastName:   form.lastName ?? '',
    middleName: form.middleName ?? '',
    phone:      form.phone ?? '',
    email:      form.email ?? ''
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  if (!silent) console.log('[App] Profile (local) saved:', profileData)
}

const nonEmpty = v => (typeof v === 'string' ? v.trim() !== '' : !!v)
const pick = (fromForm, fromSaved) => (nonEmpty(fromForm) ? fromForm : (nonEmpty(fromSaved) ? fromSaved : ''))

function mask(str, keep = 280) {
  if (typeof str !== 'string') return str
  return str.length <= keep ? str : str.slice(0, keep) + '…(' + str.length + ')'
}

// (опционально включай при отладке)
// function debugInitData(id) {
//   console.group('init_data')
//   console.log('length:', id?.length || 0)
//   console.log('startsWith "query_id="? ', id?.startsWith('query_id='))
//   console.log('includes "hash="? ', !!id?.includes('hash='))
//   console.log('head:', mask(id, 220))
//   try {
//     const usp = new URLSearchParams(id)
//     console.log('keys:', Array.from(usp.keys()))
//     console.log('user(masked):', mask(usp.get('user') || '', 200))
//   } catch (e) {
//     console.warn('URLSearchParams failed:', e)
//   }
//   console.groupEnd()
// }


function extractUserFromInitData(id) {
  try {
    const usp = new URLSearchParams(id)
    const rawUser = usp.get('user')
    if (!rawUser) return null

    let s1 = rawUser
    try { s1 = decodeURIComponent(rawUser) } catch {}
    let s2 = s1
    try { s2 = decodeURIComponent(s1) } catch {}

    let obj = null
    try { obj = JSON.parse(s2) } catch { try { obj = JSON.parse(s1) } catch {} }
    if (!obj) return null

    return {
      id: obj.id,
      first_name: obj.first_name || '',
      last_name:  obj.last_name  || '',
      username:   obj.username   || '',
      photo_url:  obj.photo_url  || ''
    }
  } catch {
    return null
  }
}

/* --------------------- авторизация ----------------------- */

async function doTelegramLogin() {
  console.group('[LOGIN] Start')
  const initData = getInitData() 
  console.log('[LOGIN] from WebApp?', !!window.Telegram?.WebApp?.initData)
  console.log('[LOGIN] has init_data?', !!initData)
  if (!initData) { console.groupEnd(); throw new Error('init_data отсутствует (WebApp/hash/query)') }

  // debugInitData(initData) 

  console.log('[LOGIN] POST payload.init_data:', mask(initData, 400))
  const { data } = await loginViaTelegram(initData) 
  console.log('[LOGIN] Response:', data)

  const access = data?.access_token
  if (!access) { console.groupEnd(); throw new Error('access_token отсутствует') }

  store.setAccess(access)
  console.log('[LOGIN] access_token stored, len=', access.length)


  const u = extractUserFromInitData(initData)
  if (u) {
    form.firstName = u.first_name
    form.lastName  = u.last_name

    saveProfile(true)
  }

  console.groupEnd()
}

async function initAuthAndProfile() {
  try {
    saveVisit(true)

    store.initFromSession()
    if (!store.accessToken) {
      await doTelegramLogin()
    }


    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.firstName  = pick(form.firstName,  saved.firstName)
    form.lastName   = pick(form.lastName,   saved.lastName)
    form.middleName = pick(form.middleName, saved.middleName)
    form.phone      = pick(form.phone,      saved.phone)
    form.email      = pick(form.email,      saved.email)

    saveProfile(true)

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
