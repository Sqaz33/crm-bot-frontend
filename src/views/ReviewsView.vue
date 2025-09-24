<template>
  <div class="layout">
    
    <main class="main-content">
      <StaffFilter @select="goToStaff" />

    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import StaffFilter from '../components/StaffFilter.vue'

const router = useRouter()



function goToStaff(staffId) {
  router.push({ name: 'staff', params: { id: staffId } })
}
</script>

<style scoped>
.layout { display: flex; height: 100vh; }
.main-content { flex: 1; overflow-y: auto; padding: 1rem; background: var(--light-color); }
.page-title { text-align: center; margin-bottom: 1rem; font-size: 1.5rem; }
</style>
