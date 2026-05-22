<template>
  <div>
    <ToastNotification
      v-model:open="showToast"
      :text="errorText"
      type="error"
      :duration="3500"
    />

    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <SpinnerSvg class="text-brand-300" />
    </div>

    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import ToastNotification from "./components/ui/ToastNotification.vue"
import { attachDebugInitSender } from "./debug/telegramDebug"
import { reactive, ref, onMounted } from "vue"
import { ensureSession } from "./auth/ensureSession"
import { getClientByTelegramId } from "./api/clients"
import { useAuthStore } from "./stores/auth"
import { writeVisit, DEFAULT_VISIT } from "./utils/visitStorage"
import { getInitData, getInitDataInfo, isUserAuthorized, extractUserFromInitData } from './utils/initData'
import { logger } from './utils/logger'
import SpinnerSvg from './components/ui/SpinnerLoad.vue'


const PROFILE_KEY = "profile_data"

const loading = ref(true)

const showToast = ref(false)
const errorText = ref("")

const store = useAuthStore()

let mountedOnce = false

// const form = reactive({
//   name: "",
//   last_name: "",
//   middle_name: "",
//   phone: "",
//   email: "",
// })


function checkMAX() {
  const isMAX = !window?.location?.hash?.includes("tgWebAppData");
  sessionStorage.setItem("max_frontend", isMAX) 
  logger.info('App checkMAX: значение isMAX', isMAX)
}

function saveVisit(silent = false) {
  writeVisit(DEFAULT_VISIT)
  if (!silent) logger.debug('Visit draft saved', DEFAULT_VISIT)
}

// function mergeSaveProfile(partial = {}, silent = false) {
//   let saved = {}
//   try {
//     saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}")
//   } catch {}

//   const val = (v) => (typeof v === "string" ? v.trim() : v)
//   const next = {
//     tg_id: partial.tg_id ?? saved.tg_id ?? null,
//     name: val(partial.name) ?? saved.name ?? form.name ?? "",
//     last_name: val(partial.last_name) ?? saved.last_name ?? form.last_name ?? "",
//     middle_name: val(partial.middle_name) ?? saved.middle_name ?? form.middle_name ?? "",
//     phone: val(partial.phone) ?? saved.phone ?? form.phone ?? "",
//     email: val(partial.email) ?? saved.email ?? form.email ?? "",
//   }

//   localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
//   if (!silent) logger.debug('Profile merged & saved', next)

//   form.name = next.name
//   form.last_name = next.last_name
//   form.middle_name = next.middle_name
//   form.phone = next.phone
//   form.email = next.email

//   if (next.tg_id && store.setTelegramId) {
//     try {
//       store.setTelegramId(next.tg_id)
//     } catch {}
//   }
// }

// async function fetchAndApplyClientByTelegramId(tg_id) {
//   if (tg_id === undefined || tg_id === null) return
//   try {
//     const { data } = await getClientByTelegramId(tg_id)
//     const { name, last_name, middle_name, telephone } = data || {}
//     mergeSaveProfile({ 
//       name: name || form.name, 
//       last_name: last_name || form.last_name, 
//       middle_name: middle_name || form.middle_name,
//       phone: telephone || form.phone, 
//       tg_id 
//     }, true)
//     logger.info('CRM client applied', { name, last_name, middle_name, telephone, tg_id })
//   } catch (e) {
//     const s = e?.response?.status
//     if (s !== 404) logger.warn('getClientByTelegramId failed', { status: s })
//   }
// }

// async function fetchAndApplyClientByMAX() {
//   const initData = getInitData()
//   const u = extractUserFromInitData(initData)
//   const { name, last_name, middle_name, telephone } = u || {}
//   mergeSaveProfile({ 
//     name: name || form.name, 
//     last_name: last_name || form.last_name, 
//     middle_name: middle_name || form.middle_name,
//     phone: telephone || form.phone
//   }, true)
// }

function showNoInitDataToast() {
  errorText.value = "Перезайдите через мини-приложение!"
  showToast.value = true
}

async function initAuthAndProfile() {
  if (mountedOnce) return
  mountedOnce = true

  try {
    const isMAX = sessionStorage.getItem("max_frontend") === 'true';

    saveVisit(true)

    const initDataInfo = getInitDataInfo()
    logger.info('App init: initData', {
      hasRaw: !!initDataInfo.raw,
      isAuthorized: initDataInfo.isAuthorized,
      hasUser: !!initDataInfo.user,
    })

    if (!initDataInfo.raw) {
      showNoInitDataToast()
      console.error("[App] NO_INIT_DATA: приложение открыто не из WebApp")
      return
    }

    // salon id 
    try {
      const usp = new URLSearchParams(initDataInfo.raw)
      const params = Object.fromEntries(usp.entries())
      const id = params?.start_param  
      if (!id && !isMAX) {  
        throw new Error('нет start_param в telegram init_data')
      } else if (id) {
        sessionStorage.setItem('SALON_ID', id) 
        logger.info('App init: salon_id сохранён', { salonId: id })
      } else {
        logger.info('App init: MAX приложение открыто не через inline-кнопку')
      }
    } catch (e) {
      logger.warn('App init: не удалось сохранить salon_id', { error: e.message })
      return
    }
    // login
    const me = await ensureSession()
    // mergeSaveProfile({ tg_id: me.telegram_id, phone: me.telephone }, true)
    logger.info('App init: авторизация успешна', { userId: me.id })

    // if (isMAX) 
    //   await fetchAndApplyClientByMAX()
    // else 
    //   await fetchAndApplyClientByTelegramId(me.telegram_id)
  } catch (e) {
    logger.error('App init: ошибка авторизации', { 
      error: e.message, 
      code: e?.code,
      status: e?.response?.status,
    })
    const status = e?.response?.status
    const detail = e?.response?.data?.detail
    if (e?.code === 'NO_INIT_DATA') {
      errorText.value = 'Приложение открыто не из Telegram WebApp: нет init_data.'
    } else if (status === 401 && /client not found/i.test(String(detail))) {
      errorText.value = 'Клиент не найден в CRM. Нужна привязка/создание клиента.'
    } else if (status === 400) {
      errorText.value = 'Некорректная подпись или бизнес-правило не выполнено.'
    } else if (status === 422) {
      errorText.value = 'Validation Error: проверьте корректность init_data.'
    } else if (status === 500) {
      errorText.value = 'Серверная ошибка при разборе init_data.'
    } else if (status === 401) {
      errorText.value = 'Сессия отсутствует: проверьте Set-Cookie (SameSite=None; Secure; Domain).'
    } else {
      errorText.value = e?.message || 'Ошибка авторизации.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  logger.info('App mounted')
  
  checkMAX()

  attachDebugInitSender()
  initAuthAndProfile()
})
</script>
