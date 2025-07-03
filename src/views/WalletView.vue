<template>
  <div class="for-all-pages">


    <main class="wallet-content">
      <div v-if="!hasCards">
        <div class="wallet-empty-p">
          <img src="../assets/SpiderWallet.svg"
            alt="Пустой кошелёк"
            class="wallet-empty-icon">

          <p>Увы, в кошельке пусто</p>
          <p>У Вас пока нет ни одной карты лояльности</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  const hasCards = ref(false)
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

.wallet-content {
  width: 100%; 
  height: calc(100vh - 47px); 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  box-sizing: border-box; 
}

.wallet-empty-p {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: black; 
}
  .wallet-empty-p p:last-child {
	font-size: 1rem;
	font-weight: normal;
	color: #787B80;
	}

.wallet-empty-icon {
  width: 100px;
  height: 100px;
}
</style>