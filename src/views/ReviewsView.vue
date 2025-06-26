<template>
  <div class="layout">
    <!-- Sidebar -->
    <SidebarMenu :items="menuItems" />

    <!-- Main content -->
    <main class="main-content">
      <div class="reviews-view">
        <h1 class="page-title">Отзывы</h1>
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

        <div class="reviews-list">
          <div
            v-for="review in filteredReviews"
            :key="review.id"
            class="review-card"
          >
            <div class="avatar"></div>
            <div class="info">
              <div class="name">{{ review.author_name }}</div>
              <div class="specialization">{{ review.author_specialization }}</div>
            </div>
            <div class="rating">⭐ {{ review.rating }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import SidebarMenu from '../components/Sidebar.vue'

// Sidebar menu items
const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин',  path: '/shop' },
  { label: 'Отзывы',   path: '/reviews' },
  { label: 'О компании', path: '/company' }
]

// Tabs configuration
const tabs = [
  { label: 'Все', value: 'all' },
  { label: 'Должность', value: 'role' },
  { label: 'Топ сотрудник', value: 'top' }
]
const activeTab = ref('all')
const reviews = ref([])

onMounted(async () => {
  try {
    const { data } = await api.get('/salon/reviews')
    reviews.value = data
  } catch (e) {
    console.error('Не удалось загрузить отзывы:', e)
  }
})

const filteredReviews = computed(() => {
  if (activeTab.value === 'all') return reviews.value
  if (activeTab.value === 'role') return reviews.value.filter(r => r.author_specialization)
  if (activeTab.value === 'top') return reviews.value.filter(r => r.rating >= 5)
  return reviews.value
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
  overflow: hidden;
  margin-bottom: 1rem;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  cursor: pointer;
  border: none;
  background: #fff;
  transition: background 0.2s;
}
.tab.active {
  border-bottom: 3px solid #007bff;
}
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.review-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.avatar {
  width: 40px;
  height: 40px;
  background: #ccc;
  border-radius: 50%;
  margin-right: 1rem;
}
.info .name {
  font-weight: bold;
}
.info .specialization {
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
