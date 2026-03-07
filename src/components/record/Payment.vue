<template>
  <div v-if="!isOld" 
    class="mb-3 max-w-full transition-opacity duration-300" 
    :class="{ 'opacity-40 pointer-events-none': willCome || delete_ }"
  >
    <div class="text-neutral-500 font-semibold text-sm uppercase pl-3 mb-3">
      Оплата
    </div>
    <div class="bg-neutral-0 rounded-xl overflow-hidden max-w-full">
      <div class="flex items-center gap-2.5 px-3 py-3 w-full text-left opacity-55 pointer-events-none" tabindex="-1" aria-disabled="true">
        <span class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 text-black flex-shrink-0" aria-hidden="true">
          <img src="../../assets/castle.svg" alt="" class="max-w-[60%] h-auto" />
        </span>
        <span class="text-neutral-600 text-xs flex-1 truncate">
          Оплата наличными или картой в салоне
        </span>
        <span class="text-lg opacity-40">
          ›
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOld: {
    type: Boolean,
    required: true
  },
  willCome: {
    type: Boolean,
    required: true
  },
  delete_: {
    type: Boolean,
    required: true
  }
})
</script>

<style scoped>
</style>