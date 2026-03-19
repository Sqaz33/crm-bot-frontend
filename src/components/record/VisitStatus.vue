<template>
  <div :class="['flex items-center gap-3', { 'overflow-hidden': compact }]">
    <div
      :class="[
        'rounded-full flex items-center justify-center flex-shrink-0',
        sizeClasses,
        statusConfig.bgClass
      ]"
    >
      <img
        :src="statusConfig.icon"
        :alt="statusConfig.title"
        :class="iconSizeClasses"
      />
    </div>
    <div :class="{ 'min-w-0': compact }">
      <div :class="titleClasses">
        {{ statusConfig.title }}
      </div>
      <div v-if="statusConfig.subtitle" :class="subtitleClasses">
        {{ statusConfig.subtitle }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import crossIcon from '../../assets/crossIcon.svg'
import checkmarkIcon from '../../assets/checkmarkIcon.svg'
import clockIcon from '../../assets/clockIcon.svg'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  showSubtitle: {
    type: Boolean,
    default: true
  }
})

const statusMap = {
  waiting: {
    icon: clockIcon,
    bgClass: 'bg-yellow-500',
    title: 'Ожидание',
    subtitle: 'Ждем вас в салоне'
  },
  confirmed: {
    icon: checkmarkIcon,
    bgClass: 'bg-blue-500',
    title: 'Подтверждено',
    subtitle: 'Ждем вас в салоне'
  },
  canceled: {
    icon: crossIcon,
    bgClass: 'bg-pink-500',
    title: 'Отменено',
    subtitle: 'Запись отменена'
  },
  missing: {
    icon: crossIcon,
    bgClass: 'bg-neutral-500',
    title: 'Пропущено',
    subtitle: 'Визит пропущен'
  },
  success: {
    icon: checkmarkIcon,
    bgClass: 'bg-green-500',
    title: 'Оплачено',
    subtitle: 'Визит прошел успешно'
  }
}

const statusConfig = computed(() => {
  return statusMap[props.status] || {
    icon: clockIcon,
    bgClass: 'bg-neutral-300',
    title: 'Статус неизвестен',
    subtitle: ''
  }
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-8 h-8 p-2',
    lg: 'w-10 h-10 p-2'
  }
  return sizes[props.size]
})

const iconSizeClasses = computed(() => {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  return sizes[props.size]
})

const titleClasses = computed(() => {
  if (props.compact) {
    return 'font-semibold text-neutral-800 text-sm leading-tight'
  }
  return 'font-semibold text-neutral-800 text-sm md:text-[15px] leading-tight'
})

const subtitleClasses = computed(() => {
  if (props.compact) {
    return 'text-neutral-500 text-[11px] leading-tight'
  }
  return 'text-neutral-500 text-xs md:text-sm leading-tight'
})
</script>
