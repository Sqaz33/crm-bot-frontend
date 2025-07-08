<template>
  <div class="layout">
    <SidebarMenu :items="menuItems" />
    <main class="main-content">
      <div class="reviews-view">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab', { active: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="staff-list">
          <div
            v-for="staff in filteredStaff"
            :key="staff.id"
            class="staff-card"
            @click="goToStaff(staff.id)"
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
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import SidebarMenu from '../components/Sidebar.vue'

const router = useRouter()

const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/company' }
]

// заменить
const tabs = [
  { label: 'Все', value: 'all' },
  { label: 'Барбер', value: 'Барбер' },
  { label: 'Топ Барбер', value: 'Топ Барбер' }
]
const activeTab = ref('all')
const staffList = ref([])

async function loadStaff() {
  try {
    const { data } = await api.get('/salon/staff')
    staffList.value = data
  } catch (e) {
    console.error('Не удалось загрузить сотрудников:', e)
  }
}

const filteredStaff = computed(() => {
  if (activeTab.value === 'all') return staffList.value
  return staffList.value.filter(s => s.specialization === activeTab.value)
})

function goToStaff(id) {
  router.push({ path: `/staff/${id}` })
}

onMounted(loadStaff)
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f8fd;
  padding: 1rem;
}

.reviews-view {
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
  flex: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border: none;
  background: #fff;
  transition: background 0.2s;
  white-space: nowrap;
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
  flex-shrink: 0;
}

.avatar--empty {
  background-color: #ccc;
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
