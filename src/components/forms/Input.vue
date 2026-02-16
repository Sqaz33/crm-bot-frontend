<template>
  <div class="w-full py-2 flex flex-col gap-1" :class="{ 'relative': lockIcon }">
    <label 
      v-if="label" 
      class="text-neutral-800 text-base font-medium" 
      :for="id"
    >
      {{ label }}
    </label>
    <div class="relative w-full">
      <input 
        :id="id" 
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :readonly="readonly"
        :type="type"
        class="w-full h-12 px-4 rounded-lg border border-gray-200 text-neutral-800 text-base outline-none"
        :class="[
          readonly ? 'bg-gray-50' : 'bg-white'
        ]"
      />
      <img 
        v-if="lockIcon" 
        src="../../assets/lock.svg" 
        alt="" 
        class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 pointer-events-none" 
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'text'
  },
  lockIcon: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>