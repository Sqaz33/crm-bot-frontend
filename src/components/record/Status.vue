<template>
  <div class="card-status">
    <div class="status-info">
      <img
        :src="statusMessage[visit.status]?.icon || clockIcon"
        :alt="statusMessage[visit.status]?.title || 'Статус'"
        :class="['status-icon', statusMessage[visit.status]?.bgClass || 'status-icon-waiting']"
      />
      <div class="status-badge">
        {{ statusMessage[visit.status]?.title || 'Ожидание' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import crossIcon from '../../assets/crossIcon.svg'
import checkmarkIcon from '../../assets/checkmarkIcon.svg'
import clockIcon from '../../assets/clockIcon.svg'

const props = defineProps({
  visit: {
    type: Object,
    required: true
  }
})

/* Преобразование статуса в сообщение пользователю */
const statusMessage = {
  "waiting": { icon: clockIcon, bgClass: 'status-icon-waiting', title: "Ожидание" },
  "confirmed": { icon: checkmarkIcon, bgClass: 'status-icon-confirmed', title: "Подтверждено"},
  "canceled": { icon: crossIcon, bgClass: 'status-icon-canceled', title: "Отменено" },
  "missing": { icon: crossIcon, bgClass: 'status-icon-missed', title: "Пропущена" },
  "success": { icon: checkmarkIcon, bgClass: 'status-icon-paid', title: "Оплачено" },
}
</script>

<style scoped>
@config "../../tailwind.config.js";

.card-status {
  @apply bg-neutral-0;
  @apply rounded-xl;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 12px;
  margin-bottom: 12px;
  max-width: 100%;
}
.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}
.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.status-icon-paid {
  background-color: #00BB83;
}
.status-icon-canceled {
  background-color: #DE5D93;
}
.status-icon-missed {
  background-color: #8096b0;
}
.status-icon-confirmed {
  background-color: #6dadff;
}
.status-icon-waiting {
  background-color: #f3a950;
}
.status-badge {
  @apply text-neutral-800;
  font-weight: 600;
  font-size: 14px;
}
</style>