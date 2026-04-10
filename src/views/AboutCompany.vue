<template>
  <div
    class="min-h-screen bg-neutral-100 px-4 pt-16 pb-10 flex flex-col items-center justify-center"
  >
    <div
      class="w-full max-w-[420px] bg-white rounded-[24px] px-6 pb-8 pt-12 text-center relative flex flex-col min-h-[min(400px,70vh)] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-neutral-200/60"
    >
      <div v-if="loading" class="flex-1 flex justify-center items-center min-h-[280px]">
        <SpinnerLoad class="text-brand-500 w-8 h-8" />
      </div>

      <div
        v-else-if="!company || !company.name"
        class="flex-1 flex flex-col items-center justify-center min-h-[280px]"
      >
        <div
          class="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full w-[80px] h-[80px] overflow-hidden shadow-md ring-4 ring-white"
        >
          <img :src="defaultLogo" alt="Логотип" class="w-full h-full object-cover object-center block" />
        </div>
        <p class="text-neutral-500 font-medium text-[15px] mt-2">Информация не заполнена</p>
      </div>

      <div v-else class="flex flex-col flex-1 w-full">
        <div
          class="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full w-[80px] h-[80px] overflow-hidden shadow-md ring-4 ring-white"
        >
          <img
            :src="company.photo || defaultLogo"
            alt="Логотип компании"
            class="w-full h-full object-cover object-center block"
          />
        </div>

        <h1 class="text-[18px] font-semibold text-neutral-800 mb-1 px-1">{{ company.name }}</h1>

        <hr class="border-t border-neutral-200 my-5 w-full" />

        <div class="flex flex-col gap-6 w-full text-center">
          <section class="w-full">
            <h2 class="text-[#8E96A8] uppercase tracking-[0.08em] font-semibold text-[12px] mb-2">
              Адрес
            </h2>
            <p class="text-[#1C1C1E] text-[15px] leading-[1.5] whitespace-pre-line">
              {{ company.address }}
            </p>
          </section>

          <section class="w-full">
            <h2 class="text-[#8E96A8] uppercase tracking-[0.08em] font-semibold text-[12px] mb-2">
              О компании
            </h2>
            <p class="text-[#1C1C1E] text-[15px] leading-[1.5] whitespace-pre-line">
              {{ company.about_company }}
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { logger } from '@/utils/logger'
import SpinnerLoad from '@/components/ui/SpinnerLoad.vue' 
import defaultLogo from '@/assets/logo.svg'
// import reviewIcon from '@/assets/reviewIcon.svg'

const company = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data: info } = await api.get('/salon/info/')
    company.value = {
      name: info.name,
      rating: info.rating || '', 
      description: info.description || '',
      about_company: info.about_company || '',
      address: info.address || '',
      photo: info.logo_url || ''
    }
  } catch (e) {
    logger.error('AboutCompany: ошибка загрузки данных', { error: e?.message || String(e) });
  } finally {
    loading.value = false
  }
})

</script>

