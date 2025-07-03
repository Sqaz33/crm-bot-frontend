<template>
  <div class="for-all-pages">


    <main class="shop-content">
      <div class="shop-empty-p">
        <img src="../assets/PercentShop.svg"
          alt="Пустой магазин"
          class="shop-empty-icon">

        <p>Магазин скоро откроется</p>
        <p>Скоро Вы сможете что-то купить...</p>
      </div>
    </main>

  </div>
</template>

<script setup>

</script>

<style scoped>
.for-all-pages {
  background-color: #E7EAED;
  min-height: 100vh;
  padding-bottom: 2rem;
  font-family: sans-serif;
}

.header-all-pages {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #F6F9FC; 
  color: black;
  max-height: 47px;
  box-sizing: border-box;   
}

.section-title {
  text-align: center;     
  font-size: 1.2rem;
  font-weight: 600;
  display: inline-block;
  padding: 0.5rem 2rem;
}

.shop-content {
  width: 100%; 
  height: calc(100vh - 47px); 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  box-sizing: border-box; 
}

.shop-empty-p {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: black; 
}

  .shop-empty-p p:last-child {
      font-size: 1rem;
      font-weight: normal;
      color: #787B80;   
    }

.shop-empty-icon {
  width: 100px;
  height: 100px;
}
</style>