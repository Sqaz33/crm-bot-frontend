<template>
  <div class="p-4 bg-neutral-100 min-h-screen pt-16">
    
    <div class="bg-white rounded-[24px] px-6 pb-6 pt-12 text-center relative flex flex-col min-h-[400px]">

      <div v-if="loading" class="flex-1 flex justify-center items-center">
        <SpinnerLoad class="text-brand-500 w-8 h-8" />
      </div>

      <div v-else-if="!company || !company.name" class="flex-1 flex flex-col items-center justify-center">
        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-500 rounded-full w-[80px] h-[80px] flex justify-center items-center overflow-hidden shadow-sm">
          <img :src="defaultLogo" alt="Логотип" class="w-10 h-10" />
        </div>
        <p class="text-neutral-500 font-medium text-[15px] mt-2">Информация не заполнена</p>
      </div>

      <div v-else class="flex flex-col text-center flex-1">
        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-500 rounded-full w-[80px] h-[80px] flex justify-center items-center overflow-hidden shadow-sm">
           <img :src="company.photo || defaultLogo" alt="Логотип компании" class="w-10 h-10 object-cover" />
        </div>

        <h1 class="text-[18px] font-semibold text-neutral-800 mb-2">{{ company.name }}</h1>

        <div v-if="company.rating" class="inline-flex items-center justify-center bg-neutral-100 rounded-full px-3 py-1 mb-6 text-[13px] font-medium text-neutral-700 mx-auto gap-1">
          <img :src="reviewIcon" alt="Star" class="w-4 h-4" />
          <span>{{ company.rating }}</span>
        </div>

        <hr class="border-t border-neutral-200 mb-4" />

        <div class="text-left">
          <h2 class="text-[#8E96A8] uppercase tracking-wider font-semibold text-[12px] mb-2">О компании</h2>
          <p class="text-[#1C1C1E] text-[15px] leading-relaxed">
            {{ company.about_company }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { logger } from '@/utils/logger'
// Исправленный путь: добавили папку ui
import SpinnerLoad from '@/components/ui/SpinnerLoad.vue' 
import defaultLogo from '@/assets/logo.svg'
import reviewIcon from '@/assets/reviewIcon.svg'

const company = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data: info } = await api.get('/salon/info/')
    company.value = {
      name: info.name,
      rating: info.rating || '5', 
      description: info.description || '',
      about_company: info.about_company || '',
      photo: info.photo || ''
    }
  } catch (e) {
    logger.error('AboutCompany: ошибка загрузки данных', { error: e?.message || String(e) });
  } finally {
    loading.value = false
  }
})
<<<<<<< HEAD
</script>
=======
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
  background: #D4DDE9;
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
	background: #D4DDE9;
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
	background: #D4DDE9;
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
  background: #D4DDE9;
  border-radius: 50%;
  flex-shrink: 0;
}
.reviewer-info .reviewer-name {
  font-weight: bold;
	font-size: 1.2rem;
}
.reviewer-info .review-date {
  font-size: 0.75rem;
  color: #475569;
}
.review-rating {
  margin-left: auto;
  color: #475569;
  background: #D4DDE9;
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
>>>>>>> koptev/tilwind-redesign
