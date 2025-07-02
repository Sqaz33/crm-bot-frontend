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

// Ключ хранения доп. полей профиля в localStorage
const PROFILE_KEY = 'profile_data'

// Состояние загрузки и ошибок (если нужно)
const loading   = ref(true)
const authError = ref(false)
const router    = useRouter()

// Поля формы профиля
const form = reactive({
  firstName:  '',
  lastName:   '',
  middleName: '',
  phone:      '',
  email:      ''
})

// Для отображения необработанных данных из tgWebAppData
const initData = ref({})

// Извлечение initData из Telegram WebApp или из URL-хэша
function getInitDataString() {
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand()
    return window.Telegram.WebApp.initData
  }
  const rawHash = window.location.hash.slice(1)
  const prefix  = 'tgWebAppData='
  if (!rawHash.startsWith(prefix)) return null
  const endIndex = rawHash.indexOf('&tgWebAppVersion')
  const encoded  = endIndex > 0
    ? rawHash.slice(prefix.length, endIndex)
    : rawHash.slice(prefix.length)
  return decodeURIComponent(encoded)
}

// Основная инициализация: авторизация и заполнение формы
async function initAuthAndProfile() {
  try {
    // 1. Авторизация через Telegram
    const initStr = getInitDataString()
    console.log('InitData string:', initStr)
    if (!initStr) throw new Error('initData отсутствует')

    const loginRes = await loginViaTelegram(initStr)
    console.log('loginViaTelegram response:', loginRes.data)

    const exchRes = await exchangeToken(loginRes.data.temporary_token)
    console.log('exchangeToken response:', exchRes.data)

    localStorage.setItem('access_token',  exchRes.data.access_token)
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

    // 2. Парсим tgWebAppData
    const { tgData } = parseTelegramLaunchData()
    initData.value = tgData
    console.log('Parsed tgWebAppData object:', tgData)

    // 3. Заполняем поля формы из tgData.user и localStorage
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''

    // Смотрим, что уже есть в localStorage
    console.log('Existing localStorage profile_data:', localStorage.getItem(PROFILE_KEY))
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''

  } catch (err) {
    console.error('Ошибка инициализации профиля:', err)
    authError.value = true
  } finally {
    loading.value = false
    // Ждём, чтобы пользователь увидел возможную ошибку, потом редирект
    setTimeout(() => {
      authError.value = false
      router.replace({ path: '/' })
    }, 2000)
  }
}

// Сохранение профиля в localStorage и в cookie
function saveProfile() {
  const profileData = {
    firstName:  form.firstName,
    lastName:   form.lastName,
    middleName: form.middleName,
    phone:      form.phone,
    email:      form.email
  }

  // Сохраняем в localStorage
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))

  // Сохраняем единый cookie (требует HTTPS для Secure; SameSite=None)
  document.cookie =
    `profile_user=${encodeURIComponent(JSON.stringify(profileData))}` +
    `; path=/; max-age=${365 * 24 * 60 * 60}` +
    `; Secure; SameSite=None`

  console.log('Profile saved to localStorage:', profileData)
  console.log('Current document.cookie:', document.cookie)
}

// Lifecycle
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
