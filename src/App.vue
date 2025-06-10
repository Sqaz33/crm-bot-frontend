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
import { useAuthStore } from './stores/auth'
import { loginViaTelegram, exchangeToken } from './api/auth'

const loading = ref(true)
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const tg = window.Telegram?.WebApp
    tg?.expand()

    if (!tg?.initData) {
      alert("WebApp не запущен в Telegram или initData отсутствует")
      loading.value = false
      return
    }

    // Шаг 1: Отправляем initData на сервер для валидации
    const loginResponse = await loginViaTelegram(tg.initData)

    // Шаг 2: Обмениваем временный токен на access_token
    const exchangeResponse = await exchangeToken(loginResponse.data.temporary_token)

    // Сохраняем токены
    authStore.setTokens(exchangeResponse.data)
    loading.value = false
  } catch (err) {
    console.error(err)
    alert(" Ошибка авторизации")
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
