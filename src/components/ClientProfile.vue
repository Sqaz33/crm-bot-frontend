<template>
  <div class="bg-white rounded-3xl p-4 shadow-sm mb-3">
    <div class="text-xs font-bold text-gray-500 mb-1.5 tracking-wide">ПРОФИЛЬ КЛИЕНТА</div>
    <div class="flex items-center gap-2 bg-[#F6F9FC] rounded-2.5 p-2.5 font-semibold">
      <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#666FE8] text-white">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </span>
      <span>{{ clientName }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  clientName: {
    type: String,
    default: '—'
  }
})
</script>