<template>
  <nav class="menu">
    <div class="menu-item">Адрес</div>
    <div class="menu-item">Записи</div>
    <div class="menu-item">Поделиться</div>
    <div class="menu-item">Профиль</div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeItem = ref('Адрес')

const navigate = (item) => {
  activeItem.value = item
  switch (item) {
    case 'Адрес':
      router.push('/address')
      break
    case 'Записи':
      router.push('/records')
      break
    case 'Поделиться':
      router.push('/share')
      break
    case 'Профиль':
      router.push('/profile')
      break
  }
}
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
