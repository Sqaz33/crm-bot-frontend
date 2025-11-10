<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="$emit('close')"
      @keydown.esc="$emit('close')"
    >
      <div class="modal-content" ref="content" tabindex="-1">
        <button
          class="modal-close"
          type="button"
          aria-label="Закрыть"
          @click="$emit('close')"
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

const props = defineProps({ visible: Boolean })
const content = ref(null)

function setScrollLock(lock) {
  const html = document.documentElement
  if (lock) {
    html.classList.add('modal-open')
  } else {
    html.classList.remove('modal-open')
  }
}

watch(
  () => props.visible,
  async v => {
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

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  width: 100dvw;
  height: 100dvh;

  display: flex;
  justify-content: center;
  align-items: center;

  
  padding:
    max(16px, env(safe-area-inset-top))
    max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom))
    max(16px, env(safe-area-inset-left));

  background-color: rgba(0, 0, 0, 0.5);
  overscroll-behavior: contain; 
}

@supports not (height: 100dvh) {
  .modal-overlay {
    width: 100vw;
    height: 100vh;
  }
}

.modal-content {
  background: #fff;
  position: relative;
  border-radius: 16px;

  width: 100%;
  max-width: 520px;

 
  max-height: calc(100dvh - 48px);
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  padding: clamp(16px, 4vw, 24px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  outline: none;
}

@supports not (max-height: 100dvh) {
  .modal-content {
    max-height: calc(100vh - 48px);
  }
}

.modal-close {
  position: absolute;
  top: 4px;
  right: 4px;

  /* тач-таргет по гайдам 44x44 */
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;

  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

@media (pointer: coarse) {
  .modal-content { border-radius: 20px; }
}
</style>


<style>
html.modal-open { overflow: hidden; }
</style>
