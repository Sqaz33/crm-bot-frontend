<template>
  <aside class="sidebar">
    <ul class="menu-list">
      <li
        v-for="item in items"
        :key="item.path"
        class="menu-item"
        :class="{ active: route.path === item.path }"
      >
        <RouterLink :to="item.path" class="menu-link">
          <span class="icon"></span>
          <span class="label">{{ item.label }}</span>
          <span class="arrow">›</span>
        </RouterLink>
      </li>
    </ul>
    <div class="back-button" @click="router.back()">
      <span class="arrow-back">‹</span> Назад
    </div>
  </aside>
</template>

<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { defineProps } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const route = useRoute()
const router = useRouter()
</script>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #f9fbfe;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin: 0.5rem 1rem;
  border-radius: 10px;
  overflow: hidden;
}

.menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  text-decoration: none;
  color: inherit;
}

.menu-item.active .menu-link {
  background-color: #e0e7ff;
  font-weight: bold;
}

.icon {
  width: 24px;
  height: 24px;
  background-color: #ddd;
  border-radius: 4px;
  margin-right: 1rem;
}

.label {
  flex: 1;
  margin-left: 0.5rem;
}

.arrow {
  color: #888;
  font-size: 1.2rem;
}

.back-button {
  margin-top: auto;
  padding: 1rem;
  font-size: 0.95rem;
  color: #333;
  background-color: #f1f1f1;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.arrow-back {
  font-size: 1.2rem;
}
</style>



<!-- пример использования
<script setup>
import SidebarMenu from '../components/LeftMainMenu.vue'

const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/about' },
]
</script>

<template>
  <div class="layout">
    <SidebarMenu :items="menuItems" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
}
</style> -->
