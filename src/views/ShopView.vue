<template>
  <div class="base">
      
    <main class="form-container">
      <img src="../assets/PercentShop.svg" alt="Пустой магазин" class="nothing-icon" />
      <p1>Магазин скоро откроется</p1>
      <p2>Скоро Вы сможете что-то купить...</p2>        
    </main>

  </div>
</template>

<script>
</script>

<style>

.form-container {
  flex: 1;
  display: flex;
  padding:6rem;
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

    padding: initial;
    padding-right: 3rem!important;
  }
}

</style>
