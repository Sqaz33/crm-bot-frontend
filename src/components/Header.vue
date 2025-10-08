<template>
  <HomeMenu v-if="isHome" />

 
  <template v-else>
	
    <div class="topbar">
      <div class="bot-name" @click="goHome">{{ botName }}</div>
    </div>
		
    <header class="header">
      
			
			<div class = "button-title">
			  <div class="back-button" @click="goBack" v-if="!notShowSidebarButton">
					<span class="arrow-back">‹</span> Назад
			  </div>
						
				<button class="button" @click="clickSidebarButton" v-if="notShowSidebarButton">
					<img src="../assets/sidebarIcon.svg"/>
				</button>
        <h1 class="page-title">
				  {{ title }}
			  </h1>
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
.button-title {
  display: flex;
  justify-content: center; 
  width: 100%; 
  position: relative; 
}

.page-title {
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: bold;
  font-family: var(--font-primary);
  margin: 0 auto;
  text-align: center;
}

.button {
  width: 24px;
  height: 24px;
  position: absolute; 
  left: 0.7rem; 
  margin: 0;
  background: rgba(255, 255, 255, 0);
  border: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 0px;
  padding: 0;
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
	justify-content: center;
  border-bottom: 1px solid #ccc;
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