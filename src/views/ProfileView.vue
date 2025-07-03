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

const STORAGE_KEY = 'profile_data'
const COOKIE_KEY  = 'profile_data'

// Утилита: читаем JSON из localStorage
function readProfileStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

// Утилита: записываем JSON в localStorage
function writeProfileStorage(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

// (опционально) — кука, если нужна
function writeProfileCookie(obj) {
  const json = encodeURIComponent(JSON.stringify(obj))
  document.cookie =
    `${COOKIE_KEY}=${json}` +
    `; path=/; max-age=${365*24*60*60}`
}

// Форма
const form = reactive({
  firstName:  '',
  lastName:   '',
  middleName: '',
  phone:      '',
  email:      ''
})

onMounted(() => {
  // Сначала пробуем из localStorage
  const saved = readProfileStorage()
  console.log('Loaded from localStorage →', saved)

  // Заполняем форму
  form.firstName  = saved.firstName  ?? ''
  form.lastName   = saved.lastName   ?? ''
  form.middleName = saved.middleName ?? ''
  form.phone      = saved.phone      ?? ''
  form.email      = saved.email      ?? ''
})

function saveProfile() {
  const payload = {
    firstName:  form.firstName,
    lastName:   form.lastName,
    middleName: form.middleName,
    phone:      form.phone,
    email:      form.email
  }

  writeProfileStorage(payload)
  console.log('Saved to localStorage →', payload)

 
  writeProfileCookie(payload)
  console.log('Now document.cookie →', document.cookie)
}
</script>

<style scoped>
.profile-view {
  max-width: 600px;
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
.btn-save:hover {
  background: #0056b3;
}
</style>
 