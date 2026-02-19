<!-- 
<ToastNotification v-model:open="showToast" text="Данные сохранены" type="success" />
<ToastNotification v-model:open="showToast" text="Проверь поля" type="warn" />
<ToastNotification v-model:open="showToast" text="Ошибка" type="error" /> -->

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="open"
      class="fixed left-1/2 top-5 z-[10000] -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <div
        class="flex items-center gap-2 rounded-2xl px-4 py-3 text-white shadow-card"
        :class="bgClass"
      >
        <span class="text-sm font-medium">
          <slot>{{ text }}</slot>
        </span>

        <button
          v-if="closable"
          type="button"
          class="ml-1 rounded-xl px-2 py-1 text-white/90 hover:text-white"
          @click="close"
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from "vue"

const props = defineProps({
  open: { type: Boolean, default: false },
  text: { type: String, default: "Готово" },

  // строго 3 состояния
  type: { type: String, default: "success" }, // success | warn | error

  duration: { type: Number, default: 3000 }, // 0 = без автозакрытия
  closable: { type: Boolean, default: false },
})

const emit = defineEmits(["update:open"])

let timer = null

const bgClass = computed(() => {
  if (props.type === "warn") return "bg-orange-500"
  if (props.type === "error") return "bg-red-700"
  return "bg-green-700"
})

function close() {
  emit("update:open", false)
}

watch(
  () => props.open,
  (v) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (v && props.duration > 0) {
      timer = setTimeout(() => close(), props.duration)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>
