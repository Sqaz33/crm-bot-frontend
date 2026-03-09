<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
      >
        <div class="relative w-full max-w-[600px] bg-white rounded-3xl overflow-hidden">
          <!-- Content -->
          <div class="flex flex-col py-12 px-8">
            <!-- Salon Card -->
            <div class="flex items-center gap-4 py-4 px-2 mb-8">
            <div class="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="32" fill="#666FE8"/>
                  <path d="M28.858 39.71V36.4899C28.858 35.6709 29.5608 35.0054 30.4316 34.9999H33.6215C34.4965 34.9999 35.2058 35.667 35.2058 36.4899V39.72C35.2056 40.4154 35.7958 40.9837 36.5349 41H38.6615C40.7815 41 42.5 39.3837 42.5 37.3899V28.2297C42.4887 27.4454 42.0971 26.7088 41.4367 26.2297L34.1638 20.7196C32.8897 19.7601 31.0784 19.7601 29.8043 20.7196L22.5633 26.2397C21.9004 26.7169 21.5082 27.4546 21.5 28.2397V37.3899C21.5 39.3837 23.2185 41 25.3385 41H27.4651C28.2226 41 28.8367 40.4224 28.8367 39.71" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M42.4133 44.0304H44.5399C46.6598 44.0304 48.3784 42.4141 48.3784 40.4203V33.5001C48.3671 32.7158 47.9755 31.9792 47.3151 31.5001L45.9275 30.25" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21.4651 44.0304H19.3385C17.2186 44.0304 15.5 42.4141 15.5 40.4203V33.5001C15.5113 32.7158 15.9029 31.9792 16.5633 31.5001L17.9509 30.25" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="flex flex-col">
                <div class="text-xl font-medium">{{ salonInfo.name }}</div>
                <div class="text-base font-normal">{{ salonInfo.description }}</div>
              </div>
            </div>

            <!-- Success Text -->
            <div class="text-xl leading-relaxed mb-8">
              <strong class="font-medium">{{ clientName }}</strong>, Вы успешно записаны на услугу <strong class="font-medium">{{ summary.service?.name }}</strong>
              <br />
              👤 К специалисту — <strong class="font-medium">{{ summary.staff?.name }}</strong>
              <br />
              ⏰ Дата и время: <strong class="font-medium">{{ summary.date }}, {{ summary.time }}</strong>
            </div>

            <!-- Buttons -->
            <div class="flex flex-col">
              <button
                type="button"
                @click="$emit('go-to-records')"
                class="h-14 bg-brand-500 text-white border-0 rounded-2.5 font-medium text-lg flex items-center justify-center mb-4 hover:bg-brand-400 transition-colors"
              >
                Мои записи
              </button>
              <button
                type="button"
                :disabled="!adminLink"
                @click="askAdmin"
                :class="[
                  'h-14 border-0 rounded-2.5 font-medium text-lg flex items-center justify-center transition-colors',
                  adminLink 
                    ? 'bg-neutral-200 text-neutral-800 cursor-pointer hover:bg-neutral-300' 
                    : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                ]"
              >
                Задать вопрос администратору
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  clientName: {
    type: String,
    default: ''
  },
  summary: {
    type: Object,
    required: true,
    default: () => ({ date: '', time: '', staff: null, service: null })
  },
  salonInfo: {
    type: Object,
    default: () => ({ name: 'Загрузка...', description: '' })
  }
})

const adminLink = ref(null)

const fetchSalonInfo = async () => {
  try {
    const response = await api.get('/salon/info')
    if (response.data?.admin_link) {
      adminLink.value = response.data.admin_link
    }
  } catch (error) {
    console.error('Failed to fetch salon info:', error)
  }
}

const askAdmin = () => {
  if (adminLink.value) {
    window.open(adminLink.value, '_blank')
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchSalonInfo()
  }
})

defineEmits(['update:modelValue', 'go-to-records'])
</script>
