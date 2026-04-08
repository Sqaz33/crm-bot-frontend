<template>
  <div class="services-view">
    <div v-if="loading" class="flex justify-center py-6">
      <SpinnerSvg class="text-brand-500" />
    </div>

    <div v-else class="max-w-[720px] mx-auto px-3 pb-4">
      <h1 class="text-[22px] font-bold text-center mb-3">Выберите услуги</h1>

      <div class="flex flex-col gap-3">
        <section
          v-for="type in serviceTypes"
          :key="type.id"
          class="rounded-[14px] overflow-hidden"
          :class="[openType === type.id ? 'bg-neutral-100' : '']"
        >
          <button
            class="w-full px-4 py-3.5 rounded-[14px] flex items-center justify-between cursor-pointer font-bold text-base transition-colors"
            :class="[openType === type.id ? 'bg-brand-100' : 'bg-neutral-100']"
            @click="toggle(type.id)"
          >
            <span class="truncate overflow-hidden text-ellipsis">{{ type.name }}</span>
            <div class="inline-flex items-center gap-2.5">
              <span class="min-w-[34px] h-[34px] px-2.5 bg-white border border-neutral-200 rounded-full inline-flex items-center justify-center font-bold text-sm">
                {{ (servicesByType[type.id] || []).length }}
              </span>
              <span 
                class="text-xl transition-transform duration-150"
                :class="{ 'rotate-180': openType === type.id }"
              >
                ▾
              </span>
            </div>
          </button>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <ul
              v-show="openType === type.id"
              class="flex flex-col gap-2.5 mt-2.5 pb-0.5 list-none"
            >
              <li
                v-for="svc in servicesByType[type.id]"
                :key="svc.id"
              >
                <ServiceCard
                  :service="svc"
                  :is-selected="isSelected(svc.id)"
                  @toggle="toggleService"
                  @show-details="openServiceModal"
                />
              </li>
            </ul>
          </Transition>
        </section>
      </div>

      <div class="flex justify-center mt-6">
        <button
          class="flex items-center justify-between w-[90%] max-w-[400px] px-4 py-3 rounded-[0.625rem] whitespace-nowrap text-base font-semibold text-white bg-brand-500 hover:bg-[#4f54d8] disabled:bg-brand-300 disabled:cursor-not-allowed transition-colors duration-200"
          :disabled="!selectedServiceIds.length"
          @click="confirm"
        >
          <span class="truncate">Продолжить запись</span>
          <span class="shrink-0 ml-2 bg-white bg-opacity-30 px-3 py-1 rounded-xl text-neutral-800 text-sm">{{ totalPrice.toLocaleString('ru-RU') }} ₽</span>
        </button>
      </div>
    </div>

    <!-- Service Details Modal -->
    <ServiceModal
      :visible="serviceModalVisible"
      :service="selectedService"
      @close="closeServiceModal"
    >
      <template #footer>
        <button
          class="b_button w-full"
          @click="selectAndClose"
        >
          Выбрать услугу
        </button>
      </template>
    </ServiceModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'
import { readVisit, writeVisit } from '../utils/visitStorage'
import SpinnerSvg from '../components/ui/SpinnerLoad.vue'
import ServiceCard from '../components/services/ServiceCard.vue'
import ServiceModal from '../components/Modal/ServiceModal.vue'
import { logger } from '../utils/logger'

const router = useRouter()
const loading = ref(true)
const serviceTypes = ref([])
const services = ref([])
const openType = ref(null)
const selectedServiceIds = ref([])
const serviceModalVisible = ref(false)
const selectedService = ref(null)

const visit = ref({
  ...readVisit(),
  staff_id: null,
  services_id: [],
  visit_time: {}
})

onMounted(async () => {
  // Восстанавливаем выбранные услуги из localStorage
  const savedVisit = readVisit()
  if (Array.isArray(savedVisit.services_id) && savedVisit.services_id.length > 0) {
    selectedServiceIds.value = [...savedVisit.services_id]
    visit.value.services_id = [...savedVisit.services_id]
  }

  try {
    const { data: types } = await api.get('/services/types/')
    serviceTypes.value = types || []

    const params = {}
    if (visit.value.staff_id) params.staff_id = visit.value.staff_id

    const { data: all } = await api.get('/services/', { params })
    services.value = all || []
  } catch (error) {
    logger.error('ServicesView: error loading services', { error: error?.message || String(error) })
  } finally {
    loading.value = false
  }
})

// Слушаем изменения localStorage для синхронизации между вкладками
window.addEventListener('local-storage-changed', handleStorageChange)

function handleStorageChange() {
  const savedVisit = readVisit()
  if (Array.isArray(savedVisit.services_id)) {
    selectedServiceIds.value = [...savedVisit.services_id]
  }
}

onUnmounted(() => {
  window.removeEventListener('local-storage-changed', handleStorageChange)
})

const servicesByType = computed(() => {
  const map = {}
  serviceTypes.value.forEach(t => { map[t.id] = [] })
  services.value.forEach(s => {
    if (s.service_type_id && map[s.service_type_id]) {
      map[s.service_type_id].push(s)
    }
  })
  return map
})

const selectedServices = computed(() =>
  services.value.filter(s => selectedServiceIds.value.includes(s.id))
)

const totalPrice = computed(() =>
  selectedServices.value.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
)

function toggle(typeId) {
  openType.value = openType.value === typeId ? null : typeId
}

function isSelected(id) {
  return selectedServiceIds.value.includes(id)
}

function toggleService(svc) {
  const idx = selectedServiceIds.value.indexOf(svc.id)

  if (idx >= 0) {
    selectedServiceIds.value = []
  } else {
    selectedServiceIds.value = [svc.id]
  }

  visit.value.services_id = selectedServiceIds.value.length
    ? [selectedServiceIds.value[0]]
    : []
  writeVisit(visit.value, { syncCookie: true })
}

function openServiceModal(service) {
  selectedService.value = service
  serviceModalVisible.value = true
}

function closeServiceModal() {
  serviceModalVisible.value = false
  selectedService.value = null
}

function selectAndClose() {
  if (selectedService.value) {
    toggleService(selectedService.value)
  }
  closeServiceModal()
}

function confirm() {
  if (!selectedServiceIds.value.length) return
  visit.value.services_id = selectedServiceIds.value.length
    ? [selectedServiceIds.value[0]]
    : []
  writeVisit(visit.value, { syncCookie: true })
  router.push({ name: 'choicestaff' })
}
</script>