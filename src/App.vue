<template>
  <div>
    <!-- Баннер об ошибке -->
    <transition name="fade">
      <div v-if="authError" class="auth-error-banner">
        Не удалось пройти авторизацию
      </div>
    </transition>

    <!-- Спиннер загрузки -->
    <div v-if="loading" class="loading-container">
      <p>Загрузка…</p>
    </div>

    <!-- Основной контент -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginViaTelegram, exchangeToken } from './api/auth'
import api from './api'

const loading = ref(true)
const authError = ref(false)
const router = useRouter()

// Получение initData из Telegram WebApp или из hash-фоллбека
function getInitData() {
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand()
    return window.Telegram.WebApp.initData
  }

  const rawHash = window.location.hash.slice(1)
  const prefix = 'tgWebAppData='
  if (!rawHash.startsWith(prefix)) return null

  // забираем только до &tgWebAppVersion
  const endIndex = rawHash.indexOf('&tgWebAppVersion')
  const encodedPart = endIndex > 0
    ? rawHash.slice(prefix.length, endIndex)
    : rawHash.slice(prefix.length)

  return decodeURIComponent(encodedPart)
}

onMounted(async () => {
  try {
    // 1) Получаем и логируем initData
    const initData = getInitData()
    console.log('initData:', initData)
    if (!initData) throw new Error('initData отсутствует')

    // 2) Логинимся — логируем серверный ответ
    console.group('POST /auth/telegram/login')
    console.log('Payload:', { init_data: initData })
    const loginRes = await loginViaTelegram(initData)
    console.log('Response data:', loginRes.data)
    console.groupEnd()

    // 3) Обмениваем токен — логируем ответ
    console.group('POST /auth/telegram/exchange')
    console.log('Payload:', { temporary_token: loginRes.data.temporary_token })
    const exchRes = await exchangeToken(loginRes.data.temporary_token)
    console.log('Response data:', exchRes.data)
    console.groupEnd()

    // 4) Сохраняем токены
    localStorage.setItem('access_token', exchRes.data.access_token)
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

  } catch (err) {
    // Логируем полную ошибку, включая ответ сервера
    if (err.response) {
      console.error(`Ошибка ${err.response.status} на ${err.config.url}:`, err.response.data)
    } else {
      console.error('Ошибка авторизации:', err.message)
    }
    authError.value = true
  } finally {
    // В любом случае идём на home
    await router.replace({ name: 'home' })
    loading.value = false

    // Скрываем баннер через 5 секунд
    setTimeout(() => { authError.value = false }, 5000)
  }
})
</script>

<style scoped>
.loading-container {
  text-align: center;
  margin-top: 2rem;
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
p { font-size: 1.1rem; }
</style>