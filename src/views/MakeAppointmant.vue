<template>
  <div class="min-h-screen bg-neutral-100 px-4 pt-6">
    <div class="mx-auto w-full max-w-[420px]">
      <MenuList
        v-model="activeStep"
        :items="stepItems"
        @select="onSelectStep"
      />

      <button
        type="button"
        class="b_button mt-10"
        :disabled="!canSubmit"
        @click="openProfileModal"
      >
        Оформить запись
      </button>

      <div
        v-if="showProfileModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] px-4"
      >
        <div class="bg-white p-6 rounded-2xl w-full max-w-[500px] shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          <h3 class="text-neutral-800 text-2xl font-medium text-center mb-4">
            Проверьте данные
          </h3>

          <ProfileForm
            v-model="form"
            :saving="false"
            @save="confirmProfile"
          />

          <button
            type="button"
            @click="showProfileModal = false"
            class="b_button b_button--cancel mt-3"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { getRawVisit } from '../utils/visitStorage'
import { logger } from '../utils/logger'

import MenuList from '../components/ui/MenuList.vue' 
import ProfileForm from '../components/forms/ProfileForm.vue'


import servicesIcon from '../assets/servicesIcon.svg'
import staffIcon from '../assets/staffIcon.svg'
import calendarIcon from '../assets/calendarIcon.svg'
import { getService, getStaff } from '../utils/staffServiceCache'

const router = useRouter()
const route = useRoute()

const summary = ref({
  staffName: null,
  visitTime: null,
  totalPrice: null,
  staff_id: null,
  visit_time: null,
  services_id: []
})

const hasServices = computed(() =>
  Array.isArray(summary.value.services_id) && summary.value.services_id.length > 0
)
const hasStaff = computed(() => !!summary.value.staff_id)
const hasDateTime = computed(() => !!summary.value.visitTime)

const canSubmit = computed(() => hasServices.value && hasStaff.value && hasDateTime.value)

// активный пункт 
const activeStep = ref(route.name ?? null)
watch(
  () => route.name,
  (name) => { if (name) activeStep.value = name }
)

const servicesText = computed(() => {
  const p = summary.value.totalPrice
  if (p === null || p === undefined) return '—'
  return p > 0 ? `${p} ₽` : '0 ₽'
})

// Пункты меню: один блок 
const stepItems = computed(() => ([
  {
    key: 'services',
    label: `Услуги: ${servicesText.value}`,
    icon: servicesIcon,
    disabled: false,
    class: 'border-b border-neutral-200'
  },
  {
    key: 'choicestaff',
    label: `Сотрудник: ${summary.value.staffName || '—'}`,
    icon: staffIcon,
    disabled: !hasServices.value,
    class: 'border-b border-neutral-200'
  },
  {
    key: 'datetime',
    label: `Дата и время: ${summary.value.visitTime || '—'}`,
    icon: calendarIcon,
    disabled: !hasServices.value || !hasStaff.value
  }
]))

function onSelectStep(item) {
  if (item.disabled) return
  router.push({ name: item.key })
}

/* ===== Профиль ===== */
const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

const showProfileModal = ref(false)

async function readProfile() {
  try {
    const response = await api.get('/auth/me/')
    const profile = response.data
    return {
      firstName: profile.name?.split(' ')[0] || '',
      lastName: profile.name?.split(' ')[1] || '',
      middleName: profile.name?.split(' ')[2] || '',
      phone: profile.phone || '',
      email: profile.email || ''
    }
  } catch {
    return { firstName: '', lastName: '', middleName: '', phone: '', email: '' }
  }
}

async function writeProfile(obj) {
  try {
    await api.patch('/auth/me/', obj)
  } catch (error) {
    logger.error('BookingView: ошибка при сохранении профиля', { error: error?.message || String(error) })
  }
}

function openProfileModal() {
  if (!canSubmit.value) return
  showProfileModal.value = true
}

function saveProfile() {
  const n = `${form.lastName} ${form.firstName} ${form.middleName}`.trim()
  const payload = { name: n, email: form.email }
  writeProfile(payload)
}

function confirmProfile() {
  saveProfile()
  showProfileModal.value = false
  router.push({ name: 'createvisit' })
}

/* ===== Summary ===== */
async function loadSummary() {
  const data = getRawVisit()
  if (!data) return

  const { staff_id, services_id = [], visit_time = {} } = data

  const visitTime = visit_time.start_time
    ? new Date(visit_time.start_time).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  let staffName = null
  if (staff_id) {
    try {
      // const { data: staff } = await api.get(`/staff/${staff_id}`)
      const staff = await getStaff(staff_id)
      staffName = staff.name
    } catch {
      staffName = '—'
    }
  }

  let totalPrice = null
  if (services_id.length) {
    try {
      const prices = await Promise.all(
        services_id.map(async (id) => {
          // const { data } = await api.get('/services/', { params: { service_id: id } })
          // return data[0]?.price || 0
          const data = await getService(id)
          return data?.price || 0
        })
      )
      totalPrice = prices.reduce((sum, p) => sum + p, 0)
    } catch {
      totalPrice = 0
    }
  } else {
    totalPrice = 0
  }

  summary.value = {
    staffName,
    visitTime,
    totalPrice,
    staff_id,
    visit_time,
    services_id
  }
}

onMounted(async () => {
  await loadSummary()

  const saved = await readProfile()
  form.firstName = saved.firstName ?? ''
  form.lastName = saved.lastName ?? ''
  form.middleName = saved.middleName ?? ''
  form.phone = saved.phone ?? ''
  form.email = saved.email ?? ''
})
</script>
