<template>
    <div class="staff-view">
      <div class="tabs">
        <button
          class="tab active"
        >
          Все
        </button>
      </div>
  
      <div class="staff-list">
        <div
          v-for="staff in staffList"
          :key="staff.id"
          class="staff-card"
          @click="goToStaff(staff.id)"
        >
          <div 
            class="avatar" 
            :class="{ 'avatar--empty': !staff.photo }"
            :style="staff.photo ? { backgroundImage: `url(${staff.photo})` } : {}"
          ></div>
          <div class="info">
            <div class="name">{{ staff.name }}</div>
            <div class="spec">{{ staff.specialization }}</div>
          </div>
          <div class="rating">⭐ {{ staff.rating }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import api from '../api'
  
  const router    = useRouter()
  const staffList = ref([])
  
  async function loadAllStaff() {
    try {
      const { data } = await api.get('/salon/staff')
      staffList.value = data
    } catch (err) {
      console.error('Не удалось загрузить сотрудников:', err)
    }
  }
  
  function goToStaff(id) {
    router.push({ name: 'employee', params: { id } })
  }
  
  onMounted(loadAllStaff)
  </script>
  
  <style scoped>
  .staff-view {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    background: #f5f8fd;
  }
  
  .tabs {
    display: flex;
    margin-bottom: 1rem;
  }
  
  .tab {
    padding: 0.75rem 1.5rem;
    background: #fff;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: bold;
  }
  
  .tab.active {
    border-color: #000;
  }
  
  .staff-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .staff-card {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background .2s;
  }
  
  .staff-card:hover {
    background: #eef2f7;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    margin-right: 1rem;
  }
  
  .avatar--empty {
    background-color: #ccc;
  }
  
  .info {
    flex: 1;
  }
  
  .name {
    font-weight: bold;
  }
  
  .spec {
    font-size: 0.85rem;
    color: #555;
  }
  
  .rating {
    background: #e0e0e0;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
  }
  </style>