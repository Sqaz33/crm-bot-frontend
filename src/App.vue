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
      <router-view/>

      <div v-if="visitError" class="visit-error-banner">
        {{ visitError }}
      </div>
      <div v-else-if="currentVisit" class="visit-info-banner">
        <div>Текущий визит:</div>
        <pre>{{ currentVisit }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { loginViaTelegram, exchangeToken } from './api/auth'
import { parseTelegramLaunchData } from './utils/telegram'

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'

// --------- Получение access_token из cookie -------------
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

// --------- Получение текущего визита -------------------
const currentVisit = ref(null)
const visitError = ref('')

async function fetchCurrentVisit() {
  const token = getCookie('access_token')
  if (!token) throw new Error('Токен не найден')
  const resp = await axios.get('http://127.0.0.1:8000/visits/current/', {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  })
  return resp.data
}

async function loadCurrentVisit() {
  try {
    currentVisit.value = await fetchCurrentVisit()
    visitError.value = ''
    console.log('Current visit:', currentVisit.value)
  } catch (e) {
    visitError.value = e.response?.data?.detail || e.message
    currentVisit.value = null
    console.error('Ошибка получения визита:', visitError.value)
  }
}

// --------- Инициализация пустого визита ----------------
function saveVisit(silent = false) {
  const visitData = {
    staff_id:   '',
    services_id: '',
    visit_time: { start_time: '' },
    comment:    ''
  }
  localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
  const cookieValue = encodeURIComponent(JSON.stringify(visitData))
  document.cookie =
    `${VISIT_KEY}=${cookieValue}` +
    `; path=/; max-age=${365 * 24 * 60 * 60}` +
    `; Secure; SameSite=None`
  if (!silent) console.log('Visit data saved:', visitData)
}

saveVisit()

// --------- Инициализация профиля и авторизация ---------
const loading   = ref(true)
const authError = ref(false)
const router    = useRouter()

const form = reactive({
  firstName:  '',
  lastName:   '',
  middleName: '',
  phone:      '',
  email:      ''
})
const initData = ref({})

function getInitDataString() {
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand()
    return window.Telegram.WebApp.initData
  }
  const raw = window.location.hash.slice(1)
  if (!raw.startsWith('tgWebAppData=')) return null
  const payload = raw.replace('tgWebAppData=', '').split('&tgWebAppVersion')[0]
  return decodeURIComponent(payload)
}

async function initAuthAndProfile() {
  try {
    // 1) Авторизация
    const initStr = getInitDataString()
    if (!initStr) throw new Error('initData отсутствует')
    const loginRes = await loginViaTelegram(initStr)
    const exchRes = await exchangeToken(loginRes.data.temporary_token)

    // -- пишем токен в куку (обязано быть Secure!)
    document.cookie =
      `access_token=${exchRes.data.access_token}; path=/; max-age=${24*60*60}; Secure; SameSite=None`
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

    // 2) Парсим tgWebAppData
    const { tgData } = parseTelegramLaunchData()
    initData.value = tgData

    // 3) Заполняем базовые поля из Telegram
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''

    // 4) Загружаем ранее сохранённые доп. поля
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''

    // 5) Сохраняем все поля в localStorage и куку
    saveProfile(true)

  } catch (err) {
    console.error('Ошибка инициализации профиля:', err)
    authError.value = true
  } finally {
    loading.value = false
    // Показать ошибку 2 сек, затем переход на главную
    setTimeout(() => {
      authError.value = false
      router.replace({ path: '/' })
    }, 2000)
  }
}

// ------- Сохранение профиля в localStorage и cookie ------
function saveProfile(silent = false) {
  const profileData = {
    firstName:  form.firstName,
    lastName:   form.lastName,
    middleName: form.middleName,
    phone:      form.phone,
    email:      form.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  document.cookie =
    `profile_user=${encodeURIComponent(JSON.stringify(profileData))}` +
    `; path=/; max-age=${365*24*60*60}` +
    `; Secure; SameSite=None`
  if (!silent) console.log('Profile manually saved:', profileData)
}

onMounted(async () => {
  await initAuthAndProfile()
  await loadCurrentVisit()
})
</script>

<style scoped>
.loading-container {
  text-align: center;
  margin: 2rem 0;
  font-size: 1.1rem;
}

.auth-error-banner {
  position: fixed;
  top: 0; left: 0; right: 0;
  background: #e53935;
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 1000;
}
.visit-error-banner {
  background: #ffcdd2;
  color: #d32f2f;
  margin: 1rem;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}
.visit-info-banner {
  background: #e3f2fd;
  color: #1565c0;
  margin: 1rem;
  padding: 1rem;
  border-radius: 6px;
  font-size: 1em;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
