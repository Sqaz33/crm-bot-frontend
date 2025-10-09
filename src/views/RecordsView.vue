<template>
  <div class="records-page">
    <SidebarMenu :items="menuItems" class="sidebar" />

    <div class="records-container">
      <h2 class="records-title">Мои записи</h2>

      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="['tab', activeTab === 'current' ? 'active' : '']"
          @click="switchTab('current')"
        >
          Текущие
        </button>
        <button
          :class="['tab', activeTab === 'past' ? 'active' : '']"
          @click="switchTab('past')"
        >
          Прошедшие
        </button>
      </div>
      <!-- Content -->
      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else>
        <ul v-if="visits.length > 0" class="records-list">
          <li v-for="visit in visits" :key="visit.id" class="record-item">
            <div class="record-left">
              <div class="staff-name">{{ visit.staff.name }}</div>
              <div class="staff-spec">
                {{ visit.staff.specializations.join(', ') }}
              </div>
              <div class="service-name">{{ visit.service.name }}</div>
            </div>
            <div class="record-right">
              <div class="date">{{ formatDate(visit.visit_date_time) }}</div>
              <div class="price">{{ visit.service.price }} ₽</div>
            </div>
          </li>
        </ul>
        <!-- Заглушка -->
        <div v-else class="empty-state">
          <div class="empty-circle"></div>
          <p class="empty-title">Увы, ничего не запланировано</p>
          <p class="empty-subtitle">У Вас нет ни одной записи</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SidebarMenu from '../components/Sidebar.vue'

const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/company' }
]

const visits = ref([])
const loading = ref(true)
const activeTab = ref('current')

// --- КЭШ ---
const staffCache = {}
const servicesCache = {}

async function getStaff(staff_id) {
  if (staffCache[staff_id]) return staffCache[staff_id]
  const resp = await fetch(`/salon/staff/${staff_id}`)
  const data = await resp.json()
  staffCache[staff_id] = data
  return data
}

async function getService(service_id) {
  if (servicesCache[service_id]) return servicesCache[service_id]
  if (Object.keys(servicesCache).length === 0) {
    const resp = await fetch(`/services/`)
    const arr = await resp.json()
    arr.forEach(s => { servicesCache[s.id] = s })
  }
  return servicesCache[service_id]
}

// --- API загрузка ---
async function fetchVisits(tab) {
  loading.value = true
  visits.value = []

  const url = tab === 'current' ? '/visits/current/' : '/visits/old/'
  console.log(`Загружаем данные с: ${url}`)

  try {
    const resp = await fetch(url)
    const rawVisits = await resp.json()

    console.log(`Получено ${rawVisits.length} записей`)

    if (rawVisits.length > 0) {
      console.log('Первый элемент (сырой):', rawVisits[0])
    }

    let processedCount = 0

    const mapped = await Promise.all(
      rawVisits.map(async (v, i) => {
        const staff = await getStaff(v.staff_id)
        const service = await getService(v.service_id)
        const enriched = { ...v, staff, service }

        processedCount++
        if (i === 0) {
          console.log('Первый элемент после обработки:', enriched)
        }
        if (processedCount % 10 === 0 || processedCount === rawVisits.length) {
          console.log(`Обработано ${processedCount} из ${rawVisits.length}`)
        }

        return enriched
      })
    )

    visits.value = mapped
    console.log(`Всего обработано ${mapped.length} записей`)
  } catch (err) {
    console.error('Ошибка при загрузке или обработке:', err)
    visits.value = []
  } finally {
    loading.value = false
    console.log('Завершено обновление данных\n')
  }
}

function switchTab(tab) {
  activeTab.value = tab
  fetchVisits(tab)
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => fetchVisits(activeTab.value))
</script>


<style scoped>
.records-page {
  display: flex;
  min-height: 100vh;
  background-color: #f6f9fc;
  font-family: var(--font-primary);
}

.sidebar {
  width: 200px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
}

.records-container {
  flex: 1;
  padding: 1.5rem;
  text-align: center;
}

.records-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.tab {
  flex: 1;
  max-width: 200px;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  background-color: #eaeaea;
  cursor: pointer;
  font-size: 1rem;
}
.tab.active {
  background-color: #d0d0d0;
  font-weight: 600;
}

/* List */
.records-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.record-item {
  display: flex;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
}
.empty-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #d9d9d9;
  margin-bottom: 1.5rem;
}
.empty-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.empty-subtitle {
  font-size: 0.9rem;
  color: #777;
}

.loading {
  margin-top: 2rem;
  font-size: 1rem;
}

@media (max-width: 992px) {
  .sidebar {
    display: none;
  }
}
</style>
