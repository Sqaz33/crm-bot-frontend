<template>
  <Teleport to="body">
      <div
        v-if="visible"
        v-bind="$attrs"
        role="dialog"
        aria-modal="true"
        class="fixed inset-0 z-[9999]
              flex items-start justify-center
              w-[100dvw] h-[100dvh]
              bg-black/50 overscroll-contain
              px-4 pt-[43dvh] pb-4
              md:items-center md:pt-4"
              @click.self="emit('close')"
              >

      <div
        ref="content"
        tabindex="-1"
        @keydown.esc.stop.prevent="emit('close')"
        class="relative outline-none box-border
               bg-white rounded-2xl shadow-sheet
               w-full max-w-[520px]
               max-h-[calc(100dvh-32px)]
               overflow-auto [-webkit-overflow-scrolling:touch]
               p-4 sm:p-6"
      >
        <button
          type="button"
          aria-label="Закрыть"
          @click="emit('close')"
          class="absolute right-1 top-1 h-11 w-11 grid place-items-center
                 bg-transparent border-0 text-2xl leading-none
                 cursor-pointer select-none
                 [-webkit-tap-highlight-color:transparent]"
        >
          ×
        </button>

        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

defineOptions({ inheritAttrs: false })

const emit = defineEmits(['close'])
const props = defineProps({ visible: Boolean })

const content = ref(null)

function setScrollLock(lock) {
  const html = document.documentElement
  if (lock) html.classList.add('modal-open')
  else html.classList.remove('modal-open')
}

watch(
  () => props.visible,
  async (v) => {
    setScrollLock(v)
    if (v) {
      await nextTick()
      content.value?.focus()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => setScrollLock(false))
</script>

<style>
html.modal-open { overflow: hidden; }
</style>
