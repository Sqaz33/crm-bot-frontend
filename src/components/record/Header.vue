<template>
  <div class="bg-neutral-0 rounded-xl">
    <HeaderTitle
      :firstLetter="firstLetter"
      :staff="staff"
      :visit="visit"
    />

    <HeaderDetails
      v-if="service?.id"
      :service="service"
    />
  </div>
</template>

<script setup>
import HeaderDetails from './HeaderDetails.vue'
import HeaderTitle from './HeaderTitle.vue'

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
  },
  service: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
</style>