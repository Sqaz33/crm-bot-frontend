<template>
  <div class="staff-view">
    <div class="card-header">
      <div
        class="avatar"
        :style="staff.photo ? { backgroundImage: `url(${staff.photo})` } : {}"
      />
      <h2 class="staff-name">{{ staff.name }}</h2>
      <div class="staff-rating">⭐ {{ staff.rating }}</div>
    </div>

    <section class="about-section">
      <h3>О себе</h3>
      <p>{{ staff.about || 'Информация отсутствует.' }}</p>
    </section>

    <section class="reviews-section">
      <h3>Отзывы ({{ reviews.length }})</h3>
      <div v-for="r in reviews" :key="r.id" class="review">
        <div class="review-header">
          <div class="reviewer-name">{{ r.client_name }}</div>
          <div class="review-date">{{ formatDate(r.created_at) }}</div>
          <div class="review-rating">⭐ {{ r.rating }}</div>
        </div>
        <p class="review-text">{{ r.comment }}</p>
      </div>
    </section>

    <button class="btn-select" @click="selectStaff">Выбрать</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

const route = useRoute()
const router = useRouter()
const staffId = route.params.id

const staff = ref({
  name: '',
  photo: '',
  about: '',
  rating: 0
})
const reviews = ref([])

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

async function loadData() {
  try {
    const { data: s } = await api.get(`/salon/staff/${staffId}`)
    staff.value = s
    const { data: rev } = await api.get(`/salon/reviews?staff_id=${staffId}`)
    reviews.value = rev
  } catch (e) {
    console.error('Ошибка при загрузке данных сотрудника:', e)
  }
}

function selectStaff() {
  router.back()
}

onMounted(loadData)
</script>

<style scoped>
.staff-view {
  max-width: 500px;
  margin: 1rem auto;
  background: #f5f8fd;
  border-radius: 12px;
  overflow: hidden;
  font-family: sans-serif;
}

.card-header {
  background: #fff;
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: 12px 12px 0 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ccc;
  background-size: cover;
  background-position: center;
  margin: 0 auto 0.5rem;
}

.staff-name {
  margin: 0.25rem 0;
  font-size: 1.25rem;
}

.staff-rating {
  color: #777;
}

.about-section,
.reviews-section {
  background: #fff;
  margin-top: 1rem;
  padding: 1rem;
}

.about-section h3,
.reviews-section h3 {
  margin-top: 0;
  font-size: 1rem;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.about-section p {
  margin: 0.75rem 0 0;
  font-size: 0.95rem;
  color: #333;
}

.review {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.review:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reviewer-name {
  font-weight: bold;
}

.review-date {
  font-size: 0.8rem;
  color: #777;
}

.review-rating {
  margin-left: auto;
  background: #e0e0e0;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.review-text {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #333;
}

.btn-select {
  width: calc(100% - 2rem);
  margin: 1rem;
  padding: 0.75rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-select:hover {
  background: #0056b3;
}
</style>
