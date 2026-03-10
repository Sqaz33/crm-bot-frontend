<template>
  <div class="bg-white rounded-3xl p-4 shadow-sm">
    <!-- Comment Textarea -->
    <div>
      <textarea
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        placeholder="Ваши пожелания"
        class="w-full min-h-[96px] rounded-2.5 border border-neutral-300 p-3 text-sm resize-y focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
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