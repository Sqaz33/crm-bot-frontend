<template>
<div class="container-sidebar">
  <div class="staff-view">
    <button class="btn-back" @click="$router.back()">← Назад</button>
    
    <div class="card">
      <div
        v-if="staff.photo"
        class="avatar"
        :style="{ backgroundImage: `url(${staff.photo})` }"
      />
      <div v-else class="avatar avatar--empty">
        <span class="avatar-letter">{{ getFirstLetter(staff.name) }}</span>
      </div>
      
      <h2 class="name">{{ staff.name }}</h2>
      
      <div class="rating-container">
        <span class="star">⭐</span>
        <span class="rating-value">{{ staff.rating }}</span>
      </div>

      <div class="about-section">
        <div class="about-label">О себе</div>
        <p class="about-text">{{ staff.about || 'Информация отсутствует.' }}</p>
      </div>
    </div>

    <button class="btn-select" @click="chooseStaff">
      Выбрать
    </button>

    <section class="reviews">
      <h3 class="reviews-title">Отзывы ({{ reviews.length }})</h3>
      <div v-for="r in reviews" :key="r.id" class="review">
        <div class="rev-header">
          <div class="rev-avatar">
            <div 
              v-if="r.client_photo" 
              class="rev-avatar-img" 
              :style="{ backgroundImage: `url(${r.client_photo})` }"
            ></div>
            <div v-else class="rev-avatar-img rev-avatar-empty">
              <span class="avatar-letter-small">{{ getFirstLetter(r.client_name) }}</span>
            </div>
          </div>
          <div class="name-date">
            <div class="rev-name">{{ r.client_name }}</div>
            <div class="rev-date">{{ formatDate(r.created_at) }}</div>
          </div>
          <div class="rev-rating">
            <span class="star-small">⭐</span>
            <span class="rating-small">{{ r.rating }}</span>
          </div>
        </div>
        <p class="rev-text">{{ r.comment }}</p>
      </div>
    </section>
  </div>
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

function getFirstLetter(name) {
  return name ? name.charAt(0).toUpperCase() : ''
}

function readVisit() {
  const raw = localStorage.getItem(VISIT_KEY)
  if (raw) {
    try { return JSON.parse(raw) } catch {}
  }
  return { staff_id:'', client_id:'', visit_time:{ start:'', end:'' }, comment:''  }
}

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
.container-sidebar {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.staff-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: #F6F5F6;
  display: flex;
  flex-direction: column;
}

.btn-back {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  margin-bottom: 1.5rem;
  font-size: clamp(12px, 3vw, 16px);
  padding: 0;
  align-self: flex-start;
}

.card {
  background: #fff;
  padding: clamp(1rem, 5vw, 2rem);
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.avatar {
  width: clamp(80px, 20vw, 140px);
  height: clamp(80px, 20vw, 140px);
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-bottom: clamp(0.5rem, 3vw, 1rem);
}

.avatar--empty {
  background: linear-gradient(145deg, #69FFDB 0%, #69FF03 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-letter {
  font-size: clamp(1.5rem, 8vw, 3rem);
  font-weight: 600;
  color: #fff;
}

.name {
  font-size: clamp(18px, 5vw, 24px);
  font-weight: 500;
  font-family: 'Geometria', sans-serif;
  margin: clamp(0.3rem, 2vw, 0.8rem) 0;
  color: #454558;
  line-height: 1.3;
}

.rating-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: clamp(0.5rem, 2vw, 1rem) 0;
  background: #F6F5F6;
  padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.8rem, 2vw, 1.2rem);
  border-radius: 32px;
  width: fit-content;
}

.star {
  font-size: clamp(1rem, 3vw, 1.2rem);
}

.rating-value {
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 400;
  font-family: 'Inter', sans-serif;
  color: #454558;
}

.about-section {
  background: #F6F5F6;
  border-radius: 12px;
  padding: clamp(1rem, 4vw, 2rem);
  margin-top: clamp(0.5rem, 2vw, 1rem);
  text-align: left;
  min-height: clamp(120px, 25vw, 175px);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.about-label {
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 500;
  font-family: 'Geometria', sans-serif;
  color: #454558;
  margin-bottom: clamp(0.3rem, 2vw, 0.8rem);
  line-height: 1.3;
}

.about-text {
  font-size: clamp(14px, 3vw, 16px);
  color: #454558;
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

.btn-select {
  align-self: center;
  width: clamp(200px, 90%, 390px);
  height: clamp(44px, 8vw, 60px);
  margin: clamp(1rem, 3vw, 1.5rem) auto;
  padding: 0;
  background: #666FE8;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: clamp(16px, 4vw, 24px);
  font-weight: 500;
  font-family: 'Geometria', sans-serif;
  line-height: 1.3;
  transition: background 0.2s;
}

.btn-select:hover {
  background: #5563d9;
}

.btn-select:active {
  background: #4a52c0;
}

.reviews {
  margin-top: clamp(1rem, 4vw, 2rem);
  width: 100%;
}

.reviews-title {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 400;
  font-family: 'Inter', sans-serif;
  margin: 0 0 clamp(0.8rem, 3vw, 1.5rem) 0;
  color: #454558;
}

.review {
  background: #fff;
  padding: clamp(1rem, 4vw, 2rem);
  border-radius: 10px;
  margin-bottom: clamp(1rem, 4vw, 2rem);
  min-height: clamp(80px, 15vw, 95px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.rev-header {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.6rem, 2vw, 1rem);
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
  flex-wrap: wrap;
}

.rev-avatar {
  flex-shrink: 0;
}

.rev-avatar-img {
  width: clamp(44px, 12vw, 64px);
  height: clamp(44px, 12vw, 64px);
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rev-avatar-empty {
  background: linear-gradient(145deg, #69FFDB 0%, #69FF03 100%);
}

.avatar-letter-small {
  font-size: clamp(1rem, 4vw, 1.5rem);
  font-weight: 600;
  color: #fff;
}

.name-date {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 150px;
}

.rev-name {
  font-weight: 500;
  font-size: clamp(14px, 3vw, 20px);
  font-family: 'Geometria', sans-serif;
  color: #454558;
  line-height: 1.3;
}

.rev-date {
  font-size: clamp(12px, 2.5vw, 16px);
  font-family: 'Geometria', sans-serif;
  font-weight: 400;
  color: #999;
  margin-top: 0.2rem;
  line-height: 1.3;
}

.rev-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  background: #F6F5F6;
  padding: clamp(0.3rem, 1vw, 0.6rem) clamp(0.6rem, 1.5vw, 1rem);
  border-radius: 32px;
  width: clamp(60px, 20vw, 114px);
  height: clamp(32px, 8vw, 46px);
  justify-content: center;
}

.star-small {
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
}

.rating-small {
  font-size: clamp(14px, 3vw, 24px);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  color: #454558;
}

.rev-text {
  margin: clamp(0.3rem, 2vw, 0.8rem) 0 0 0;
  font-size: clamp(13px, 3vw, 16px);
  color: #555;
  line-height: 1.5;
}

/* ПЛАНШЕТЫ - max-width: 920px */
@media (max-width: 920px) {
  .staff-view {
    padding: 1.5rem 1rem;
  }

  .card {
    padding: 1.5rem 1rem;
  }

  .about-section {
    min-height: 140px;
    padding: 1.5rem;
  }

  .reviews {
    margin-top: 1.5rem;
  }

  .review {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

/* МОБИЛЬНЫЕ - max-width: 600px */
@media (max-width: 600px) {
  .staff-view {
    padding: 1rem;
    max-width: 100%;
  }

  .btn-back {
    margin-bottom: 1rem;
    font-size: 14px;
  }

  .card {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 10px;
  }

  .avatar {
    width: 100px;
    height: 100px;
    margin-bottom: 0.8rem;
  }

  .avatar-letter {
    font-size: 2.2rem;
  }

  .name {
    font-size: 20px;
    margin: 0.5rem 0;
  }

  .rating-container {
    margin: 0.5rem 0;
    padding: 0.4rem 0.8rem;
  }

  .star {
    font-size: 1rem;
  }

  .rating-value {
    font-size: 18px;
  }

  .about-section {
    min-height: 120px;
    padding: 1rem;
    margin-top: 0.8rem;
    border-radius: 10px;
  }

  .about-label {
    font-size: 16px;
    margin-bottom: 0.5rem;
  }

  .about-text {
    font-size: 13px;
  }

  .btn-select {
    width: 90%;
    height: 48px;
    margin: 1rem auto;
    font-size: 16px;
    border-radius: 10px;
  }

  .reviews {
    margin-top: 1.5rem;
  }

  .reviews-title {
    font-size: 18px;
    margin-bottom: 1rem;
  }

  .review {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    min-height: 80px;
  }

  .rev-header {
    gap: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .rev-avatar-img {
    width: 48px;
    height: 48px;
  }

  .avatar-letter-small {
    font-size: 1.1rem;
  }

  .name-date {
    min-width: auto;
  }

  .rev-name {
    font-size: 16px;
  }

  .rev-date {
    font-size: 12px;
  }

  .rev-rating {
    width: 70px;
    height: 36px;
    padding: 0.3rem 0.6rem;
  }

  .star-small {
    font-size: 0.95rem;
  }

  .rating-small {
    font-size: 16px;
  }

  .rev-text {
    margin-top: 0.5rem;
    font-size: 13px;
  }
}

/* ОЧЕНЬ МАЛЫЕ ЭКРАНЫ - max-width: 380px */
@media (max-width: 380px) {
  .staff-view {
    padding: 0.8rem;
  }

  .card {
    padding: 0.8rem;
  }

  .avatar {
    width: 80px;
    height: 80px;
  }

  .avatar-letter {
    font-size: 1.8rem;
  }

  .name {
    font-size: 18px;
  }

  .about-section {
    padding: 0.8rem;
    min-height: 100px;
  }

  .about-label {
    font-size: 14px;
  }

  .about-text {
    font-size: 12px;
  }

  .btn-select {
    width: 95%;
    height: 44px;
    font-size: 14px;
  }

  .review {
    padding: 0.8rem;
    min-height: auto;
  }

  .rev-avatar-img {
    width: 40px;
    height: 40px;
  }

  .rev-name {
    font-size: 14px;
  }

  .rev-date {
    font-size: 11px;
  }

  .rev-text {
    font-size: 12px;
  }
}
</style>