<template>
  <div v-if="loading">
    <p>Авторизация…</p>
  </div>
  <div v-else>
    <div v-if="ok">
      <p>Токен валиден, статус: {{ status }}</p>
    </div>
    <div v-else>
      <p>Ошибка проверки токена: {{ status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loginViaTelegram, exchangeToken } from './api/auth'
import api from './api'

// Вспомогалка: если нет WebApp API, вытягиваем initData из хэша URL
function getInitDataFallback() {
  const hash = window.location.hash.slice(1) // убираем '#'
  const prefix = 'tgWebAppData='
  if (hash.startsWith(prefix)) {
    return decodeURIComponent(hash.replace(prefix, ''))
  }
  return null
}

// Функция для фильтрации параметров initData
function sanitizeInitData(raw) {
  const params = new URLSearchParams(raw)
  const allowed = ['query_id', 'user', 'auth_date', 'signature', 'hash']
  const filtered = new URLSearchParams()
  for (const key of allowed) {
    const val = params.get(key)
    if (val !== null) {
      filtered.set(key, val)
    }
  }
  return filtered.toString()
}

const loading = ref(true)
const ok      = ref(false)
const status  = ref(null)

onMounted(async () => {
  try {
    // 1) Получаем initData
    let initData = window.Telegram?.WebApp?.initData
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand()
    } else {
      console.warn('WebApp API не найдена — используем fallback initData из URL')
      initData = getInitDataFallback()
    }

    if (!initData) {
      throw new Error('initData отсутствует ни в WebApp, ни в URL')
    }
    console.log('raw initData:', initData)

    // 1.1) Очищаем initData от параметров, которые не нужны
    const cleanInitData = sanitizeInitData(initData)
    console.log('sanitized initData:', cleanInitData)

    // 2) POST /auth/telegram/login → temporary_token
    const { data: { temporary_token } } = await loginViaTelegram(cleanInitData)
    console.log('temporary_token:', temporary_token)

    // 3) POST /auth/telegram/exchange → access + refresh
    const { data: { access_token, refresh_token } } = await exchangeToken(temporary_token)
    console.log('access_token:', access_token)
    console.log('refresh_token:', refresh_token)

    // 4) Сохраняем токены
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)

    // 5) Делаем защищённый запрос, чтобы проверить токен
    const res = await api.get('/services')  // замените на свой защищённый эндпоинт
    ok.value     = true
    status.value = res.status

  } catch (e) {
    console.error('Auth error:', e)
    ok.value     = false
    status.value = e.response?.status || e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
p {
  text-align: center;
  margin-top: 2rem;
  font-size: 1.1rem;
}
</style>
