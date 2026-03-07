<template>
  <div 
    v-if="!isOld" 
    class="mb-3 max-w-full transition-opacity duration-300" 
    :class="{ 'opacity-40 pointer-events-none': willCome || delete_ }"
  >
    <div class="bg-neutral-0 rounded-xl flex items-center justify-between gap-3 p-3 max-w-full">
      <div class="flex-1 min-w-0 overflow-hidden">
        <div class="text-neutral-800 font-semibold text-sm truncate">
          Я точно приду
        </div>
        <div class="text-neutral-500 text-xs truncate whitespace-nowrap">
          Нажимая, вы подтверждаете свой визит
        </div>
      </div>
      <label class="relative inline-block w-[46px] h-7 flex-shrink-0">
        <input
          type="checkbox"
          class="opacity-0 w-0 h-0"
          :checked="willCome"
          @change="onWillComeChange"
          :disabled="willCome || processing || delete_"
        />
        <span 
          class="absolute inset-0 bg-gray-300 rounded-full transition-colors duration-200 overflow-hidden"
          :class="{'bg-green-700': willCome}"
        >
        <span 
          class="absolute left-[3px] top-[3px] w-5.5 h-5.5 bg-neutral-0 rounded-full shadow-md transition-transform duration-200"
          :class="{'translate-x-[18px]': willCome}"
        >
        </span>
        </span>
      </label>
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
  processing: {
    type: Boolean,
    required: true
  },
  delete_: {
    type: Boolean,
    required: true
  },
  onWillComeChange: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
</style>