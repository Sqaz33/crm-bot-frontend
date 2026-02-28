<template>
  <HomeMenu v-if="isHome" />

  <header v-else class="header">
    <div class="header-content">
      <!-- Лого → переход на главную -->
      <img
        :src="logo"
        alt="На главную"
        class="logo-btn"
        @click="$router.push('/')"
      />

      <h1 class="page-title">{{ title }}</h1>

      <!-- Кнопка сайдбара или пустой spacer для центрирования заголовка -->
      <button
        v-if="showSidebarButton"
        class="menu-button"
        @click="clickSidebarButton"
      >
        <img src="@/assets/sidebarIcon.svg" alt="Меню" />
      </button>
      <div v-else class="spacer" />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeMenu from './MainMenu.vue'
import logo from '../../assets/logo.svg'

const route = useRoute()

const isHome = computed(() => route.name === 'home')
const title = computed(() => route.meta.title || route.name || 'Страница')

// Сайдбар-кнопка не нужна на страницах без сайдбара (appointmant)
const showSidebarButton = computed(() => route.name !== 'appointmant')

const emit = defineEmits(['sidebarButtonClick'])

function clickSidebarButton() {
  emit('sidebarButtonClick')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #FFFFFF;
  box-shadow: 3px 0px 9px 0px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

/* Фиолетовая кнопка-лого */
.logo-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #6267ee;
  padding: 6px;
  cursor: pointer;
  flex-shrink: 0;
  display: block;
  transition: opacity 0.2s;
}

.logo-btn:hover {
  opacity: 0.8;
}

.page-title {
  font-family: 'Geometria', sans-serif;
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  text-align: center;
  color: #454558;
  margin: 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-button {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 0;
  flex-shrink: 0;
  transition: background-color 0.2s;
}

.menu-button:hover {
  background-color: #f3f6fa;
}

.menu-button img {
  width: 24px;
  height: 24px;
}

/* Пустой элемент для баланса, когда нет кнопки сайдбара */
.spacer {
  width: 40px;
  flex-shrink: 0;
}
</style>
