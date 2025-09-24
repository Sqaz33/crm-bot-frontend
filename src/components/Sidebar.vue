<template>
  <aside 
    class="sidebar"
    :class="{ 'collapsed': !isOpen, 'empty': items.length === 0 }" 
  >
    <div v-if="items.length > 0">
      <ul class="menu-list">
        <li
          v-for="item in items"
          :key="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
        >
          <RouterLink :to="item.path" class="menu-link" @click="closeSidebar">
            <span class="icon"></span>
            <span class="label">{{ item.label }}</span>
            <span class="arrow">›</span>
          </RouterLink>
        </li>
      </ul>
      <div class="back-button" @click="goBack">
        <span class="arrow-back">‹</span>
        <span class="back-label"> Назад</span>
      </div>
    </div>
    
    <div v-else class="empty-state">
      Меню недоступно для этой страницы
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
  isOpen: {
    type: Boolean,
    default: false
  },
  sidebarButtonClicked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const route = useRoute()
const router = useRouter()

function goBack() {
  router.push('/')
  emit('close')
}

function closeSidebar() {
  emit('close')
}
</script>

<style scoped>
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #888;
}

.sidebar.empty {
  display: none; 
}

.sidebar-toggle {
  width: 50px;
  position: sticky;
  padding: 1rem 0.5rem;
  background-color: var( --color-light);
  border: none;
	border-bottom: 2px solid #fff;
  display: flex;
  align-items: left;
  cursor: pointer;
}

.sidebar-container {
  position: relative;
	display: flex;
	flex-direction: column;
	width: 220px;
	max-width: 220px;
}

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
	transition: width 0.3s ease;
	position: absolute;
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
	max-height: 50px;
	box-sizing: border-box;
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

.sidebar.collapsed {
  width: 50px; 
}

.sidebar.collapsed:hover {
  width: 220px;
}

/* Состояние свернутого сайдбара */
.sidebar.collapsed .label,
.sidebar.collapsed .arrow,
.sidebar.collapsed .back-label {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.9s ease-in-out, visibility 0.9s ease-in-out, transform 0.6s ease-out 0.1s;
	width: 0;
	display: none;
}

.sidebar.collapsed .menu-link {
  
  padding: 1rem 0.5rem;
	margin: 0;
}

.sidebar.collapsed .icon {
  margin-right: 0;
}

.sidebar.collapsed:hover .back-label {
  display: block;
}

.sidebar.collapsed:hover .label,
.sidebar.collapsed:hover .arrow,
.sidebar.collapsed:hover .back-label {
  opacity: 1;
  visibility: visible;	
	display: block;
	white-space: nowrap;
}

.sidebar.collapsed:hover .menu-link {
  justify-content: space-between;
  padding: 1rem;
	transition: all 0.3s ease 0.1s;
}

.sidebar.collapsed:hover .icon {
  margin-right: 1rem;
	transition: margin-right 0.3s ease 0.1s;
}

.sidebar.collapsed:hover .back-button {
  justify-content: flex-start;
	padding: 1rem;
	transition: all 0.3s ease 0.2s;
}

/* анимация каскадная */
.sidebar.collapsed:hover .arrow {
  transition: 0.5s ease-out 0.1s;
}
.sidebar.collapsed:hover .label {
  transition: all 0.6s ease-out 0.2s;
}
.sidebar.collapsed:hover .back-label {
  transition: all 0.5s ease-out 0.3s;
}

/* исчезновение при @mouseleave */
.sidebar:not(.collapsed) .label,
.sidebar:not(.collapsed) .arrow,
.sidebar:not(.collapsed) .back-label {
  transition: all 0.3s ease;
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