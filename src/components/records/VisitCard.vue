<template>
  <div
    class="bg-white rounded-xl shadow-card p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    @click="goToVisit"
  >
    <!-- Header with Staff Info -->
    <div class="flex justify-between items-start gap-4 mb-4">
      <img
        src="../assets/emptyAvatar.svg"
        alt="Staff avatar"
        class="w-12 h-12 rounded-full flex-shrink-0 object-cover"
      />
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-neutral-800 text-base mb-1">{{ visit.staff.name }}</div>
        <div class="text-neutral-600 text-sm line-clamp-2">
          {{ visit.staff.specializations.join(", ") }}
        </div>
      </div>
      <div class="text-right flex-shrink-0">
        <div class="font-semibold text-neutral-800 text-sm mb-1">
          {{ formatDateShort(visit.visit_date_time) }}
        </div>
        <div class="text-neutral-600 text-sm">
          {{ formatTimeOnly(visit.visit_date_time) }}
        </div>
      </div>
    </div>

    <!-- Service Info Grid -->
    <div class="grid grid-cols-3 gap-3 py-3 border-t border-b border-neutral-200 mb-4">
      <div>
        <div class="text-neutral-500 text-xs uppercase font-medium tracking-wide mb-2">
          Услуга
        </div>
        <div class="font-medium text-neutral-800 text-sm">
          {{ visit.service?.name || "Неизвестная услуга" }}
        </div>
      </div>
      <div class="text-center">
        <div class="text-neutral-500 text-xs uppercase font-medium tracking-wide mb-2">
          Количество
        </div>
        <div class="text-neutral-800 text-sm">1</div>
      </div>
      <div class="text-right">
        <div class="text-neutral-500 text-xs uppercase font-medium tracking-wide mb-2">
          Стоимость
        </div>
        <div class="font-semibold text-neutral-800 text-sm">
          {{ visit.service?.price != null ? `${visit.service.price} ₽` : "Неизвестно" }}
        </div>
      </div>
    </div>

    <!-- Status and Total Price -->
    <div class="flex justify-between items-start gap-4">
      <div class="flex gap-3 items-start">
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 p-2',
            statusClasses[visit.status].bgClass
          ]"
        >
          <img
            :src="statusClasses[visit.status].icon"
            :alt="statusClasses[visit.status].title"
            class="w-6 h-6"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="font-bold text-lg text-neutral-800 leading-tight">
            {{ statusClasses[visit.status].title }}
          </span>
          <div class="text-sm text-neutral-700">
            {{ statusClasses[visit.status].subtitle }}
          </div>
        </div>
      </div>
      <div class="font-semibold text-lg text-neutral-800 whitespace-nowrap flex-shrink-0">
        {{ visit.service?.price != null ? `${visit.service.price} ₽` : "Неизвестно" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { formatDateShort, formatTimeOnly } from '../../utils/dateFormatters'
import crossIcon from '../assets/crossIcon.svg'
import checkmarkIcon from '../assets/checkmarkIcon.svg'
import clockIcon from '../assets/clockIcon.svg'

const props = defineProps({
  visit: {
    type: Object,
    required: true
  },
  isOld: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const statusClasses = {
  waiting: {
    icon: clockIcon,
    bgClass: 'bg-yellow-400',
    title: "Ожидание",
    subtitle: "Ждем вас в салоне"
  },
  confirmed: {
    icon: checkmarkIcon,
    bgClass: 'bg-blue-400',
    title: "Подтверждено",
    subtitle: "Ждем вас в салон"
  },
  missing: {
    icon: crossIcon,
    bgClass: 'bg-pink-400',
    title: "Не оплачено",
    subtitle: "Визит отменен / клиент не пришел"
  },
  success: {
    icon: checkmarkIcon,
    bgClass: 'bg-green-400',
    title: "Оплачено",
    subtitle: "Визит прошел успешно"
  }
}

function goToVisit() {
  router.push({
    name: "record",
    params: { id: props.visit.id },
    query: { isOld: props.isOld.toString() }
  })
}
</script>
