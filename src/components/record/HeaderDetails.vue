<template>
  <div class="details">
    <div class="row services-row">
      <div class="service-name">{{ service.name }}</div>
      <div class="price">{{ service.price }} ₽</div>
      <div class="duration">{{ service.duration }} мин</div>
    </div>
    <div class="row footer-row">
      <div class="total-price-title">Итого к оплате</div>
      <div class="total-price">{{ service.price }} ₽</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
@config "../../tailwind.config.js";
*, *::before, *::after { box-sizing: border-box; }

.details {
  padding: 5px 12px 10px 12px;
  margin-bottom: 12px;
  overflow: hidden;
  max-width: 100%;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: 
    "name name"
    "duration price";
  column-gap: 10px;
  row-gap: 1px;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}
.row > *{ min-width: 0; }
.services-row {
  border-top: 1px solid #EBEEF6;
  border-bottom: 1px solid #EBEEF6;
  padding: 10px 0px;
}
.service-name {
  @apply text-neutral-800;
  grid-area: name;
  font-size: 14px;
  font-weight: 600;
  min-width: 0;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.price {
  @apply text-neutral-800;
  grid-area: price;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.duration {
  @apply text-neutral-500;
  grid-area: duration;
  font-size: 12px;
}
.footer-row {
  margin-top: 12px;
}
.total-price-title {
  @apply text-neutral-800;
  font-size: 14px;
  font-weight: 600;
}
.total-price {
  @apply text-neutral-800;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 768px){
  .details { padding: 10px 12px; }
}
</style>