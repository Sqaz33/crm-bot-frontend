<template>
  <div class="fixed inset-0 bg-black/40 flex justify-center items-center z-[999999]">
    <div class="bg-neutral-0 rounded-xl p-4 max-w-[90vw] w-auto shadow-lg text-center">
      <h3 class="text-neutral-800 font-semibold text-sm mb-3">{{ hText }}</h3>
      <p class="text-neutral-800 text-sm mb-4.5">{{ pText }}</p>
      <div class="flex justify-center gap-2">
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
</style>