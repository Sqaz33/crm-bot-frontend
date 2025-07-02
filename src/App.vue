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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginViaTelegram, exchangeToken } from './api/auth'
import { parseTelegramLaunchData } from './utils/telegram'

const loading    = ref(true)
const authError  = ref(false)
const router     = useRouter()

// Ключ хранения доп. полей профиля
const PROFILE_KEY = 'profile_data'

// Данные формы профиля
const profile = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

// Получаем initData из Telegram WebApp или из хэша
function getInitData() {
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

// Парсим tgWebAppData и одновременно возвращаем user
function parseAndFillProfile() {
  const { tgData } = parseTelegramLaunchData()
  console.log('Parsed tgWebAppData:', tgData)
  const user = tgData.user || {}
  // основные поля из Telegram
  profile.firstName = user.first_name || ''
  profile.lastName  = user.last_name  || ''
  // доп. поля из localStorage
  const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
  profile.middleName = saved.middleName || ''
  profile.phone      = saved.phone      || ''
  profile.email      = saved.email      || ''
}

// Сохраняем доп. поля в localStorage и cookie
function saveProfile() {
  const toSave = {
    middleName: profile.middleName,
    phone:      profile.phone,
    email:      profile.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(toSave))
  // также запишем единый cookie с инфой о пользователе
  const cookieValue = encodeURIComponent(
    JSON.stringify({
      firstName:  profile.firstName,
      lastName:   profile.lastName,
      middleName: profile.middleName,
      phone:      profile.phone,
      email:      profile.email
    })
  )
  document.cookie = `profile_user=${cookieValue}; path=/; max-age=${365*24*60*60}`
  console.log('Profile saved', toSave)
}

onMounted(async () => {
  try {
    // 1) Логинимся через Telegram
    const initData = getInitData()
    console.log('InitData:', initData)
    if (!initData) throw new Error('initData отсутствует')

    const loginRes = await loginViaTelegram(initData)
    console.log('loginViaTelegram →', loginRes.data)

    const exchRes = await exchangeToken(loginRes.data.temporary_token)
    console.log('exchangeToken →', exchRes.data)

    localStorage.setItem('access_token',  exchRes.data.access_token)
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

    // 2) Парсим initData и заполняем профиль
    parseAndFillProfile()

  } catch (err) {
    console.error('Ошибка авторизации:', err)
    authError.value = true

  } finally {
    // переход на главную даже при ошибке
    await router.replace({ path: '/' })
    loading.value = false
    setTimeout(() => { authError.value = false }, 5000)
  }
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

/* Плавное появление/исчезновение баннера */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
