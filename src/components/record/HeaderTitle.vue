<template>
  <div class="flex flex-col justify-between gap-3 p-2.5 px-3 max-w-full">
    <div class="flex items-center gap-2.5 min-w-0">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#69FFDB] to-[#69FF03] flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
        {{ firstLetter }}
      </div>
      <div class="min-w-0">
        <div class="text-neutral-800 font-semibold text-sm truncate">
        {{ staff.name }}
        </div>
        <div class="text-neutral-800 text-xs mt-[2px] truncate">
          {{ staff.specializations?.join(', ') }}
        </div>
      </div>
    </div>
    <div class="text-neutral-800 text-xs truncate">
      {{ formatDate(visit.visit_date_time) }}
    </div>
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
</style>