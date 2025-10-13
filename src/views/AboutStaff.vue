<template>
  <div class="staff-view">
    <button class="btn-back" @click="$router.back()">← Назад</button>
    <div class="card">
      <div
        v-if="staff.photo"
        class="avatar"
        :style="{ backgroundImage: `url(${staff.photo})` }"
      />
      <div v-else class="avatar avatar--empty"/>
      <h2 class="name">{{ staff.name }}</h2>
      <div class="spec">{{ staff.specialization }}</div>
      <div class="rating">⭐ {{ staff.rating }}</div>
      <p class="about">{{ staff.about || 'Информация отсутствует.' }}</p>
    </div>

    <button class="btn-select" @click="chooseStaff">
      Выбрать
    </button>

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
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

const VISIT_KEY = 'visit_data'

const route   = useRoute()
const router  = useRouter()
const staffId = route.params.id

const staff   = ref({ name:'', specialization:'', photo:'', about:'', rating:0 })
const reviews = ref([])

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}

// Читает существующий visit_data из localStorage (или создаёт базовый объект)
function readVisit() {
  const raw = localStorage.getItem(VISIT_KEY)
  if (raw) {
    try { return JSON.parse(raw) } catch {}
  }
  return { staff_id:'', client_id:'', visit_time:{ start:'', end:'' }, comment:'' }
}

// Сохраняет visit_data и ставит cookie
function writeVisit(obj) {
  localStorage.setItem(VISIT_KEY, JSON.stringify(obj))
  const cookieValue = encodeURIComponent(JSON.stringify(obj))
  document.cookie = `${VISIT_KEY}=${cookieValue}; path=/; max-age=${365*24*60*60}; Secure; SameSite=None`
}

function chooseStaff() {
  const visit = readVisit()
  visit.staff_id = staffId
  writeVisit(visit)
  router.push({ name: 'appointmant' })
}

onMounted(async () => {
  try {
    const { data: s }   = await api.get(`/salon/staff/${staffId}`)
    const { data: rev } = await api.get(`/salon/reviews?staff_id=${staffId}`)
    staff.value   = s
    reviews.value = rev
  } catch (e) {
    console.error('Ошибка загрузки данных:', e)
  }
})
</script>

<style scoped>
.staff-view {
  max-width: 600px;
  margin: 1rem auto;
	margin-left: 50px;
  padding: 1rem;
  background: #f5f8fd;
  border-radius: 8px;
	border: red solid 1px;
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
	margin: 1rem auto;
	
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin: 0 auto 0.5rem;
}

.avatar--empty {
  background-color: #ccc;
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

/* Кнопка «Выбрать» */
.btn-select {
  display: block;
  width: 120px;
  margin: 0.5rem auto 1.5rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-select:hover {
  background: #0056b3;
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

@media (max-width: 765px)
{
.staff-view {
  max-width: 350px;
	}
	
}

@media (max-width: 480px) {
  .staff-view {
		max-width: 250px;
  }
	}
</style>
