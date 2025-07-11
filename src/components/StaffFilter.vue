<template>
    <div class="staff-view">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="selectTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
  
      <div class="staff-list">
        <div
          v-for="staff in staffList"
          :key="staff.id"
          class="staff-card"
          @click="$emit('select', staff.id)"
        >
          <div
            v-if="staff.photo"
            class="avatar"
            :style="{ backgroundImage: `url(${staff.photo})` }"
          />
          <div v-else class="avatar avatar--empty" />
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
  import { ref, onMounted, watch } from 'vue'
  import api from '../api'
  
  const emit = defineEmits(['select'])
  
  const tabs = ref([{ label: 'Все', value: 'all' }])
  const activeTab = ref('all')
  const staffList = ref([])
  
  async function loadSpecializations() {
    try {
      const { data } = await api.get('/salon/specializations')
      data.forEach(spec => {
        tabs.value.push({ label: spec, value: spec })
      })
    } catch (e) {
      console.error('Не удалось получить специализации:', e)
    }
  }
  
  async function loadStaff(specialization = null) {
    try {
      let url = '/salon/staff'
      if (specialization && specialization !== 'all') {
        url = `/salon/staff_by_specialization/${encodeURIComponent(specialization)}`
      }
      const { data } = await api.get(url)
      staffList.value = data
    } catch (e) {
      console.error('Не удалось загрузить сотрудников:', e)
      staffList.value = []
    }
  }
  
  function selectTab(value) {
    activeTab.value = value
  }
  
  watch(activeTab, nv => {
    loadStaff(nv)
  })
  
  onMounted(async () => {
    await loadSpecializations()
    await loadStaff()
  })
  </script>
  
  <style scoped>
  .staff-view {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .tabs {
    display: flex;
    background: #fff;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .tab {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    border: none;
    background: #fff;
    white-space: nowrap;
    transition: background 0.2s;
  }
  
  .tab.active {
    border-bottom: 3px solid #007bff;
    font-weight: bold;
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
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: transform 0.1s;
  }
  
  .staff-card:hover {
    transform: translateY(-2px);
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    background-size: cover;
    background-position: center;
    border-radius: 50%;
  }
  
  .avatar--empty {
    width: 40px;
    height: 40px;
    background-color: #ccc;
    border-radius: 50%;
  }
  
  .info {
    margin-left: 1rem;
  }
  
  .name {
    font-weight: bold;
  }
  
  .spec {
    font-size: 0.85rem;
    color: #555;
  }
  
  .rating {
    margin-left: auto;
    background: #e0e0e0;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.85rem;
  }
  </style>
  