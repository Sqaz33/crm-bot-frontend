<template>
  <div class="profile-view">
    <h1 class="page-title">Профиль</h1>
    <form @submit.prevent="saveProfile" class="profile-form">
      <div class="field">
        <label for="firstName">Имя</label>
        <input id="firstName" v-model="form.firstName" disabled />
      </div>
      <div class="field">
        <label for="lastName">Фамилия</label>
        <input id="lastName" v-model="form.lastName" disabled />
      </div>
      <div class="field">
        <label for="middleName">Отчество</label>
        <input id="middleName" v-model="form.middleName" placeholder="Не указано" />
      </div>
      <div class="field">
        <label for="phone">Телефон</label>
        <input id="phone" v-model="form.phone" placeholder="Не указан" />
      </div>
      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" v-model="form.email" placeholder="Не указан" />
      </div>
      <button type="submit" class="btn-save">Сохранить</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { parseTelegramLaunchData } from '../utils/telegram'

// Ключ для хранения доп. данных в localStorage
const PROFILE_KEY = 'profile_data'
const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

function getInitUser() {
  const { tgData } = parseTelegramLaunchData()
  return tgData.user || {}
}

onMounted(() => {
  const user = getInitUser()
  form.firstName = user.first_name || ''
  form.lastName = user.last_name || ''
  // Загружаем сохранённые доп. поля из localStorage
  const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
  form.middleName = saved.middleName || ''
  form.phone      = saved.phone      || ''
  form.email      = saved.email      || ''
})

function saveProfile() {
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      middleName: form.middleName,
      phone: form.phone,
      email: form.email
    })
  )
  alert('Данные сохранены')
}
</script>

<style scoped>
.profile-view {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
}
.page-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}
.profile-form .field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.profile-form label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.profile-form input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background: #f5f7fa;
}
.profile-form input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-save {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.btn-save:hover {
  background: #0056b3;
}
</style>
