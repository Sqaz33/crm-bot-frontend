<template>
  <div class="app">
    <Header @sidebarButtonClick="handleSidebarButtonClick" />
    
    <div class="container">
		  <SidebarMenu 
      :is-open="isSidebarOpen" 
      :items="currentMenuItems"
      :sidebar-button-clicked="sidebarButtonClicked"
      v-if="showSidebar"
			
      />
      <main class="main-content">
        <keep-alive include="RecordView">
          <router-view />
        </keep-alive>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import SidebarMenu from '../components/Sidebar.vue'

const isSidebarOpen = ref(false)
const sidebarButtonClicked = ref(false)
const route = useRoute()

// Основное меню
const mainMenuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/company' }
]

// Специальное меню для страниц записи
const appointmentMenuItems = [
  { label: 'Сотрудник', path: '/choicestaff' },
  { label: 'Дата и время', path: '/datetime' },
  { label: 'Услуги', path: '/services' }
]

// Страницы со специальным меню
const appointmentPages = ['/choicestaff', '/datetime', '/services']

// Страницы без сайдбара
const pagesWithoutSidebar = ['/home', '/appointmant']

// Текущее меню
const currentMenuItems = computed(() => {
  const path = route.path
  if (path.startsWith('/choicestaff') || path.startsWith('/datetime') || path.startsWith('/services')) {
    return appointmentMenuItems
  }
  return mainMenuItems
})

// Показывать ли сайдбар
const showSidebar = computed(() => {
  const path = route.path
  return !(path === '/' || path === '/home' || path === '/appointmant' || path.startsWith('/appointmant/'))
})


function handleSidebarButtonClick() {
  if (showSidebar.value) {
    sidebarButtonClicked.value = true
    isSidebarOpen.value = !isSidebarOpen.value
    setTimeout(() => sidebarButtonClicked.value = false, 100)
  }
}

</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
	position: relative;
}

.container {
  display: flex;
  flex: 1;
  overflow: hidden;
	
}

.main-content {
  flex: 1;
  padding: 0;
}
</style>
