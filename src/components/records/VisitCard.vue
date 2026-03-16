<template>
  <div
    :class="[
      'bg-white rounded-xl shadow-card transition-all duration-200',
      hasPrice
        ? 'p-3 md:p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5'
        : 'p-3 md:p-4 cursor-default'
    ]"
    @click="goToVisit"
  >
    <div class="flex items-start gap-3 mb-2.5 md:mb-3">
      <Avatar :name="visit.staff.name" size="sm" class="md:size-normal" />

      <div class="flex-1 min-w-0">
        <div class="font-semibold text-neutral-800 text-sm md:text-base leading-tight mb-0.5">
          {{ visit.staff.name }}
        </div>
        <div class="text-neutral-600 text-xs md:text-sm leading-tight">
          {{ visit.staff.specializations.join(", ") }}
        </div>
      </div>
    </div>

    <div class="text-neutral-500 text-xs md:text-sm mb-2">
      {{ formatDateShort(visit.visit_date_time) }}, {{ formatTimeOnly(visit.visit_date_time) }}
    </div>

    <div class="border-t border-neutral-200 mb-2.5 md:mb-3"></div>

    <div class="flex justify-between items-start gap-3">
      <div class="flex gap-2 items-start min-w-0">
        <div
          :class="[
            'w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 p-1.5',
            statusInfo.bgClass
          ]"
        >
          <img
            :src="statusInfo.icon"
            :alt="statusInfo.title"
            class="w-3.5 h-3.5 md:w-4 md:h-4"
          />
        </div>

        <div class="flex flex-col min-w-0 leading-tight">
          <span class="font-semibold text-neutral-800 text-sm md:text-[15px]">
            {{ statusInfo.title }}
          </span>
          <div class="text-neutral-500 text-[11px] md:text-xs">
            {{ statusInfo.subtitle }}
          </div>
        </div>
      </div>

      <!-- Цена -->
      <div class="font-medium text-neutral-800 text-sm md:text-base whitespace-nowrap flex-shrink-0 leading-tight">
        {{ hasPrice ? `${visit.service.price} ₽` : "-" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDateShort, formatTimeOnly } from '../../utils/dateFormatters'
import crossIcon from '../../assets/crossIcon.svg'
import checkmarkIcon from '../../assets/checkmarkIcon.svg'
import clockIcon from '../../assets/clockIcon.svg'
import Avatar from '../staff/Avatar.vue'

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

const hasPrice = computed(() => {
  return props.visit?.service?.price !== null && props.visit?.service?.price !== undefined
})

const statusMap = computed(() => ({
  waiting: {
    icon: clockIcon,
    bgClass: 'bg-yellow-400',
    title: 'Ожидание',
    subtitle: props.isOld ? 'Запись просрочена' : 'Ждем вас в салоне'
  },
  confirmed: {
    icon: checkmarkIcon,
    bgClass: 'bg-blue-400',
    title: 'Подтверждено',
    subtitle: props.isOld ? 'Запись просрочена' : 'Ждем вас в салоне'
  },
  missing: {
    icon: crossIcon,
    bgClass: 'bg-pink-400',
    title: 'Не оплачено',
    subtitle: 'Визит отменен / клиент не пришел'
  },
  success: {
    icon: checkmarkIcon,
    bgClass: 'bg-green-400',
    title: 'Оплачено',
    subtitle: 'Визит прошел успешно'
  }
}))

const statusInfo = computed(() => {
  return (
    statusMap.value[props.visit.status] || {
      icon: clockIcon,
      bgClass: 'bg-neutral-300',
      title: 'Статус неизвестен',
      subtitle: ''
    }
  )
})

function goToVisit() {
  if (!hasPrice.value) return

  router.push({
    name: 'record',
    params: { id: props.visit.id },
    query: { isOld: props.isOld.toString() }
  })
}
</script>