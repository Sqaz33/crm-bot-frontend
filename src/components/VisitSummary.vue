<template>
  <div class="space-y-3">
    <!-- Date and Time Card (separate component) -->
    <DateTimeCard 
      :date="summary.rawDate"
      :time="summary.time"
      :day="dateComponents.day"
      :month="dateComponents.month"
      :weekday="dateComponents.weekday"
    />

    <!-- Staff + Service Combined Card -->
    <div v-if="summary.staff || summary.service" class="bg-white rounded-3xl p-4 shadow-sm">
      <!-- Staff Info -->
      <div v-if="summary.staff" class="flex items-center gap-3">
        <img 
          v-if="summary.staff.photo" 
          :src="summary.staff.photo" 
          class="w-12 h-12 rounded-full object-cover bg-neutral-100"
          alt="Фото специалиста"
        />
        <div v-else class="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="min-w-0">
          <div class="font-bold text-neutral-900">{{ summary.staff.name }}</div>
          <div class="text-sm text-neutral-500">{{ summary.staff.specialization }}</div>
        </div>
      </div>

      <!-- Gray Divider -->
      <div v-if="summary.staff && summary.service" class="border-t border-neutral-200 my-4"></div>

      <!-- Service Info -->
      <div v-if="summary.service" class="grid grid-cols-[1fr_auto] gap-y-1.5 gap-x-3">
        <div class="font-semibold text-neutral-900">{{ summary.service.name }}</div>
        <div class="font-bold text-neutral-900">{{ summary.service.price.toLocaleString('ru-RU') }} ₽</div>
        <div class="text-neutral-500 text-sm">{{ summary.service.duration }} мин</div>
        <div></div>
      </div>
    </div>

    <!-- Total Block -->
    <div v-if="summary.service" class="flex justify-between items-center bg-brand-100 rounded-xl p-3 font-bold">
      <span>Итого к оплате:</span>
      <span class="text-brand-500">{{ summary.service.price.toLocaleString('ru-RU') }} ₽</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DateTimeCard from './DateTimeCard.vue'
import { parseDateComponents } from '../utils/dateFormatters'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
    default: () => ({
      rawDate: '',
      date: '',
      time: '',
      staff: null,
      service: null
    })
  }
})

const dateComponents = computed(() => parseDateComponents(props.summary.rawDate))
</script>