<template>
  <div class="flex items-center gap-2 mb-4 mt-2">
    <label :for="checkboxId" class="flex items-center gap-2 cursor-pointer">
      <div class="relative w-6 h-6">
        <input
          type="checkbox"
          :id="checkboxId"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
          class="peer appearance-none w-6 h-6 rounded-md border-2 border-neutral-300 bg-white cursor-pointer 
                 checked:border-brand-500 checked:bg-brand-500 transition-colors"
        />
        <svg
          v-if="modelValue"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
      <span class="text-sm text-gray-700">
        <span>Я принимаю </span>
        <span 
          @click.prevent="$emit('show-terms')"
          class="text-brand-500 underline"
        >
          условия использования
        </span>
      </span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  checkboxId: {
    type: String,
    default: 'accept'
  }
})

defineEmits(['update:modelValue', 'show-terms'])
</script>