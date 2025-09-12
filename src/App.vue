<template>
  <div>
    <transition name="fade">
      <div v-if="authError" class="auth-error-banner">{{ errorText }}</div>
    </transition>

    <div v-if="loading" class="loading-container">Загрузка...</div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loginViaTelegram } from './api/auth'                 
import { parseTelegramLaunchData, getInitDataString } from './utils/telegram'
import { useAuthStore } from './stores/auth'

/**
 * Политика хранения:
 * - init_data: только в памяти (не пишем в LS/cookie)
 * - access_token: в Pinia + sessionStorage (store.setAccess)
 * - Профиль/черновики: только локально (LS) с TTL — серверу не отправляем
 */

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'

const loading   = ref(true)
const authError = ref(false)
const errorText = ref('Ошибка авторизации. Пожалуйста, попробуйте ещё раз.')
const router    = useRouter()
const store     = useAuthStore()

const form = reactive({ firstName: '', lastName: '', middleName: '', phone: '', email: '' })

function saveVisit(silent = false) {
  // локальный черновик (LS), без cookie
  const visitData = { staff_id: '', services_id: '', visit_time: { start_time: '' }, comment: '' }
  localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
  if (!silent) console.log('[App] Visit draft saved:', visitData)
}

function saveProfile(silent = false) {
  // локальный профиль (LS), НЕ отправляется на сервер
  const profileData = {
    firstName: form.firstName, lastName: form.lastName,
    middleName: form.middleName, phone: form.phone, email: form.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  if (!silent) console.log('[App] Profile (local) saved:', profileData)
}

async function doTelegramLogin() {
  // Берём init_data РОВНО как Telegram его даёт 
  const initStr = getInitDataString()
  if (!initStr) {
    throw new Error('init_data отсутствует (откройте приложение внутри Telegram)')
  }
  console.log('[App] init_data length:', initStr.length, 'hash?=', initStr.includes('hash='))

  const { data } = await loginViaTelegram(initStr) // ожидаем { access_token }
  const access = data?.access_token
  if (!access) throw new Error('access_token отсутствует в ответе /auth/telegram/login')

  // Кладём только в память + sessionStorage 
  store.setAccess(access)
}

async function initAuthAndProfile() {
  try {
    // 0) Черновики локально
    saveVisit(true)

    // 1) Если уже восстанавливали токен из sessionStorage — логин не нужен
    store.initFromSession()
    if (!store.accessToken) {
      // Проверка, что мы действительно внутри Telegram 
      const isInTelegram = !!window.Telegram?.WebApp
      if (!isInTelegram) {
        throw new Error('Приложение должно быть запущено внутри Telegram.')
      }
      await doTelegramLogin()
    }

    // 2) Автоподстановка имени в локальный профиль из tgData 
    const { tgData } = parseTelegramLaunchData()
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''
    // опционально сохраним tg id в store (не обязательно)
    if (user.id) store.setTelegramId?.(user.id)

    // 3) Подхват локально сохранённых полей 
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''
    saveProfile(true)

  } catch (e) {
    console.error('[App] Ошибка авторизации:', e)
    const status = e?.response?.status
    if (status === 400)      errorText.value = 'Некорректная подпись или телефон не найден.'
    else if (status === 422) errorText.value = 'Validation Error: проверьте корректность init_data.'
    else                     errorText.value = e?.message || 'Ошибка авторизации. Откройте приложение внутри Telegram.'
    authError.value = true
  } finally {

    setTimeout(() => { authError.value = false }, 1500)
  }
}

onMounted(initAuthAndProfile)
</script>

<style scoped>
.loading-container { text-align: center; margin: 2rem 0; font-size: 1.1rem; }
.auth-error-banner {
  position: fixed; top: 0; left: 0; right: 0;
  background: #e53935; color: #fff; padding: 1rem; text-align: center; z-index: 1000;
}
.fade-enter-active, .fade-leave-active { transition: opacity .5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
