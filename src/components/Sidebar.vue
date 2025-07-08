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
    <div class="back-button" @click="goBack">
      <span class="arrow-back">‹</span> Назад
    </div>
  </aside>
</template>

<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const route = useRoute()
const router = useRouter()

function goBack() {
  router.back()
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
  font-family: var(--font-primary);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin: 0;
  overflow: hidden;
  padding: 2px 0 0 0;
}

.menu-list li:first-child {
  padding: 0;
}

.menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var( --color-light);
  text-decoration: none;
  color: inherit;
}

.menu-item.active .menu-link {
  background-color: #E6E6E6;
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
  position: sticky;
  bottom: 0;
  padding: 1rem;
  font-size: 0.95rem;
  color: #333;
  background-color: #fff;
  border-top: 1px solid #ccc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: bold;
}

.arrow-back {
  font-size: 1.2rem;
}
</style>


<!-- пример использования
<script setup>
import SidebarMenu from '../components/Sidebar.vue'

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

 -->
