<template>
  <TermsBottomSheet v-model="open">
    <template #title>
      УСЛОВИЯ ИСПОЛЬЗОВАНИЯ СЕРВИСА «ОНЛАЙН-ЗАПИСЬ»
    </template>

    <p>
      Полные условия использования приложения и обработки ваших данных изложены по следующим ссылкам:
    </p>

    <ul class="mt-3 list-disc pl-5 space-y-2">
      <li>
        Политика конфиденциальности:
        <a
          class="underline break-all"
          href="https://zabot.org/politics"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://zabot.org/politics
        </a>
      </li>

      <li>
        Пользовательское соглашение:
        <a
          class="underline break-all"
          href="https://zabot.org/oferta"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://zabot.org/oferta
        </a>
      </li>
    </ul>

    <template #footer>
      <button
        class="w-full h-12 rounded-xl bg-gray-900 text-white font-medium hover:opacity-90 transition"
        @click="open = false"
      >
        Понятно
      </button>
    </template>
  </TermsBottomSheet>
</template>

<script setup>
import { computed } from 'vue'
import TermsBottomSheet from '@/components/lowerModal.vue' // твой bottom-sheet

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
</script>
