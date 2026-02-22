<template>
  <div class="flex items-center gap-2 mb-4 mt-2">
    <input
      type="checkbox"
      :id="checkboxId"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="w-6 h-6 rounded border-gray-300 text-[#666FE8] focus:ring-[#666FE8]"
    />
    <label :for="checkboxId" class="text-sm text-gray-700">
      <span>Я принимаю </span>
      <a 
        href="#" 
        @click.prevent="$emit('show-terms')"
        class="text-[#3471D6] underline"
      >
        условия использования
      </a>
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