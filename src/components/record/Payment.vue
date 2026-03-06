<template>
  <div v-if="!isOld" class="section" :class="{ 'section-disabled': willCome || delete_ }">
    <div class="section-bar">Оплата</div>
    <div class="list">
      <div class="list-item disabled" tabindex="-1" aria-disabled="true">
        <span class="icon-circle lock-icon" aria-hidden="true">
          <img src="../../assets/castle.svg" alt="" class="icon-14" />
        </span>
        <span class="text">Оплата недоступна</span>
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
.section{margin-bottom:12px;max-width:100%;}
.section-disabled{
  opacity: 0.4;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.section-bar{
  background:var(--primary);color:#8097B1;font-weight:400;
  padding:10px 12px;border-radius:10px 10px 0 0;
  letter-spacing:.02em;text-transform:uppercase;
}
.list{
  background:#fff;border:1px solid var(--divider);border-top:none;
  border-radius:0 0 12px 12px;overflow:hidden;max-width:100%;
}
.list-item{
  display:flex;align-items:center;gap:10px;padding:14px 12px;width:100%;
  border-top:1px solid var(--divider);background:#fff;text-align:left;
}
.list-item{border:none}
.list-item .text{
  flex:1 1 auto;color:var(--text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.list-item .chevron{font-size:18px;opacity:.4}
.list-item.disabled{opacity:.55;pointer-events:none}
.list-item.danger .text{color:#d9534f}
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
.icon-14 {max-width: 60%;}

@media (max-width: 768px){
  .list-item{ padding:12px; }
}
</style>