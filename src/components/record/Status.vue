<template>
  <div class="card-status">
    <div class="status-info">
      <img
        :src="statusMessage[visit.status]?.icon || clockIcon"
        :alt="statusMessage[visit.status]?.title || 'Статус'"
        :class="['status-icon', statusMessage[visit.status]?.bgClass || 'status-icon-waiting']"
      />
      <div class="status-badge-reason">
        <span class="status-badge">
          {{ statusMessage[visit.status]?.title || 'Ожидание' }}
        </span>
        <div class="status-reason">
          {{ statusMessage[visit.status]?.subtitle || 'Ждем вас в салоне' }}
        </div>
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
  "waiting": { icon: clockIcon, bgClass: 'status-icon-waiting', title: "Ожидание", subtitle: "Ждем вас в салоне" },
  "confirmed": { icon: checkmarkIcon, bgClass: 'status-icon-confirmed', title: "Подтверждено", subtitle: "Ждем вас в салон" },
  "missing": { icon: crossIcon, bgClass: 'status-icon-unpaid', title: "Не оплачено", subtitle: "Визит отменен / клиент не пришел" },
  "success": { icon: checkmarkIcon, bgClass: 'status-icon-paid', title: "Оплачено", subtitle: "Визит прошел успешно" },
}
</script>

<style scoped>
.card-status{
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  background: #fff;
  border: 1px solid var(--divider);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  max-width: 100%;
}
.status-info{
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.status-icon{
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
.status-icon-unpaid {
  background-color: #DE5D93;
}
.status-icon-confirmed {
  background-color: #6dadff;
}
.status-icon-waiting {
  background-color: #f3a950;
}
.status-badge-reason{
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.status-badge{
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: rgba(69, 69, 88, 1);
}
.status-reason{
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5rem;
  color: rgba(69, 69, 88, 1);
}
</style>