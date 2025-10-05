<template>
  <div class="base">
    <div class="review-view">
      
      <div class="tabs-container">
        <button 
          class="tab-button1" 
          :class="{ active: activeTab === 'current' }"
          @click="activeTab = 'current'">
          Текущие
        </button>
        <button 
          class="tab-button2" 
          :class="{ active: activeTab === 'past' }"
          @click="activeTab = 'past'">
          Прошедшие
        </button>
      </div>
      
      <main v-if="activeTab === 'current'" class="empty-content">
        <img src="../assets/emptyRecord.svg" alt="Нет записей" class="empty-icon" />
        <p1>Увы, ничего не запланировано</p1>
        <p2>У Вас ни одной активной записи</p2>        
      </main>

      <main v-if="activeTab === 'past'" class="empty-content">
        <img src="../assets/emptyRecordPast.svg" alt="Нет записей" class="empty-icon" />
        <p1>Нет прошедших записей</p1>
        <p2>У Вас еще не было завершенных записей</p2>        
      </main>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ReviewView',
  data() {
    return {
      activeTab: 'current'
    }
  }
}
</script>

<style scoped>
.review-view {
  padding: 1rem;
  width: 100%;
}

.tabs-container {
  display: flex;
  background-color: white;
  box-shadow: 0 0.3px  #6f6f6f97;
  border-radius: 10px;
  margin:0 clamp(1rem, 7rem, 15rem) ;
}

.tab-button1,
.tab-button2 {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background-color: white;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-dark);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button1 {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.tab-button2 {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.tab-button1.active,
.tab-button2.active {
  background: #ddd;
}

.tab-button1:hover:not(.active),
.tab-button2:hover:not(.active) {
  background: #f1f1f1;
}

</style>