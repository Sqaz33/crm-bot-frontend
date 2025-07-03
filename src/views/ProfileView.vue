<template>
  <div class="profile-page">
    <SidebarMenu :items="menuItems" class="sidebar" />

    <div class="profile-form-container">
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
          <input id="phone" v-model="form.phone" />
        </div>
        <div class="field">
          <label for="email">E-mail</label>
          <input id="email" v-model="form.email" />
        </div>
        <button type="submit" class="btn-save">Сохранить</button>
      </form>
    </div>
  </div>
</template>


<script setup>
import { reactive, onMounted } from 'vue'
import SidebarMenu from '../components/Sidebar.vue'

// Sidebar menu items
const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/about-company' }
]
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
.profile-page {
  display: flex;
  min-height: 100vh;
  background-color: #f6f9fc;
}

/* Sidebar */
.sidebar {
  width: 200px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
}

/* Контейнер формы */
.profile-form-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* Форма */
.profile-form {
  width: 100%;
  max-width: 500px;
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
}

/* Поля */
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.field label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.field input {
  padding: 0.75rem;
  border: none;
  background-color: #e1e3e8;
  border-radius: 6px;
  font-size: 1rem;
}

/* Кнопка */
.btn-save {
  margin-top: 1rem;
  width: 100%;
  padding: 0.75rem;
  background-color: #1877f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.btn-save:hover {
  background-color: #155ecb;
}

</style>
 