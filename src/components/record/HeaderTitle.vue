<template>
  <div class="header-title">
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
@config "../../tailwind.config.js";
*, *::before, *::after { box-sizing: border-box; }

.header-title {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 5px 12px;
  max-width: 100%;
}
.header-title > *{ min-width: 0; }    
.who {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.avatar {
  width: 24px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #69FFDB, #69FF03);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  flex: 0 0 40px;
}
.info { min-width: 0; }
.name {
  @apply text-neutral-800;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.spec {
  @apply text-neutral-800;
  font-size: 12px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.datetime {
  @apply text-neutral-800;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40%;
}

@media (max-width: 768px){
  .header-title { padding: 1 0px 12px; }
}
</style>