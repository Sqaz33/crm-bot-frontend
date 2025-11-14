<template>
  <div class="layout">

    <main class="main-content">
		<div class="container">
				<div class="company-card">
					
					<!-- <div class="avatar" v-if="company.photo" :style="{ backgroundImage: `url(${company.photo})`, backgroundSize: 'cover' }"></div> -->
					<!-- <div class="avatar" v-else></div> -->
					
					
					<div class="avatar">
						<img src="../assets/logo.svg" alt="Company Logo" class="logo" />
					</div>
					<div class="info">
						<div class="name">{{ company.name }}</div>
						<!-- <div class="rating">⭐ {{ company.rating }}</div> -->
						<p>{{ company.description }}</p>
					</div>
				</div>

				<section class="description" v-if="company?.about_company || company?.address">
          <p v-if="company?.address">Мы находимся по адресу: {{ company.address }}</p>
          <p v-if="company?.about_company">{{ company.about_company }}</p>
        </section>

				<!-- <section class="reviews">
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
				</section> -->
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
  address:'',
  about_company: '',
  photo: ''
})

// const reviews = ref([])

onMounted(async () => {
  try {
   
    const { data: info } = await api.get('/salon/info/')
    company.value = {
      name: info.name,
      rating: info.rating,
      description: info.description || '',
      about_company: info.about_company || '',
      address: info.address || '',
      photo: info.photo || ''
    }

    
    // const { data: rev } = await api.get('/salon/reviews')
    // reviews.value = rev.map(r => ({
    //   id: r.id,
    //   author: r.client_name,
    //   date: new Date(r.created_at).toLocaleDateString(),
    //   rating: r.rating,
    //   text: r.comment
    // }))
  } catch (e) {
    console.error('Ошибка загрузки данных компании/отзывов:', e)
  }
})
</script>


<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--light-color);
  font-family:var(--font-primary) ;
	padding: 1rem clamp(1rem, 12vw, 20rem);
	
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(2rem, 5vw, 4rem) clamp(0.5rem, 3vw, 2rem);
	margin: 0;
  
}


.container {
  width: 100%;
  max-width: 950px;
  background-color: #ffffff;
  padding: 1.2rem;
  border-radius: 32px 32px 0 0;
	margin: 0;
  min-height: 100vh;
}

.description,
.review {
  background: var(--color-light);
}

.description{
  text-align: center;
  border-radius: 8px;
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
  width:clamp(5rem, 10vw, 6rem);
  height: clamp(5rem, 10vw, 6rem);
  background: #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.info .name {
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: bold;
  text-align: center;
  font-family:var(--font-primary) ;
}
.info .rating {
  color: black;
	background: #ccc;
	padding: 0.3rem 1rem 0.4rem 0.9rem;
	border-radius: 32px;
  display: block;
  margin: 0.5rem auto 0;
  width: fit-content;
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
	font-size: 1.2rem;
}
.reviewer-avatar {
  width: 32px;
  height: 32px;
  background: #ccc;
  border-radius: 50%;
  flex-shrink: 0;
}
.reviewer-info .reviewer-name {
  font-weight: bold;
	font-size: 1.2rem;
}
.reviewer-info .review-date {
  font-size: 0.75rem;
  color: #777;
}
.review-rating {
  margin-left: auto;
  color: #777;
  background: #e0e0e0;
  padding: 0rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
  white-space: nowrap;
  flex-shrink: 0;
}
.review-text {
  margin: 0;
}
@media (max-width: 765px) {
  .layout {
    padding-left: clamp(3rem, 12vw, 15rem);
    padding-right: clamp(0.2rem, 3vw, 4rem);
    margin-right: -20px;
    
  }
  .reviewer-info .reviewer-name {
	font-size: 0.75rem;
  }
  .review-text {
  font-size: 0.7rem;
  }
  .review-rating {
    width: 2.5rem;
    padding: 0.3rem;
    font-size: 0.75rem;
}
}


</style>