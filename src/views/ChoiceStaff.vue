<template>
  <div class="staff-filter">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab', { active: activeTab === tab.value }]"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="staff-list">
      <div
        v-for="staff in staffList"
        :key="staff.id"
        class="staff-card"
      >
        <div
          class="avatar"
          :class="{ 'empty': !staff.photo }"
          :style="staff.photo ? { backgroundImage: `url(${staff.photo})` } : {}"
          @click="selectStaff(staff.id)"
        />
        <div class="info" @click="selectStaff(staff.id)">
          <div class="name">{{ staff.name }}</div>
          <div class="spec">{{ staff.specialization }}</div>
        </div>
        <button class="star-btn" @click="openReviews(staff.id)">
          ⭐ {{ Math.round(staff.rating) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const VISIT_KEY = 'visit_data'

const tabs = ref([{ label: 'Все', value: 'all' }])
const activeTab = ref('all')
const staffList = ref([])

// Читаем visit_data из localStorage
function getVisitData() {
  try {
    return JSON.parse(localStorage.getItem(VISIT_KEY)) || {}
  } catch {
    return {}
  }
}

// Загружаем список специализаций для вкладок
async function loadSpecializations() {
  try {
    const { data } = await api.get('/salon/specializations')
    data.forEach(spec => tabs.value.push({ label: spec, value: spec }))
  } catch (e) {
    console.error('Не удалось получить специализации:', e)
  }
}

// Общий метод загрузки сотрудников с учётом фильтров
async function loadStaff() {
  const visit = getVisitData()
  const params = {}

  if (activeTab.value !== 'all') {
    params.specialization = activeTab.value
  }
  // если выбрана услуга — берем первый ID
  if (Array.isArray(visit.services_id) && visit.services_id[0]) {
    params.service_id = visit.services_id[0]
  }
  // если есть выбранная дата/время — передаем
  if (visit.visit_time && visit.visit_time.start_time) {
    params.datetime = visit.visit_time.start_time
  }

  try {
    const { data } = await api.get('/salon/staff', { params })
    staffList.value = data
  } catch (e) {
    console.error('Не удалось загрузить сотрудников:', e)
    staffList.value = []
  }
}

function selectTab(value) {
  activeTab.value = value
}

watch(activeTab, loadStaff)

onMounted(async () => {
  await loadSpecializations()
  await loadStaff()
})

// Выбрать сотрудника и сохранить в visit_data
function selectStaff(id) {
  const visit = getVisitData()
  visit.staff_id = id
  localStorage.setItem(VISIT_KEY, JSON.stringify(visit))
  document.cookie = `${VISIT_KEY}=${encodeURIComponent(JSON.stringify(visit))}; path=/; max-age=${365*24*60*60}; Secure; SameSite=None`
  router.push({ name: 'staff', params: { id } })
}

// Открыть отзывы по сотруднику
function openReviews(id) {
  router.push({ name: 'staff-reviews', params: { id } })
}
</script>

<style scoped>
.staff-filter {
  max-width: 600px;
  margin: 0 auto;
}
.tabs {
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}
.tab {
  flex: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border: none;
  background: #fff;
  transition: background 0.2s;
  white-space: nowrap;
}
.tab.active {
  border-bottom: 3px solid #007bff;
  font-weight: bold;
}
.staff-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.staff-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.avatar {
  width: 48px;
  height: 48px;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
}
.avatar.empty {
  background: #ccc;
}
.info {
  margin-left: 1rem;
  flex: 1;
  cursor: pointer;
}
.name {
  font-weight: bold;
}
.spec {
  font-size: 0.85rem;
  color: #555;
}
.star-btn {
  background: #e0e0e0;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
