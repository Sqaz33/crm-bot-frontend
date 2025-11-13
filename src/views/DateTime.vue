<template>
  <div class="booking-page">
    <div class="booking-container">
      <div class="month-navigation">
        <button class="nav-button" @click="prevMonth">{{ prevMonthName }}</button>
        <div class="month-header">
          <span class="month-name">{{ monthTitle }}</span>
        </div>
        <button class="nav-button" @click="nextMonth">{{ nextMonthName }}</button>
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
              'day-cell': true,
              'other-month': !day.isCurrentMonth,
              'current-day': day.isToday,
              'selected': day.date === selectedDate,
              'day-past': day.isPast && day.isCurrentMonth
            }"
            @click="!day.isPast && day.isCurrentMonth && selectDate(day)"
          >
            {{ day.dayNumber }}
          </div>
        </div>
      </div>

      <div class="time-section" v-if="selectedDate">
        <h3 class="time-title">Выберите время начала</h3>

        <div class="time-category">
          <div class="category-label">Утро</div>
          <div class="time-buttons">
            <button
              v-for="slot in morningSlots"
              :key="slot"
              :class="['time-btn', { selected: slot === selectedTime }]"
              @click="selectTime(slot)"
              type="button"
            >
              {{ formatTime(slot) }}
            </button>
          </div>
        </div>

        <div class="time-category" v-if="afternoonSlots.length">
          <div class="category-label">День</div>
          <div class="time-buttons">
            <button
              v-for="slot in afternoonSlots"
              :key="slot"
              :class="['time-btn', { selected: slot === selectedTime }]"
              @click="selectTime(slot)"
              type="button"
            >
              {{ formatTime(slot) }}
            </button>
          </div>
        </div>

        <div class="time-category" v-if="eveningSlots.length">
          <div class="category-label">Вечер</div>
          <div class="time-buttons">
            <button
              v-for="slot in eveningSlots"
              :key="slot"
              :class="['time-btn', { selected: slot === selectedTime }]"
              @click="selectTime(slot)"
              type="button"
            >
              {{ formatTime(slot) }}
            </button>
          </div>
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

export default {
  data() {
    return {
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
    monthTitle() {
      return this.cap(this.currentMonthName)
    },
    prevMonthName() {
      const d = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
      return this.cap(d.toLocaleString('ru-RU', { month: 'long' }))
    },
    nextMonthName() {
      const d = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
      return this.cap(d.toLocaleString('ru-RU', { month: 'long' }))
    },
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const firstDay = new Date(year, month, 1)
      let w = firstDay.getDay()
      w = w === 0 ? 6 : w - 1

      const days = []
      const prevCount = new Date(year, month, 0).getDate()

      for (let i = w; i > 0; i--) {
        const d = prevCount - i + 1
        const dt = new Date(year, month - 1, d)
        dt.setHours(0, 0, 0, 0)
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
        const dt = new Date(year, month, i)
        dt.setHours(0, 0, 0, 0)
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
        const dt = new Date(year, month + 1, i)
        dt.setHours(0, 0, 0, 0)
        days.push({
          dayNumber: i,
          date: this.formatDate(dt),
          isCurrentMonth: false,
          isToday: false,
          isPast: dt < today
        })
      }
      return days
    },
    morningSlots() {
      return this.freeSlots.filter(slot => {
        const hour = parseInt(slot.slice(11, 13))
        return hour < 12
      })
    },
    afternoonSlots() {
      return this.freeSlots.filter(slot => {
        const hour = parseInt(slot.slice(11, 13))
        return hour >= 12 && hour < 18
      })
    },
    eveningSlots() {
      return this.freeSlots.filter(slot => {
        const hour = parseInt(slot.slice(11, 13))
        return hour >= 18
      })
    }
  },
  methods: {
    cap(s) {
      return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
    },
    formatDate(d) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${dd}`
    },
    formatTime(iso) {
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
    async loadFreeSlots() {
      let staff_id = null
      let service_id = null
      const raw = localStorage.getItem(VISIT_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          
          if (parsed.staff_id && parsed.staff_id !== '') {
            staff_id = parsed.staff_id
          }
          
          if (Array.isArray(parsed.services_id) && parsed.services_id.length > 0) {
            service_id = parsed.services_id[0]
          } else if (parsed.services_id) {
            service_id = parsed.services_id
          }
        } catch (e) {
          console.error('Ошибка парсинга visit_data:', e)
        }
      }
      
      if (!service_id) {
        console.warn('service_id обязателен для загрузки свободных слотов')
        this.freeSlots = []
        return
      }

      const params = { date: this.selectedDate }
      if (staff_id) params.staff_id = parseInt(staff_id)
      if (service_id) params.service_id = parseInt(service_id)

      try {
        const { data } = await api.get('/staff/free_time/', { params })
        const slots = data[0].available_slots
        this.freeSlots = slots.map(slot => {
          const s = slot.start_time
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
      visit.staff_id ??= ''
      visit.comment ??= ''
      visit.services_id ??= []

      localStorage.setItem(VISIT_KEY, JSON.stringify(visit))
      document.cookie = `visit_data=${encodeURIComponent(JSON.stringify(visit))}; path=/; SameSite=Lax;`

      const redirect = this.$route.query.redirect
      if (redirect) {
        const [path, queryString] = redirect.split('?')
        const query = {}
        if (queryString) {
          const params = new URLSearchParams(queryString)
          for (const [key, value] of params.entries()) {
            query[key] = value
          }
        }
        query.fromDatetime = 'true'
        this.$router.push({ path, query })
      } else {
        this.$router.push({ path: '/appointmant' })
      }
    }
  }
}
</script>


<style scoped>
.booking-page {
  display: flex;
  min-height: 100vh;
  background: #f6f9fc;
  padding: 1rem;
  box-sizing: border-box;
}

.booking-container {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  box-sizing: border-box;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fb;
  border-bottom: 1px solid #e8eef5;
}

.nav-button {
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #5073f0;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.nav-button:hover {
  color: #3d5dd4;
}

.month-header {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a2233;
}

.calendar-section {
  padding: 1rem 1.5rem 1.5rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.weekday {
  font-size: 0.75rem;
  font-weight: 500;
  color: #8b9aaa;
  padding: 0.375rem 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-cell {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.9375rem;
  background: #f8f9fb;
  color: #1a2233;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  margin: 0 auto;
}

.day-cell:hover:not(.other-month):not(.day-past) {
  background: #e8eef5;
}

.day-cell.other-month {
  color: #c4cdd5;
  cursor: not-allowed;
}

.day-cell.day-past {
  color: #c4cdd5;
  cursor: not-allowed;
  background: #fafbfc;
}

.day-cell.current-day:not(.selected) {
  border-color: #5073f0;
  background: #ffffff;
}

.day-cell.selected {
  background: #5073f0;
  color: #ffffff;
  font-weight: 600;
}

.time-section {
  padding: 1.5rem;
  border-top: 1px solid #e8eef5;
  background: #fafbfc;
}

.time-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a2233;
  margin-bottom: 1.5rem;
}

.time-category {
  margin-bottom: 1.25rem;
}

.category-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7688;
  margin-bottom: 0.75rem;
}

.time-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.time-btn {
  min-width: 70px;
  padding: 0.625rem 1rem;
  border: 1.5px solid #5073f0;
  background: #ffffff;
  color: #5073f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  background: #f0f4ff;
}

.time-btn.selected {
  background: #5073f0;
  color: #ffffff;
  font-weight: 600;
}

.book-button-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.book-button {
  width: 100%;
  max-width: 400px;
  padding: 0.875rem 1.5rem;
  background: #5073f0;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.book-button:hover:not(:disabled) {
  background: #3d5dd4;
}

.book-button:disabled {
  background: #c4cdd5;
  cursor: not-allowed;
}

/* @media (max-width: 768px) {
  .booking-page {
    padding: 0.5rem;
  }
  .month-navigation {
    padding: 0.875rem 1rem;
  }
  .calendar-section {
    padding: 1rem;
    max-width: 100%;
  }
  .weekday {
    font-size: 0.7rem;
    padding: 0.25rem 0;
  }
  .day-cell {
    font-size: 0.875rem;
    height: 44px;
  }
  .time-section {
    padding: 1rem;
  }
  .time-title {
    font-size: 0.9375rem;
    margin-bottom: 1rem;
  }
  .time-btn {
    min-width: 65px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
} */

@media (max-width: 768px) {
  .booking-page {
    --sidebar-mobile: 12px;
        --gutter-mobile: 36px;
        --top-gap-mobile: 12px;
        padding: 0;
        padding-top: var(--top-gap-mobile);
        padding-left: calc(var(--sidebar-mobile) + 2 * var(--gutter-mobile));
        /* padding-right: calc(var(--sidebar-mobile) + var(--gutter-mobile)); */
    background: #f6f9fc;
  }
  .booking-container {
    /* width: calc(100vw - 2 * (var(--sidebar-mobile) + var(--gutter-mobile))); */
    max-width: none;
    margin: 0;
    border-radius: 14px;
    overflow: hidden;
  }
  .month-navigation {
    padding: 10px 12px;
    background: transparent;
    border-bottom: none;
  }
  .month-header {
    background: #eef0ff;
    color: #2b3240;
    border-radius: 12px;
    padding: 6px 16px;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.2px;
  }
  .nav-button {
    color: #5c6cf0;
    font-weight: 600;
    font-size: 14px;
    padding: 6px 4px;
  }
  .calendar-section {
    padding: 12px;
    background: #ffffff;
  }
  .weekdays {
    gap: 6px;
    margin-bottom: 8px;
  }
  .weekday {
    color: #8d99ad;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 6px 0;
  }
  .days-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
  }
  .day-cell {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    margin: 0;
    border-radius: 12px;
    border: 1px solid #e6eaf2;
    background: #ffffff;
    color: #2b3240;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.15s ease;
  }
  .day-cell.other-month {
    border-color: transparent;
    background: #eef2f6;
    color: #b7c0cc;
  }
  .day-cell.day-past {
    color: #b7c0cc;
    background: #fafbfc;
    border-color: transparent;
  }
  .day-cell.current-day:not(.selected) {
    background: #ffffff;
    border: 2px solid #5c6cf0;
    color: #5c6cf0;
  }
  .day-cell.selected {
    background: #5c6cf0;
    border-color: #5c6cf0;
    color: #ffffff;
  }
  .time-section {
    padding: 12px;
    background: #ffffff;
    border-top: 1px solid #eef1f5;
  }
  .time-title {
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e6eaf2;
    color: #8d99ad;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.02em;
  }
  .time-category {
    margin-bottom: 14px;
  }
  .category-label {
    margin-bottom: 8px;
    color: #8d99ad;
    font-weight: 600;
    font-size: 13px;
  }
  .time-buttons {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .time-btn {
    min-width: 0;
    width: 100%;
    padding: 10px 6px;
    border: 2px solid #5c6cf0;
    background: #ffffff;
    color: #2b3240;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
    line-height: 1;
    transition: 0.15s ease;
  }
  .time-btn.selected {
    background: #5c6cf0;
    color: #ffffff;
    border-color: #5c6cf0;
  }
  .book-button-container {
    margin-top: 12px;
  }
  .book-button {
    width: 100%;
    max-width: none;
    border-radius: 12px;
  }
}

@media (max-width: 360px) {
  .time-buttons {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

</style>
