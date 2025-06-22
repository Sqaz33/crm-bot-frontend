<template>
  <div v-if="loading">
    <p>Загрузка…</p>
  </div>
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { parseTelegramLaunchData } from './utils/telegram'
import { fetchUser, createUser } from './api/user'

const loading = ref(true)
const router = useRouter()

onMounted(async () => {
  try {
    // 1. Собираем данные из URL
    const { params, tgData } = parseTelegramLaunchData()
    console.log('Query-параметры:', params)
    console.log('tgWebAppData:', tgData)

    // 2. Берём telegram_id из tgData.user или из ?user_id
    const telegramId = tgData.user?.id || params.user_id
    if (!telegramId) {
      throw new Error('Не найден telegram_id ни в hash ни в query')
    }

    // 3. Пытаемся получить пользователя из API
    let res
    try {
      res = await fetchUser(telegramId)
      console.log('Пользователь найден:', res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        // 4. Если нет — создаём
        console.log('Пользователь не найден, создаём…', tgData.user)
        res = await createUser(tgData.user || { id: telegramId })
        console.log('Создан пользователь:', res.data)
      } else {
        throw err
      }
    }

    // 5. Сохраняем токен, если API вернул его в res.data
    const { access_token, refresh_token } = res.data
    if (access_token) {
      localStorage.setItem('access_token', access_token)
    }
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token)
    }

    // 6. Переходим на домашний маршрут
    await router.replace({ name: 'home' })

  } catch (e) {
    console.error('Ошибка авторизации:', e)
    // Неудача — просто на home без токена
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
