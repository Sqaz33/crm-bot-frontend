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
function goHome() {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #888;
  font-family: var(--font-primary);
}

.sidebar.empty {
  display: none;
}

.sidebar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 320px;
  max-width: 320px;
}

.sidebar {
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
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
  padding: 14px 20px 14px 28px;
  background: rgba(246, 245, 246, 0.40);
  text-decoration: none;
  color: #454558;
  font-family: var(--font-primary);
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  max-height: 56px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.menu-item.active .menu-link {
  background-color: #E6E6E6;
  font-weight: bold;
}

.icon,
.icon-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  margin-right: 2rem;
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
  margin-left: 0;
  transition: all 0.3s ease;
  opacity: 1;
  visibility: visible;
  white-space: nowrap;
  overflow: hidden;
  font-family: var(--font-primary);
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  color: #454558;
}

.arrow {
  color: #8097B1;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  opacity: 1;
  visibility: visible;
}

.back-button {
  position: sticky;
  bottom: 0;
  height: 56px; 
  padding: 14px 20px 14px 28px; 
  font-size: 20px;
  color: #8097B1;
  font-family: var(--font-primary);
  font-weight: 400;
  line-height: 24px;
  background-color: rgba(246, 245, 246, 0.40);
  border-top: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.arrow-back {
  width: 36px;
  height: 36px; 
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem; 
  font-size: 1.5rem;
  color: #B0BECF;
  flex-shrink: 0;
}

.back-label {
  transition: all 0.3s ease;
  opacity: 1;
  visibility: visible;
  white-space: nowrap;
  overflow: hidden;
  font-family: var(--font-primary);
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  color: #8097B1;
}


.sidebar.collapsed {
  width: 60px;
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
  padding: 14px 12px;
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
  padding: 14px 12px;
  transition: all 0.3s ease 0.2s;
}

.sidebar.collapsed .arrow-back {
  margin-right: 0;
}

/* развёрнутый по клику */
.sidebar:not(.collapsed) {
  width: 320px;
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
  padding: 14px 20px 14px 28px;
  transition: all 0.3s ease 0.1s;
}

.sidebar:not(.collapsed) .icon,
.sidebar:not(.collapsed) .icon-placeholder {
  margin-right: 2rem;
  transition: margin-right 0.3s ease 0.1s;
}

.sidebar:not(.collapsed) .back-button {
  justify-content: flex-start;
  padding: 14px 20px 14px 28px;
  transition: all 0.3s ease 0.2s;
}

/* отключено развёртывание при наведении */
/*
.sidebar.collapsed:hover {
  width: 320px;
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
  padding: 14px 20px 14px 28px;
  transition: all 0.3s ease 0.1s;
}

.sidebar.collapsed:hover .icon,
.sidebar.collapsed:hover .icon-placeholder {
  margin-right: 2rem;
  transition: margin-right 0.3s ease 0.1s;
}

.sidebar.collapsed:hover .back-button {
  justify-content: flex-start;
  padding: 14px 20px 14px 28px;
  transition: all 0.3s ease 0.2s;
}

.sidebar.collapsed:hover .arrow-back {
  margin-right: 1rem;
}
*/

</style>