<template>
  <!-- Если мы на домашней странице — только меню -->
  <HomeMenu v-if="isHome" />

  <!-- Иначе — обычный хедер -->
  <template v-else>
    <div class="topbar">
      <div class="bot-name" @click="goHome">{{ botName }}</div>
    </div>
    <header class="header">
      <h1 class="page-title">{{ title }}</h1>
      <slot name="actions" />
    </header>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeMenu from './MainMenu.vue'

const route  = useRoute()
const router = useRouter()


const isHome  = computed(() => route.name === 'home')

const title   = computed(() => route.meta.title || route.name || 'Страница')

// Название бота в топбаре
const botName = import.meta.env.VITE_APP_NAME || 'БЬЮТИ-БОТ'

function goHome() {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.topbar {
  background-color: #333;
  color: white;
  padding: 0.75rem 1rem;
  font-weight: bold;
  font-size: 1rem;
}

.bot-name {
  text-transform: uppercase;
  cursor: pointer;
}

.header {
  background-color: #f5f7fa;
  text-align: center;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}

.page-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}
</style>