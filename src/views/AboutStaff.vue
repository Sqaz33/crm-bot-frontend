<template>
  <div class="staff-view">
    <button class="btn-back" @click="$router.back()">← Назад</button>

    <div class="card">
      <img :src="staff.photo || placeholder" class="avatar" />
      <h2 class="name">{{ staff.name }}</h2>
      <div class="spec">{{ staff.specialization }}</div>
      <div class="rating">⭐ {{ staff.rating }}</div>
      <p class="about">{{ staff.about }}</p>
    </div>

    <section class="reviews">
      <h3>Отзывы ({{ reviews.length }})</h3>
      <div v-for="r in reviews" :key="r.id" class="review">
        <div class="rev-header">
          <div class="rev-name">{{ r.client_name }}</div>
          <div class="rev-date">{{ formatDate(r.created_at) }}</div>
          <div class="rev-rating">⭐ {{ r.rating }}</div>
        </div>
        <p class="rev-text">{{ r.comment }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const staffId = route.params.id

const staff = ref({
  name: '', specialization: '', photo: '', about: '', rating: 0
})
const reviews = ref([])
const placeholder = 'https://via.placeholder.com/64'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

onMounted(async () => {
  try {
    // 1) Детали сотрудника
    const { data: s } = await api.get(`/salon/staff/${staffId}`)
    staff.value = s

    // 2) Отзывы по этому сотруднику
    const { data: rev } = await api.get(`/salon/reviews?staff_id=${staffId}`)
    reviews.value = rev
  } catch (e) {
    console.error('Ошибка загрузки данных сотрудника:', e)
  }
})
</script>

<style scoped>
.staff-view {
  max-width: 600px;
  margin: 1rem auto;
  padding: 1rem;
  background: #f5f8fd;
  border-radius: 8px;
}
.btn-back {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  margin-bottom: 1rem;
}
.card {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}
.avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
}
.name {
  font-size: 1.2rem;
  font-weight: bold;
}
.spec {
  color: #555;
  margin-bottom: 0.5rem;
}
.rating {
  background: #e0e0e0;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}
.about {
  margin-bottom: 1.5rem;
}
.reviews h3 {
  margin-bottom: 0.5rem;
}
.review {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.rev-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.rev-name {
  font-weight: bold;
}
.rev-date {
  font-size: 0.85rem;
  color: #777;
}
.rev-rating {
  margin-left: auto;
  background: #e0e0e0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}
.rev-text {
  margin: 0;
}
</style>
