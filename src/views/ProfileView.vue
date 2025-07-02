<template>
  <div class="profile-view">
    <h1 class="page-title">Профиль</h1>
    <form @submit.prevent="saveProfile" class="profile-form">
      <div class="field">
        <label for="firstName">Имя</label>
        <input id="firstName" v-model="form.firstName" />
      </div>
      <div class="field">
        <label for="lastName">Фамилия</label>
        <input id="lastName" v-model="form.lastName" />
      </div>
      <div class="field">
        <label for="middleName">Отчество</label>
        <input id="middleName" v-model="form.middleName" />
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
import api from '../api'

// утилита для чтения куки
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

onMounted(() => {
  // Парсим JSON из куки account1
  const raw = getCookie('account1')
  if (raw) {
    try {
      const user = JSON.parse(raw)
      form.firstName   = user.firstName || ''
      form.lastName    = user.lastName  || ''
      form.middleName  = user.middleName|| ''
      form.phone       = user.phone     || ''
      form.email       = user.email     || ''
    } catch {
      console.error('Не удалось распарсить account1 куку')
    }
  }
})

async function saveProfile() {
  try {
    // пример отправки, если потребуется
    await api.post(`/users/${form.firstName}`, {
      first_name: form.firstName,
      last_name:  form.lastName,
      middle_name:form.middleName,
      phone:      form.phone,
      email:      form.email
    })
    alert('Профиль сохранён')
  } catch (e) {
    console.error(e)
    alert('Ошибка сохранения')
  }
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
  background: #f5f7fa;
}
.btn-save {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
