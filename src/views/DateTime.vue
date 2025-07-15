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
          @click="selectDate(day)"
        >
          {{ day.dayNumber }}
        </div>
      </div>
    </div>
    
 
    <div class="time-section" v-if="selectedDate">
      <h3 class="time-title">Выберите время начала</h3>
      
      <div class="time-group" v-for="(group, idx) in timeGroups" :key="idx">
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

<script>
export default {
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedTime: null,
      weekdayNames: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
      timeSlots: [
        '11:00','11:30','12:00','12:30','13:00','13:30',
        '15:00','15:30','16:00','16:30','17:00','17:30',
        '18:00','18:30','19:00','19:30','20:00','20:30'
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
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const today = new Date()
      const firstDay = new Date(year, month, 1)
      const daysInMonth = new Date(year, month+1,0).getDate()
      let firstWeekday = firstDay.getDay()
      firstWeekday = firstWeekday===0?6:firstWeekday-1

      const days = []
   
      const prevMonthDays = new Date(year,month,0).getDate()
      for(let i=firstWeekday;i>0;i--){
        const d = prevMonthDays - i +1
        days.push({
          dayNumber:d,
          date:this.formatDate(new Date(year,month-1,d)),
          isCurrentMonth:false,
          isToday:false
        })
      }
      
      for(let i=1;i<=daysInMonth;i++){
        const d = new Date(year,month,i)
        days.push({
          dayNumber:i,
          date:this.formatDate(d),
          isCurrentMonth:true,
          isToday:d.toDateString()===today.toDateString()
        })
      }
     
      const total = Math.ceil(days.length/7)*7
      const nextCount = total - days.length
      for(let i=1;i<=nextCount;i++){
        days.push({
          dayNumber:i,
          date:this.formatDate(new Date(year,month+1,i)),
          isCurrentMonth:false,
          isToday:false
        })
      }
      return days
    },
    timeGroups() {
      const groups = []
      this.timeSlots.forEach(time=>{
        const hour = +time.split(':')[0]
        let title = hour<12?'УТРО': hour<18?'ДЕНЬ':'ВЕЧЕР'
        let grp = groups.find(g=>g.title===title)
        if(!grp){
          grp={title, times:[]}
          groups.push(grp)
        }
        grp.times.push(time)
      })
      return groups
    }
  },
  methods: {
    formatDate(date){
      const y=date.getFullYear()
      const m=String(date.getMonth()+1).padStart(2,'0')
      const d=String(date.getDate()).padStart(2,'0')
      return `${y}-${m}-${d}`
    },
    prevMonth(){
      this.currentDate=new Date(this.currentDate.getFullYear(),this.currentDate.getMonth()-1,1)
    },
    nextMonth(){
      this.currentDate=new Date(this.currentDate.getFullYear(),this.currentDate.getMonth()+1,1)
    },
    selectDate(day){
      if(!day.isCurrentMonth)return
      this.selectedDate=day.date
      this.selectedTime=null
    },
    selectTime(time){
      this.selectedTime=time
    },
    getCookie(name){
      const m=document.cookie.match(new RegExp('(^| )'+name+'=([^;]+)'))
      return m? decodeURIComponent(m[2]) : null
    },
    setCookie(name,value,days=7){
      const d=new Date()
      d.setTime(d.getTime()+days*24*60*60*1000)
      document.cookie=`${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=None;Secure`
    },
    bookTime(){
      if(!this.selectedDate||!this.selectedTime) return
      const raw=this.getCookie('visit_data')
      let visitData= raw? JSON.parse(raw) : {
        staff_id:'', services_id:[], visit_time:{start_time:'',end:''}, comment:''
      }
      visitData.visit_time.start_time = `${this.selectedDate}T${this.selectedTime}:00`
      const ser=JSON.stringify(visitData)
      this.setCookie('visit_data',ser)
      localStorage.setItem('visit_data',ser)
      console.log('→ visit_data cookie:', this.getCookie('visit_data'))
      console.log('→ visit_data localStorage:', localStorage.getItem('visit_data'))
    }
  },
  mounted(){
    const raw=this.getCookie('visit_data')
    if(raw){
      try{
        const d=JSON.parse(raw)
        if(d.visit_time&&d.visit_time.start_time){
          const [dt, tm]=d.visit_time.start_time.split('T')
          this.selectedDate=dt
          if(tm) this.selectedTime=tm.slice(0,5)
        }
      }catch(e){
        console.error('Ошибка чтения visit_data:',e)
      }
    }
  }
}
</script>

<style scoped>
.booking-container {
  max-width: 360px;
  margin: 0 auto;
  padding: 16px;
  font-family: 'Roboto', sans-serif;
  color: #333;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px 16px;
}

.month-header {
  text-align: center;
}

.month-name {
  font-size: 18px;
  font-weight: bold;
  margin-right: 4px;
  text-transform: capitalize;
}

.year {
  font-size: 16px;
  color: #666;
}

.calendar-section {
  margin-bottom: 24px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.day.other-month {
  color: #ccc;
  cursor: default;
}

.day.selected {
  background-color: #000;
  color: white;
}

.day.current-day {
  font-weight: bold;
  text-decoration: underline;
}

.time-section {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.time-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.time-group {
  margin-bottom: 16px;
}

.time-group-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #666;
}

.time-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-buttons button {
  flex: 1 0 calc(25% - 8px);
  min-width: 0;
  padding: 10px 0;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.time-buttons button.selected {
  background: #000;
  color: white;
}

.book-button {
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.book-button:hover {
  background-color: #333;
}

.book-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>