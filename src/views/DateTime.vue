<template>
  <div class="booking-page">
    <SidebarMenu :items="menuItems" />
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
  <h3 class="time-title">Выберите время начала</h3>
  <div class="time-groups">
    <div class="time-group" v-for="(group, idx) in timeGroups" :key="idx">
      <h4 class="time-group-title">{{ group.title }}</h4>
      <div class="time-buttons">
        <button
          v-for="time in group.times"
          :key="time"
          :class="['time-btn', { selected: time === selectedTime }]"
          @click="selectTime(time)"
          type="button"
        >
          {{ time }}
        </button>

        <button
          v-if="selectedTime && group.times.includes(selectedTime)"
          class="book-button"
          @click="bookTime"
        >
          Занять
        </button>
      </div>
    </div>
  </div>
</div>
</div>
  </div>
</template>

<script>
import SidebarMenu from '../components/Sidebar.vue'

const menuItems = [
  { label: 'Сотрудник', path: '/choicestaff' },
  { label: 'Дата и время', path: '/datetime' },
  { label: 'Услуги', path: '/services' }
]

export default {
  components: { SidebarMenu },
  data() {
    return {
      menuItems,
      currentDate: new Date(),
      selectedDate: null,
      selectedTime: null,
      weekdayNames: ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'],
      timeSlots: [
        '10:00','10:30','11:00','11:30','12:00','12:10','12:30','13:00','13:30',
        '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
        '18:00','18:30','19:00','19:30'
      ]
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
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDay = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      let firstWeekday = firstDay.getDay();
      firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;

      const days = [];
      const prevMonthDays = new Date(year, month, 0).getDate();

      // Предыдущий месяц
      for (let i = firstWeekday; i > 0; i--) {
        const d = prevMonthDays - i + 1;
        const dateObj = new Date(year, month - 1, d);
        dateObj.setHours(0, 0, 0, 0);
        days.push({
          dayNumber: d,
          date: this.formatDate(dateObj),
          isCurrentMonth: false,
          isToday: false,
          isPast: dateObj < today
        });
      }

      // Текущий месяц
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        d.setHours(0, 0, 0, 0);
        days.push({
          dayNumber: i,
          date: this.formatDate(d),
          isCurrentMonth: true,
          isToday: d.toDateString() === today.toDateString(),
          isPast: d < today
        });
      }

      // Следующий месяц
      const total = Math.ceil(days.length / 7) * 7;
      const nextCount = total - days.length;
      for (let i = 1; i <= nextCount; i++) {
        const dateObj = new Date(year, month + 1, i);
        dateObj.setHours(0, 0, 0, 0);
        days.push({
          dayNumber: i,
          date: this.formatDate(dateObj),
          isCurrentMonth: false,
          isToday: false,
          isPast: dateObj < today
        });
      }
      return days;
    },
    timeGroups() {
      // Группировка времени — как на скрине
      return [
        {
          title: 'день',
          times: this.timeSlots.filter(t => +t.split(':')[0] >= 12 && +t.split(':')[0] < 18)
        },
        {
          title: 'вечер',
          times: this.timeSlots.filter(t => +t.split(':')[0] >= 18)
        }
      ]
    }
  },
  methods: {
    formatDate(date){
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    prevMonth(){
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },
    nextMonth(){
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },
    selectDate(day){
      if (!day.isCurrentMonth) return;
      const today = new Date();
      const dateParts = day.date.split('-');
      const d = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]);
      today.setHours(0,0,0,0);
      d.setHours(0,0,0,0);
      if (d < today) return;
      this.selectedDate = day.date;
      this.selectedTime = null;
    },
    selectTime(time){
      this.selectedTime = time;
    },
    bookTime() {
  if (!this.selectedDate || !this.selectedTime) return;


  const raw = localStorage.getItem('visit_data');
  let visitData = raw
    ? JSON.parse(raw)
    : {
        staff_id: '',
        services_id: [],
        visit_time: { start_time: '', end: '' },
        comment: ''
      };

  
  visitData.visit_time.start_time = `${this.selectedDate}T${this.selectedTime}:00`;

  
  const ser = JSON.stringify(visitData);
  localStorage.setItem('visit_data', ser);

  document.cookie = `visit_data=${encodeURIComponent(ser)};path=/;SameSite=Lax;`;


  this.$router.go(-1);
}

  }
}
</script>


<style scoped>
.booking-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
}

.booking-container {
  flex: 1;
  max-width: 480px;
  margin: 32px auto;
  padding: 32px 32px 24px 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 18px 0 rgba(31, 70, 255, 0.10);
  border: 2px solid #1976ff;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  font-size: 1.1rem;
  font-weight: 500;
  background: #f6f8fa;
  border-radius: 10px;
  padding: 12px 0;
}

.nav-button {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #1976ff;
  font-weight: bold;
  padding: 6px 16px;
}

.month-header {
  text-align: center;
}

.month-name {
  font-size: 20px;
  font-weight: 600;
  margin-right: 6px;
  text-transform: capitalize;
}

.year {
  font-size: 17px;
  color: #888;
  font-weight: 400;
}

.calendar-section {
  margin-bottom: 32px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
  font-size: 15px;
  color: #9ea5b1;
  letter-spacing: 0.02em;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 7px;
}

.day {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
  background: #f6f8fa;
  color: #222;
  cursor: pointer;
  transition: background .1s, color .1s;
  border: none;
  outline: none;
}

.day.other-month, .day.day-past {
  color: #c4c4c4 !important;
  background: #f6f8fa !important;
  cursor: not-allowed;
  pointer-events: none;
}

.day.selected {
  background: #1976ff !important;
  color: #fff !important;
  font-weight: bold;
}

.day.current-day:not(.selected) {
  border: 1.5px solid #1976ff;
}

.time-section {
  border-top: 1px solid #ececec;
  padding-top: 24px;
}

.time-title {
  font-size: 19px;
  font-weight: bold;
  margin-bottom: 22px;
  text-align: left;
}

.time-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-group-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 7px;
  color: #777;
}

.time-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.time-buttons button {
  min-width: 74px;
  padding: 8px 0;
  border: 1.5px solid #1976ff;
  background: #fff;
  color: #1976ff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background .2s, color .2s, border .2s;
}

.time-buttons button.selected,
.time-buttons button:active {
  background: #1976ff;
  color: #fff;
}

.book-button {
  width: 100%;
  padding: 15px;
  margin-top: 14px;
  background: #1976ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.book-button:disabled {
  background: #c4c4c4;
  color: #fff;
  cursor: not-allowed;
}
</style>
