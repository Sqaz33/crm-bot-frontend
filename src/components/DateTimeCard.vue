<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <!-- Date and Time -->
    <div class="flex justify-between items-center">
      <!-- Left: Day, Month, Weekday -->
      <div class="flex items-center gap-2">
        <!-- Day in rounded square -->
        <div class="bg-[#d4dde9] rounded-lg px-3 py-1.5 text-xl font-bold text-gray-900">
          {{ day || '—' }}
        </div>
        <!-- Month and Weekday outside square (same line, comma separated) -->
        <div class="text-lg font-semibold text-gray-900 leading-tight">
          {{ month }}, {{ weekday }}
        </div>
      </div>
      
      <!-- Right: Time -->
      <div class="text-lg font-bold text-gray-900">
        {{ time || '—' }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  date: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  day: {
    type: [String, Number],
    default: ''
  },
  month: {
    type: String,
    default: ''
  },
  weekday: {
    type: String,
    default: ''
  }
})
</script>
