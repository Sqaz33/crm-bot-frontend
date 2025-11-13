<template>
  <div class="profile-layout">
    <main class="main-content">
      <div class="profile-container">
        <div class="profile-form">
          <!-- Имя -->
          <div class="form-field">
  <div class="field-header">
    <label class="field-label">Имя</label>
  </div>
  <div class="input-wrapper">
    <input 
      v-model="profileData.firstName" 
      @input="profileData.firstName = $event.target.value.replace(/[^а-яА-ЯёЁ]/g, '')" 
      type="text" 
      class="form-input" 
      placeholder="Имя" 
    />
  </div>
</div>

<!-- Фамилия -->
<div class="form-field">
  <div class="field-header">
    <label class="field-label">Фамилия</label>
  </div>
  <div class="input-wrapper">
    <input 
      v-model="profileData.lastName" 
      @input="profileData.lastName = $event.target.value.replace(/[^а-яА-ЯёЁ]/g, '')" 
      type="text" 
      class="form-input" 
      placeholder="Фамилия" 
    />
  </div>
</div>

<!-- Отчество -->
<div class="form-field">
  <div class="field-header">
    <label class="field-label">Отчество</label>
  </div>
  <div class="input-wrapper">
    <input 
      v-model="profileData.middleName" 
      @input="profileData.middleName = $event.target.value.replace(/[^а-яА-ЯёЁ]/g, '')" 
      type="text" 
      class="form-input" 
      placeholder="Отчество" 
    />
  </div>
</div>

          <!-- Телефон (readOnly) -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">Телефон</label>
            </div>
            <div class="input-wrapper">
              <input v-model="profileData.phone" type="tel" class="form-input" placeholder="Телефон" readonly />
            </div>
          </div>

          <!-- E-mail (readOnly) -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">E-mail</label>
            </div>
            <div class="input-wrapper">
              <input v-model="profileData.email" type="email" class="form-input" placeholder="example@mail.com" readonly />
            </div>
          </div>
        </div>

        <!-- Кнопка сохранения -->
        <div class="save-section">
          <button class="save-button"
                  @click="handleSave"
                  :disabled="!isFormValid || saving || loading">
            {{ saving ? 'Сохранение…' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api' 

const loading = ref(false)
const saving  = ref(false)

const profileData = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})


function splitFullName(full) {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '', middleName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '', middleName: '' }
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1], middleName: '' }
  return { firstName: parts[0], lastName: parts[1], middleName: parts.slice(2).join(' ') }
}
function joinFullName({ firstName, lastName, middleName }) {
  return [firstName, lastName, middleName].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

const isFormValid = computed(() => profileData.value.firstName.trim().length > 0)

async function loadMe() {
  loading.value = true
  try {
    const { data } = await api.get('/auth/me', {
      headers: { Accept: 'application/json' },
      withCredentials: true
    })
    const fio = splitFullName(data?.name)
    profileData.value = {
      ...fio,
      phone: data?.phone ?? '',
      email: data?.email ?? ''
    }
    console.debug('[GET /auth/me] data:', data)
  } catch (e) {
    console.error('[GET /auth/me] error:', e?.response ?? e)
    
  } finally {
    loading.value = false
  }
}

async function updateMeName(payload) {
  const cfg = { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
  try {              
    return await api.patch('/auth/me', payload, cfg)
  } catch (e1) {
    const s = e1?.response?.status
    if (s !== 404 && s !== 405 && s !== 400) throw e1
    try {              
      return await api.put('/auth/me', payload, cfg)
    } catch (e2) {
      const s2 = e2?.response?.status
      if (s2 !== 404 && s2 !== 405) throw e2
      return await api.post('/auth/me', payload, cfg)
    }
  }
}

async function handleSave() {
  if (!isFormValid.value) return
  saving.value = true
  try {
    const payload = { name: joinFullName(profileData.value) }
    console.debug('[SAVE /auth/me] payload:', payload)
    await updateMeName(payload)
    await loadMe()
    console.error('ФИО обновлено')
  } catch (e) {
    console.error('[SAVE /auth/me] error:', e?.response ?? e)
    const code = e?.response?.status
    if (code === 401) {
      console.error('Сессия истекла. Войдите заново.')
    } else if (code === 415) {
      console.error('Сервер не принял формат данных (415). Проверьте Content-Type.')
    } else {
      console.error('Не удалось сохранить. Подробности в консоли.')
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadMe)
</script>


<style scoped>

.profile-layout {
  --sidebar-mobile: 64px;
  --gutter-mobile: 20px;

  --sidebar-desktop: 0px;

  display: flex;
  min-height: 100vh;
  background-color: var(--Color-Grey-Grey-100, #f6f5f6);
  font-family: 'Geometria', sans-serif;

  padding-left: var(--sidebar-desktop);
}
.form-input[readonly] {
  color: #6b7280;
  cursor: default;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  width: 100%;
}

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

.save-button:hover:not(:disabled) { opacity: 0.9; }
.save-button:disabled { opacity: 0.5; cursor: not-allowed; }


@media (max-width: 1200px) {
  .profile-container { width: 95%; }
}


@media (min-width: 431px) and (max-width: 768px) {
  .profile-layout {
    --gutter-tablet: 24px;
    padding-left: calc(var(--sidebar-mobile) + var(--gutter-tablet));
    padding-right: var(--gutter-tablet);
  }

  .profile-form {
    height: auto;
    padding: 20px 0;
  }

  .form-field {
    height: auto;
    padding: 10px 0;
  }

  .field-label { font-size: 18px; line-height: 22px; }
  .input-wrapper { height: 56px; padding: 16px 20px; }
  .form-input { font-size: 18px; line-height: 22px; }

  .save-section {
    width: 100%;
    max-width: 360px;
    height: 52px;
  }

  .save-button { font-size: 18px; line-height: 22px; }
}


@media (max-width: 430px) {
  
  .profile-layout {
    padding-left: calc(var(--sidebar-mobile) + var(--gutter-mobile));
    padding-right: var(--gutter-mobile);
  }
 .main-content { padding: 8px 0 72px; }

  .profile-container {
    width: 100%;
    max-width: 100%;
    padding: 0; 
  }

  .profile-form {
    height: auto;
    padding: 16px 0;
    align-items: stretch;
  }

  .form-field {
    height: auto;
    padding: 10px 0;
  }

  .field-label {
    font-size: 16px;
    line-height: 20px;
    width: auto;
  }

  .input-wrapper {
    height: 52px;
    padding: 14px 16px;
  }

  .form-input {
    font-size: 18px;
    line-height: 22px;
  }

  .save-section {
    width: 100%;
    max-width: 100%;
    height: 52px;
    border-radius: 12px;
  }

  .save-button {
    font-size: 18px;
    line-height: 22px;
  }
}

</style>