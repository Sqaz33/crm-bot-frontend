<template>
  <section class="flex min-h-[70vh] w-full items-center justify-center px-4 py-10 sm:px-6">
    <div class="flex max-w-[320px] flex-col items-center text-center">
      <img
        :src="emptyShopIcon"
        alt="Пустой магазин"
        class="mb-6 h-28 w-28 sm:h-32 sm:w-32"
      />
      <p class="text-[18px] font-medium leading-6 text-neutral-800">Вы скоро сможете что-то купить</p>
    </div>
  </section>
</template>

<script setup>
import emptyShopIcon from '../assets/PercentShop.svg'
</script>
