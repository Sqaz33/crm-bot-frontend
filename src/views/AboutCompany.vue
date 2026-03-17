<template>
  <div class="p-4 bg-neutral-100 min-h-screen pt-16">
    
    <div class="bg-white rounded-[24px] px-6 pb-6 pt-12 text-center relative flex flex-col min-h-[400px]">

      <div v-if="loading" class="flex-1 flex justify-center items-center">
        <SpinnerLoad class="text-brand-500 w-8 h-8" />
      </div>

      <div v-else-if="salon.error || !salon.name" class="flex-1 flex flex-col items-center justify-center">
        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-500 rounded-full w-[80px] h-[80px] flex justify-center items-center overflow-hidden shadow-sm">
          <img :src="defaultLogo" alt="Логотип" class="w-10 h-10" />
        </div>
        <p class="text-neutral-500 font-medium text-[15px] mt-2">Информация не заполнена</p>
      </div>

      <div v-else class="flex flex-col text-center flex-1">
        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-500 rounded-full w-[80px] h-[80px] flex justify-center items-center overflow-hidden shadow-sm">
           <img
             :src="salon.logoUrl || defaultLogo"
             alt="Логотип компании"
             class="w-10 h-10 object-cover"
             @error="(e) => e.target.src = defaultLogo"
           />
        </div>

        <h1 class="text-[18px] font-semibold text-neutral-800 mb-2">{{ salon.name }}</h1>

        <!-- <div v-if="salon.rating" class="inline-flex items-center justify-center bg-neutral-100 rounded-full px-3 py-1 mb-6 text-[13px] font-medium text-neutral-700 mx-auto gap-1">
          <img :src="reviewIcon" alt="Star" class="w-4 h-4" />
          <span>{{ salon.rating }}</span>
        </div> -->

        <hr class="border-t border-neutral-200 mb-4" />

        

        <div class="text-left">
          <h2 class="text-[#8E96A8] uppercase tracking-wider font-semibold text-[12px] mb-2">Адрес:</h2>
          <div class="text-[#1C1C1E] text-[15px] leading-relaxed">
            {{ salon.address }}
          </div>
          <br>
          <h2 class="text-[#8E96A8] uppercase tracking-wider font-semibold text-[12px] mb-2">О компании</h2>
          <p class="text-[#1C1C1E] text-[15px] leading-relaxed">
            {{ salon.aboutCompany }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSalonStore } from '@/stores/salon'
import SpinnerLoad from '@/components/ui/SpinnerLoad.vue' 
import defaultLogo from '@/assets/logo.svg'

const salon = useSalonStore()
const loading = ref(true)

onMounted(async () => {
  await salon.fetch()
  loading.value = false
})

</script>
