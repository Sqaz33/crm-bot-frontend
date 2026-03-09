<template>
  <div 
    class="bg-white border border-neutral-200 rounded-3xl p-4 flex flex-col gap-3 transition-all"
    :class="{ 'border-orange-500 shadow-[-3px_0_0_0_#F3A950]': isSelected }"
  >
    <!-- Название услуги -->
    <div class="font-semibold leading-tight text-neutral-900 overflow-hidden text-ellipsis line-clamp-2">
      {{ service.name }}
    </div>

    <!-- Кнопка подробнее, цена и крестик -->
    <div class="flex items-center justify-between gap-3">
      <!-- Кнопка подробнее -->
      <button 
        class="px-4 py-2 rounded-full text-sm font-medium text-brand-400 bg-transparent border border-brand-400 cursor-pointer transition-all flex-shrink-0 hover:bg-brand-100"
        @click="$emit('show-details', service)"
        type="button"
      >
        Подробнее
      </button>

      <!-- Цена и крестик -->
      <div class="inline-flex items-center gap-3 ml-auto flex-shrink-0">
        <div class="font-semibold whitespace-nowrap">{{ service.price.toLocaleString('ru-RU') }} ₽</div>
        
        <button
          class="w-9 h-9 rounded-lg inline-flex items-center justify-center text-3xl border-2 transition-colors flex-shrink-0 cursor-pointer"
          :class="isSelected ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-brand-500 border-brand-500 hover:brightness-95'"
          @click="$emit('toggle', service)"
          type="button"
        >
          <span v-if="isSelected" class="-mt-1">×</span>
          <span v-else class="-mt-1">＋</span>
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
