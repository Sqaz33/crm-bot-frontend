<template>
    <div class="booking-view">
      <ul class="steps-list">
        <li class="step-item" @click="goTo('choicestaff')">
          <div class="checkbox"></div>
          <div class="label">Сотрудник</div>
          <div class="arrow">›</div>
        </li>
        <li class="step-item" @click="goTo('datetime')">
          <div class="checkbox"></div>
          <div class="label">Дата и время</div>
          <div class="arrow">›</div>
        </li>
        <li class="step-item" @click="goTo('services')">
          <div class="checkbox"></div>
          <div class="label">Услуги</div>
          <div class="arrow">›</div>
        </li>
        <li class="step-item back-item" @click="goBack">
          <div class="arrow-back">‹</div>
          <div class="label">Назад</div>
        </li>
      </ul>
  
      <button class="btn-submit" @click="submitBooking">
        Оформить запись
      </button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  function goTo(stepName) {
    router.push({ name: stepName })
  }
  
  function goBack() {
    router.back()
  }
  
  function submitBooking() {
    console.log('Booking submitted')
  }
  </script>
  
  <style scoped>
  .booking-view {
    max-width: 400px;
    margin: 2rem auto;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .steps-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .step-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #ececec;
    cursor: pointer;
  }
  
  .step-item:last-of-type {
    border-bottom: none;
  }
  
  .checkbox {
    width: 20px;
    height: 20px;
    background: #ececec;
    border-radius: 4px;
    flex-shrink: 0;
  }
  
  .arrow, .arrow-back {
    margin-left: auto;
    color: #999;
    font-size: 1.2rem;
  }
  
  .label {
    margin: 0 1rem;
    flex: 1;
  }
  
  .back-item .checkbox {
    display: none;
  }
  
  .back-item .arrow-back {
    display: block;
  }
  
  .btn-submit {
    display: block;
    width: calc(100% - 2rem);
    margin: 1.5rem auto;
    padding: 0.75rem;
    background: #007bff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .btn-submit:hover {
    background: #0056b3;
  }
  </style>
  