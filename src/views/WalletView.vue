<template>
  <div class="base">
        
    
        
    <main class="form-container">
      <img src="../assets/SpiderWallet.svg" alt="Пустой кошелёк" class="nothing-icon" />
      <p1>Увы, в кошельке пусто</p1>
      <p2>У Вас пока нет ни одной карты лояльности</p2>        
    </main>
         
  </div>
</template>




<script setup>
  import { ref } from 'vue'
  const hasCards = ref(false)



</script>
<style>
.form-container {
  flex: 1;
  display: flex;
  padding:0;
	position: absolute;
  top: 250px;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
  
  
}

.form-container p1 {
  font-size: clamp(0.75rem,4vw,1.2rem);
}

.form-container p2{
  font-size: clamp(0.6rem,3vw,1rem);
}


.nothing-icon{
  width:clamp(6.7rem, 10vw, 8rem);
  height: clamp(6.7rem, 10vw, 8rem);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .form-container {
    
  }
}


</style>