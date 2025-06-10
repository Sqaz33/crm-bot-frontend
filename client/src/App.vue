<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

onMounted(() => {
  const tg = window.Telegram?.WebApp
  if (tg?.initDataUnsafe?.user) {
    tg.expand()
    const store = useUserStore()
    store.setUser({ id: tg.initDataUnsafe.user.id })
  }
})
</script>

<template>
  <router-view />
</template>
