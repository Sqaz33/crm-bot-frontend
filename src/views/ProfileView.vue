<template>
  <div class="profile-view">
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
import { useAuthStore } from '../stores/auth'
import api from '../api'

const auth = useAuthStore()
const form = reactive({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

onMounted(() => {
  // Берём инфу из Telegram user в хранилище
  const user = auth.user || {}
  form.firstName = user.first_name || ''
  form.lastName = user.last_name || ''
  // отчество может храниться в user.middle_name
  form.middleName = user.middle_name || ''
  // Дополнительные поля из профиля
  form.phone = auth.profile?.phone || ''
  form.email = auth.profile?.email || ''
})

async function saveProfile() {
  try {
    // Отправляем на сервер
    await api.post(`/users/${auth.user.id}`, {
      first_name: form.firstName,
      last_name: form.lastName,
      middle_name: form.middleName,
      phone: form.phone,
      email: form.email
    })
    // Обновляем локально
    auth.setProfile({ phone: form.phone, email: form.email })
    alert('Профиль сохранён')
  } catch (e) {
    console.error('Ошибка сохранения профиля:', e)
    alert('Не удалось сохранить профиль')
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
  font-size: 1rem;
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
  font-size: 1rem;
  cursor: pointer;
}
.btn-save:hover {
  background: #0056b3;
}
</style>
