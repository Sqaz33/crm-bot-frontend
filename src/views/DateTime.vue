<template>
  <div class="min-h-screen bg-[#F6F9FC] px-4 py-4 md:px-6">
    <div class="mx-auto w-full max-w-[900px] overflow-hidden rounded-xl bg-white shadow-sm">
      <DaytimeMonthNavigation
        :prev-month-name="prevMonthName"
        :month-title="monthTitle"
        :next-month-name="nextMonthName"
        @prev="prevMonth"
        @next="nextMonth"
      />

      <DaytimeCalendar
        :weekday-names="weekdayNames"
        :calendar-days="calendarDays"
        :selected-date="selectedDate"
        :loading-day="loadingDay"
        @select-day="selectDate"
      />

      <DaytimeTimeSlots
        :selected-date="selectedDate"
        :free-slots="freeSlots"
        :morning-slots="morningSlots"
        :afternoon-slots="afternoonSlots"
        :evening-slots="eveningSlots"
        :selected-time="selectedTime"
        :is-loading="loadingDay"
        :format-time="formatTime"
        @select-time="selectTime"
        @book="bookTime"
      />
    </div>
  </div>
</template>

<script>
import api from '../api'
import DaytimeCalendar from '../components/daytime/DaytimeCalendar.vue'
import DaytimeMonthNavigation from '../components/daytime/DaytimeMonthNavigation.vue'
import DaytimeTimeSlots from '../components/daytime/DaytimeTimeSlots.vue'
import { getRawVisit, readVisit, writeVisit } from '../utils/visitStorage'
import { formatDateForCalendar, formatTime } from '../utils/dateFormatters'
import { cap } from '../utils/stringUtils'
import { logger } from '../utils/logger'

export default {
  components: {
    DaytimeMonthNavigation,
    DaytimeCalendar,
    DaytimeTimeSlots
  },
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedTime: null,
      loadingDay: false,
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
  mounted() {
    this.selectedDate = null
    this.selectedTime = null
    this.loadingDay = false
    this.freeSlots = []
  },
  methods: {
    cap,
    formatDate: formatDateForCalendar,
    formatTime,
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
    async selectDate(day) {
      this.selectedDate = day.date
      this.selectedTime = null
      this.loadingDay = true
      try {
        await this.loadFreeSlots()
      } finally {
        this.loadingDay = false
      }
    },
    async loadFreeSlots() {
      let staff_id = null
      let service_id = null
      const parsed = getRawVisit()
      if (parsed) {
        if (parsed.staff_id && parsed.staff_id !== '') {
          staff_id = parsed.staff_id
        }

        if (Array.isArray(parsed.services_id) && parsed.services_id.length > 0) {
          service_id = parsed.services_id[0]
        } else if (parsed.services_id) {
          service_id = parsed.services_id
        }
      }

      if (!service_id) {
        logger.warn('DateTime: service_id обязателен для загрузки свободных слотов')
        this.freeSlots = []
        return
      }

      const params = { date: this.selectedDate }
      if (staff_id) params.staff_id = parseInt(staff_id)
      if (service_id) params.service_id = service_id

      try {
        const response = await api.get('/staff/free_time/', { params })

        if (response.status !== 200) {
          logger.error('DateTime: неожиданный статус ответа', {
            date: this.selectedDate,
            staff_id,
            service_id,
            status: response.status
          })
          this.freeSlots = []
          return
        }

        const data = response.data
        const slots = data[0]?.free_slots || []

        this.freeSlots = slots.map(slot => {
          const s = slot.start_time

          if (s.includes('T')) {
            return s
          }

          return `${this.selectedDate}T${s}`
        })
      } catch (err) {
        logger.error('DateTime: ошибка загрузки слотов', {
          date: this.selectedDate,
          staff_id,
          service_id,
          error: err?.message || String(err)
        })
        this.freeSlots = []
      }
    },
    selectTime(start) {
      this.selectedTime = start
    },
    bookTime() {
      if (!this.selectedTime) return
      const visit = readVisit()

      visit.visit_time.start_time = this.selectedTime
      visit.staff_id ??= ''
      visit.comment ??= ''
      visit.services_id ??= []

      writeVisit(visit, { syncCookie: true })

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
