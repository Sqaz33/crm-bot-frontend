<template>
  <div class="bg-neutral-0 rounded-xl flex justify-between items-start gap-4 p-3 mb-3 max-w-full">
    <VisitStatus :status="visit.status" size="lg" :show-subtitle="false" />
  </div>
</template>

<script setup>
import VisitStatus from './VisitStatus.vue'

const props = defineProps({
  visit: {
    type: Object,
    required: true
  }
})
</script>
