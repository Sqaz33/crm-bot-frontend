<template>
  <HomeMenu v-if="isHome" />

  <header v-else class="header">
    <div class="header-content">
      <!-- Лого в зоне 51px, центр совпадает с иконками сайдбара -->
      <div class="logo-area">
        <img
          :src="logo"
          alt="На главную"
          class="logo-btn"
          @click="$router.push('/')"
        />
      </div>

      <h1 class="page-title">{{ title }}</h1>

      <div class="spacer" />
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
  padding: 12px 0;
}

/* Зона лого шириной 51px, чтобы центр совпадал с иконками сайдбара */
.logo-area {
  width: 51px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #6267ee;
  padding: 6px;
  cursor: pointer;
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

.spacer {
  width: 51px;
  flex-shrink: 0;
}
</style>
