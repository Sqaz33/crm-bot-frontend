<template>
  <div class="flex justify-center">
    <div class="inline-flex rounded-xl bg-white shadow-card overflow-hidden border border-neutral-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="[
          'px-8 py-3 font-semibold text-base transition-all duration-200 whitespace-nowrap',
          activeTab === tab.id
            ? 'bg-brand-500 text-white shadow-md'
            : 'bg-white text-neutral-700 hover:text-neutral-800'
        ]"
        @click="emitSelect(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
    // items: [{ id: string, label: string }]
  },
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['select'])

function emitSelect(tabId) {
  emit('select', tabId)
}
</script>
