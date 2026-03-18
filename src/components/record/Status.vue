<template>
  <div class="bg-neutral-0 rounded-xl flex justify-between items-start gap-4 p-3 mb-3 max-w-full">
    <div class="flex items-center gap-3 overflow-hidden">
      <div 
        class="w-10 h-10 rounded-full flex items-center justify-center p-2 flex-shrink-0"
        :class="statusMessage[visit.status]?.bg"
      >
        <img
          :src="statusMessage[visit.status]?.icon || clockIcon"
          :alt="statusMessage[visit.status]?.title || 'Статус'"
          class="max-w-full h-auto"
        />
      </div>
      <div class="text-neutral-800 font-semibold text-sm">
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
  "waiting": { icon: clockIcon, bg: 'bg-[#f3a950]', title: "Ожидание" },
  "confirmed": { icon: checkmarkIcon, bg: 'bg-[#6dadff]', title: "Подтверждено"},
  "canceled": { icon: crossIcon, bg: 'bg-[#DE5D93]', title: "Отменено" },
  "missing": { icon: crossIcon, bg: 'bg-[#8096b0]', title: "Пропущено" },
  "success": { icon: checkmarkIcon, bg: 'bg-[#00BB83]', title: "Оплачено" },
}
</script>

<style scoped>
</style>