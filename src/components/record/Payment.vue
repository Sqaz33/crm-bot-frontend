<template>
  <div v-if="!isOld" class="payment" :class="{ 'payment-disabled': willCome || delete_ }">
    <div class="title">Оплата</div>
    <div class="list">
      <div class="list-item disabled" tabindex="-1" aria-disabled="true">
        <span class="icon-circle lock-icon" aria-hidden="true">
          <img src="../../assets/castle.svg" alt="" class="icon-14" />
        </span>
        <span class="text">Оплата наличными или картой в салоне</span>
        <span class="chevron">›</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOld: {
    type: Boolean,
    required: true
  },
  willCome: {
    type: Boolean,
    required: true
  },
  delete_: {
    type: Boolean,
    required: true
  }
})
</script>

<style scoped>
@config "../../tailwind.config.js";

.payment {
  margin-bottom: 12px;
  max-width: 100%;
}
.payment-disabled {
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.title {
  @apply text-neutral-500;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  padding-left: 12px;
  margin-bottom: 12px;
}
.list {
  @apply bg-neutral-0;
  @apply rounded-xl;
  overflow: hidden;
  max-width: 100%;
}
.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  width: 100%;
  text-align: left;
}
.list-item .text {
  @apply text-neutral-600;
  font-size: 12px;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list-item .chevron {
  font-size: 18px;
  opacity: .4
}
.list-item.disabled {
  opacity: .55;
  pointer-events: none
}
.list-item.danger .text { 
  @apply text-red-700;
}
.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}
.lock-icon {
  background-color: #7F8287; 
  color: #020202;
}
.icon-14 { max-width: 60%; }

@media (max-width: 768px){
  .list-item { padding: 12px; }
}
</style>