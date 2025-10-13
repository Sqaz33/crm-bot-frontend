<template>
  <div class="staff-view">
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
      <div v-if="staffList.length === 0" style="text-align:center; color: #888;">
        Нет сотрудников
      </div>
      <div
        v-for="staff in staffList"
        :key="staff.id"
        class="staff-card"
        @click="onSelect(staff.id)"
      >
        <div
          v-if="staff.photo"
          class="avatar"
          :style="{ backgroundImage: `url(${staff.photo})` }"
          @click.stop="onVisit(staff.id)"
        />
        <div
          v-else
          class="avatar avatar--empty"
          @click.stop="onVisit(staff.id)"
        />
        <div class="info">
          <div class="name">{{ staff.name }}</div>
          <div class="spec">
            <span
              v-for="(spec, i) in staff.specializations"
              :key="i"
            >{{ spec }}<span v-if="i < staff.specializations.length - 1">, </span></span>
          </div>
        </div>
        <div
          class="rating"
          @click.stop="onReview(staff.id)"
        >⭐ {{ staff.rating }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../api'
const emit = defineEmits(['select', 'review', 'visit'])

const tabs = ref([{ label: 'Все', value: 'all' }])
const activeTab = ref('all')
const staffList = ref([])

async function loadSpecializations() {
  const { data } = await api.get('/salon/specializations')
  data.forEach(spec =>
    tabs.value.push({ label: spec.name, value: spec.id })
  )
}

async function loadStaff(specId) {
  let url = `/salon/staff`
  if (specId && specId !== 'all') {
    url += `?specialization_id=${specId}`
  }
  const { data } = await api.get(url)
  staffList.value = data
}

function selectTab(v) { activeTab.value = v }
watch(activeTab, v => loadStaff(v))
onMounted(async () => {
  await loadSpecializations()
  await loadStaff()
})

function onSelect(id) { emit('select', id) }
function onReview(id) { emit('review', id) }
function onVisit(id)  { emit('visit', id) }
</script>

<style scoped>
.staff-view {
  max-width: 600px;
  margin: 0 auto;
	padding-left: 50px;
}
.tabs {
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}
.tab {
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border: none;
  background: #fff;
  white-space: nowrap;
  transition: background 0.2s;
}
.tab.active {
  border-bottom: 3px solid #007bff;
  font-weight: bold;
}
.staff-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
	width: 100%;
	border: red solid 1px;
}
.staff-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.1s;
}
.staff-card:hover {
  transform: translateY(-2px);
}
.avatar {
  width: 40px;
  height: 40px;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
}
.avatar--empty {
  width: 40px;
  height: 40px;
  background-color: #ccc;
  border-radius: 50%;
}
.info {
  margin-left: 0.5rem;
}
.name {
  font-weight: bold;
}
.spec {
  font-size: 0.85rem;
  color: #555;
}
.rating {
  margin-left: 0;
  background: #e0e0e0;
  padding: 0rem 0.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
}

@media (max-width: 765px)
{
.staff-view {
  max-width: 400px;
	}
}

@media (max-width: 480px) {
  .staff-view {
		max-width: 300px;
  }
  
  .staff-card {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .avatar {
    width: 45px;
    height: 45px;
  }
  
  .tab {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .name {
    font-size: 0.9rem;
  }
  
  .spec {
    font-size: 0.75rem;
  }
  
  .rating {
	  width: 1rem;
    padding: 0.3rem;
    font-size: 0.75rem;
  }
}

</style>
