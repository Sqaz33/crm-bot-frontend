<template>
    <div class="layout">
      <SidebarMenu :items="menuItems" />
      <main class="main-content">
        <h1 class="page-title">Сотрудники</h1>
        <StaffFilter @select="goToStaff" />
      </main>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import SidebarMenu from '../components/Sidebar.vue'
  import StaffFilter from '../components/StaffFilter.vue'
  
  const router = useRouter()
  
  const menuItems = [
    { label: 'Сотрудник',     path: '/choicestaff' },
    { label: 'Дата',     path: '/shop'   },
    { label: 'Услуги',      path: '/reviews'}
  ]
  
  function goToStaff(id) {
    // роут должен быть что-то вроде: { name: 'employee', path: '/staff/:id' }
    router.push({ name: 'employee', params: { id } })
  }
  </script>
  
  <style scoped>
  .layout { display: flex; height: 100vh; }
  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #f5f8fd;
  }
  .page-title { text-align: center; margin-bottom: 1rem; font-size: 1.5rem; }
  </style>
  