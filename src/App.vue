<template>
  <div>
    <ToastNotification
      v-model:open="showToast"
      :text="errorText"
      type="error"
      :duration="3500"
    />

    <div v-if="loading" class="my-8 text-center text-[1.1rem] text-neutral-800">
      Загрузка...
    </div>

    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import ToastNotification from "./components/ToastNotification.vue"
import { attachDebugInitSender } from "./debug/telegramDebug"
import { reactive, ref, onMounted } from "vue"
import { ensureSession } from "./auth/ensureSession"
import { getClientByTelegramId } from "./api/clients"
import { useAuthStore } from "./stores/auth"
import { splitFullNameIfNeeded, getInitDataInfo } from "./utils/telegram"
import { writeVisit, DEFAULT_VISIT } from "./utils/visitStorage"

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
  if (!silent) console.log("[App] Visit draft saved:", DEFAULT_VISIT)
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
  if (!silent) console.log("[App] Profile merged & saved:", next)

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
    console.log("[App] CRM client applied →", { name, telephone, tg_id })
  } catch (e) {
    const s = e?.response?.status
    if (s !== 404) console.warn("[App] getClientByTelegramId failed:", e)
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

  
    try {
      const usp = new URLSearchParams(initDataInfo.raw)
      const params = Object.fromEntries(usp.entries())
      const id = params?.start_param
      if (!id) throw new Error("нет start_param в telegram init_data")
      sessionStorage.setItem("SALON_ID", id)
    } catch (e) {
      console.log("[App] SALON_ID parse:", e?.message || e)
    }

    console.group("[App] InitData Information")
    console.log("Available:", !!initDataInfo.raw)
    console.log("Raw length:", initDataInfo.raw?.length || 0)
    console.log("Is user authorized:", initDataInfo.isAuthorized)
    console.log("User data:", initDataInfo.user)
    console.log("Auth date:", initDataInfo.auth_date_formatted)
    console.log("Has hash:", !!initDataInfo.hash)
    console.groupEnd()

    if (!initDataInfo.raw) {
      showNoInitDataToast()
      console.error("[App] NO_INIT_DATA: приложение открыто не из Telegram WebApp")
      return
    }

    const me = await ensureSession()
    mergeSaveProfile({ tg_id: me.telegram_id, phone: me.telephone }, true)

    await fetchAndApplyClientByTelegramId(me.telegram_id)
  } catch (e) {
    console.error("[App] Ошибка авторизации (только в консоль):", e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log("[App] Starting application with Telegram WebApp integration")
  attachDebugInitSender()
  initAuthAndProfile()
})
</script>
