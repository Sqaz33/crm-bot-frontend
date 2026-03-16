<template>
  <div class="p-[5px] px-3 pb-2.5 mb-3 overflow-hidden max-w-full md:p-2.5">
    <div class="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-[1px] items-center border-t border-b border-gray-200 py-2.5">
      <div class="text-neutral-800 font-semibold text-sm truncate col-span-2">
        {{ safeName }}
      </div>
      <div class="text-neutral-500 text-xs">
        {{ safeDuration }}
      </div>
      <div class="text-neutral-800 font-semibold text-sm whitespace-nowrap">
        {{ safePrice }}
      </div>
    </div>

    <div class="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-0 items-center mt-3">
      <div class="text-neutral-800 font-semibold text-sm">Итого к оплате</div>
      <div class="text-neutral-800 font-semibold text-sm whitespace-nowrap">
        {{ safePrice }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const safeName = computed(() => {
  return props.service?.name ?? '-'
})

const safeDuration = computed(() => {
  const duration = props.service?.duration
  return duration != null ? `${duration} мин` : '-'
})

const safePrice = computed(() => {
  const price = props.service?.price
  return price != null ? `${price} ₽` : '-'
})
</script>

