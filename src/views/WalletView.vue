<template>
  <div class="base">
        
    
        
    <main class="empty-content">
      <img src="../assets/SpiderWallet.svg" alt="Пустой кошелёк" class="empty-icon" />
      <p1>Увы, в кошельке пусто</p1>
      <p2>У Вас пока нет ни одной карты лояльности</p2>        
    </main>
         
  </div>
</template>




<script setup>
  import { ref } from 'vue'
  const hasCards = ref(false)



</script>
