<template>
  <div class="layout">
    <!-- Sidebar -->
    <SidebarMenu :items="menuItems" />

    <!-- Main content -->
    <main class="main-content">
     

        <div class="company-card">
          <div class="avatar"></div>
          <div class="info">
            <div class="name">{{ company.name }}</div>
            <div class="rating">⭐ {{ company.rating }}</div>
            <p>{{ company.description }}</p>
          </div>
        </div>

        <section class="description">
          <p>{{ siteInfo.about_company }}</p>
        </section>

        <section class="reviews">
          <h2>Отзывы ({{ reviews.length }})</h2>
          <div v-for="review in reviews" :key="review.id" class="review">
            <div class="review-header">
              <div class="reviewer-avatar"></div>
              <div class="reviewer-info">
                <div class="reviewer-name">{{ review.author }}</div>
                <div class="review-date">{{ review.date }}</div>
              </div>
              <div class="review-rating">⭐ {{ review.rating }}</div>
            </div>
            <p class="review-text">{{ review.text }}</p>
          </div>
        </section>
      
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import SidebarMenu from '../components/Sidebar.vue'
import { siteInfo } from '../config/siteInfo'


// Sidebar menu items
const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/about-company' }
]

const company = ref({ name: '', rating: 0, description: '' })
const reviews = ref([])

onMounted(async () => {
  try {
    const { data: info } = await api.get('/salon/info')
    company.value = {
      name: info.name,
      rating: info.rating,
      description: info.description || 'Описание компании отсутствует.'
    }
    const { data: rev } = await api.get('/salon/reviews')
    reviews.value = rev.map(r => ({
      id: r.id,
      author: r.author_name,
      date: r.created_at, // предполагаем поле
      rating: r.rating,
      text: r.text
    }))
  } catch (e) {
    console.error('Ошибка загрузки данных компании:', e)
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
.about-company {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
}
.page-title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
.company-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f5f8fd;
  border-radius: 8px;
}
.avatar {
  width: 64px;
  height: 64px;
  background: #ccc;
  border-radius: 50%;
}
.info .name {
  font-size: 1.2rem;
  font-weight: bold;
}
.info .rating {
  color: #777;
}
.description,
.reviews {
  margin-top: 2rem;
}
.reviews h2 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}
.review {
  background: #f5f8fd;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.reviewer-avatar {
  width: 32px;
  height: 32px;
  background: #ccc;
  border-radius: 50%;
}
.reviewer-info .reviewer-name {
  font-weight: bold;
}
.reviewer-info .review-date {
  font-size: 0.75rem;
  color: #777;
}
.review-rating {
  margin-left: auto;
  color: #777;
}
.review-text {
  margin: 0;
}
</style>

