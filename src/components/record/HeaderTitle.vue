<template>
  <div class="header">
    <div class="who">
      <div class="avatar">{{ firstLetter }}</div>
      <div class="info">
        <div class="name">
        {{ staff.name }}
        </div>
        <div class="spec">{{ staff.specializations?.join(', ') }}</div>
      </div>
    </div>
    <div class="datetime">{{ formatDate(visit.visit_date_time) }}</div>
  </div>
</template>

<script setup>
import { formatDate } from '../../utils/dateFormatters'

const props = defineProps({
  firstLetter: {
    type: String,
    required: true
  },
  staff: { 
    type: Object, 
    required: true 
  },
  visit: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  background:#EEF3FF;
  border-radius:12px;
  padding:10px 12px;
  margin-bottom:12px;
  max-width:100%;
}
.header > *{ min-width:0; }    
.who{display:flex;align-items:center;gap:10px;min-width:0;}
.avatar{
  width:24px;height:40px;border-radius:50%;
  background:var(--green);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:16px;flex:0 0 40px;
}
.info{min-width:0;}
.name{
  font-weight:800;font-size:14px;color:var(--text);line-height:1.1;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.spec{
  font-size:12px;color:var(--muted);margin-top:2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.datetime{
  font-size:12px;color:#6f7a87;
  overflow:hidden;text-overflow:ellipsis;max-width:40%;
}

@media (max-width: 768px){
  .header{ padding:10px 12px; }
}
</style>