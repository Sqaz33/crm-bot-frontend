<template>
  <div class="p-[5px] px-3 pb-2.5 mb-3 overflow-hidden max-w-full md:p-2.5">
    <div class="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-[1px] items-center border-t border-b border-gray-200 py-2.5">
      <div class="text-neutral-800 font-semibold text-sm truncate col-span-2">
        {{ service.name }}
      </div>
      <div class="text-neutral-500 text-xs">
        {{ service.duration }} мин
      </div>
      <div class="text-neutral-800 font-semibold text-sm whitespace-nowrap">
        {{ service.price }} ₽
      </div>
    </div>
    <div class="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-0 items-center mt-3">
      <div class="text-neutral-800 font-semibold text-sm">Итого к оплате</div>
      <div class="text-neutral-800 font-semibold text-sm whitespace-nowrap">{{ service.price }} ₽</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
</style>