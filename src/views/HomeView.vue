<template>
  <div class="home-view">
    <header class="header">
      <div class="logo-block">
        <div class="logo"></div>
        <div>
          <div class="name">Название</div>
          <div class="type">тип заведения</div>
        </div>
      </div>
      <MainMenu />
    </header>

    <main class="content">
      <h2 class="section-title">Персональные услуги</h2>

      <div class="cards">
        <div class="card">
          <span>Кошелёк</span>
          <span class="badge">0</span>
        </div>
        <div class="card">
          <span>Магазин</span>
          <span class="arrow">›</span>
        </div>
        <div class="card">
          <span>Отзывы</span>
          <span class="badge">0</span>
        </div>
        <div class="card">
          <span>О компании</span>
          <span class="arrow">›</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import MainMenu from '../components/MainMenu.vue'
</script>

<style scoped>
.home-view {
  background-color: #f5f8fd;
  min-height: 100vh;
  padding-bottom: 2rem;
  font-family: sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1f1f1f;
  color: white;
  padding: 1rem;
}

.logo-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  width: 40px;
  height: 40px;
  background-color: #ccc;
  border-radius: 4px;
}

.name {
  font-weight: bold;
  font-size: 1rem;
}

.type {
  font-size: 0.75rem;
  opacity: 0.7;
}

.section-title {
  text-align: center;
  margin: 2rem 0 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: white;
  display: inline-block;
  padding: 0.5rem 2rem;
  border-radius: 8px;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.badge {
  background-color: #e0e0e0;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.arrow {
  font-size: 1.4rem;
  color: #999;
}
</style>

