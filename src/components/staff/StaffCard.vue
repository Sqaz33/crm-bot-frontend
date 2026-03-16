<template>
  <div
    class="flex items-center w-full bg-white rounded-[12px] cursor-pointer
           h-[72px] px-3 py-2
           md:h-24 md:px-6 md:py-4
           transition-[transform,box-shadow] duration-200
           hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
    @click="$emit('select')"
  >
    <Avatar
      :name="staff.name"
      :photo="staff.photo"
      class="mr-3 md:mr-4"
    />

    <div class="flex flex-col gap-1 flex-1 min-w-0">
      <div class="font-medium text-neutral-800 truncate text-sm leading-[18px] md:text-xl md:leading-6">
        {{ staff.name }}
      </div>

      <div class="text-neutral-800 truncate text-xs leading-4 md:text-xl md:leading-6">
        {{ staff.specializations.join(', ') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import Avatar from './Avatar.vue'

const props = defineProps({
  staff: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])
</script>