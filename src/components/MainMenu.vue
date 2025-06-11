<template>
  <nav class="menu">
    <div class="menu-item">Адрес</div>
    <div class="menu-item">Записи</div>
    <div class="menu-item">Поделиться</div>
    <div class="menu-item">Профиль</div>
  </nav>
</template>

<script setup>
// пока без логики
</script>

<style scoped>
.menu {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.menu-item {
  cursor: pointer;
}
</style>
