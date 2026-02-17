<template>
  <div class="flex flex-col gap-6">
    <!-- 1) ВСТАВЛЯЕМ ТВОЙ МОДУЛЬ -->
    <ProfileForm
      ref="profileFormRef"
      v-model="profile"
      :saving="saving"
      @save="saveProfile"
    />

    <!-- 2) ТВОИ КНОПКИ -->
    <div class="flex flex-col items-center gap-3">
      <button class="tc_button tc_button--ok" @click="moveVisit">
        Перенести запись
      </button>

      <button class="tc_button tc_button--cancel" @click="cancelVisit">
        Отменить запись
      </button>
    </div>

    <div class="flex justify-center mt-6">
      <button class="r_button" :disabled="!selectedTime" @click="bookTime">
        Занять
      </button>
    </div>

    <br />

    <div class="flex content-center gap-3 w-full max-w-[375px]">
      <button class="s_button s_button--yes flex-1" @click="confirmCancel">
        Да, отменить
      </button>
      <button class="s_button s_button--no flex-1" @click="closeCancel">
        Отмена
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProfileForm from '../components/forms/ProfileForm.vue' // <-- путь поправь под свой проект

const profileFormRef = ref(null)

const profile = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  email: ''
})

const saving = ref(false)
const selectedTime = ref(null)

async function saveProfile() {
  saving.value = true
  try {
    // await api.saveProfile(profile.value)

    // Вызов метода, который ты expose-нул
    profileFormRef.value?.triggerToast()
  } finally {
    saving.value = false
  }
}

function moveVisit() {
  // ...
  // profileFormRef.value?.triggerToast() // если надо тост и отсюда
}

function cancelVisit() {
  // ...
}

function bookTime() {
  // ...
}

function confirmCancel() {}
function closeCancel() {}
</script>
