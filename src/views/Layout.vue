<template>
  <div class="min-h-dvh bg-neutral-100 text-neutral-800">
    <Header @sidebarButtonClick="handleSidebarButtonClick" />
    <div class="flex w-full">
      <!-- Сайдбар прибит к левому краю без отступов -->
      <SidebarMenu
        v-if="showSidebar"
        :is-open="isSidebarOpen"
        :items="currentMenuItems"
        :sidebar-button-clicked="sidebarButtonClicked"
      />
      <!-- Основной контент -->
      <div class="mx-auto flex w-full max-w-phone flex-1 overflow-hidden px-3 sm:px-4 lg:px-6">
        <main class="min-w-0 flex-1">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../components/Header.vue'
import SidebarMenu from '../components/Sidebar.vue'

import walletIcon from '../assets/walletIcon.svg'
import shopIcon from '../assets/shopIcon.svg'
import reviewIcon from '../assets/reviewIcon.svg'
import companyIcon from '../assets/companyIcon.svg'

import staffIcon from '../assets/staffIcon.svg'
import calendarIcon from '../assets/calendarIcon.svg'
import servicesIcon from '../assets/servicesIcon.svg'

const isSidebarOpen = ref(false)
const sidebarButtonClicked = ref(false)
const route = useRoute()

// Основное меню
const mainMenuItems = [
  { label: 'Кошелёк', path: '/wallet', icon: walletIcon },
  { label: 'Магазин', path: '/shop', icon: shopIcon },
  // { label: 'Отзывы', path: '/reviews', icon: reviewIcon },
  { label: 'О компании', path: '/company', icon: companyIcon }
]

// Меню для записи
const appointmentMenuItems = [
  { label: 'Услуги', path: '/services', icon: servicesIcon },
  { label: 'Сотрудник', path: '/choicestaff', icon: staffIcon },
  { label: 'Дата и время', path: '/datetime', icon: calendarIcon },
  
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
.sidebar-layout {
  margin: 0;
  padding: 0;
  max-width: 100vw;
  overflow-x: hidden;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
</style>
