<template>
  <div class="min-h-screen bg-neutral-100 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-neutral-800 mb-8 text-center">Профиль</h1>

      <ProfileForm
        v-model="profileData"
        :saving="saving"
        @save="handleSave"
        ref="profileFormRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "../api"
import { logger } from '../utils/logger'
import ProfileForm from '../components/forms/ProfileForm.vue'

const saving = ref(false)
const profileFormRef = ref(null)

const profileData = ref({
  firstName: "",
  lastName: "",
  middleName: "",
  phone: "",
  email: "",
})

function splitFullName(full) {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: "", middleName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: "", middleName: "" }
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1], middleName: "" }
  return { firstName: parts[0], lastName: parts[1], middleName: parts.slice(2).join(" ") }
}

function joinFullName({ firstName, lastName, middleName }) {
  return [firstName, lastName, middleName].filter(Boolean).join(" ").replace(/\s+/g, " ").trim()
}

async function loadMe() {
  try {
    const { data } = await api.get("/auth/me/", {
      headers: { Accept: "application/json" },
      withCredentials: true,
    })
    const fio = splitFullName(data?.name)
    profileData.value = {
      ...fio,
      phone: data?.phone ?? "",
      email: data?.email ?? "",
    }
    logger.debug('ProfileView: [GET /auth/me] data', { data })
  } catch (e) {
    logger.error('ProfileView: [GET /auth/me] error', { error: e?.response ?? e })
  }
}

async function updateMeName(payload) {
  const cfg = { headers: { "Content-Type": "application/json" }, withCredentials: true }
  try {
    return await api.patch("/auth/me/", payload, cfg)
  } catch (e1) {
    const s = e1?.response?.status
    if (s !== 404 && s !== 405 && s !== 400) throw e1
    try {
      return await api.put("/auth/me/", payload, cfg)
    } catch (e2) {
      const s2 = e2?.response?.status
      if (s2 !== 404 && s2 !== 405) throw e2
      return await api.post("/auth/me/", payload, cfg)
    }
  }
}

async function handleSave() {
  saving.value = true
  try {
    const payload = { 
      name: joinFullName(profileData.value),
      email: profileData.value.email
    }
    logger.debug('ProfileView: [SAVE /auth/me] payload', { payload })
    await updateMeName(payload)
    await loadMe()
    logger.info('ProfileView: Данные обновлены')
    profileFormRef.value?.triggerToast()
  } catch (e) {
    logger.error('ProfileView: [SAVE /auth/me] error', { error: e?.response ?? e })
    const code = e?.response?.status
    if (code === 401) {
      logger.warn('ProfileView: Сессия истекла. Войдите заново.')
    } else if (code === 415) {
      logger.warn('ProfileView: Сервер не принял формат данных (415).')
    } else {
      logger.error('ProfileView: Не удалось сохранить.')
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadMe)
</script>