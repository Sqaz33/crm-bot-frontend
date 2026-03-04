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
import SpinnerLoad from '@/components/SpinnerLoad.vue'
import defaultLogo from '@/assets/logo.svg'
import reviewIcon from '@/assets/reviewIcon.svg'

const company = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data: info } = await api.get('/salon/info/')
    company.value = {
      name: info.name,
      rating: info.rating,
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
</script>