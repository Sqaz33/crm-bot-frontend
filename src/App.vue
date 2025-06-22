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
  console.groupCollapsed('App Mounted')
  console.log('Mode:', import.meta.env.MODE)

  // initFromUrl
  console.group('🔧 auth.initFromUrl()')
  auth.initFromUrl()
  console.log('Auth state after initFromUrl:', { ...auth })
  console.groupEnd()

  // Проверяем Telegram.WebApp
  let tg = window.Telegram?.WebApp
  console.group('Telegram WebApp check')
  console.log('window.Telegram.WebApp:', tg)
  // Мокаем в dev-режиме, чтобы весь flow отработал
  if (!tg && import.meta.env.MODE === 'development') {
    console.info('— dev mode: mocking Telegram.WebApp')
    window.Telegram = {
      WebApp: {
        initData: 'id=123456789&first_name=DevUser&auth_date=1234567890&hash=abcdef',
        expand: () => console.log('— tg.expand() called'),
      }
    }
    tg = window.Telegram.WebApp
  }
  console.groupEnd()

  try {
    if (!tg) {
      console.warn('Telegram WebApp API не найдена — переходим на home')
      await router.replace({ name: 'home' })
      return
    }

    // expand
    console.group('tg.expand()')
    tg.expand()
    console.groupEnd()

    // initData
    console.group('tg.initData')
    const initData = tg.initData
    console.log('initData:', initData)
    if (!initData) throw new Error('initData отсутствует')
    console.groupEnd()

    // loginViaTelegram
    console.groupCollapsed('loginViaTelegram')
    const { data: loginData } = await loginViaTelegram(initData)
    console.log('loginData:', loginData)
    console.groupEnd()

    // exchangeToken
    console.groupCollapsed('exchangeToken')
    const { data: exchangeData } = await exchangeToken(loginData.temporary_token)
    console.log('exchangeData:', exchangeData)
    console.groupEnd()

    // сохранение в стор
    console.group('Saving tokens to store')
    auth.setTokens(exchangeData)
    auth.setTelegramId(exchangeData.telegram_id || auth.telegramId)
    console.log('Auth state after setTokens:', { ...auth })
    console.groupEnd()

    // навигация
    console.log('Navigating to home')
    await router.replace({ name: 'home' })

  } catch (err) {
    console.error('Ошибка авторизации:', err)
    alert('Не удалось пройти авторизацию через Telegram')
    await router.replace({ name: 'home' })
  } finally {
    loading.value = false
    console.groupEnd()  // закрываем корневую группу
  }
})
</script>

<style scoped>
p {
  text-align: center;
  margin-top: 2rem;
}
</style>
