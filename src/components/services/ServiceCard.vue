<template>
  <div
    class="bg-white border border-neutral-200 rounded-3xl p-4 flex flex-col gap-3 transition-all"
    :class="{ 'border-orange-500 border-l-4 border-l-orange-500': isSelected }"
  >
    <!-- Название услуги -->
    <div class="font-semibold leading-tight text-neutral-900 overflow-hidden text-ellipsis line-clamp-2">
      {{ service.name }}
    </div>

    <!-- Нижняя строка: кнопка подробнее, цена и кнопка выбора -->
    <div class="flex items-center justify-between gap-3">
      <!-- Кнопка "Подробнее" -->
      <button 
        class="px-4 py-2 rounded-full text-sm font-medium text-brand-400 bg-transparent border border-brand-400 cursor-pointer transition-all flex-shrink-0 hover:bg-brand-100"
        @click="$emit('show-details', service)"
        type="button"
      >
        Подробнее
      </button>

      <!-- Цена и кнопка выбора -->
      <div class="inline-flex items-center gap-3 ml-auto flex-shrink-0">
        <div class="font-semibold whitespace-nowrap">{{ service.price.toLocaleString('ru-RU') }} ₽</div>
        
        <!-- Кнопка добавления/удаления -->
        <button
          class="w-9 h-9 rounded-lg inline-flex items-center justify-center text-2xl leading-none border-2 transition-colors cursor-pointer"
          :class="isSelected ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-brand-500 border-brand-500 hover:brightness-95'"
          @click="$emit('toggle', service)"
          type="button"
        >
          <span>{{ isSelected ? '×' : '+' }}</span>
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