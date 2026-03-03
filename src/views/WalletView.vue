<template>
  <main 
    v-if="!hasCards"
    class="absolute top-[250px] inset-0 flex flex-col items-center p-0 overflow-y-auto"
  >
    <img 
      src="../assets/SpiderWallet.svg" 
      alt="Пустой кошелёк" 
      class="w-[clamp(6.7rem,10vw,8rem)] h-[clamp(6.7rem,10vw,8rem)] mb-4" 
    />

    <p class="text-[clamp(0.6rem,3vw,1rem)] text-gray-500">
      У Вас пока нет ни одной карты лояльности
    </p>
  </main>
</template>

<script setup>
import { ref } from 'vue'
const hasCards = ref(false)
</script>