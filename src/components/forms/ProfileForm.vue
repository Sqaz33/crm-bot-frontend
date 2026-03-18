<template>
  <div class="w-full max-w-[540px] mx-auto" @click="handleOutsideClick">
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-1">
      <Input
        id="firstName"
        v-model="modelValue.firstName"
        label="Имя"
        :required="true"
      />
      <Input
        id="lastName"
        v-model="modelValue.lastName"
        label="Фамилия"
        :required="true"
      />
      <Input
        id="middleName"
        v-model="modelValue.middleName"
        label="Отчество"
      />
      <Input
        id="phone"
        v-model="modelValue.phone"
        label="Телефон"
        readonly
        :lock-icon="true"
      />
      <Input
        id="email"
        v-model="modelValue.email"
        label="E-mail"
        type="email"
        :required="true"
      />

      <button
        type="submit"
        :disabled="!isFormValid || saving"
        class="b_button"
      >
        {{ saving ? 'Сохранение…' : 'Сохранить' }}
      </button>
    </form>

    <ToastNotification
      v-model:open="showToast"
      text="Данные сохранены"
      type="success"
      :duration="3500"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Input from '../ui/Input.vue'
import ToastNotification from '../ui/ToastNotification.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const showToast = ref(false)

const isFormValid = computed(() => {
  const { firstName, lastName } = props.modelValue
  return firstName?.trim().length > 0 && lastName?.trim().length > 0
})

function handleSubmit() {
  if (isFormValid.value) {
    emit('save')
  }
}

function handleOutsideClick(event) {
  // Проверяем, что клик был не по кнопке submit и не по полям ввода
  const target = event.target
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
  const isSubmitButton = target.type === 'submit'
  const isLabel = target.tagName === 'LABEL'
  
  // Если клик был вне полей ввода и кнопки отправки, убираем фокус со всех input
  if (!isInput && !isSubmitButton && !isLabel) {
    const inputs = document.querySelectorAll('input')
    inputs.forEach(input => input.blur())
  }
}

function triggerToast() {
  showToast.value = false
  setTimeout(() => (showToast.value = true), 0)
}

// Метод для вызова из родителя
defineExpose({
  triggerToast
})
</script>