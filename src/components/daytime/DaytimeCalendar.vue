<template>
  <section class="bg-white px-3 py-3 md:px-6 md:py-5">
    <div class="mb-2 grid grid-cols-7 gap-1.5 text-center md:mb-3 md:gap-2">
      <div
        v-for="day in weekdayNames"
        :key="day"
        class="py-1 text-xs font-bold uppercase tracking-wide text-neutral-500"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1.5 md:gap-2">
      <button
        v-for="day in calendarDays"
        :key="day.date"
        type="button"
        :disabled="!canSelect(day)"
        :class="dayClasses(day)"
        @click="$emit('select-day', day)"
      >
        {{ day.dayNumber }}
      </button>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  weekdayNames: {
    type: Array,
    required: true
  },
  calendarDays: {
    type: Array,
    required: true
  },
  selectedDate: {
    type: String,
    default: null
  },
  loadingDay: {
    type: Boolean,
    default: false
  },
  unavailableDates: {
    type: Set,
    default: () => new Set()
  }
})

defineEmits(['select-day'])

const canSelect = day => {
  if (!day.isCurrentMonth) return false
  if (day.isPast) return false
  if (props.loadingDay) return false
  if (day.isUnavailable) return false
  return true
}

const dayClasses = day => {
  const selected = day.date === props.selectedDate
  const isPastCurrentMonth = day.isPast && day.isCurrentMonth
  const isUnavailableCurrentMonth = day.isUnavailable && day.isCurrentMonth

  return [
    'mx-auto aspect-square w-full max-w-12 rounded-xl border text-sm font-semibold transition md:max-w-[48px]',
    selected && 'border-brand-500 bg-brand-500 text-white',
    day.isToday && !selected && 'border-2 border-brand-500 bg-white text-brand-500',
    !selected && !day.isToday && day.isCurrentMonth && !isPastCurrentMonth && !isUnavailableCurrentMonth && 'border-neutral-200 bg-white text-neutral-900 hover:bg-brand-100',
    (!day.isCurrentMonth || isPastCurrentMonth) && 'cursor-not-allowed border-transparent bg-neutral-200 text-neutral-300',
    isUnavailableCurrentMonth && !selected && 'cursor-not-allowed border-transparent bg-neutral-200 text-neutral-300'
  ]
}
</script>
