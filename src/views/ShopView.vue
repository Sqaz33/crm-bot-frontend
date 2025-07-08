<template>
  <div class="shop-page">
    <SidebarMenu :items="menuItems" class="sidebar" />

    <main class="shop-content">
      <div class="shop-empty-p">
        <img src="../assets/PercentShop.svg" alt="Пустой магазин" class="shop-empty-icon" />
        <p>Магазин скоро откроется</p>
        <p>Скоро Вы сможете что-то купить...</p>
      </div>
    </main>
  </div>
</template>



<script setup>
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
.shop-page {
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


.shop-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
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
  color: #787b80;
}

.shop-empty-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

</style>