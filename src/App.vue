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
import { useRouter } from 'vue-router'
import { loginViaTelegram, exchangeToken } from './api/auth'
import { parseTelegramLaunchData, getInitDataString } from './utils/telegram'

const VISIT_KEY = 'visit_data'
const PROFILE_KEY = 'profile_data'

const loading   = ref(true)
const authError = ref(false)
const errorText = ref('Ошибка авторизации. Пожалуйста, попробуйте ещё раз.')
const router    = useRouter()

const form = reactive({
  firstName:  '',
  lastName:   '',
  middleName: '',
  phone:      '',
  email:      ''
})

function saveVisit(silent = false) {
  const visitData = { staff_id:'', services_id:'', visit_time:{ start_time:'' }, comment:'' }
  localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
  document.cookie =
    `${VISIT_KEY}=${encodeURIComponent(JSON.stringify(visitData))}; path=/; max-age=${365*24*60*60}; Secure; SameSite=None`
  if (!silent) console.log('Visit data saved:', visitData)
}

function saveProfile(silent = false) {
  const profileData = {
    firstName: form.firstName, lastName: form.lastName,
    middleName: form.middleName, phone: form.phone, email: form.email
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData))
  document.cookie =
    `profile_user=${encodeURIComponent(JSON.stringify(profileData))}; path=/; max-age=${365*24*60*60}; Secure; SameSite=None`
  if (!silent) console.log('Profile manually saved:', profileData)
}

async function initAuthAndProfile() {
  try {
    saveVisit(true)

    const initStr = getInitDataString()
    if (!initStr) throw new Error('initData отсутствует')

    // 1) Новый маршрут: /auth/telegram/login { init_data }
    const loginRes = await loginViaTelegram(initStr)
    const tmp = loginRes.data?.temporary_token
    if (!tmp) throw new Error('temporary_token отсутствует')

    // 2) Обмен на обычные токены
    const exchRes = await exchangeToken(tmp)
    const { access_token, refresh_token } = exchRes.data || {}
    localStorage.setItem('access_token', access_token || '')
    localStorage.setItem('refresh_token', refresh_token || '')
    document.cookie = `access_token=${access_token || ''}; path=/; max-age=3600; SameSite=Lax`

    // 3) Распарсим user для автозаполнения
    const { tgData } = parseTelegramLaunchData()
    const user = tgData.user || {}
    form.firstName = user.first_name || ''
    form.lastName  = user.last_name  || ''

    // 4) Подхватим сохранённые доп. поля
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
    form.middleName = saved.middleName || ''
    form.phone      = saved.phone      || ''
    form.email      = saved.email      || ''

    // 5) Сохраняем профиль (cookie + LS)
    saveProfile(true)
  } catch (e) {
    console.error('Ошибка авторизации:', e)
    // точные сообщения по спецификации:
    const status = e?.response?.status
    if (status === 400) {
      errorText.value = 'Некорректная подпись или телефон не найден.'
    } else if (status === 422) {
      errorText.value = 'Validation Error: проверьте корректность init_data.'
    } else {
      errorText.value = 'Ошибка авторизации. Пожалуйста, попробуйте ещё раз.'
    }
    authError.value = true
  } finally {
    loading.value = false
    setTimeout(() => {
      authError.value = false
      router.replace({ path: '/' })
    }, 2000)
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
</style>
