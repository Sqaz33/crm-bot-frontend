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
import { ref, onMounted } from 'vue'
import api from '../../api'
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

const logoUrl = ref('')

async function loadSalonInfo() {
  try {
    const { data } = await api.get('/salon/info/')
    logoUrl.value = data.logo_url || ''
  } catch (error) {
    console.error('Ошибка загрузки логотипа:', error)
    logoUrl.value = ''
  }
}

onMounted(() => {
  loadSalonInfo()
})
</script>

<style scoped>
</style>