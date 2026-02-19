<template>
  <div>
    <ToastNotification
      v-model:open="showToast"
      :text="errorText"
      type="error"
      :duration="3500"
    />

    <div v-if="loading" class="loading">
  <SpinnerSvg style="color: var(--brand)" />
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
import { splitFullNameIfNeeded, getInitDataInfo, isUserAuthorized } from './utils/telegram'
import { logger } from './utils/logger'
import SpinnerSvg from './components/ui/SpinnerLoad.vue'


const PROFILE_KEY = "profile_data"

const loading = ref(true)

const showToast = ref(false)
const errorText = ref("")

const store = useAuthStore()

let mountedOnce = false

const form = reactive({
  firstName: "",
  lastName: "",
  middleName: "",
  phone: "",
  email: "",
})

function saveVisit(silent = false) {
  writeVisit(DEFAULT_VISIT)
  if (!silent) logger.debug('Visit draft saved', DEFAULT_VISIT)
}

function mergeSaveProfile(partial = {}, silent = false) {
  let saved = {}
  try {
    saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}")
  } catch {}

  const val = (v) => (typeof v === "string" ? v.trim() : v)
  const next = {
    tg_id: partial.tg_id ?? saved.tg_id ?? null,
    firstName: val(partial.firstName) ?? saved.firstName ?? form.firstName ?? "",
    lastName: val(partial.lastName) ?? saved.lastName ?? form.lastName ?? "",
    middleName: val(partial.middleName) ?? saved.middleName ?? form.middleName ?? "",
    phone: val(partial.phone) ?? saved.phone ?? form.phone ?? "",
    email: val(partial.email) ?? saved.email ?? form.email ?? "",
  }

  localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
  if (!silent) logger.debug('Profile merged & saved', next)

  form.firstName = next.firstName
  form.lastName = next.lastName
  form.middleName = next.middleName
  form.phone = next.phone
  form.email = next.email

  if (next.tg_id && store.setTelegramId) {
    try {
      store.setTelegramId(next.tg_id)
    } catch {}
  }
}

async function fetchAndApplyClientByTelegramId(tg_id) {
  if (tg_id === undefined || tg_id === null) return
  try {
    const { data } = await getClientByTelegramId(tg_id)
    const { name, telephone } = data || {}
    const namePatch = splitFullNameIfNeeded(name, {
      firstName: form.firstName,
      lastName: form.lastName,
    })
    mergeSaveProfile({ ...namePatch, phone: telephone || form.phone, tg_id }, true)
    logger.info('CRM client applied', { name, telephone, tg_id })
  } catch (e) {
    const s = e?.response?.status
    if (s !== 404) logger.warn('getClientByTelegramId failed', { status: s })
  }
}

function showNoInitDataToast() {
  errorText.value = "Перезайдите через телеграмм!"
  showToast.value = true
}

async function initAuthAndProfile() {
  if (mountedOnce) return
  mountedOnce = true

  try {
    saveVisit(true)

    const initDataInfo = getInitDataInfo()
    logger.info('App init: initData', {
      hasRaw: !!initDataInfo.raw,
      isAuthorized: initDataInfo.isAuthorized,
      hasUser: !!initDataInfo.user,
    })

  
    try {
      const usp = new URLSearchParams(initDataInfo.raw)
      const params = Object.fromEntries(usp.entries())
      const id = params?.start_param  
      if (!id) {  
        throw new Error('нет start_param в telegram init_data')
      }
      sessionStorage.setItem('SALON_ID', id) 
      logger.info('App init: salon_id сохранён', { salonId: id })
    } catch (e) {
      logger.warn('App init: не удалось сохранить salon_id', { error: e.message })
    }

    if (!initDataInfo.raw) {
      showNoInitDataToast()
      console.error("[App] NO_INIT_DATA: приложение открыто не из Telegram WebApp")
      return
    }

    const me = await ensureSession()
    mergeSaveProfile({ tg_id: me.telegram_id, phone: me.telephone }, true)
    logger.info('App init: авторизация успешна', { userId: me.id })

    await fetchAndApplyClientByTelegramId(me.telegram_id)
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
    authError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  logger.info('App mounted')
  
  attachDebugInitSender()
  initAuthAndProfile()
})
</script>
