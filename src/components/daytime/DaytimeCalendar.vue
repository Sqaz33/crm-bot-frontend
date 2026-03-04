<template>
  <section class="bg-white px-3 py-3 md:px-6 md:py-5">
    <div class="mb-2 grid grid-cols-7 gap-1.5 text-center md:mb-3 md:gap-2">
      <div
        v-for="day in weekdayNames"
        :key="day"
        class="py-1 text-xs font-bold uppercase tracking-wide text-[#8D99AD]"
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
  }
})

defineEmits(['select-day'])

const canSelect = day => day.isCurrentMonth && !day.isPast && !props.loadingDay

const dayClasses = day => {
  const selected = day.date === props.selectedDate
  const isPastCurrentMonth = day.isPast && day.isCurrentMonth

  return [
    'mx-auto aspect-square w-full max-w-12 rounded-xl border text-sm font-semibold transition md:max-w-[48px]',
    selected && 'border-[#5073F0] bg-[#5073F0] text-white',
    day.isToday && !selected && 'border-2 border-[#5073F0] bg-white text-[#5073F0]',
    !selected && !day.isToday && day.isCurrentMonth && !isPastCurrentMonth && 'border-[#E6EAF2] bg-white text-[#2B3240] hover:bg-[#E8EEF5]',
    (!day.isCurrentMonth || isPastCurrentMonth) && 'cursor-not-allowed border-transparent bg-[#EEF2F6] text-[#B7C0CC]'
  ]
}
</script>
