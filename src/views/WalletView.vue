<template>
  <div class="wallet-page">
    <SidebarMenu :items="menuItems" class="sidebar" />

    <main class="wallet-content">
      <div v-if="!hasCards">
        <div class="wallet-empty-p">
          <img src="../assets/SpiderWallet.svg"
            alt="Пустой кошелёк"
            class="wallet-empty-icon" />

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

  import SidebarMenu from '../components/Sidebar.vue'
// Sidebar menu items
const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/company' }
]
</script>

<style scoped>
.wallet-page {
  display: flex;
  min-height: 100vh;
  background-color: #f6f9fc;
  font-family: sans-serif;
}


.sidebar {
  width: 200px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
}


.wallet-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
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
  color: #787b80;
}

.wallet-empty-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

</style>