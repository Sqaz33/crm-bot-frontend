<template>
  <div class="booking-page">

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
          <div v-for="day in calendarDays" :key="day.date" :class="{
            day: true,
            'other-month': !day.isCurrentMonth,
            'current-day': day.isToday,
            selected: day.date === selectedDate,
            'day-past': day.isPast && day.isCurrentMonth
          }" @click="!day.isPast && day.isCurrentMonth && selectDate(day)">
            {{ day.dayNumber }}
          </div>
        </div>
      </div>

      <div class="time-section" v-if="selectedDate">
        <h3 class="time-title">Выберите время</h3>
        <div class="time-buttons">
          <button v-for="start in freeSlots" :key="start" :class="['time-btn', { selected: start === selectedTime }]"
            @click="selectTime(start)" type="button">
            {{ formatTime(start) }}
          </button>
        </div>
        <div class="book-button-container">
          <button class="book-button" :disabled="!selectedTime" @click="bookTime">
            Занять
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api'

const VISIT_KEY = 'visit_data'
const menuItems = [
  { label: 'Сотрудник', path: '/choicestaff' },
  { label: 'Дата и время', path: '/datetime' },
  { label: 'Услуги', path: '/services' }
]

export default {
  data() {
    return {
      menuItems,
      currentDate: new Date(),
      selectedDate: null,
      selectedTime: null,
      weekdayNames: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'],
      freeSlots: []
    }
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleString('ru-RU', { month: 'long' })
    },
    currentYear() {
      return this.currentDate.getFullYear()
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const today = new Date(); today.setHours(0, 0, 0, 0)

      const firstDay = new Date(year, month, 1)
      let w = firstDay.getDay()
      w = w === 0 ? 6 : w - 1

      const days = []
      const prevCount = new Date(year, month, 0).getDate()

      for (let i = w; i > 0; i--) {
        const d = prevCount - i + 1
        const dt = new Date(year, month - 1, d); dt.setHours(0, 0, 0, 0)
        days.push({
          dayNumber: d,
          date: this.formatDate(dt),
          isCurrentMonth: false,
          isToday: false,
          isPast: dt < today
        })
      }
      const thisCount = new Date(year, month + 1, 0).getDate()
      for (let i = 1; i <= thisCount; i++) {
        const dt = new Date(year, month, i); dt.setHours(0, 0, 0, 0)
        days.push({
          dayNumber: i,
          date: this.formatDate(dt),
          isCurrentMonth: true,
          isToday: dt.toDateString() === today.toDateString(),
          isPast: dt < today
        })
      }
      const total = Math.ceil(days.length / 7) * 7
      const nextCount = total - days.length
      for (let i = 1; i <= nextCount; i++) {
        const dt = new Date(year, month + 1, i); dt.setHours(0, 0, 0, 0)
        days.push({
          dayNumber: i,
          date: this.formatDate(dt),
          isCurrentMonth: false,
          isToday: false,
          isPast: dt < today
        })
      }
      return days
    }
  },
  methods: {
    formatDate(d) {
      const y = d.getFullYear(),
        m = String(d.getMonth() + 1).padStart(2, '0'),
        dd = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${dd}`
    },
    formatTime(iso) {
      // ожидаем полный ISO, подрезаем HH:MM
      return iso.slice(11, 16)
    },
    prevMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      )
    },
    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      )
    },
    selectDate(day) {
      this.selectedDate = day.date
      this.selectedTime = null
      this.loadFreeSlots()
    },

    // — вот этот метод исправлен —
    async loadFreeSlots() {
      let staff_id = null
      let service_id = null
      const raw = localStorage.getItem(VISIT_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          staff_id = parsed.staff_id
          // services_id может быть массивом или одним значением
          if (Array.isArray(parsed.services_id) && parsed.services_id.length > 0) {
            service_id = parsed.services_id[0]
          } else if (parsed.services_id) {
            service_id = parsed.services_id
          }
        } catch (e) {
          console.error('Ошибка парсинга visit_data:', e)
        }
      }

      const params = { date: this.selectedDate }
      if (staff_id) params.staff_id = staff_id
      if (service_id) params.service_id = service_id

      try {
        const { data } = await api.get('/salon/free_time', { params })
        this.freeSlots = data.map(slot => {
          const s = slot.start

          let utcString
          if (s.includes('T')) {
            utcString = s
          } else {
            utcString = `${this.selectedDate}T${s}:00Z`
          }

          const local = new Date(utcString)
          const localIso = new Date(local.getTime() - local.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 19)

          return localIso
        })
      } catch (err) {
        console.error('Не удалось загрузить слоты:', err)
        this.freeSlots = []
      }
    },

    selectTime(start) {
      this.selectedTime = start
    },
    bookTime() {
      if (!this.selectedTime) return
      const raw = localStorage.getItem(VISIT_KEY)
      const visit = raw
        ? JSON.parse(raw)
        : { staff_id: '', services_id: [], visit_time: { start_time: '', end: '' }, comment: '' }

      visit.visit_time.start_time = this.selectedTime
      visit.staff_id ??= id
      visit.comment ??= ''
      visit.services_id ??= []

      localStorage.setItem(VISIT_KEY, JSON.stringify(visit))
      document.cookie = `visit_data=${encodeURIComponent(JSON.stringify(visit))}; path=/; SameSite=Lax;`

      const redirect = this.$route.query.redirect;

      if (redirect) {
        // парсим redirect URL
        const [path, queryString] = redirect.split('?');
        const query = {};

        if (queryString) {
          const params = new URLSearchParams(queryString);
          for (const [key, value] of params.entries()) {
            query[key] = value;
          }
        }

        // добавляем fromDatetime
        query.fromDatetime = 'true';

        this.$router.push({ path, query });
      } else {
        this.$router.push({ path: '/appointmant' });
      }
    }
  }
}
</script>

<style scoped>
.booking-page { 
  display: flex; 
  min-height: 100vh; 
  background: var(--light-color); 
}
.booking-container {
  flex: 1; ; max-width: clamp(300px, 70%, 900px);
  margin: 32px auto; 
  padding:0;
  background: #fff;
  border-radius: 10px; 
  border: 1.2px solid #1976ff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); 
  
}
.month-navigation {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 18px; 
  font-size: clamp(16px, 60%, 20px); 
  font-weight: 500;
  background: #edf2fa; 
  border-radius: 10px 10px 0 0; 
  padding: clamp(2px, 3vw,12px) 0;
  
}
.nav-button {
  background: none; 
  border: none; 
  font-size: 22px;
  cursor: pointer; 
  color: #1976ff; 
  margin: 0 1.2rem;
}
.weekdays {
  display: grid; 
  grid-template-columns: repeat(7,1fr);
  text-align: center; 
  margin-bottom: 8px;
  font-size: clamp(12px, 60%, 18px); 
  color: #9ea5b1;  padding: 0 2rem;
}
.days-grid {
  display: grid; 
  grid-template-columns: repeat(7,1fr); gap:5px;  padding: 0 2rem; 
}
.day {
  height: clamp(20px, 3vw, 38px); width:  clamp(20px, 3vw, 38px); 
  display: flex; align-items: center; justify-content: center;
  border-radius:  6px; font-size: clamp(12px, 60%, 18px); 
  background: #f6f8fa;
  color: #222; 
  cursor: pointer; 
  transition: background .1s,color .1s;
  border: none; 
  margin: auto; 
}
.day.other-month,
.day.day-past {
  color: #c4c4c4 !important; 
  cursor: not-allowed;
}
.day.selected {
  background: #1976ff !important; color: #fff !important;
  font-weight: bold;
}
.day.current-day:not(.selected) {
  border: 1.5px solid #1976ff;
}
.time-section {
  margin-top: 24px ;
  padding: 0 0px 30px 0px ; 
  border-top: 1px solid #ececec;
}
.time-title {
  font-size: clamp(14px, 3vw ,19px); font-weight: bold; 
  margin-bottom: 22px;  margin-left:15px;
}
.time-buttons {
  justify-content: center;
  display: flex; flex-wrap: wrap; column-gap: 15px; row-gap: 10px;
  margin-bottom: 12px; margin: 15px; margin-top: 10px; 
}
.time-btn {
  min-width: 70px; padding: 8px 0;
  border: 1.2px solid #1976ff; background: #fff;
  color: #1976ff; border-radius: 8px;
  font-size: 15px; font-weight: 500; cursor: pointer;
  transition: background .2s, color .2s, border .2s;
}
.time-btn.selected {
  background: #1976ff; color: #fff;
}
.book-button-container {
  display: flex;
  justify-content: center;
  margin: 14px 0 0 0;
}
.book-button {
  margin: 14px 15% 0 15%;
  width: 70%; height:2.7rem;
  background: #1976ff; color: #fff;
  border: none; border-radius: 8px;
  font-size: 17px; font-weight: 600; cursor: pointer;
  font-display: center;
  transition: background .2s;
}
.book-button:disabled {
  background: #c4c4c4; cursor: not-allowed;
}

.calendar-section {
  padding: 0; 
}
.month-header {
  color: rgb(0, 0, 0); font-weight: 400;
}
.month-name {
  margin-right: 10px;
}
@media (max-width: 900px) 
{
.booking-page { 
  display: flex; min-height: 100vh; background: var(--light-color);  
  padding: 1rem clamp(0.1rem, 1vw, 15rem) 1rem  clamp(2rem, 15vw, 15rem)
}
.booking-container {
  flex: 1; ; max-width: clamp(275px, 70%, 900px);  margin-top: 2px; padding:0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1.2px solid #1976ff;
}
.day {
  height: clamp(20px, 3vw, 45px); width:  clamp(23px, 3vw, 38px); display: flex; align-items: center; justify-content: center;
  border-radius:  3px; font-size: clamp(12px, 60%, 18px); background: #f6f8fa;
  border: none; margin: auto; 
}
.weekdays {
  display: grid; grid-template-columns: repeat(7,1fr);
  text-align: center; margin-bottom: 8px;
  font-size: clamp(12px, 60%, 18px); color: #9ea5b1;  padding: 0;
}
.days-grid {
  display: grid; grid-template-columns: repeat(7,1fr); gap:5px; padding: 0;
}
.time-section {
  margin-top: 15px ;padding: 0 0 0 0 ; border-top: 1px solid #ececec;
  
}
.book-button-container {
  display: flex;
  justify-content: center;
  margin: 14px 0 0 0;
}

.book-button {
  
  margin: 14px 0 0 0;
  width: 70%; height:2rem;;
  font-size: 14px; font-weight: 600; cursor: pointer;
}
}
</style>