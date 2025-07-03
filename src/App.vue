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
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginViaTelegram, exchangeToken } from './api/auth'
import { parseTelegramLaunchData } from './utils/telegram'

// Ключ для localStorage
const PROFILE_KEY = 'profile_data'

// Флаги загрузки/ошибки
const loading   = ref(true)
const authError = ref(false)
const router    = useRouter()

// Форма профиля
const form = reactive({
  firstName:  '',
  lastName:   '',
  middleName: '',
  phone:      '',
  email:      ''
})

// Сырая структура tgWebAppData
const initData = ref({})

// Извлекаем строку initData
function getInitDataString() {
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand()
    return window.Telegram.WebApp.initData
  }
  const raw = window.location.hash.slice(1)
  if (!raw.startsWith('tgWebAppData=')) return null
  const payload = raw
    .replace('tgWebAppData=', '')
    .split('&tgWebAppVersion')[0]
  return decodeURIComponent(payload)
}

// Общая инициализация
async function initAuthAndProfile() {
  try {
    // 1) Авторизация
    const initStr = getInitDataString()
    console.log('InitData string:', initStr)
    if (!initStr) throw new Error('initData отсутствует')

    const loginRes = await loginViaTelegram(initStr)
    console.log('loginViaTelegram →', loginRes.data)

    const exchRes = await exchangeToken(loginRes.data.temporary_token)
    console.log('exchangeToken →', exchRes.data)

    localStorage.setItem('access_token',  exchRes.data.access_token)
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

    // 2) Парсим tgWebAppData
    const { tgData } = parseTelegramLaunchData()
    initData.value = tgData
    console.log('Parsed tgWebAppData:', tgData)

    // 3) Заполняем базовые поля из Telegram
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''

    // 4) Загружаем ранее сохранённые доп. поля
    console.log('Existing localStorage:', localStorage.getItem(PROFILE_KEY))
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''

    // 5) Сразу сохраняем ВСЕ поля в cookie и localStorage
    saveProfile(true /* silent */)

  } catch (err) {
    console.error('Ошибка инициализации профиля:', err)
    authError.value = true
  } finally {
    loading.value = false
    setTimeout(() => {
      authError.value = false
      router.replace({ path: '/' })
    }, 2000)
  }
}

// Сохранение профиля в localStorage + куку
function saveProfile(silent = false) {
  const profileData = {
    firstName:  form.firstName,
    lastName:   form.lastName,
    middleName: form.middleName,
    phone:      form.phone,
    email:      form.email
  }
  // localStorage
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  // cookie (Secure, SameSite=None)
  document.cookie =
    `profile_user=${encodeURIComponent(JSON.stringify(profileData))}` +
    `; path=/; max-age=${365*24*60*60}` +
    `; Secure; SameSite=None`

  if (!silent) {
    console.log('Profile manually saved:', profileData)
  }
  console.log('→ document.cookie:', document.cookie)
  console.log('→ localStorage profile_data:', localStorage.getItem(PROFILE_KEY))
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
  top: 0; left: 0; right: 0;
  background: #e53935;
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 1000;
}

/* Плавное появление/исчезновение баннера */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
