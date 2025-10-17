<template>

    <div class="layout">    
      <main class="main-content">
				<StaffFilter
					@select="startVisitById"
					@review="viewStaff"
					@visit="startVisitById"
				/>
      </main>
    </div>

</template>

<script setup>
import { useRouter } from 'vue-router'
import StaffFilter from '../components/StaffFilter.vue'   // <-- правильно!

const router = useRouter()



const VISIT_KEY = 'visit_data'

// Переход на просмотр сотрудника (по клику на рейтинг/звезду)
function viewStaff(id) {
  router.push({ name: 'staff', params: { id } })
}

// Выбор сотрудника для записи — сюда staff.id!
function startVisitById(id) {
  const raw = localStorage.getItem(VISIT_KEY)
  let visit = raw ? JSON.parse(raw) : {
    staff_id:   '',
    client_id:  '',
    visit_time: { start: '', end: '' },
    comment:    ''
  }

  visit.staff_id = id
  visit.visit_time ??= { start: '', end: '' }
  visit.comment ??= ''
  visit.services_id ??= []

  const json = JSON.stringify(visit)
  localStorage.setItem(VISIT_KEY, json)
  document.cookie =
    `${VISIT_KEY}=${encodeURIComponent(json)}; path=/; max-age=${365*24*60*60}; Secure; SameSite=None`

  router.push({ path: '/appointmant' })
}
</script>


<style scoped>
.layout {
 display: flex;
 height: 100vh;
 }
 
.main-content { 
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  }
  
.staff-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin: 0.5rem auto;
}

.staff-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  width: 80%;
  margin: 0rem auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.1s;
}

.staff-card:hover {
    transform: translateY(-2px);
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
  width: 40px; height: 40px;
  border-radius: 50%;
  cursor: pointer;
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
  
  .staff-card {
    margin: 0.5rem auto;
  }
  
  .staff-list {
    gap: 0;
  }
}
</style>
