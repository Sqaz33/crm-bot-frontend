<template>
  <div class="staff-view">
    <!-- Табы -->
    <div class="tabs-container">
      <div class="tabs-background">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="selectTab(tab.value)"
          :ref="el => (tabButtons[index] = el)" 
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="active-line" ref="activeLine"></div>
    </div>

    <!-- Список сотрудников -->
    <div class="staff-list">
      <div v-if="staffList.length === 0" class="no-staff">
        Нет сотрудников
      </div>
      <div
        v-for="staff in staffList"
        :key="staff.id"
        class="staff-card"
        @click="() => { console.log('click', staff.id); onSelect(staff.id) }"
      >

        <!-- Аватар -->
        <div class="avatar-container">
          <div
            v-if="staff.photo"
            class="avatar"
            :style="{ backgroundImage: `url(${staff.photo})` }"
            @click.stop="goStaff(staff)"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="goStaff(staff)"
            @keydown.space.prevent="goStaff(staff)"
          ></div>
          <div
            v-else
            class="avatar avatar--empty"
            @click.stop="goStaff(staff)"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="goStaff(staff)"
            @keydown.space.prevent="goStaff(staff)"
          >
            <span class="avatar-letter">{{ getFirstLetter(staff.name) }}</span>
          </div>
        </div>

        <!-- Информация о сотруднике -->
        <div class="staff-info">
          <div class="staff-name">{{ staff.name }}</div>
          <div class="staff-position">
            <span
              v-for="(spec, i) in staff.specializations"
              :key="i"
            >{{ spec }}<span v-if="i < staff.specializations.length - 1">, </span></span>
          </div>
        </div>

        <!-- Рейтинг -->
        <!-- <div class="rating-container">
          <div class="rating-badge">
            <div class="star-icon">
              <svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.7412 0L18.2212 11.0557H29.4826L20.3719 17.8885L23.8519 28.9443L14.7412 22.1115L5.63054 28.9443L9.11051 17.8885L-0.000164986 11.0557H11.2612L14.7412 0Z" fill="#F3A950"/>
              </svg>
            </div>
            <div class="rating-number">{{ staff.rating || 5 }}</div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()


const emit = defineEmits(['select', 'review', 'visit'])

const tabs = ref([{ label: 'Все', value: 'all' }])
const activeTab = ref('all')
const tabButtons = ref([])
const activeLine = ref(null)


const staffList = ref([])
const selectedId = ref(null)

const VISIT_KEY = 'visit_data'

const defaultVisit = {
  staff_id: '',
  services_id: [],
  visit_time: { start_time: '', end: '' },
  comment: ''
}

function readVisit () {
  try {
    const raw = localStorage.getItem(VISIT_KEY)
    if (!raw) return { ...defaultVisit }
    const parsed = JSON.parse(raw)
    return { ...defaultVisit, ...parsed }
  } catch {
    return { ...defaultVisit }
  }
}

function writeVisit (v) {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(v))
  } catch (e) {
    console.warn('writeVisit failed:', e)
  }
}


function getStaffId (s) {
  return s?.id ?? s?.staff_id ?? s?._id ?? s?.user_id ?? null
}

function getFirstLetter (name) {
  return name && name.length > 0 ? name.charAt(0).toUpperCase() : ''
}


async function loadSpecializations () {
  const { data } = await api.get('/salon/specializations')
  data.forEach(spec => tabs.value.push({ label: spec.name, value: spec.id }))
}

async function loadStaff (specId) {
  const visit = readVisit()
  const params = {}

  if (visit?.services_id?.length) params.service_id = visit.services_id
  if (visit?.visit_time?.start_time) params.start_time = visit.visit_time.start_time
  if (specId && specId !== 'all') params.specialization_id = specId

  const { data } = await api.get('/salon/staff', { params })
  staffList.value = data


  if (selectedId.value && !staffList.value.some(s => getStaffId(s) === selectedId.value)) {
    selectedId.value = null
    const v = readVisit()
    v.staff_id = ''
    writeVisit(v)
  }
}


function updateActiveLine () {
  try {
    if (!tabButtons.value || !activeLine.value) return
    const idx = tabs.value.findIndex(t => t.value === activeTab.value)
    if (idx === -1) return
    const btn = tabButtons.value[idx]
    if (!btn) return

    const container = btn.parentElement
    const containerRect = container.getBoundingClientRect()
    const buttonRect = btn.getBoundingClientRect()
    const left = buttonRect.left - containerRect.left + container.scrollLeft
    const width = buttonRect.width

    activeLine.value.style.left = `${left + width * 0.1}px`
    activeLine.value.style.width = `${width * 0.8}px`
  } catch (e) {
    console.warn('updateActiveLine failed:', e)
  }
}

function scrollToActiveTab () {
  try {
    if (!tabButtons.value) return
    const idx = tabs.value.findIndex(t => t.value === activeTab.value)
    if (idx === -1) return
    const btn = tabButtons.value[idx]
    const container = btn?.parentElement
    if (!btn || !container) return

    const containerWidth = container.clientWidth
    const buttonLeft = btn.offsetLeft
    const buttonWidth = btn.offsetWidth
    const scrollTo = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)

    container.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' })
  } catch (e) {
    console.warn('scrollToActiveTab failed:', e)
  }
}

function selectTab (v) {
  activeTab.value = v
  nextTick(() => {
    updateActiveLine()
    scrollToActiveTab()
  })
}

function goStaff(idOrStaff) {
  const id = typeof idOrStaff === 'object' ? getStaffId(idOrStaff) : idOrStaff
  if (!id) return
  router.push({ name: 'staff', params: { id } })
}


function onSelect (idOrStaff) {
  const id = typeof idOrStaff === 'object' ? getStaffId(idOrStaff) : idOrStaff
  console.log('onSelect, id:', id)
  if (!id) return

  selectedId.value = id

 
  const visit = readVisit()
  visit.staff_id = id
  writeVisit(visit)


  emit('select', id)
  router.push({ path: '/appointmant' })

}

function onReview (id) { emit('review', id) }
function onVisit (id)  { emit('visit', id) }


watch(activeTab, v => loadStaff(v))

onMounted(async () => {
  await loadSpecializations()
  await loadStaff()


  const v = readVisit()
  if (v?.staff_id) selectedId.value = v.staff_id

  nextTick(updateActiveLine)
  window.addEventListener('resize', updateActiveLine)
})
</script>


<style scoped>
.staff-view {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0;
  background: #F6F5F6;
}

/* Табы */
.tabs-container {
  position: relative;
  width: 100%;
  max-width: 1140px;
  height: 96px;
  margin: 24px auto 0 auto;
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  position: relative; z-index: 1;
}

.tabs-background {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.tabs-background::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Geometria', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  color: #454558;
  transition: color 0.3s ease;
  padding: 0 24px;
  margin: 0;
  min-height: 96px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
}

.tab.active {
  font-weight: 500;
  color: #454558;
}

.active-line {
  position: absolute;
  bottom: 0;
  height: 5px;
  background: #666FE8;
  border-radius: 2.5px;
  transition: all 0.3s ease;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  z-index: 1;
  pointer-events: none;
}

/* Список сотрудников */
.staff-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 28px auto 0 auto;
  width: 1140px;
  position: relative; z-index: 2; 
}

.no-staff {
  text-align: center;
  color: #8097B1;
  font-family: 'Geometria', sans-serif;
  font-size: 18px;
  padding: 2rem;
}

.staff-card {
  display: flex;
  align-items: center;
  width: 1139px;
  height: 96px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-sizing: border-box;
  position: relative; z-index: 2;
}

.staff-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  margin-right: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar--empty {
  background: linear-gradient(135deg, #69FFDB 0%, #69FF03 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-letter {
  font-family: 'Geometria', sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 28px;
  line-height: 33px;
  color: #FFFFFF;
}

.staff-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.staff-name {
  font-family: 'Geometria', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
}

.staff-position {
  font-family: 'Geometria', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
}

.rating-container {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.rating-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 114px;
  height: 46px;
  background: #F6F5F6;
  border-radius: 32px;
  gap: 8px;
  padding: 8px 16px;
  box-sizing: border-box;
}

.star-icon {
  width: 30px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-number {
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 29px;
  color: #454558;
}

/* Медиа-запросы для адаптивности */
@media (max-width: 1200px) {
  .staff-view {
    padding: 0 1rem;
  }
  
  .tabs-container,
  .staff-list {
    width: 100%;
    max-width: calc(100vw - 2rem);
  }
  
  .staff-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .staff-view {
    padding: 0 0.5rem;
  }
  
  .tabs-container {
    height: 64px;
    margin: 16px auto 0 auto;
  }
  
  .tab {
    font-size: 16px;
    line-height: 20px;
    min-height: 64px;
    padding: 0 16px;
    min-width: 120px; /* Минимальная ширина для удобства нажатия */
  }
  
  .staff-list {
    gap: 8px;
    margin: 16px auto 0 auto;
  }
  
  .staff-card {
    height: 80px;
    padding: 12px 16px;
  }
  
  .avatar {
    width: 48px;
    height: 48px;
  }
  
  .avatar-letter {
    font-size: 20px;
    line-height: 24px;
  }
  
  .staff-name {
    font-size: 16px;
    line-height: 20px;
  }
  
  .staff-position {
    font-size: 14px;
    line-height: 18px;
  }
  
  .rating-badge {
    width: 80px;
    height: 36px;
    gap: 4px;
    padding: 4px 8px;
  }
  
  .star-icon {
    width: 20px;
    height: 19px;
  }
  
  .star-icon svg {
    width: 20px;
    height: 19px;
  }
  
  .rating-number {
    font-size: 16px;
    line-height: 20px;
  }
}

@media (max-width: 480px) {
  .staff-view {
    padding: 0 0.25rem;
  }
  
  .tabs-container {
    height: 56px;
    margin: 12px auto 0 auto;
  }
  
  .tab {
    font-size: 14px;
    line-height: 18px;
    min-height: 56px;
    padding: 0 12px;
    min-width: 100px; /* Уменьшенная минимальная ширина для мобильных */
  }
  
  .staff-card {
    height: 72px;
    padding: 8px 12px;
  }
  
  .avatar-container {
    margin-right: 12px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
  
  .avatar-letter {
    font-size: 16px;
    line-height: 20px;
  }
  
  .staff-name {
    font-size: 14px;
    line-height: 18px;
  }
  
  .staff-position {
    font-size: 12px;
    line-height: 16px;
  }
  
  .rating-badge {
    width: 60px;
    height: 30px;
    gap: 2px;
    padding: 2px 6px;
  }
  
  .star-icon {
    width: 16px;
    height: 15px;
  }
  
  .star-icon svg {
    width: 16px;
    height: 15px;
  }
  
  .rating-number {
    font-size: 14px;
    line-height: 18px;
  }
}
</style>