<template>
  <div class="bg-white rounded-3xl p-4 shadow-sm">
    <!-- Comment Textarea -->
    <div>
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="Ваши пожелания"
        class="w-full min-h-[96px] rounded-2.5 border border-gray-300 p-3 text-sm resize-y focus:outline-none focus:border-[#666FE8] focus:ring-1 focus:ring-[#666FE8]"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>