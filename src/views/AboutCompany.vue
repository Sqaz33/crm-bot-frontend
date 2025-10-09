<template>
  <div class="layout">

    <main class="main-content">
		<div class="container">
				<div class="company-card">
					<div class="avatar" v-if="company.photo" :style="{ backgroundImage: `url(${company.photo})`, backgroundSize: 'cover' }"></div>
					<div class="avatar" v-else></div>
					<div class="info">
						<div class="name">{{ company.name }}</div>
						<div class="rating">⭐ {{ company.rating }}</div>
						<p>{{ company.description }}</p>
					</div>
				</div>

				<section class="description" v-if="company.about_company">
					<p>{{ company.about_company }}</p>
				</section>

				<section class="reviews">
					<h2>Отзывы <span class="count">{{ reviews.length }}</span></h2>
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
			</div>
    </main>
		
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'


const company = ref({
  name: '',
  rating: 0,
  description: '',
  about_company: '',
  photo: ''
})

const reviews = ref([])

onMounted(async () => {
  try {
   
    const { data: info } = await api.get('/salon/info')
    company.value = {
      name: info.name,
      rating: info.rating,
      description: info.description || 'Описание компании отсутствует.',
      about_company: info.about_company || '',
      photo: info.photo || ''
    }

    
    const { data: rev } = await api.get('/salon/reviews')
    reviews.value = rev.map(r => ({
      id: r.id,
      author: r.client_name,
      date: new Date(r.created_at).toLocaleDateString(),
      rating: r.rating,
      text: r.comment
    }))
  } catch (e) {
    console.error('Ошибка загрузки данных компании/отзывов:', e)
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
  padding: 1rem clamp(2rem, 15vw, 20rem);
  background: var(--color-light);
	height: 100vh;
}

.container {
  margin: 5rem 3.5rem 0; 
	background: #fff;
	border-radius: 32px;
	height: 100vh;
	padding: 0 1.5rem 0.5rem;
}

.description,
.review {
  background: var(--color-light);
}

.about-company {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem; 
  border-radius: 8px;
}

.company-card {
  display: flex;
  align-items: center;
	flex-direction: column;
  gap: 1rem;
  padding: 0;
  background-color: rgba(0, 0, 0, 0);
  position: relative;
	bottom: 50px;
}
.avatar {
  width: 100px;
  height: 100px;
  background: #ccc;
  border-radius: 50%;

}
.info .name {
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: bold;
  font-family:var(--font-primary) ;
}
.info .rating {
  color: black;
	background: #ccc;
	padding: 0.3rem 1rem 0.4rem 0.9rem;
	border-radius: 32px;
}
.description,
.reviews {
  margin-top: 2rem;
}
.reviews h2 {
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: 0.5rem;
  font-family:var(--font-primary);
	font-weight: normal;
	color: black;
}

.count {
  font-size: clamp(0.5rem, 3vw, 0.9rem);
  font-weight: normal;
	background: #ccc;
	padding: 0.1rem 0.8rem;
	border-radius: 32px;
	color: black;
}

.review {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
	font-size: clamp(1rem, 3vw, 1.2rem);
}
.reviewer-avatar {
  width: 32px;
  height: 32px;
  background: #ccc;
  border-radius: 50%;
}
.reviewer-info .reviewer-name {
  font-weight: bold;
	font-size: clamp(1rem, 3vw, 1.2rem);
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

