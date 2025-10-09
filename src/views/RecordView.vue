<template>
  <div class="p-6">
    <h2 class="text-2xl font-semibold mb-4">Просмотр записи</h2>
    <p><strong>ID записи:</strong> {{ visitId }}</p>
    <p><strong>Старая запись:</strong> {{ isOld ? 'Да' : 'Нет' }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// достаем параметры
const visitId = route.params.id
const isOld = route.query.isOld === 'true'

console.log('Открыта запись с id:', visitId, 'isOld =', isOld)
</script>

<style scoped>
p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}
</style>
