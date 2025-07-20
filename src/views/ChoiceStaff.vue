<template>
  <div class="header-of-staff-list">
    <div class="filter-title">Все</div>
	<div class="filter-title">Должность</div>
    <div class="filter-title">Топ-сотрудник</div>
  </div>
  <div class="staff-list">
    <div
      v-for="staff in staffList"
      :key="staff.id"
      class="staff-card"
    >
      <div
        class="avatar"
        :class="{ 'avatar--empty': !staff.photo }"
        :style="staff.photo ? { backgroundImage: `url(${staff.photo})` } : {}"
        @click="startVisit(staff)"
      />
      
      <div class="info">
        <div class="name">{{ staff.name }}</div>
        <div class="spec">{{ staff.specialization }}</div>
      </div>
      
      <div class="rating" @click.stop="viewStaff(staff.id)">
        ⭐ {{ staff.rating }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const VISIT_KEY = 'visit_data'
const staffList = ref([])

async function loadStaff() {
  const { data } = await api.get('/salon/staff')
  staffList.value = data
}

function viewStaff(id) {
  router.push({ name: 'staff', params: { id } })
}

function startVisit(staff) {
  // 1) читаем существующий visit_data или создаём новый
  const raw = localStorage.getItem(VISIT_KEY)
  let visit = raw ? JSON.parse(raw) : {
    staff_id:   '',
    client_id:  '',
    visit_time: { start:'', end:'' },
    comment:    ''
  }

  // 2) записываем staff_id и сбрасываем всё остальное
  visit.staff_id = staff.id
  visit.visit_time = { start:'', end:'' }
  visit.comment = ''
  visit.services_id = []   // если нужно отслеживать услуги

  const json = JSON.stringify(visit)
  localStorage.setItem(VISIT_KEY, json)
  document.cookie = 
    `${VISIT_KEY}=${encodeURIComponent(json)}; path=/; max-age=${365*24*60*60}; Secure; SameSite=None`
  
  // 3) уходим на страницу оформления
  router.push({ path: '/appointmant' })
}

onMounted(loadStaff)
</script>

<style scoped>
.header-of-staff-list {
  display: flex;
  flex-direction: row;
  margin: 1.5rem auto;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  width: 80%;
}

.filter-title {
  margin: 1.5rem;
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.staff-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  width: 80%;
  margin: 0rem auto;
}
.avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  cursor: pointer;
}
.avatar--empty {
  background-color: #ccc;
}
.info {
  flex: 1;
  margin: 0 1rem;
}
.rating {
  cursor: pointer;
  user-select: none;
}

@media (max-width: 768px) {
  .header-of-staff-list {
    width: 100%;
	margin-top: 0;
	border-radius: 0;
  }
  
  .staff-card {
    margin: 0.5rem auto;
  }
  
  .staff-list {
    gap: 0;
  }
}
</style>
