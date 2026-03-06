<template>
  <div class="details">
    <div class="row header-row">
      <div>Услуга</div>
      <div>Стоимость</div>
    </div>
    <div class="row">
      <div class="service-name">{{ service.name }}</div>
      <div class="price">{{ service.price }} ₽</div>
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
*, *::before, *::after { box-sizing: border-box; }

.details{
  background:#F3F5F8;border-radius:12px;padding:10px 12px;margin-bottom:12px;
  overflow:hidden;max-width:100%;
}
.row{
  display:flex;justify-content:space-between;gap:8px;min-width:0;max-width:100%;
}
.header-row{
  font-weight:700;color:#647089;
  padding-bottom:8px;border-bottom:1px solid #e6e9f0;margin-bottom:8px;
}
.row > *{ min-width:0; }
.header-row > *{ min-width:0; }
.service-name{
  min-width:0;max-width:70%;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.price{font-weight:700;color:var(--text);}
@media (max-width: 768px){
  .details{ padding:10px 12px; }
}
</style>