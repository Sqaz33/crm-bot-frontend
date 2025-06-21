<template>
  <div v-if="loading">
    <p>Загрузка...</p>
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { loginViaTelegram, exchangeToken } from './api/auth'

const loading = ref(true)
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  try {
    // если нужно — подхватываем токен из query-параметров или localStorage
    auth.initFromUrl()

    // проверяем наличие Telegram WebApp API
    const tg = window.Telegram?.WebApp
    if (!tg) {
      console.warn('Telegram WebApp API не найдена — переходим на домашнюю страницу')
      await router.replace({ name: 'home' })
      return
    }
    tg.expand()

    const initData = tg.initData
    if (!initData) {
      throw new Error('initData отсутствует')
    }

    // 1) логинимся через Telegram, получаем временный токен
    const { data: loginData } = await loginViaTelegram(initData)

    // 2) обмениваем временный токен на access+refresh
    const { data: exchangeData } = await exchangeToken(loginData.temporary_token)

    // сохраняем в Pinia
    auth.setTokens(exchangeData)
    auth.setTelegramId(exchangeData.telegram_id || auth.telegramId)

    // на домашний экран
    await router.replace({ name: 'home' })

  } catch (err) {
    console.error('Ошибка авторизации:', err)
    alert('Не удалось пройти авторизацию через Telegram')
    // даже при ошибке — показываем главный экран
    await router.replace({ name: 'home' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
p {
  text-align: center;
  margin-top: 2rem;
}
</style>