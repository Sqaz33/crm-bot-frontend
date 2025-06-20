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
// import { useAuthStore } from './stores/auth'
// import { loginViaTelegram, exchangeToken } from './api/auth'

const loading = ref(true)
const router = useRouter()
// const authStore = useAuthStore()

onMounted(async () => {
  /*
  try {
    const tg = window.Telegram?.WebApp
    tg?.expand()

    if (!tg?.initData) {
      alert("WebApp не запущен в Telegram или initData отсутствует")
      loading.value = false
      return
    }

    const loginResponse = await loginViaTelegram(tg.initData)
    const exchangeResponse = await exchangeToken(loginResponse.data.temporary_token)

    authStore.setTokens(exchangeResponse.data)
    await router.push({ name: 'home' }) // Переход на HomePage.vue
  } catch (err) {
    console.error(err)
    alert("Ошибка авторизации")
  }
  */

  // Заглушка без авторизации
  await new Promise(resolve => setTimeout(resolve, 500))
  const currentRoute = router.currentRoute.value
  if (currentRoute.name === undefined || currentRoute.name === null) {
    await router.push({ name: 'home' }) 
  } 
  loading.value = false
})
</script>


<style scoped>
p {
  text-align: center;
  margin-top: 2rem;
}
</style>
