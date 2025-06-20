<template>
    <div class="topbar">
      <div class="bot-name">{{ botName }}</div>
    </div>
    <header class="header">
      <h1 class="page-title">{{ title }}</h1>
      <slot name="actions" />
    </header>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const title = route.meta.title || route.name || 'Страница'
  const botName = import.meta.env.VITE_APP_NAME || 'БЬЮТИ-БОТ'
  </script>
  
  <style scoped>
  .topbar {
    background-color: #333;
    color: white;
    padding: 0.75rem 1rem;
    font-weight: bold;
    font-size: 1rem;
  }
  
  .bot-name {
    text-transform: uppercase;
  }
  
  .header {
    background-color: #f5f7fa;
    text-align: center;
    padding: 1rem;
    border-bottom: 1px solid #ccc;
  }
  
  .page-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
  }
  </style>
  