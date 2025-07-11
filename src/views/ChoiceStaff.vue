<template>
    <div class="layout">
      <SidebarMenu :items="menuItems" />
      <main class="main-content">
        <StaffFilter
          @select="goToStaff"
          @review="goToReviews"
          @visit="startVisit"
        />
      </main>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import SidebarMenu from '../components/Sidebar.vue'
  import StaffFilter from '../components/StaffFilter.vue'
  
  const router = useRouter()
  const VISIT_KEY = 'visit_data'
  
  const menuItems = [
    { label: 'Сотрудник', path: '/choicestaff' },
    { label: 'Дата',        path: '/datetime'    },
    { label: 'Услуги',      path: '/services'    }
  ]
  
  function goToStaff(id) {
    router.push({ name: 'staff', params: { id } })
  }
  
  function goToReviews(id) {
    router.push({ name: 'staff-reviews', params: { id } })
  }
  
  function startVisit(staffId) {
    const visitData = {
      staff_id:   staffId,
      client_id:  '',
      visit_time: { start:'', end:'' },
      comment:    ''
    }
    localStorage.setItem(VISIT_KEY, JSON.stringify(visitData))
    document.cookie = `${VISIT_KEY}=${encodeURIComponent(JSON.stringify(visitData))}; path=/; max-age=${365*24*60*60}; Secure; SameSite=None`
    console.log('Visit initialized:', visitData)
    router.push({ path: '/appointment' })
  }
  </script>
  
  <style scoped>
  .layout { display:flex; height:100vh }
  .main-content { flex:1; padding:1rem; background:#f5f8fd; overflow-y:auto }
  </style>
  