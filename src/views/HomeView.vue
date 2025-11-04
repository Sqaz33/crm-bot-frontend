<template>
  <div class="base">

    <!-- Верхняя кнопка -->
    <button class="main-button" @click="goTo('appointment')">
      Персональные услуги
    </button>

    <!-- Список карточек -->
    <div class="cards">
      <div class="card" @click="goTo('wallet')">
        <div class="left">
          <i class="icon">👛</i>
          <span>Кошелёк</span>
        </div>
        <span class="badge orange">0</span>
      </div>

      <div class="card" @click="goTo('shop')">
        <div class="left">
          <i class="icon">👜</i>
          <span>Магазин</span>
        </div>
        <span class="arrow">›</span>
      </div>

      <div class="card" @click="goTo('reviews')">
        <div class="left">
          <i class="icon">⭐</i>
          <span>Отзывы</span>
        </div>
        <span class="badge blue">{{ reviewCount }}</span>
      </div>

      <div class="card" @click="goTo('company')">
        <div class="left">
          <i class="icon">🏢</i>
          <span>О компании</span>
        </div>
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

onMounted(async () => {
  try {
    const { data: reviews } = await api.get('/salon/reviews')
    reviewCount.value = Array.isArray(reviews) ? reviews.length : 0
  } catch {
    reviewCount.value = 0
  }
})

function goTo(name) {
  router.push({ name })
}
</script>

<style scoped>
.base {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f7f6f8;
  min-height: 100vh;
  padding-top: 2rem;
}

/* Главная кнопка */
.main-button {
  background-color: #6267ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  width: min(90%, 400px);
  transition: background 0.2s;
  margin-bottom: 1.5rem;
}

.main-button:hover {
  background-color: #4f54d8;
}

/* Список карточек */
.cards {
  width: min(90%, 1000px);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

/* Карточки */
.card {
  background: white;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.1s ease-in-out, box-shadow 0.1s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

/* Левая часть с иконкой */
.left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #3a3a3a;
  font-weight: 500;
}

/* Иконки (можно заменить на svg или fontawesome) */
.icon {
  font-size: 1.2rem;
}

/* Индикаторы */
.badge {
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  min-width: 20px;
  text-align: center;
}

.orange {
  background-color: #fbbf24;
  color: white;
}

.blue {
  background-color: #d9dcff;
  color: #3a3a3a;
}

/* Стрелка */
.arrow {
  color: #888;
  font-size: 1.3rem;
}
</style>
