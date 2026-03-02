<template>
  <div class="min-h-dvh bg-#F6F5F6 text-neutral-800">
    <Header />
    <div class="flex w-full">
      <SidebarMenu
        v-if="showSidebar"
        :items="currentMenuItems"
      />
      <!-- Основной контент -->
      <div class="flex w-full flex-1 overflow-hidden px-4">
        <main class="min-w-0 flex-1">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../components/layout/Header.vue'
import SidebarMenu from '../components/layout/Sidebar.vue'

import recordsIcon from '../assets/recordsIcon.svg'
import shopIcon from '../assets/shopIcon.svg'
import walletIcon from '../assets/walletIcon.svg'
import companyIcon from '../assets/companyIcon.svg'
import profileIcon from '../assets/profileIcon.svg'
import staffIcon from '../assets/staffIcon.svg'
import calendarIcon from '../assets/calendarIcon.svg'
import servicesIcon from '../assets/servicesIcon.svg'

const route = useRoute()

// Порядок пунктов соответствует макету Figma
const mainMenuItems = [
  { label: 'Мои записи', path: '/records', icon: recordsIcon },
  { label: 'Магазин', path: '/shop', icon: shopIcon },
  { label: 'Кошелёк', path: '/wallet', icon: walletIcon },
  { label: 'О компании', path: '/company', icon: companyIcon },
  { label: 'Профиль', path: '/profile', icon: profileIcon },
]

// Меню шагов оформления записи
const appointmentMenuItems = [
  { label: 'Услуги', path: '/services', icon: servicesIcon },
  { label: 'Сотрудник', path: '/choicestaff', icon: staffIcon },
  { label: 'Дата и время', path: '/datetime', icon: calendarIcon },
]

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

</script>
