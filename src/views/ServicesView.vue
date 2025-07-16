<template>
  <div class="services-view">
    <h1>Выберите услугу</h1>

    <div v-if="loading" class="loading">Загрузка…</div>
    <div v-else>
      <div 
        v-for="type in serviceTypes" 
        :key="type" 
        class="type-block"
      >
        <button class="type-header" @click="toggle(type)">
          {{ type }}
          <span class="count">{{ servicesByType[type]?.length || 0 }}</span>
          <span class="arrow">{{ openType === type ? '▲' : '▼' }}</span>
        </button>
        <ul 
          v-show="openType === type" 
          class="service-list"
        >
          <li 
            v-for="svc in servicesByType[type]" 
            :key="svc.id" 
            :class="{ selected: selectedService?.id === svc.id }"
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
        :disabled="!selectedService" 
        @click="confirm"
      >
        Продолжить запись{{ selectedService ? ' — ' + selectedService.price + ' ₽' : '' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const VISIT_KEY = 'visit_data'

const loading = ref(true)
const serviceTypes = ref([])
const services = ref([])
const openType = ref(null)
const selectedServiceId = ref(null)
const router = useRouter()

// Считываем куку
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : null
}
// Запись в куку и localStorage
function saveVisit(data) {
  const str = JSON.stringify(data)
  document.cookie = `${VISIT_KEY}=${encodeURIComponent(str)}; path=/; max-age=${365*24*60*60}; SameSite=None; Secure`
  localStorage.setItem(VISIT_KEY, str)
}

const visitData = ref({ staff_id: null, services_id: [], visit_time: {}, comment: '' })

onMounted(async () => {
  // загрузить visit_data
  const raw = getCookie(VISIT_KEY)
  if (raw) {
    try { visitData.value = JSON.parse(raw) } catch {}
  }

  // 1) Типы услуг
  const { data: types } = await api.get('/services/types/')
  serviceTypes.value = types

  // 2) Все услуги
  const { data: all } = await api.get('/services/')
  // если известен staff_id — фильтруем
  if (visitData.value.staff_id) {
    services.value = all.filter(s => s.staff_ids.includes(+visitData.value.staff_id))
  } else {
    services.value = all
  }

  loading.value = false
})

// сгруппировать по типам
const servicesByType = computed(() => {
  const map = {}
  serviceTypes.value.forEach(t => (map[t] = []))
  services.value.forEach(s => {
    if (!map[s.service_type]) map[s.service_type] = []
    map[s.service_type].push(s)
  })
  return map
})

const selectedService = computed(() => {
  return services.value.find(s => s.id === selectedServiceId.value) || null
})

function toggle(type) {
  openType.value = openType.value === type ? null : type
}

function confirm() {
  if (!selectedService.value) return
  visitData.value.services_id = [ selectedService.value.id ]
  // сохраняем и переходим
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
