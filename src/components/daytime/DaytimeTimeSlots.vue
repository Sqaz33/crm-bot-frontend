<template>
  <section
    v-if="selectedDate"
    class="border-t border-[#E8EEF5] bg-[#FAFBFC] px-3 py-3 md:px-6 md:py-6"
  >
    <h3
      class="mb-3 border-b border-[#E6EAF2] pb-2 text-sm font-bold tracking-wide text-[#8D99AD] md:mb-6 md:text-base md:font-semibold md:tracking-normal md:text-[#1A2233]"
    >
      Выберите время начала
    </h3>

    <div
      v-if="isLoading"
      class="flex items-center justify-center py-10 md:py-14"
    >
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#C8D2FF] border-t-[#6C7CF7]" />
    </div>

    <div
      v-else-if="!hasSlots"
      class="py-4 text-center text-sm font-semibold uppercase tracking-wider text-[#C4CDD5]"
    >
      Нет доступного времени
    </div>

    <template v-else>
      <div
        v-for="section in sections"
        :key="section.key"
        class="mb-3 last:mb-0 md:mb-5"
      >
        <div class="mb-2 text-sm font-semibold text-[#6B7688]">
          {{ section.label }}
        </div>

        <div class="grid grid-cols-3 gap-2.5 md:flex md:flex-wrap md:gap-2">
          <button
            v-for="slot in section.slots"
            :key="slot"
            type="button"
            :class="[
              'w-full rounded-[14px] border-2 border-[#5C6CF0] px-2 py-2.5 text-sm font-bold leading-none transition md:min-w-[70px] md:w-auto md:rounded-lg md:border-[1.5px] md:px-4 md:py-2.5 md:text-[15px] md:font-medium',
              slot === selectedTime ? 'bg-[#5C6CF0] text-white' : 'bg-white text-[#2B3240] hover:bg-[#F0F4FF] md:text-[#5073F0]'
            ]"
            @click="$emit('select-time', slot)"
          >
            {{ formatTime(slot) }}
          </button>
        </div>
      </div>

      <div class="mt-3 flex justify-center md:mt-6">
        <button
          type="button"
          class="w-full max-w-[400px] rounded-xl bg-[#5073F0] px-6 py-3.5 text-base font-semibold text-white transition enabled:hover:bg-[#3D5DD4] disabled:cursor-not-allowed disabled:bg-[#9FAADE]"
          :disabled="!selectedTime"
          @click="$emit('book')"
        >
          Занять
        </button>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedDate: {
    type: String,
    default: null
  },
  freeSlots: {
    type: Array,
    required: true
  },
  morningSlots: {
    type: Array,
    required: true
  },
  afternoonSlots: {
    type: Array,
    required: true
  },
  eveningSlots: {
    type: Array,
    required: true
  },
  selectedTime: {
    type: String,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  formatTime: {
    type: Function,
    required: true
  }
})

defineEmits(['select-time', 'book'])

const sections = computed(() => {
  const result = [
    { key: 'morning', label: 'Утро', slots: props.morningSlots },
    { key: 'afternoon', label: 'День', slots: props.afternoonSlots },
    { key: 'evening', label: 'Вечер', slots: props.eveningSlots }
  ]

  return result.filter(section => section.slots.length)
})

const hasSlots = computed(() => sections.value.length > 0)
</script>
