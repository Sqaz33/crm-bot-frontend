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

// Ключ для хранения доп. данных в localStorage
const PROFILE_KEY = 'profile_data'
const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})
const initData = ref({})

function parseInit() {
  const { tgData } = parseTelegramLaunchData()
  initData.value = tgData
  return tgData.user || {}
}

onMounted(() => {
  // логируем initData в консоль
  console.log('InitData (tgWebAppData):', initData.value)

  const user = parseInit()
  form.firstName = user.first_name || ''
  form.lastName = user.last_name || ''
  // Загружаем сохранённые доп. поля из localStorage
  const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
  form.middleName = saved.middleName || ''
  form.phone      = saved.phone      || ''
  form.email      = saved.email      || ''
})

function saveProfile() {
  // Сохраняем дополнительные поля в localStorage
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      middleName: form.middleName,
      phone: form.phone,
      email: form.email
    })
  )
  // Сохраняем данные пользователя из initData в cookie
  const userCookie = encodeURIComponent(JSON.stringify({
    firstName: form.firstName,
    lastName: form.lastName,
    middleName: form.middleName,
    phone: form.phone,
    email: form.email
  }))
  document.cookie = `profile_user=${userCookie}; path=/; max-age=${365*24*60*60}`
  console.log('Данные сохранены и сохранены в cookie')
}
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
