<template>
  <div class="layout">
    <SidebarMenu :items="menuItems" />
    <main class="main-content">
      <div class="reviews-view">
        <h1 class="page-title">Отзывы</h1>
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab', { active: activeTab === tab.value }]"
            @click="selectTab(tab)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="reviews-list">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="review-card"
          >
            <div class="avatar"></div>
            <div class="info">
              <div class="name">{{ review.client_name }}</div>
              <div class="date">{{ formatDate(review.created_at) }}</div>
            </div>
            <div class="rating">⭐ {{ review.rating }}</div>
            <p class="comment">{{ review.comment }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import SidebarMenu from '../components/Sidebar.vue'

const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/company' }
]

const tabs = ref([{ label: 'Все', value: 'all' }])
const activeTab = ref('all')
const reviews = ref([])

async function loadStaffTabs() {
  const { data: staffList } = await api.get('/salon/staff')
  staffList.forEach(s => {
    tabs.value.push({ label: s.name, value: s.id })
  })
}

async function loadReviews(staffId = null) {
  const url = staffId && staffId !== 'all'
    ? `/salon/reviews?staff_id=${staffId}`
    : '/salon/reviews'
  const { data } = await api.get(url)
  reviews.value = data
}

function selectTab(tab) {
  activeTab.value = tab.value
  loadReviews(tab.value === 'all' ? null : tab.value)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

onMounted(async () => {
  try {
    await loadStaffTabs()
    await loadReviews()
  } catch (e) {
    console.error('Ошибка при загрузке:', e)
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #fff;
}

.reviews-view {
  padding: 1rem;
  background: #f5f8fd;
}

.page-title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
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

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: default;
}

.review-card .avatar {
  width: 40px;
  height: 40px;
  background: #ccc;
  border-radius: 50%;
  float: left;
  margin-right: 1rem;
}

.review-card .info {
  overflow: hidden;
}

.review-card .name {
  font-weight: bold;
}

.review-card .date {
  font-size: 0.85rem;
  color: #555;
}

.review-card .rating {
  float: right;
  background: #e0e0e0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.review-card .comment {
  clear: both;
  margin-top: 0.5rem;
}
</style>
