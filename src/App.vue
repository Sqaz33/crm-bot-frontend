
<template>
  <div v-if="loading">
    <p>Авторизация…</p>
  </div>
  <div v-else>
    <div v-if="ok">
      <p> Токен валиден, статус: {{ status }}</p>
    </div>
    <div v-else>
      <p> Ошибка проверки токена: {{ status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loginViaTelegram, exchangeToken } from './api/auth'
import api from './api'

const loading = ref(true)
const ok      = ref(false)
const status  = ref(null)

onMounted(async () => {
  try {
    // 1) Получаем initData из Telegram WebApp
    const tg = window.Telegram?.WebApp
    if (!tg) throw new Error('WebApp API не найдена')
    tg.expand()
    const initData = tg.initData
    if (!initData) throw new Error('initData отсутствует')

    // 2) Обмениваем initData на temporary_token
    const { data: { temporary_token } } = await loginViaTelegram(initData)
    console.log('temporary_token:', temporary_token)

    // 3) Обмениваем temporary_token на access + refresh
    const { data: { access_token, refresh_token } } = await exchangeToken(temporary_token)
    console.log('access_token:', access_token)
    console.log('refresh_token:', refresh_token)

    // 4) Сохраняем токены в localStorage
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)

    // 5) Делаем защищённый запрос, чтобы проверить, что access_token работает
    //    Эндпоинт /services защищён JWT
    const res = await api.get('/services')
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
