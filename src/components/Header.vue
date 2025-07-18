<template>
  <!-- Если мы на домашней странице — только меню -->
  <HomeMenu v-if="isHome" />

  <!-- Иначе — обычный хедер -->
  <template v-else>
    <div class="topbar">
      
      <div class="bot-name" @click="goHome">{{ siteInfo.bot_name }}</div>
    </div>
    <header class="header">
      <div class="back-button" @click="goBack">
      <span class="arrow-back">‹</span> Назад
    </div>
      <h1 class="page-title">{{ title }}</h1>
      <slot name="actions" />
    </header>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeMenu from './MainMenu.vue'
import { siteInfo } from '../static/siteInfo'

const route  = useRoute()
const router = useRouter()


const isHome  = computed(() => route.name === 'home')

const title   = computed(() => route.meta.title || route.name || 'Страница')

// Название бота в топбаре
const botName = import.meta.env.VITE_APP_NAME || 'БЬЮТИ-БОТ'

function goHome() {
  router.push({ name: 'home' })
}
function goBack() {
  router.back()
}
</script>

<style scoped>
.topbar {
  background-color:var(--color-dark);
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
  background-color: #EDF2FA;
  text-align: center;
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}

.page-title {
  font-size: clamp(1rem,3vw,1.2rem);
  font-weight: bold;
  margin: 0;
  font-family: var(--font-primary);
}
.back-button {
  display: none;
  position: absolute;
  left: 1rem;
  font-weight: bold;
  cursor: pointer;
  font-size: clamp(0.85rem,3vw,0.95rem);
  font-family: var(--font-primary);
  color: #787B80;
  gap: 0.5rem;
}
.arrow-back {
  font-size: clamp(0.85rem,3vw,0.95rem);
}
@media (max-width: 992px) {
  .back-button{
    display: flex; 
  }
}
</style>