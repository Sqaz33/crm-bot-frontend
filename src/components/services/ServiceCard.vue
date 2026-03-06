<template>
  <div
    class="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col gap-3"
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
          class="w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
          :class="[
            isSelected
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-brand-500 border-brand-500 hover:brightness-95'
          ]"
          @click="$emit('toggle', service)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            class="w-8 h-8 transition-transform duration-350"
            :class="isSelected ? 'rotate-45' : 'rotate-0'"
            fill="currentColor"
          >
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
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