<template>
  <nav class="menu">
    <div
      v-for="item in items"
      :key="item"
      class="menu-item"
      :class="{ active: activeItem === item }"
      @click="navigate(item)"
    >
      {{ item }}
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const items = ['Адрес', 'Записи', 'Поделиться', 'Профиль']
const activeItem = ref('Адрес')

const navigate = (item) => {
  activeItem.value = item
  const routes = {
    'Адрес': '/address',
    'Записи': '/records',
    'Поделиться': '/share',
    'Профиль': '/profile',
  }
  router.push(routes[item])
}
</script>

<style scoped>
.menu {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.menu-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.menu-item.active {
  background-color: #007bff;
  color: white;
}

.menu-item:hover:not(.active) {
  background-color: rgba(0, 123, 255, 0.1);
}
</style>
