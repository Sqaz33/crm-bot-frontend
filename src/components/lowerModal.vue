<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[1000] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      @keydown.esc="close"
    >
      <!-- overlay -->
      <div
        class="absolute inset-0 bg-black/20"
        @click="close"
      />

      <!-- sheet -->
      <Transition
        enter-active-class="transition transform ease-out duration-300"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition transform ease-in duration-200"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div
          v-if="modelValue"
          class="relative z-[1] w-full max-w-[540px] rounded-t-3xl bg-white shadow-[0_2px_16px_rgba(50,54,73,0.12)] max-h-[95vh] flex flex-col"
        >
          <!-- header -->
          <div class="flex items-center justify-between gap-3 border-b border-gray-200 px-6 pt-5 pb-3">
            <div class="text-[15px] font-semibold leading-snug text-gray-900">
              <slot name="title">Заголовок</slot>
            </div>

            <button
              type="button"
              class="h-10 w-10 grid place-items-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition"
              aria-label="Закрыть"
              @click="close"
            >
              <span class="text-3xl leading-none text-gray-600">&times;</span>
            </button>
          </div>

          <!-- body -->
          <div class="flex-1 overflow-y-auto px-6 py-4 text-[15px] leading-relaxed text-gray-800 break-words [overflow-wrap:anywhere]">
            <slot />
          </div>

          <!-- footer (опционально) -->
          <div v-if="$slots.footer" class="border-t border-gray-200 px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>
