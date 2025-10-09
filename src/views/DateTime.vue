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
            @click="!day.isPast && day.isCurrentMonth && selectDate(day)"
          >
            {{ day.dayNumber }}
          </div>
        </div>
      </div>

      <div class="time-section" v-if="selectedDate">
        <h3 class="time-title">Выберите время</h3>
        <div class="time-buttons">
          <button
            v-for="start in freeSlots"
            :key="start"
            :class="['time-btn', { selected: start === selectedTime }]"
            @click="selectTime(start)"
            type="button"
          >
            {{ formatTime(start) }}
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

<script>
import api from '../api'

const VISIT_KEY = 'visit_data'
const menuItems = [
  { label: 'Сотрудник',     path: '/choicestaff' },
  { label: 'Дата и время',   path: '/datetime'   },
  { label: 'Услуги',         path: '/services'   }
]

export default {
  data() {
    return {
      menuItems,
      currentDate: new Date(),
      selectedDate: null,
      selectedTime: null,
      weekdayNames: ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'],
      freeSlots: []
    }
  },
  computed: {
    currentMonthName() {
      return this.currentDate.toLocaleString('ru-RU',{ month:'long' })
    },
    currentYear() {
      return this.currentDate.getFullYear()
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const today = new Date(); today.setHours(0,0,0,0)

      const firstDay = new Date(year, month, 1)
      let w = firstDay.getDay()
      w = w === 0 ? 6 : w - 1

      const days = []
      const prevCount = new Date(year, month, 0).getDate()

      for (let i = w; i > 0; i--) {
        const d = prevCount - i + 1
        const dt = new Date(year, month - 1, d); dt.setHours(0,0,0,0)
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
        const dt = new Date(year, month, i); dt.setHours(0,0,0,0)
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
        const dt = new Date(year, month + 1, i); dt.setHours(0,0,0,0)
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
            m = String(d.getMonth()+1).padStart(2,'0'),
            dd = String(d.getDate()).padStart(2,'0')
      return `${y}-${m}-${dd}`
    },
    formatTime(iso) {
      // ожидаем полный ISO, подрезаем HH:MM
      return iso.slice(11,16)
    },
    prevMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth()-1,
        1
      )
    },
    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth()+1,
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
      const raw = localStorage.getItem(VISIT_KEY)
      if (raw) {
        try { staff_id = JSON.parse(raw).staff_id } catch {}
      }
      const params = { date: this.selectedDate }
      if (staff_id) params.staff_id = staff_id

      try {
        const { data } = await api.get('/salon/free_time', { params })
        this.freeSlots = data.map(slot => {
          const s = slot.start
          if (s.includes('T')) {
            return s
          } else {
            return `${this.selectedDate}T${s}:00`
          }
        })
        console.log('Loaded freeSlots:', this.freeSlots)
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
        : { staff_id:'', services_id:[], visit_time:{start_time:'',end:''}, comment:'' }

      visit.visit_time.start_time = this.selectedTime
      localStorage.setItem(VISIT_KEY, JSON.stringify(visit))
      document.cookie = `visit_data=${encodeURIComponent(JSON.stringify(visit))}; path=/; SameSite=Lax;`
      const redirect = this.$route?.query?.redirect || '/appointment';
      this.$router.push({ path: redirect })
    }
  }
}
</script>

<style scoped>
.booking-page { display: flex; min-height: 100vh; background: var(--light-color); }
.booking-container {
  flex: 1; max-width: clamp(250px, 70%, 900px);  margin: 32px auto; padding: 32px;
  background: #fff; border-radius: 18px;
  box-shadow: 0 2px 18px rgba(31,70,255,0.1);
  border: 2px solid #1976ff;
}
.month-navigation {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18px; font-size: 1.1rem; font-weight: 500;
  background: #f6f8fa; border-radius: 10px; padding: 12px 0;
}
.nav-button {
  background: none; border: none; font-size: 22px;
  cursor: pointer; color: #1976ff;
}
.weekdays {
  display: grid; grid-template-columns: repeat(7,1fr);
  text-align: center; margin-bottom: 8px;
  font-size: 15px; color: #9ea5b1;
}
.days-grid {
  display: grid; grid-template-columns: repeat(7,1fr); gap: 5%; margin-left: 40px;
}
.day {
  height: 38px; width: 38px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; font-size: 16px; background: #f6f8fa;
  color: #222; cursor: pointer; transition: background .1s,color .1s;
  border: none;
}
.day.other-month,
.day.day-past {
  color: #c4c4c4 !important; cursor: not-allowed;
}
.day.selected {
  background: #1976ff !important; color: #fff !important;
  font-weight: bold;
}
.day.current-day:not(.selected) {
  border: 1.5px solid #1976ff;
}
.time-section {
  border-top: 1px solid #ececec; padding-top: 24px;
}
.time-title {
  font-size: 19px; font-weight: bold; margin-bottom: 22px;
}
.time-buttons {
  display: flex; flex-wrap: wrap; gap: 12px;
  margin-bottom: 12px;
}
.time-btn {
  min-width: 74px; padding: 8px 0;
  border: 1.5px solid #1976ff; background: #fff;
  color: #1976ff; border-radius: 8px;
  font-size: 15px; font-weight: 500; cursor: pointer;
  transition: background .2s, color .2s, border .2s;
}
.time-btn.selected {
  background: #1976ff; color: #fff;
}
.book-button {
  width: 100%; padding: 15px; margin-top: 14px;
  background: #1976ff; color: #fff;
  border: none; border-radius: 8px;
  font-size: 17px; font-weight: 600; cursor: pointer;
  transition: background .2s;
}
.book-button:disabled {
  background: #c4c4c4; cursor: not-allowed;
}

.calendar-section {
  padding: 0 32px; 
}
</style>
