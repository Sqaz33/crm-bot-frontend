<template>
  <HomeMenu v-if="isHome" />

 
  <template v-else>
    <div class="topbar">

      <div class="bot-name" @click="goHome">{{ botName }}</div>


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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeMenu from './MainMenu.vue'
import api from '../api' 

const route  = useRoute()
const router = useRouter()

const isHome  = computed(() => route.name === 'home')
const title   = computed(() => route.meta.title || route.name || 'Страница')

const botName = ref('') 

onMounted(async () => {
  try {
    const { data } = await api.get('/salon/info')
    botName.value = data.bot_name || 'Загрузка...'
  } catch (e) {
    botName.value = 'Загрузка...'
    console.error('Ошибка загрузки bot_name:', e)
  }
})

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