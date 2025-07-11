<template>

  <div class="base" style="flex-direction: column; padding: 0.2rem;">

    <h2 class="section-title" @click="goTo('appointmant')">Персональные услуги</h2>

    <div class="cards">
      <div class="card" @click="goTo('wallet')">
        <span>Кошелёк</span>
        <span class="badge">0</span>
      </div>
      <div class="card" @click="goTo('shop')">
        <span>Магазин</span>
        <span class="arrow">›</span>
      </div>
      <div class="card" @click="goTo('reviews')">
        <span>Отзывы</span>
        <span class="badge">{{ reviewCount }}</span>
      </div>
      <div class="card" @click="goTo('company')">
        <span>О компании</span>
        <span class="arrow">›</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const reviewCount = ref(0)

// можно заранее подгрузить количество отзывов
onMounted(async () => {
  try {
    const { data: reviews } = await api.get('/salon/reviews')
    reviewCount.value = Array.isArray(reviews) ? reviews.length : 0
  } catch {
    reviewCount.value = 0
  }
})

function goTo(name) {
  // в зависимости от имени маршрута
  router.push({ name })
}
</script>

<style scoped>



.section-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  background: white;
  display: block;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem auto 1rem auto;
  width: 35rem;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color .2s;
}

.card:hover {
  background-color: #eaeff5;
}

.badge {
  background-color: #e0e0e0;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.arrow {
  font-size: 1.4rem;
  color: #999;
}
</style>
