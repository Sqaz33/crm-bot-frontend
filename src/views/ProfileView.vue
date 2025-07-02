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
import { parseTelegramLaunchData } from '../utils/telegram'

const COOKIE_KEY = 'profile_data'

// Утилиты для работы с JSON-кукой
function readProfileCookie() {
  const match = document.cookie.match(new RegExp('(^| )' + COOKIE_KEY + '=([^;]+)'))
  if (!match) return {}
  try {
    return JSON.parse(decodeURIComponent(match[2]))
  } catch {
    return {}
  }
}

function writeProfileCookie(obj) {
  const json = encodeURIComponent(JSON.stringify(obj))
  document.cookie =
    `${COOKIE_KEY}=${json}` +
    `; path=/; max-age=${365 * 24 * 60 * 60}` +
    `; Secure; SameSite=None`
}

// Форма с пятью полями
const form = reactive({
  firstName:  '',
  lastName:   '',
  middleName: '',
  phone:      '',
  email:      ''
})

onMounted(() => {
  // 1. Сначала пытаемся загрузить всё из cookie
  const saved = readProfileCookie()

  // 2. Парсим tgWebAppData.user
  const { tgData } = parseTelegramLaunchData()
  const user = tgData.user || {}

  // 3. Заполняем каждое поле: из cookie, а если нет — из Telegram
  form.firstName  = saved.firstName  ?? user.first_name  ?? ''
  form.lastName   = saved.lastName   ?? user.last_name   ?? ''
  form.middleName = saved.middleName ?? ''
  form.phone      = saved.phone      ?? ''
  form.email      = saved.email      ?? ''
})

function saveProfile() {
  // Записываем ВСЕ поля в cookie
  writeProfileCookie({
    firstName:  form.firstName,
    lastName:   form.lastName,
    middleName: form.middleName,
    phone:      form.phone,
    email:      form.email
  })
  console.log('profile_data cookie:', document.cookie)
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
.init-data {
  background: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}
.init-json {
  max-height: 200px;
  overflow: auto;
  background: #fff;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
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
