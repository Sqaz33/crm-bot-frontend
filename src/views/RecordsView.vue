<template>
  <div class="base">
    <div class="review-view">
      
      <div class="tabs-container">
        <button 
          class="tab-btn1" 
          :class="{ active: activeTab === 'current' }"
          @click="activeTab = 'current'">
          Текущие
        </button>
        <button 
          class="tab-btn2" 
          :class="{ active: activeTab === 'past' }"
          @click="activeTab = 'past'">
          Прошедшие
        </button>
      </div>
      
      <!-- текущие записи -->
      <main v-if="activeTab === 'current'">
        <div v-if="!hasRecords" class="empty-content">
          <img src="../assets/emptyRecord.svg" alt="Нет записей" class="empty-icon" />
          <p1>Увы, ничего не запланировано</p1>
          <p2>У Вас ни одной активной записи</p2>        
        </div>
        
        <div v-else class="filled-content">
          <!-- шаблон записи -->
            <div class="appointment-card">
            <div class="card-header">
              <img src="../assets/emptyAvatar.svg" alt="Нет фото" class="avatar"/>
              <div class="employee-info">
                
                <div class="employee-name">Имя сотрудника</div>
                <div class="employee-specialty">Специальность</div>
              </div>
              <div class="date-time">
                <div class="date">15 октября</div>
                <div class="time">15:00</div>
              </div>
            </div>
            
            <div class="service-info">
              <div class="service-name-small">Услуга</div>
              <div class="service-name-small">Количество</div>
              <div class="service-name-small">Стоимость</div>
              
              <div class="service-name">Название услуги</div>
              <div class="quantity">1</div>
              <div class="price">5000 ₽</div>
              
            </div>
            
            <div class="card-status">
              <div class="status-info">
                <img src="../assets/crossIcon.svg" alt="не оплачено" class="status-icon"/>
                <div class="status-badge-reason">
                  <span class="status-badge">Не оплачено</span>
                  <div class="status-reason">Визит отменен/клиент не пришел</div>
                </div>
              </div>
              <div class="total-price">
                5000  ₽
              </div>
            </div>
            
          </div>
        </div>

      </main>

      <!-- прошедшие записи -->
      <main v-if="activeTab === 'past'">
        <div v-if="!hasRecords" class="empty-content">
          <img src="../assets/emptyRecordPast.svg" alt="Нет записей" class="empty-icon" />
          <p1>Нет прошедших записей</p1>
          <p2>У Вас еще не было завершенных записей</p2>        
        </div>
        
        <div v-else class="filled-content">
          <!-- шаблон записи -->
          <div class="appointment-card">
            <div class="card-header">
              <img src="../assets/emptyAvatar.svg" alt="Нет фото" class="avatar"/>
              <div class="employee-info">
                <div class="employee-name">Имя сотрудника</div>
                <div class="employee-specialty">Специальность</div>
              </div>
              <div class="date-time">
                <div class="date">1 октября</div>
                <div class="time">11:00</div>
              </div>
            </div>
            <div class="service-info">
              <div class="service-name-small">Услуга</div>
              <div class="service-name-small">Количество</div>
              <div class="service-name-small">Стоимость</div>
              <div class="service-name">Название услуги</div>
              <div class="quantity">1</div>
              <div class="price">1000 ₽</div>
            </div>
            <div class="card-status">
              <div class="status-info">
                <img src="../assets/checkmarkIcon.svg" alt="не оплачено" class="status-icon"/>
                <div class="status-badge-reason">
                  <span class="status-badge">Оплачено</span>
                  <div class="status-reason">Визит прошел успешно</div>
                </div>
              </div>
              <div class="total-price">
                1000  ₽
              </div>
            </div>
          </div>
          <!-- шаблон2 записи -->
          <div class="appointment-card">
            <div class="card-header">
              <img src="../assets/emptyAvatar.svg" alt="Нет фото" class="avatar"/>
              <div class="employee-info">
                <div class="employee-name">Имя сотрудника</div>
                <div class="employee-specialty">Специальность</div>
              </div>
              <div class="date-time">
                <div class="date">1 октября</div>
                <div class="time">11:00</div>
              </div>
            </div>
            <div class="service-info">
              <div class="service-name-small">Услуга</div>
              <div class="service-name-small">Количество</div>
              <div class="service-name-small">Стоимость</div>
              <div class="service-name">Название услуги</div>
              <div class="quantity">2</div>
              <div class="price">1000 ₽</div>
            </div>
            <div class="card-status">
              <div class="status-info">
                <img src="../assets/checkmarkIcon.svg" alt="Оплачено" class="status-icon"/>
                <div class="status-badge-reason">
                  <span class="status-badge">Оплачено</span>
                  <div class="status-reason">Визит прошел успешно</div>
                </div>
              </div>
              <div class="total-price">
                2000  ₽
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewView',
  data() {
    return {
      activeTab: 'current',
      hasRecords: true
    }
  }
}
</script>

<style scoped>
.review-view {
  padding: 1rem clamp(1rem, 10vw, 15rem);
  width: 100%;
  background-color: var(--light-color);
}

.tabs-container {
  display: flex;
  justify-content: center;
  box-shadow: 0 0.3px  #6f6f6f97;
  border-radius: 10px;
  margin-bottom: 1rem;
}
.tab-btn1,
.tab-btn2 {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background-color: white;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 500;
  color: #6f6f6f97;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tab-btn1 {
  border-radius: 10px 0px 0px 10px;
}
.tab-btn2 {
  border-radius: 0px 10px 10px 0px;
}
.tab-btn1.active,
.tab-btn2.active {
  background: #ddd;
  color: var(--color-dark);
}
.tab-btn1:hover:not(.active),
.tab-btn2:hover:not(.active) {
  background: #f1f1f1;
}
.filled-content {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.appointment-card {
  border-radius: 10px;
  box-shadow: 0 0.3px  #6f6f6f97;
  padding: clamp(0.6rem, 1.2vw, 1.5rem);
  background-color: white;
}
.card-header {
  display: flex;
  gap: clamp(0.2rem, 0.7vw, 1rem);
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}
.employee-info {
  flex: 1;
}
.employee-name {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
.employee-specialty {
  color: var(--color-dark);
  font-size: 0.875rem;
}
.date-time {
  text-align: right;
}
.date {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
.time {
  color: var(--color-dark);
  font-size: 1rem;
}

.service-info {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: clamp(0.1rem, 0.3vw, 0.5rem);
  margin-bottom: 0.5rem;
  padding: clamp(0.1rem, 2vw, 0.3rem) 0;
  border-bottom: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
}
.service-name-small:nth-child(3), .price {
  text-align: right;
}
.service-name-small {
  font-weight: 300;
  color: #a9a9a9;
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
}
.quantity, .service-name, .price  {
  color: var(--color-dark);
  font-size: 1rem;
}
.service-name, .price {
  font-weight: 600;
}

.card-status {
  display: flex;
  gap: clamp(0.2rem, 0.7vw, 1rem);
  justify-content: space-between;
  padding: clamp(0.2rem, 2vw, 0.5rem) 0 0 clamp(0.2rem, 1.5vw, 0.5rem);
  align-items: flex-start;
  margin-bottom: 0.5rem;
}
.status-info{
  display: flex;
  gap: clamp(0.2rem, 0.7vw, 1rem);
  align-items: flex-start;
}
.status-icon{
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.status-badge-reason{
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.status-badge {
  padding: 0;
  font-size: 1rem;
  font-weight: 500;
}
.status-reason {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.3;
  font-style: italic;
}
.total-price {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-dark);
  white-space: nowrap;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
@media (max-width: 900px) {
  .review-view {
  padding: 1rem clamp(1rem, 5vw, 15rem) 1rem  clamp(2rem, 14vw, 15rem);
  width: 100%;
  }
}
</style>