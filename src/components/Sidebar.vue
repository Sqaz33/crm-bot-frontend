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
            <span class="icon" v-if="item.icon">
              <img :src="item.icon" :alt="item.label" />
            </span>
            <span class="icon-placeholder" v-else></span>
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
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  isOpen: {
    type: Boolean,
    default: true
  }
})

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['close'])

function closeSidebar() {
  emit('close')
}

function goBack() {
  router.back()
  closeSidebar()
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
  background-color: var(--color-light);
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
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
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
  background: var(--color-light);
  text-decoration: none;
  color: inherit;
  max-height: 50px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.menu-item.active .menu-link {
  background-color: #E6E6E6;
  font-weight: bold;
}

.icon,
.icon-placeholder {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  margin-right: 1rem;
  transition: margin-right 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-placeholder {
  background-color: #ddd;
}

.icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.label {
  flex: 1;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
  opacity: 1;
  visibility: visible;
  white-space: nowrap;
  overflow: hidden;
}

.arrow {
  color: #888;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  opacity: 1;
  visibility: visible;
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
  transition: all 0.3s ease;
}

.back-label {
  transition: all 0.3s ease;
  opacity: 1;
  visibility: visible;
  white-space: nowrap;
  overflow: hidden;
}

.arrow-back {
  font-size: 1.2rem;
}

/* свёрнутый сайдбар */
.sidebar.collapsed {
  width: 50px; 
}

.sidebar.collapsed .label,
.sidebar.collapsed .arrow,
.sidebar.collapsed .back-label {
  opacity: 0;
  visibility: hidden;
  width: 0;
  margin: 0;
  transition: all 0.3s ease;
}

.sidebar.collapsed .menu-link {
  padding: 1rem 0.5rem;
  justify-content: center;
  transition: all 0.3s ease 0.1s;
}

.sidebar.collapsed .icon,
.sidebar.collapsed .icon-placeholder {
  margin-right: 0;
  transition: margin-right 0.3s ease 0.1s;
}

.sidebar.collapsed .back-button {
  justify-content: center;
  padding: 1rem 0.5rem;
  transition: all 0.3s ease 0.2s;
}

/* развёрнутый по клику */
.sidebar:not(.collapsed) {
  width: 220px;
}

.sidebar:not(.collapsed) .label,
.sidebar:not(.collapsed) .arrow,
.sidebar:not(.collapsed) .back-label {
  opacity: 1;
  visibility: visible;
  width: auto;
  transition: all 0.3s ease 0.2s;
}

.sidebar:not(.collapsed) .menu-link {
  justify-content: space-between;
  padding: 1rem;
  transition: all 0.3s ease 0.1s;
}

.sidebar:not(.collapsed) .icon,
.sidebar:not(.collapsed) .icon-placeholder {
  margin-right: 1rem;
  transition: margin-right 0.3s ease 0.1s;
}

.sidebar:not(.collapsed) .back-button {
  justify-content: flex-start;
  padding: 1rem;
  transition: all 0.3s ease 0.2s;
}

/* развёрнутый по наведению */
.sidebar.collapsed:hover {
  width: 220px;
}

.sidebar.collapsed:hover .label,
.sidebar.collapsed:hover .arrow,
.sidebar.collapsed:hover .back-label {
  opacity: 1;
  visibility: visible;
  width: auto;
  transition: all 0.3s ease 0.2s;
}

.sidebar.collapsed:hover .menu-link {
  justify-content: space-between;
  padding: 1rem;
  transition: all 0.3s ease 0.1s;
}

.sidebar.collapsed:hover .icon,
.sidebar.collapsed:hover .icon-placeholder {
  margin-right: 1rem;
  transition: margin-right 0.3s ease 0.1s;
}

.sidebar.collapsed:hover .back-button {
  justify-content: flex-start;
  padding: 1rem;
  transition: all 0.3s ease 0.2s;
}
</style>