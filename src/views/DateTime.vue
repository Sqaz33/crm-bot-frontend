<template>
  <div class="booking-page">
    <SidebarMenu :items="menuItems" />

    <div class="booking-container">
      <!-- Навигация по месяцам -->
      <div class="month-navigation">
        <button class="nav-button" @click="prevMonth">&lt;</button>
        <div class="month-header">
          <span class="month-name">{{ currentMonthName }}</span>
          <span class="year">{{ currentYear }}</span>
        </div>
        <button class="nav-button" @click="nextMonth">&gt;</button>
      </div>

      <!-- Календарь -->
      <div class="calendar-section">
        <div class="weekdays">
          <div
            v-for="day in weekdayNames"
            :key="day"
            class="weekday"
          >{{ day }}</div>
        </div>
        <div class="days-grid">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            :class="{
              day: true,
              'other-month': !day.isCurrentMonth,
              'current-day': day.isToday,
              selected: day.date === selectedDate,
              'day-past': day.isPast && day.isCurrentMonth
            }"
            @click="selectDate(day)"
          >
            {{ day.dayNumber }}
          </div>
        </div>
      </div>

      <!-- Слоты свободного времени -->
      <div class="time-section" v-if="selectedDate">
        <h3 class="time-title">Выберите время начала</h3>
        <div class="time-buttons">
          <button
            v-for="time in timesForSelectedDay"
            :key="time"
            :class="['time-btn', { selected: time === selectedTime }]"
            @click="selectTime(time)"
            type="button"
          >
            {{ time }}
          </button>
        </div>
        <button
          class="book-button"
          :disabled="!selectedTime"
          @click="bookTime"
        >
          Занять
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SidebarMenu from '../components/Sidebar.vue'
import api from '../api'

const VISIT_KEY = 'visit_data'
const menuItems = [
  { label: 'Сотрудник',   path: '/choicestaff' },
  { label: 'Дата и время', path: '/datetime'   },
  { label: 'Услуги',       path: '/services'   }
]

const currentDate   = ref(new Date())
const selectedDate  = ref(null)
const selectedTime  = ref(null)
const freeSlots     = ref([])   // массив ISO-строк вида "2025-07-13T11:00:00"

const weekdayNames = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС']

const currentMonthName = computed(() =>
  currentDate.value.toLocaleString('ru-RU',{ month:'long' })
)
const currentYear = computed(() =>
  currentDate.value.getFullYear()
)

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date(); today.setHours(0,0,0,0)

  // 1-й день и сдвиг недели
  const first = new Date(year, month, 1)
  let wd = first.getDay(); wd = wd===0?6:wd-1

  const days = []
  const prevDaysCount = new Date(year, month, 0).getDate()
  // предыдущий месяц
  for(let i=wd; i>0; i--){
    const d = prevDaysCount - i +1
    const dt = new Date(year, month-1, d); dt.setHours(0,0,0,0)
    days.push({
      dayNumber: d,
      date: formatDate(dt),
      isCurrentMonth: false,
      isToday: false,
      isPast: dt < today
    })
  }
  // текущий месяц
  const dim = new Date(year, month+1, 0).getDate()
  for(let i=1;i<=dim;i++){
    const dt = new Date(year, month, i); dt.setHours(0,0,0,0)
    days.push({
      dayNumber: i,
      date: formatDate(dt),
      isCurrentMonth: true,
      isToday: dt.toDateString()===today.toDateString(),
      isPast: dt < today
    })
  }
  // дополняем сетку до полного ряда
  const total = Math.ceil(days.length/7)*7
  const nextCount = total - days.length
  for(let i=1;i<=nextCount;i++){
    const dt = new Date(year, month+1, i); dt.setHours(0,0,0,0)
    days.push({
      dayNumber: i,
      date: formatDate(dt),
      isCurrentMonth: false,
      isToday: false,
      isPast: dt < today
    })
  }
  return days
})

function formatDate(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'),
        D=String(d.getDate()).padStart(2,'0')
  return `${y}-${m}-${D}`
}

// перелистывание месяцев
function prevMonth(){
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth()-1,1
  )
}
function nextMonth(){
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth()+1,1
  )
}

// выбор даты
async function selectDate(day){
  if(!day.isCurrentMonth || day.isPast) return
  selectedDate.value = day.date
  selectedTime.value = null
  await loadFreeSlots()
}

// запрашиваем свободные слоты без даты в параметрах
async function loadFreeSlots(){
  const raw = localStorage.getItem(VISIT_KEY)
  let staff_id = null
  if(raw){
    try { staff_id = JSON.parse(raw).staff_id } catch {}
  }
  const params = {}
  if(staff_id) params.staff_id = staff_id

  try {
    const { data } = await api.get('/salon/free_time', { params })
    freeSlots.value = data.map(item => item.start)
  } catch(e) {
    console.error('Не удалось загрузить слоты:', e)
    freeSlots.value = []
  }
}

// отфильтровать слоты на выбранный день и форматировать
const timesForSelectedDay = computed(() => {
  if(!selectedDate.value) return []
  return freeSlots.value
    .filter(s => s.startsWith(selectedDate.value+'T'))
    .map(s => s.slice(11,16))  // HH:mm
})

// выбор времени
function selectTime(t){
  selectedTime.value = t
}

// бронь
function bookTime(){
  const raw = localStorage.getItem(VISIT_KEY)
  const visit = raw
    ? JSON.parse(raw)
    : { staff_id:'', services_id:[], visit_time:{start_time:'',end:''}, comment:'' }

  visit.visit_time.start_time = `${selectedDate.value}T${selectedTime.value}:00`
  const ser = JSON.stringify(visit)
  localStorage.setItem(VISIT_KEY, ser)
  document.cookie = `visit_data=${encodeURIComponent(ser)};path=/;SameSite=Lax;`

  // возврат на страницу записи
  this.$router.push({ name:'appointment' })
}

// при загрузке восстановим, если уже есть в localStorage
onMounted(async () => {
  const raw = localStorage.getItem(VISIT_KEY)
  if(raw){
    try {
      const v = JSON.parse(raw)
      const st = v.visit_time?.start_time
      if(st){
        const [d,t] = st.split('T')
        selectedDate.value = d
        selectedTime.value = t.slice(0,5)
        currentDate.value = new Date(d)
        await loadFreeSlots()
      }
    } catch {}
  }
})
</script>

<style scoped>
.booking-page { display:flex; min-height:100vh; background:#f5f7fa }
.booking-container {
  flex:1; max-width:480px; margin:32px auto; padding:32px;
  background:#fff; border-radius:18px; box-shadow:0 2px 18px rgba(31,70,255,0.1);
  border:2px solid #1976ff;
}
.month-navigation { display:flex; justify-content:space-between; align-items:center;
  margin-bottom:18px; font-size:1.1rem; font-weight:500; background:#f6f8fa;
  border-radius:10px; padding:12px 0;
}
.nav-button { background:none;border:none;font-size:22px;cursor:pointer;color:#1976ff }
.weekdays { display:grid;grid-template-columns:repeat(7,1fr);text-align:center;
  margin-bottom:8px;font-size:15px;color:#9ea5b1;letter-spacing:0.02em;
}
.days-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:7px }
.day { height:38px;display:flex;align-items:center;justify-content:center;
  border-radius:8px;font-size:16px;background:#f6f8fa;color:#222;cursor:pointer;
  transition:background .1s,color .1s;border:none;outline:none;
}
.day.other-month,.day.day-past { color:#c4c4c4!important;cursor:not-allowed }
.day.selected { background:#1976ff!important;color:#fff!important;font-weight:bold }
.day.current-day:not(.selected) { border:1.5px solid #1976ff }
.time-section { border-top:1px solid #ececec;padding-top:24px }
.time-title { font-size:19px;font-weight:bold;margin-bottom:22px;text-align:left }
.time-buttons { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:12px }
.time-btn { min-width:74px;padding:8px 0;border:1.5px solid #1976ff;background:#fff;
  color:#1976ff;border-radius:8px;font-size:15px;font-weight:500;cursor:pointer;
  transition:background .2s,color .2s,border .2s;
}
.time-btn.selected { background:#1976ff;color:#fff }
.book-button {
  width:100%;padding:15px;margin-top:14px;background:#1976ff;color:#fff;
  border:none;border-radius:8px;font-size:17px;font-weight:600;cursor:pointer;
  transition:background .2s;
}
.book-button:disabled { background:#c4c4c4;color:#fff;cursor:not-allowed }
</style>
