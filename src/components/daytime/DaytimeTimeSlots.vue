<template>
  <section
    v-if="selectedDate"
    class="border-t border-neutral-200 bg-neutral-100 px-3 py-3 md:px-6 md:py-6"
  >
    <h3
      class="mb-3 border-b border-neutral-200 pb-2 text-sm font-bold tracking-wide text-neutral-500 md:mb-6 md:text-base md:font-semibold md:tracking-normal md:text-neutral-900"
    >
      Выберите время начала
    </h3>

    <div
      v-if="isLoading"
      class="flex items-center justify-center py-10 md:py-14"
    >
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
    </div>

    <div
      v-else-if="!hasSlots"
      class="py-4 text-center text-sm font-semibold uppercase tracking-wider text-neutral-300"
    >
      Нет доступного времени
    </div>

    <template v-else>
      <div
        v-for="section in sections"
        :key="section.key"
        class="mb-3 last:mb-0 md:mb-5"
      >
        <div class="mb-2 text-sm font-semibold text-neutral-600">
          {{ section.label }}
        </div>

        <div class="grid grid-cols-3 gap-2.5 md:flex md:flex-wrap md:gap-2">
          <button
            v-for="slot in section.slots"
            :key="slot"
            type="button"
            :class="[
              'w-full rounded-[14px] border-2 border-brand-500 px-2 py-2.5 text-sm font-bold leading-none transition md:min-w-[70px] md:w-auto md:rounded-lg md:border-[1.5px] md:px-4 md:py-2.5 md:text-[15px] md:font-medium',
              slot === selectedTime ? 'bg-brand-500 text-white' : 'bg-white text-neutral-900 hover:bg-brand-100 md:text-brand-500'
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
          class="r_button"
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
