<template>
  <div class="main-menu">
    <div class="salon-info">
      <div class="salon-name">{{ salon.name }}</div>
      <div class="salon-desc">{{ salon.description }}</div>
    </div>
    <nav class="menu">
      <div
        v-for="item in items"
        :key="item.label"
        class="menu-item"
        :class="{ active: activeItem === item.path }"
        @click="navigate(item)"
      >
        <span class="icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'

const router     = useRouter()
const route      = useRoute()
const activeItem = ref(route.path)

const salon = ref({ name: 'Загрузка...', description: '' })

onMounted(async () => {
  try {
    const { data } = await api.get('/salon/info')
    salon.value = { name: data.name, description: data.description }
  } catch {
    salon.value = { name: 'Ошибка загрузки', description: '' }
  }
})

watch(() => route.path, p => {
  activeItem.value = p
})

const items = [
  { label: 'Адрес',     path: '/address',   icon: '📍' },
  { label: 'Записи',    path: '/records',   icon: '🗓️' },
  { label: 'Поделиться', path: '/share',     icon: '🔗' },
  { label: 'Профиль',   path: '/profile',   icon: '👤' },
]

function navigate(item) {
  if (item.label === 'Адрес') {
    window.open('https://yandex.ru/maps/-/CHgMj6Yi', '_blank')  // заменить на адресс
  } else {
    activeItem.value = item.path
    router.push(item.path)
  }
}
</script>

<style scoped>
.main-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1f1f1f;
  color: white;
  padding: 0 1rem;
}

.salon-info {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.salon-name {
  font-size: 1rem;
  font-weight: bold;
}

.salon-desc {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

.menu {
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;

  padding: 0.5rem 1rem;
}

.menu-item {
 
  text-align: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-item.active {
  background-color: #007bff;
}

.menu-item:hover:not(.active) {
  background-color: rgba(0, 123, 255, 0.2);
}

.menu-item .icon {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
}

</style>