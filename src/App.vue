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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import Layout from './views/Layout.vue'
import { loginViaTelegram, exchangeToken } from './api/auth'

const loading    = ref(true)
const authError  = ref(false)
const router     = useRouter()

function getInitData() {
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand()
    return window.Telegram.WebApp.initData
  }

  const rawHash = window.location.hash.slice(1)
  const prefix  = 'tgWebAppData='
  if (!rawHash.startsWith(prefix)) return null

  const endIndex   = rawHash.indexOf('&tgWebAppVersion')
  const encoded    = endIndex > 0
    ? rawHash.slice(prefix.length, endIndex)
    : rawHash.slice(prefix.length)
  return decodeURIComponent(encoded)
}

onMounted(async () => {
  try {
    const initData = getInitData()
    console.log('InitData received from Telegram:', initData)   
    if (!initData) throw new Error('initData отсутствует')

    const loginRes = await loginViaTelegram(initData)
    console.log('loginViaTelegram response:', loginRes.data)
    const exchRes  = await exchangeToken(loginRes.data.temporary_token)
    console.log('exchangeToken response:', exchRes.data)
    
    localStorage.setItem('access_token',  exchRes.data.access_token)
    localStorage.setItem('refresh_token', exchRes.data.refresh_token)

  } catch (err) {
    console.error('Ошибка авторизации:', err)
    authError.value = true

  } finally {
    // перенаправляем на главную (даже при ошибке)
    await router.replace({ path: '/' })
    loading.value = false

    // прячем баннер через 5 секунд
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
