<template>
  <div class="base">
      
    <SidebarMenu :items="menuItems" class="sidebar" />

    <main class="empty-content">
      <img src="../assets/PercentShop.svg" alt="Пустой магазин" class="empty-icon" />
      <p1>Магазин скоро откроется</p1>
      <p2>Скоро Вы сможете что-то купить...</p2>
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