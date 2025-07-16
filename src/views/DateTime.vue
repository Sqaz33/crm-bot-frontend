<template>
  <div class="booking-container">
    <div class="month-navigation">
      <button class="nav-button" @click="prevMonth">&lt;</button>
      <div class="month-header">
        <span class="month-name">{{ currentMonthName }}</span>
        <span class="year">{{ currentYear }}</span>
      </div>
      <button class="nav-button" @click="nextMonth">&gt;</button>
    </div>

    <div class="calendar-section">
      <div class="weekdays">
        <div v-for="day in weekdayNames" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="days-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="{
            day: true,
            'other-month': !day.isCurrentMonth,
            'current-day': day.isToday,
            selected: day.date === selectedDate
          }"
          @click="onDayClick(day)"
        >
          {{ day.dayNumber }}
        </div>
      </div>
    </div>

    <div class="time-section" v-if="selectedDate">
      <h3 class="time-title">Выберите время начала</h3>
      <div class="time-group" v-for="group in timeGroups" :key="group.title">
        <h4 class="time-group-title" v-if="group.title">{{ group.title }}</h4>
        <div class="time-buttons">
          <button
            v-for="time in group.times"
            :key="time"
            :class="{ selected: time === selectedTime }"
            @click="selectTime(time)"
          >
            {{ time }}
          </button>
        </div>
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '../api'

const VISIT_KEY = 'visit_data'
const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedTime = ref(null)
const freeSlots = ref([])  // все слоты start ISO

const weekdayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

const currentMonthName = computed(() =>
  currentDate.value.toLocaleString('ru-RU',{ month:'long' })
)
const currentYear = computed(() =>
  currentDate.value.getFullYear()
)

// собираем календарь
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date(); today.setHours(0,0,0,0)

  // первый день и кол-во дней
  const first = new Date(year, month, 1)
  let wd = first.getDay(); wd = wd===0?6:wd-1
  const daysInM = new Date(year, month+1, 0).getDate()

  const days = []
  // предыдущий
  const prevCount = wd
  const prevLast = new Date(year, month, 0).getDate()
  for(let i=prevCount; i>0; i--){
    days.push(makeDay(year,month-1, prevLast - i +1, today, false))
  }
  // текущий
  for(let i=1;i<=daysInM;i++){
    days.push(makeDay(year,month,i, today, true))
  }
  // дополняем до 7×n
  const total = Math.ceil(days.length/7)*7
  for(let i=1;i<= total - days.length;i++){
    days.push(makeDay(year,month+1,i, today, false))
  }
  return days
})

function makeDay(y,m,d, today, inMonth){
  const dt = new Date(y,m,d); dt.setHours(0,0,0,0)
  return {
    dayNumber: d,
    date: formatDate(dt),
    isCurrentMonth: inMonth,
    isToday: dt.getTime()===today.getTime()
  }
}

function formatDate(d){
  const y=d.getFullYear(), M=String(d.getMonth()+1).padStart(2,'0'), D=String(d.getDate()).padStart(2,'0')
  return `${y}-${M}-${D}`
}

function prevMonth(){
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth()-1,1)
}
function nextMonth(){
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth()+1,1)
}

async function fetchFreeSlots(){
  const visit = JSON.parse(localStorage.getItem(VISIT_KEY)||'{}')
  const staffId = visit.staff_id
  const params = staffId ? `?staff_id=${staffId}` : ''
  const { data } = await api.get(`/salon/free_time${params}`)
  // сохраняем только поля start
  freeSlots.value = data.map(item => item.start)
}

// при выборе даты — сбросить время и подгрузить слоты
function onDayClick(day){
  if(!day.isCurrentMonth) return
  selectedDate.value = day.date
  selectedTime.value = null
  fetchFreeSlots()
}

// порезать по дате и группировать
const timeGroups = computed(()=>{
  if(!selectedDate.value) return []
  // фильтруем слоты по тому, что начинается с выбранной даты
  const todaySlots = freeSlots.value
    .filter(s => s.startsWith(selectedDate.value+'T'))
    .map(s => s.slice(11,16))
  // разбиваем на три группы
  const groups = [
    { title:'УТРО', times: todaySlots.filter(t=>+t.split(':')[0]<12) },
    { title:'ДЕНЬ', times: todaySlots.filter(t=>+t.split(':')[0]>=12 && +t.split(':')[0]<18) },
    { title:'ВЕЧЕР', times: todaySlots.filter(t=>+t.split(':')[0]>=18) },
  ]
  return groups
})

function selectTime(t){
  selectedTime.value = t
}

function bookTime(){
  const raw = localStorage.getItem(VISIT_KEY)
  const visit = raw? JSON.parse(raw) : { staff_id:'', services_id:[], visit_time:{start_time:'',end:''}, comment:'' }
  visit.visit_time.start_time = `${selectedDate.value}T${selectedTime.value}:00`
  const s = JSON.stringify(visit)
  localStorage.setItem(VISIT_KEY,s)
  document.cookie = `visit_data=${encodeURIComponent(s)};path=/;max-age=${365*24*60*60};SameSite=None;Secure`
  // переходим назад на страницу «appointmant»
  history.back()
}

// при старте, если дата уже в куках — восстановим выбор
if(localStorage.getItem(VISIT_KEY)){
  const v = JSON.parse(localStorage.getItem(VISIT_KEY))
  if(v.visit_time?.start_time){
    const [d,t] = v.visit_time.start_time.split('T')
    selectedDate.value = d
    selectedTime.value = t.slice(0,5)
    currentDate.value = new Date(d)
    fetchFreeSlots()
  }
}
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
