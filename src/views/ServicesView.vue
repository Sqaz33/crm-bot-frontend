<template>
  <div class="services-view">
    <h1>Выберите услугу</h1>

    <div v-if="loading" class="loading">Загрузка…</div>
    <div v-else>
      <div 
        v-for="type in serviceTypes" 
        :key="type.id" 
        class="type-block"
      >
        <button class="type-header" @click="toggle(type.id)">
          {{ type.name }}
          <span class="count">{{ servicesByType[type.id]?.length || 0 }}</span>
          <span class="arrow">{{ openType === type.id ? '▲' : '▼' }}</span>
        </button>
        <ul 
          v-show="openType === type.id" 
          class="service-list"
        >
          <li 
            v-for="svc in servicesByType[type.id]" 
            :key="svc.id" 
            :class="{ selected: selectedServiceId === svc.id }"
          >
            <label>
              <input 
                type="radio" 
                name="service" 
                :value="svc.id" 
                v-model="selectedServiceId"
              />
              <span class="name">{{ svc.name }}</span>
              <span class="price">{{ svc.price }} ₽</span>
            </label>
          </li>
        </ul>
      </div>

      <button 
        class="btn-next" 
        :disabled="!selectedServiceId" 
        @click="confirm"
      >
        Продолжить запись{{ selectedServiceId ? ' — ' + selectedService.price + ' ₽' : '' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const VISIT_KEY = 'visit_data'
const router = useRouter()

const loading = ref(true)
const serviceTypes = ref([]) // [{id, name}]
const services = ref([])     // [{id, name, price, ..., service_type_id}]
const openType = ref(null)
const selectedServiceId = ref(null)

function loadVisitData() {
  const raw = localStorage.getItem(VISIT_KEY)
  if (raw) {
    try { return JSON.parse(raw) } catch {}
  }
  return { staff_id: null, services_id: [], visit_time: {}, comment: '' }
}

function saveVisit(data) {
  const str = JSON.stringify(data)
  localStorage.setItem(VISIT_KEY, str)
  document.cookie = `${VISIT_KEY}=${encodeURIComponent(str)}; path=/; max-age=${365*24*60*60}; SameSite=None; Secure`
}

const visitData = ref(loadVisitData())

onMounted(async () => {
  // 1) Получаем список типов услуг (id, name)
  const { data: types } = await api.get('/services/types/')
  serviceTypes.value = types

  // 2) Получаем услуги, опционально фильтруем по staff_id
  const params = {}
  if (visitData.value.staff_id) {
    params.staff_id = visitData.value.staff_id
  }
  const { data: all } = await api.get('/services/', { params })
  services.value = all

  loading.value = false
})

const servicesByType = computed(() => {
  // Собираем услуги по service_type_id
  const map = {}
  serviceTypes.value.forEach(t => (map[t.id] = []))
  services.value.forEach(s => {
    if (!map[s.service_type_id]) map[s.service_type_id] = []
    map[s.service_type_id].push(s)
  })
  return map
})

const selectedService = computed(() =>
  services.value.find(s => s.id === selectedServiceId.value) || { price: 0 }
)

function toggle(typeId) {
  openType.value = openType.value === typeId ? null : typeId
}

function confirm() {
  if (!selectedService.value) return
  visitData.value.services_id = [ selectedService.value.id ]
  saveVisit(visitData.value)
  router.push({ name: 'appointmant' })
}
</script>

<style scoped>
.services-view {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
}
.loading {
  text-align: center;
  padding: 2rem;
}
.type-block {
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 1rem;
  overflow: hidden;
}
.type-header {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f9f9f9;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
}
.service-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  background: #fff;
}
.service-list li {
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
}
.service-list li + li {
  border-top: 1px solid #eee;
}
.service-list label {
  width: 100%;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}
.service-list .name {
  flex: 1;
}
.service-list .price {
  margin-left: 1rem;
}
.service-list li.selected {
  background: #e6f7ff;
}
.btn-next {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  margin-top: 1rem;
  cursor: pointer;
}
.btn-next:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
