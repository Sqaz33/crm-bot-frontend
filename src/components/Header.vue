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
			<div class = "g">
			<button class="button" @click="clickSidebarButton" v-if="!notShowSidebarButton">
			  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23"  viewBox="0 0 16 16">
        <path
          stroke="#888"          
          stroke-width="1"       
          fill="none" 				  
				  d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm5-1v12h9a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H5zM4 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2V2z"
				/>
      </svg>
			</button>
      <h1 class="page-title">{{ title }}</h1>
			</div>
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

const notShowSidebarButton = computed(() => route.name === 'appointmant')

const emit = defineEmits(['sidebarButtonClick'])

function clickSidebarButton() {
  emit('sidebarButtonClick') 
}

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
.button {
  width: 24px;
	height: 24px;
  position: sticky;
  margin: 0 0.5rem;
  background: rgba(255, 255, 255, 0);
  border: none;
  display: flex;
  align-items: left;
  cursor: pointer;
  border-radius: 4px;	
	padding: 0rem;
}

.g {
  display: flex;
  justify-content: center;	
} 

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
  padding: 1rem 0;
  border-bottom: 1px solid #ccc;
}

.page-title {
  font-size: clamp(1rem,3vw,1.2rem);
  font-weight: bold;
  margin: 0;
  font-family: var(--font-primary);
	width: 100%;
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