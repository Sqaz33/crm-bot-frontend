<template>
  <div class="profile-layout">
    <!-- Основной контент -->
    <main class="main-content">
      <!-- Форма профиля -->
      <div class="profile-container">
        <div class="profile-form">
          <!-- Поле Имя -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">Имя</label>
            </div>
            <div class="input-wrapper">
              <input
                  v-model="profileData.firstName"
                  type="text"
                  class="form-input"
                  placeholder="Имя"
              />
            </div>
          </div>

          <!-- Поле Фамилия -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">Фамилия</label>
            </div>
            <div class="input-wrapper">
              <input
                  v-model="profileData.lastName"
                  type="text"
                  class="form-input"
                  placeholder="Фамилия"
              />
            </div>
          </div>

          <!-- Поле Отчество -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">Отчество</label>
            </div>
            <div class="input-wrapper">
              <input
                  v-model="profileData.middleName"
                  type="text"
                  class="form-input"
                  placeholder="Отчество"
              />
            </div>
          </div>

          <!-- Поле Телефон -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">Телефон</label>
            </div>
            <div class="input-wrapper">
              <input
                  v-model="profileData.phone"
                  type="tel"
                  class="form-input"
                  placeholder="Телефон"
              />
            </div>
          </div>

          <!-- Поле E-mail -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">E-mail</label>
            </div>
            <div class="input-wrapper">
              <input
                  v-model="profileData.email"
                  type="email"
                  class="form-input"
                  placeholder="example@mail.com"
              />
            </div>
          </div>
        </div>

        <!-- Кнопка сохранения -->
        <div class="save-section">
          <button
              class="save-button"
              @click="handleSave"
              :disabled="!isFormValid"
          >
            Сохранить
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Данные профиля
const profileData = ref({
  firstName: 'Иван',
  lastName: 'Иванов',
  middleName: 'Иванович',
  phone: '123456789',
  email: 'example@mail.com'
})

// Валидация формы
const isFormValid = computed(() => {
  return profileData.value.firstName.trim() !== '' &&
      profileData.value.lastName.trim() !== '' &&
      profileData.value.phone.trim() !== '' &&
      profileData.value.email.trim() !== ''
})

// Обработка сохранения
const handleSave = async () => {
  try {
    console.log('Сохранение данных профиля:', profileData.value)
    // Здесь будет API вызов для сохранения данных
    // await api.post('/profile', profileData.value)

    // Показать уведомление об успешном сохранении
    alert('Данные профиля успешно сохранены!')
  } catch (error) {
    console.error('Ошибка при сохранении профиля:', error)
    alert('Ошибка при сохранении данных')
  }
}

// Загрузка данных при монтировании
onMounted(async () => {
  try {
    // Здесь будет загрузка данных профиля из API
    // const { data } = await api.get('/profile')
    // profileData.value = data
  } catch (error) {
    console.error('Ошибка при загрузке профиля:', error)
  }
})
</script>

<style scoped>
.profile-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--Color-Grey-Grey-100, #f6f5f6);
  font-family: 'Geometria', sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

/* Контейнер формы */
.profile-container {
  width: 1140px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-form {
  width: 100%;
  height: 729px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0;
}

/* Поля формы */
.form-field {
  width: 100%;
  height: 160px;
  padding: 14px 0;
  background: transparent;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  overflow: hidden;
}

.field-header {
  width: 176px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  width: 176px;
  color: var(--Color-Basic-Black, #454558);
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
  text-align: left;
}

.input-wrapper {
  width: 100%;
  height: 64px;
  padding: 28px 36px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--Color-Grey-Grey-200, #E5E7EB);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
}

.form-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--Color-Basic-Black, #454558);
  font-size: 24px;
  font-family: 'Geometria', sans-serif;
  font-weight: 400;
  line-height: 28px;
}

.form-input::placeholder {
  color: #9CA3AF;
}

/* Кнопка сохранения */
.save-section {
  width: 384px;
  height: 56px;
  background: var(--Color-Brand-Brand-500, #666FE8);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.save-button {
  border: none;
  background: transparent;
  color: white;
  font-size: 20px;
  font-family: 'Geometria', sans-serif;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.save-button:hover:not(:disabled) {
  opacity: 0.9;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .profile-container {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .profile-form {
    height: auto;
    padding: 20px;
  }

  .form-field {
    height: auto;
    padding: 10px 0;
  }

  .field-label {
    font-size: 18px;
    line-height: 22px;
  }

  .input-wrapper {
    height: 50px;
    padding: 15px 20px;
  }

  .form-input {
    font-size: 18px;
    line-height: 22px;
  }

  .save-section {
    width: 100%;
    max-width: 300px;
    height: 50px;
  }

  .save-button {
    font-size: 18px;
    line-height: 22px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    width: 100%;
    padding: 0 15px;
  }

  .profile-form {
    padding: 15px;
  }

  .input-wrapper {
    padding: 12px 16px;
  }

  .form-input {
    font-size: 16px;
    line-height: 20px;
  }
}
</style>