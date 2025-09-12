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

// локальные черновики (LS) — профиль и визит
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
  if (!silent) console.log('Visit data saved:', visitData)
}

function saveProfile(silent = false) {
  const profileData = {
    firstName: form.firstName, lastName: form.lastName,
    middleName: form.middleName, phone: form.phone, email: form.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  if (!silent) console.log('Profile saved (local only):', profileData)
}

async function initAuthAndProfile() {
  try {
    saveVisit(true)

    // если уже есть токен — скипаем логин
    store.initFromSession()
    if (!store.accessToken) {
      const initStr = getInitDataString()
      if (!initStr) throw new Error('initData отсутствует')
      const loginRes = await loginViaTelegram(initStr) // { access_token }
      const access = loginRes.data?.access_token
      if (!access) throw new Error('access_token отсутствует')
      store.setAccess(access)
    }

    // заполним форму из Telegram (для клиента, локально)
    const { tgData } = parseTelegramLaunchData()
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''

    // подхватим ранее сохранённые поля (локально)
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''
    saveProfile(true)

  } catch (e) {
    console.error('Ошибка авторизации:', e)
    const status = e?.response?.status
    if (status === 400)      errorText.value = 'Некорректная подпись или телефон не найден.'
    else if (status === 422) errorText.value = 'Validation Error: проверьте корректность init_data.'
    else                     errorText.value = 'Ошибка авторизации. Пожалуйста, попробуйте ещё раз.'
    authError.value = true
  } finally {
    loading.value = false
    setTimeout(() => {
      authError.value = false
      router.replace({ path: '/' })
    }, 1200)
  }
}

onMounted(initAuthAndProfile)
</script>

<style scoped>
.loading-container{ text-align:center; margin:2rem 0; font-size:1.1rem; }
.auth-error-banner{ position:fixed; top:0; left:0; right:0; background:#e53935; color:#fff; padding:1rem; text-align:center; z-index:1000; }
.fade-enter-active,.fade-leave-active{ transition:opacity .5s; }
.fade-enter-from,.fade-leave-to{ opacity:0; }
</style>
