<template>
  <section v-if="!hasCards" class="flex min-h-[70vh] w-full items-center justify-center px-4 py-10 sm:px-6">
    <div class="flex max-w-[320px] flex-col items-center text-center">
      <img
        :src="SpiderWalletIcon"
        alt="Пустой кошелёк"
        class="mb-6 h-28 w-28 sm:h-32 sm:w-32"
      />
      <p class="text-[18px] font-medium leading-6 text-neutral-800">У Вас пока нет ни одной карты лояльности</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import SpiderWalletIcon from '../assets/SpiderWallet.svg'

const hasCards = ref(false)
</script>
