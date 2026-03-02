<template>
  <div class="filter-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="filter-tab"
      :class="{ active: modelValue === tab.value }"
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

<style scoped>
.filter-tabs {
  display: flex;
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  min-height: 56px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Geometria', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #454558;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.filter-tab:hover {
  color: #666FE8;
}

.filter-tab:focus-visible {
  outline: 2px solid #666FE8;
  outline-offset: -2px;
}

.filter-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: transparent;
  border-radius: 2px;
  transition: background 0.2s ease;
}

.filter-tab.active::after {
  background: #666FE8;
}

@media (max-width: 768px) {
  .filter-tab {
    padding: 0 16px;
    min-height: 48px;
    font-size: 14px;
    line-height: 18px;
  }
}

@media (max-width: 412px) {
  .filter-tab {
    padding: 0 10px;
    min-height: 44px;
    font-size: 13px;
    line-height: 16px;
  }
}

@media (max-width: 360px) {
  .filter-tab {
    padding: 0 6px;
    min-height: 40px;
    font-size: 12px;
    line-height: 15px;
  }
}
</style>
