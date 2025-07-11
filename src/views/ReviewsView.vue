<template>
  <div class="layout">
    <SidebarMenu :items="menuItems" />
    <main class="main-content">
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
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин',  path: '/shop'   },
  { label: 'Отзывы',   path: '/reviews'},
  { label: 'О компании', path: '/company' }
]

function goToStaff(staffId) {
  router.push({ name: 'staff', params: { id: staffId } })
}
</script>

<style scoped>
.layout { display: flex; height: 100vh; }
.main-content { flex: 1; overflow-y: auto; padding: 1rem; background: #f5f8fd; }
.page-title { text-align: center; margin-bottom: 1rem; font-size: 1.5rem; }
</style>
