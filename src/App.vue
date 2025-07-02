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
import { parseTelegramLaunchData } from './utils/telegram'
import { loginViaTelegram, exchangeToken } from './api/auth'
import { useRouter } from 'vue-router'

const loading    = ref(true)
const authError  = ref(false)
const router     = useRouter()

// Ключ для хранения профиля
const PROFILE_KEY = 'profile_data'

// Форма профиля
const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

// Для отображения сырых данных
const initData = ref({})

// Получить initData из Telegram или из хэша
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

// Авторизация и парсинг данных
async function initAuthAndProfile() {
  try {
    const init = getInitData()
    console.log('InitData received from Telegram:', init)
    if (!init) throw new Error('initData отсутствует')

    // Авторизация
    const loginRes = await loginViaTelegram(init)
    console.log('loginViaTelegram response:', loginRes.data)

    const exchRes = await exchangeToken(loginRes.data.temporary_token)
    console.log('exchangeToken response:', exchRes.data)

    localStorage.setItem('access_token',  exchRes.data.access_token)
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

    // Парсим tgWebAppData
    const { tgData } = parseTelegramLaunchData()
    initData.value = tgData
    console.log('Parsed tgWebAppData:', tgData)

    // Заполняем форму
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''

    // Дополнительные поля из localStorage
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''

  } catch (err) {
    console.error('Ошибка авторизации или парсинга профиля:', err)
    authError.value = true
  } finally {
    await router.replace({ path: '/' })
    loading.value = false
    setTimeout(() => { authError.value = false }, 5000)
  }
}

// Сохранение профиля
function saveProfile() {
  const profileData = {
    firstName:  form.firstName,
    lastName:   form.lastName,
    middleName: form.middleName,
    phone:      form.phone,
    email:      form.email
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));

  // Обязательно указываем Secure и SameSite=None
  document.cookie =
    `profile_user=${encodeURIComponent(JSON.stringify(profileData))}` +
    `; path=/` +
    `; max-age=${365*24*60*60}` +
    `; Secure` +
    `; SameSite=None`;

  console.log('Profile saved to localStorage and cookie:', profileData);
  console.log('Current cookies:', document.cookie);
  console.log('Stored profile_data:', localStorage.getItem(PROFILE_KEY));
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
