<template>
  <div 
    class="service-card"
    :class="{ 'selected': isSelected }"
  >
    <!-- Название услуги (сверху слева) -->
    <div class="svc-name">{{ service.name }}</div>

    <!-- Ниже: кнопка подробнее, цена и крестик -->
    <div class="svc-bottom">
      <!-- Кнопка подробнее (слева, с обводкой) -->
      <button 
        class="details-btn-outline"
        @click="$emit('show-details', service)"
        type="button"
      >
        Подробнее
      </button>

      <!-- Цена и крестик (справа) -->
      <div class="svc-right">
        <div class="svc-price">{{ service.price.toLocaleString('ru-RU') }} ₽</div>
        
        <button
          class="icon-btn"
          :class="isSelected ? 'danger' : 'primary'"
          @click="$emit('toggle', service)"
          type="button"
        >
          <span v-if="isSelected">×</span>
          <span v-else>＋</span>
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

<style scoped>
.service-card {
  background: white;
  border: 1px solid #EBEEF6;
  border-radius: 1.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.service-card.selected {
  border-color: #F3A950;
  box-shadow: -3px 0 0 0 #F3A950;
}

.svc-name {
  font-weight: 600;
  line-height: 1.25;
  color: #0F172A;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.svc-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.details-btn-outline {
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #818CF8;
  background: transparent;
  border: 1px solid #818CF8;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.details-btn-outline:hover {
  background: #E0E7FF;
}

.svc-right {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
  flex-shrink: 0;
}

.svc-price {
  font-weight: 600;
  white-space: nowrap;
}

.icon-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1;
  border: 2px solid var(--brand-500, #666FE8);
  color: var(--brand-500, #666FE8);
  background: white;
  flex-shrink: 0;
  cursor: pointer;
  transition: filter 0.2s;
}

.icon-btn.primary:hover {
  filter: brightness(0.95);
}

.icon-btn.danger {
  background: var(--brand-500, #666FE8);
  color: white;
  border-color: var(--brand-500, #666FE8);
}
</style>