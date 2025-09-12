<template>
  <div>
    <transition name="fade">
      <div v-if="authError" class="auth-error-banner">{{ errorText }}</div>
    </transition>

    <div v-if="loading" class="loading-container">Загрузка...</div>

    <div v-else>
      <!-- Мягкий режим: если токена нет и мы вне Telegram — покажем подсказку -->
      <div v-if="!store.accessToken && !isInTelegram && !hasInitData" class="dev-hint">
        <p>Вы открыли приложение вне Telegram. Для авторизации нужно запустить WebApp в Telegram.</p>
        <p v-if="allowBrowser">DEV-режим включён: вы можете работать без авторизации.</p>
        <button v-if="hasInitData" @click="retryLogin">Повторить авторизацию</button>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loginViaTelegram } from './api/auth'
import { parseTelegramLaunchData, getInitDataString } from './utils/telegram'
import { useAuthStore } from './stores/auth'

// локальные черновики (LS) — профиль и визит
const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'

const loading   = ref(true)
const authError = ref(false)
const errorText = ref('Ошибка авторизации. Пожалуйста, попробуйте ещё раз.')
const router    = useRouter()
const store     = useAuthStore()

const isInTelegram = computed(() => !!window.Telegram?.WebApp)
const allowBrowser = import.meta?.env?.VITE_ALLOW_BROWSER === '1'

// есть ли init_data где-либо (hash/query/WebApp)
const hasInitData = computed(() => !!getInitDataString())

const form = reactive({ firstName:'', lastName:'', middleName:'', phone:'', email:'' })

function saveVisit(silent = false) {
  const visitData = { staff_id:'', services_id:'', visit_time:{ start_time:'' }, comment:'' }
  localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
  if (!silent) console.log('[App] Visit draft saved:', visitData)
}

function saveProfile(silent = false) {
  const profileData = {
    firstName: form.firstName, lastName: form.lastName,
    middleName: form.middleName, phone: form.phone, email: form.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  if (!silent) console.log('[App] Profile (local) saved:', profileData)
}

async function doTelegramLogin() {
  const initStr = getInitDataString()
  if (!initStr) {
    throw new Error('init_data отсутствует')
  }
  console.log('[App] init_data length:', initStr.length, 'hash?=', initStr.includes('hash='))

  const { data } = await loginViaTelegram(initStr) // ожидаем { access_token }
  const access = data?.access_token
  if (!access) throw new Error('access_token отсутствует в ответе /auth/telegram/login')

  store.setAccess(access) // память + sessionStorage
}

async function initAuthAndProfile() {
  try {
    // Черновики локально
    saveVisit(true)

    // Пытаемся восстановить токен из sessionStorage
    store.initFromSession()

    // Если токена нет — пробуем авторизоваться, но только если есть init_data
    if (!store.accessToken) {
      if (hasInitData.value) {
        await doTelegramLogin()
      } else if (!isInTelegram.value && !allowBrowser) {
        // Вне Telegram и init_data нет — мягко сообщим, но не падаем
        throw new Error('Откройте приложение внутри Telegram для авторизации.')
      }
      // Если allowBrowser=1 — разрешаем работу без авторизации (для DEV)
    }

    // Автоподстановка имени в локальный профиль из tgData (не на сервер)
    const { tgData } = parseTelegramLaunchData()
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''
    if (user.id && store.setTelegramId) store.setTelegramId(user.id)

    // Подхват локально сохранённых полей
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
    else                     errorText.value = e?.message || 'Ошибка авторизации.'
    authError.value = true
  } finally {
    loading.value = false
    setTimeout(() => { authError.value = false }, 1500)
  }
}

async function retryLogin() {
  authError.value = false
  errorText.value = ''
  try {
    await doTelegramLogin()
  } catch (e) {
    console.error('[App] retryLogin:', e)
    errorText.value = e?.message || 'Авторизация не удалась.'
    authError.value = true
  }
}

onMounted(initAuthAndProfile)
</script>

<style scoped>
.loading-container{ text-align:center; margin:2rem 0; font-size:1.1rem; }
.auth-error-banner{
  position:fixed; top:0; left:0; right:0;
  background:#e53935; color:#fff; padding:1rem; text-align:center; z-index:1000;
}
.fade-enter-active,.fade-leave-active{ transition:opacity .5s; }
.fade-enter-from,.fade-leave-to{ opacity:0; }

.dev-hint{
  margin: 1rem auto; max-width: 720px;
  background: #fff3cd; color: #7a5d00;
  border: 1px solid #ffeeba; border-radius: 8px;
  padding: 1rem;
}
.dev-hint button{
  margin-top: .5rem; padding: .5rem .9rem;
  border: none; border-radius: 6px; cursor: pointer;
  background:#2F80EC; color:#fff; font-weight:600;
}
</style>
