<template>
  <div
    class="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col gap-3 duration-200"
    :class="isSelected ? 'border-orange-400 shadow-[-3px_0_0_0_#ffa940]' : ''"
  >
 
    <div class="font-semibold leading-tight text-neutral-800 line-clamp-2">
      {{ service.name }}
    </div>

    <div class="flex items-center justify-between gap-3">
      
      <button
        class="px-4 py-2 text-sm font-medium border rounded-full border-brand-500 text-brand-500
              hover:bg-violet-50
              transition-colors duration-200"
        @click="$emit('show-details', service)"
        type="button"
        >
          Подробнее
        </button>

      <div class="flex items-center gap-3 ml-auto">
         
        <div class="font-semibold whitespace-nowrap">
          {{ service.price.toLocaleString('ru-RU') }} ₽
        </div>

        <button
          class="w-9 h-9 rounded-lg border-2 flex items-center justify-center
                transition-colors duration-300 leading-none
                ease-[cubic-bezier(0.4,0,0.2,1)]"
          :class="[
            isSelected
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-brand-500 border-brand-500'
          ]"
        @click="$emit('toggle', service)"
        >

          <transition name="icon" mode="out-in">
    
            <span
              v-if="!isSelected"
              key="plus"
              class="text-xl font-semibold"
            >
              +
            </span>

            <span
              v-else
              key="cross"
              class="text-xl font-semibold"
            >
              ×
            </span>

          </transition>

        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  service: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle', 'show-details'])
</script>