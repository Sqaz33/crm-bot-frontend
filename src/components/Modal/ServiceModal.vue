<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-end justify-center"
        role="dialog"
        aria-modal="true"
        @click.self="$emit('close')"
      >
        <!-- overlay -->
        <div
          class="absolute inset-0 bg-black/20"
          @click="$emit('close')"
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
            v-if="visible"
            class="relative z-[1] w-full max-w-[540px] rounded-t-3xl bg-white shadow-lg max-h-[95vh] flex flex-col"
          >
            <!-- header -->
            <div class="px-6 pt-5 pb-4">
              <!-- Кнопка закрытия -->
              <button
                type="button"
                class="absolute right-3 top-3 h-10 w-10 grid place-items-center rounded-full hover:bg-neutral-100 active:bg-neutral-200 transition"
                aria-label="Закрыть"
                @click="$emit('close')"
              >
              <span class="text-3xl leading-none text-neutral-600">&times;</span>
              </button>

              <!-- Заголовок "Описание" по центру -->
              <h2 class="text-center text-sm font-semibold text-neutral-900 mb-1">
                Описание
              </h2>

              <!-- Название услуги по центру -->
              <h3 class="text-center text-lg font-semibold text-neutral-900 truncate px-10">
                {{ service?.name || 'Услуга' }}
              </h3>
            </div>

            <!-- Серая черта -->
            <div class="border-t border-neutral-200"></div>

            <!-- body -->
            <div class="flex-1 overflow-y-auto px-6 py-4">
              <!-- Надпись "ОБ УСЛУГЕ" слева серая -->
              <h4 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Об услуге
              </h4>

              <!-- Описание -->
              <p class="text-base leading-relaxed text-neutral-800 break-words whitespace-pre-wrap">
                {{ service?.description || 'Описание отсутствует' }}
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  service: {
    type: Object,
    default: null
  }
})

defineEmits(['close'])
</script>