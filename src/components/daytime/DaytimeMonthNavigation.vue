<template>
  <div class="flex items-center justify-between border-b border-neutral-200 bg-neutral-100 px-4 py-3 md:px-6 md:py-4">
    <button
      type="button"
      class="rounded-md px-2 py-1 text-sm font-semibold text-brand-500 transition hover:text-[#3D5DD4]"
      @click="$emit('prev')"
    >
      {{ prevMonthName }}
    </button>

    <div class="rounded-xl bg-brand-100 px-4 py-1.5 text-base font-bold text-neutral-900 md:bg-transparent md:px-0 md:py-0 md:font-semibold md:text-lg">
      {{ monthTitle }}
    </div>

    <button
      type="button"
      class="rounded-md px-2 py-1 text-sm font-semibold text-brand-500 transition hover:text-[#3D5DD4]"
      @click="$emit('next')"
    >
      {{ nextMonthName }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  prevMonthName: {
    type: String,
    required: true
  },
  monthTitle: {
    type: String,
    required: true
  },
  nextMonthName: {
    type: String,
    required: true
  }
})

defineEmits(['prev', 'next'])
</script>
