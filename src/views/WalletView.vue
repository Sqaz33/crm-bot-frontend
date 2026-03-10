<template>
  <div 
    v-if="!hasCards"
    class="flex h-full flex-col items-center justify-center text-center"
  >
    <img 
      src="../assets/SpiderWallet.svg" 
      alt="Пустой кошелёк" 
      class="w-[clamp(6.7rem,10vw,8rem)] h-[clamp(6.7rem,10vw,8rem)] mb-4" 
    />

    <p class="text-[clamp(0.6rem,3vw,1rem)] text-gray-500 font-semibold">
      У Вас пока нет ни одной карты лояльности
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const hasCards = ref(false)
</script>