<template>
  <div class="flex w-full bg-white rounded-[12px] overflow-x-auto scrollbar-hide">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="relative flex items-center justify-center
             px-2.5 py-0 min-h-11 text-[13px] leading-4
             sm:px-4 sm:min-h-12 sm:text-sm sm:leading-[18px]
             md:px-6 md:min-h-14 md:text-base md:leading-5
             bg-transparent border-none cursor-pointer
             font-medium text-neutral-800
             whitespace-nowrap shrink-0
             transition-colors duration-200
             hover:text-brand-500
             focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:-outline-offset-2
             after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0
             after:h-1 after:rounded-sm after:transition-colors after:duration-200
             after:bg-transparent"
      :class="{ 'after:!bg-brand-500': modelValue === tab.value }"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    default: () => [{ label: 'Все', value: 'all' }],
  },
  modelValue: {
    type: String,
    default: 'all',
  },
});

defineEmits(['update:modelValue']);
</script>
