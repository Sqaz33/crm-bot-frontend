<template>
  <Teleport to="body">
      <div
        v-if="visible"
        v-bind="$attrs"
        role="dialog"
        aria-modal="true"
        :class="overlayClass"
        @click.self="emit('close')"
      >

      <div
        ref="content"
        tabindex="-1"
        @keydown.esc.stop.prevent="emit('close')"
        :class="contentClass"
      >
        <slot name="header">
          <button
            type="button"
            aria-label="Закрыть"
            @click="emit('close')"
            class="absolute right-1 top-1 h-11 w-11 grid place-items-center
                   bg-transparent border-0 text-2xl leading-none
                   cursor-pointer select-none
                   [-webkit-tap-highlight-color:transparent]"
          >
            &times;
          </button>
        </slot>

        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'

defineOptions({ inheritAttrs: false })

const emit = defineEmits(['close'])
const props = defineProps({
  visible: Boolean,
  position: {
    type: String,
    default: 'center',
    validator: (v) => ['center', 'bottom'].includes(v),
  },
})

const isBottom = computed(() => props.position === 'bottom')

const overlayClass = computed(() => [
  'fixed inset-0 z-[9999] flex w-[100dvw] h-[100dvh] bg-black/50 overscroll-contain',
  isBottom.value
    ? 'items-end justify-center md:items-center md:px-4'
    : 'items-start justify-center px-4 pt-[43dvh] pb-4 md:items-center md:pt-4',
])

const contentClass = computed(() => [
  'relative outline-none box-border bg-white shadow-sheet w-full overflow-auto [-webkit-overflow-scrolling:touch]',
  isBottom.value
    ? 'max-w-full rounded-t-2xl pt-2.5 pb-[max(2rem,env(safe-area-inset-bottom))] md:max-w-[520px] md:rounded-2xl md:p-6'
    : 'max-w-[520px] rounded-2xl max-h-[calc(100dvh-32px)] p-4 sm:p-6',
])

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
