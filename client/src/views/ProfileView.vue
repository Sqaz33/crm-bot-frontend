<template>
    <div>
      <h1>Профиль</h1>
      <p>user_id: {{ user?.id }}</p>
    </div>
  </template>
  
  <script setup>
  import { useUserStore } from '../stores/user'
  const store = useUserStore()
  const user = store.user
  </script>
  