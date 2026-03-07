<template>
  <div class="modal-overlay">
    <div class="modal">
      <h3 class="header-text">{{ hText }}</h3>
      <p class="paragraph-text">{{ pText }}</p>
      <div class="modal-buttons">
        <button 
          class="s_button s_button--yes"
          @click="yesButtonClick" 
          :disabled="yesDisabledCondition"
        >
          {{ yesText }}
        </button>
        <button 
          class="s_button s_button--no"
          @click="modalVisibilityUpdate" 
          :disabled="noDisabledCondition"
        >
          {{ noText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hText: {
    type: String,
    required: true
  },
  pText: {
    type: String,
    required: true
  },
  yesText: {
    type: String,
    required: true
  },
  noText: {
    type: String,
    required: true
  },
  yesAction: {
    type: Function,
    required: true
  },
  modalVisibilityUpdate: {
    type: Function,
    required: true
  },
  yesDisabledCondition: {
    type: Boolean,
    required: true
  },
  noDisabledCondition: {
    type: Boolean,
    required: true
  }
})

function yesButtonClick() {
  props.yesAction()
  props.modalVisibilityUpdate()
}
</script>

<style scoped>
@config "../../tailwind.config.js";

.modal-overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
}
.modal{
  @apply bg-neutral-0;
  @apply rounded-xl;
  padding: 16px;
  width: auto;
  max-width: min(90vw, 360px);
  box-shadow: 0 10px 30px rgba(0,0,0,.2);
  text-align: center;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.header-text {
  @apply text-neutral-800;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
}
.paragraph-text {
  @apply text-neutral-800;
  font-size: 14px;
  margin-bottom: 18px;
}
</style>