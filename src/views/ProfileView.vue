<template>
  <div class="min-h-screen bg-neutral-100 py-8">
    <div class="container mx-auto px-4">
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
  name: "",
  last_name: "",
  middle_name: "",
  phone: "",
  email: "",
})

async function loadMe() {
  try {
    const { data } = await api.get("/auth/me/", {
      headers: { Accept: "application/json" },
      withCredentials: true,
    })
    profileData.value = {
      name: data?.name ?? "",
      last_name: data?.last_name ?? "",
      middle_name: data?.middle_name ?? "",
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
      name: profileData.value.name,
      last_name: profileData.value.last_name,
      middle_name: profileData.value.middle_name,
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