<template>
  <div>
    <transition name="fade">
      <div v-if="authError" class="auth-error-banner">
        Ошибка авторизации. Пожалуйста, попробуйте ещё раз.
      </div>
    </transition>

    <div v-if="loading" class="loading-container">
      Загрузка...
    </div>

    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginViaTelegram, exchangeToken } from './api/auth'
import { parseTelegramLaunchData } from './utils/telegram'

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'
const INIT_KEY = 'telegram_init'

const loading = ref(true)
const authError = ref(false)
const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

const initData = ref({})

// Сохраняем пустой визит в cookie и localStorage
function saveVisit(silent = false) {
  const visitData = {
    staff_id: '',
    services_id: '',
    visit_time: { start_time: '' },
    comment: ''
  }
  localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
  const cookieValue = encodeURIComponent(JSON.stringify(visitData))
  document.cookie = `${VISIT_KEY}=${cookieValue}; path=/; max-age=${365 * 24 * 60 * 60}; Secure; SameSite=None`
  if (!silent) {
    console.log('Visit data saved:', visitData)
  }
  console.log('→ document.cookie:', document.cookie)
  console.log(`→ localStorage[${VISIT_KEY}]:`, localStorage.getItem(VISIT_KEY))
}

// Получение строки initData (Telegram)
function getInitDataString() {
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand()
    const data = window.Telegram.WebApp.initData
    localStorage.setItem('telegram_init', data) // сохраняем для последующих запросов
    return data
  }
  // если Telegram API не отдал — пробуем достать из localStorage
  const stored = localStorage.getItem('telegram_init')
  if (stored) return stored

  // или из хэша
  const raw = window.location.hash.slice(1)
  if (!raw.startsWith('tgWebAppData=')) return null
  const payload = raw.replace('tgWebAppData=', '').split('&tgWebAppVersion')[0]
  const decoded = decodeURIComponent(payload)
  localStorage.setItem('telegram_init', decoded)
  return decoded
}


// Инициализация авторизации и профиля
async function initAuthAndProfile() {
  try {
    const initStr = getInitDataString()
    console.log('[App] InitData string:', initStr)
    if (!initStr) throw new Error('initData отсутствует')

    // Сохраняем initData для дальнейших refresh
    localStorage.setItem(INIT_KEY, initStr)

    // Авторизация
    const loginRes = await loginViaTelegram(initStr)
    console.log('[App] loginViaTelegram →', loginRes.data)

    const exchRes = await exchangeToken(loginRes.data.temporary_token)
    console.log('[App] exchangeToken →', exchRes.data)

    localStorage.setItem('access_token', exchRes.data.access_token)
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

    // Парсим Telegram данные
    const { tgData } = parseTelegramLaunchData()
    initData.value = tgData
    console.log('[App] Parsed tgWebAppData:', tgData)

    // Заполняем базовые поля профиля
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName = user.last_name || ''

    // Загружаем доп. данные
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone = saved.phone || ''
    form.email = saved.email || ''

    // Сохраняем профиль в cookie и localStorage
    saveProfile(true)
    saveVisit(true)
  } catch (err) {
    console.error('[App] Ошибка инициализации профиля:', err)
    authError.value = true
  } finally {
    loading.value = false
    setTimeout(() => {
      authError.value = false
      router.replace({ path: '/' })
    }, 2000)
  }
}

// Сохранение профиля
function saveProfile(silent = false) {
  const profileData = {
    firstName: form.firstName,
    lastName: form.lastName,
    middleName: form.middleName,
    phone: form.phone,
    email: form.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  document.cookie = `profile_user=${encodeURIComponent(JSON.stringify(profileData))}; path=/; max-age=${365 * 24 * 60 * 60}; Secure; SameSite=None`
  if (!silent) {
    console.log('[App] Profile saved:', profileData)
  }
  console.log('→ document.cookie:', document.cookie)
  console.log('→ localStorage[profile_data]:', localStorage.getItem(PROFILE_KEY))
}

onMounted(initAuthAndProfile)
</script>

<style scoped>
.loading-container {
  text-align: center;
  margin: 2rem 0;
  font-size: 1.1rem;
}
.auth-error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #e53935;
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 1000;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
