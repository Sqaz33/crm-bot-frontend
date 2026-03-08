<template>
  <div
    class="flex items-center w-full bg-white rounded-[12px] cursor-pointer
           h-[72px] px-3 py-2
           md:h-24 md:px-6 md:py-4
           transition-[transform,box-shadow] duration-200
           hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
    @click="$emit('select')"
  >
    <div class="mr-3 md:mr-4" @click.stop="$emit('avatar-click')">
      <div
        v-if="staff.photo"
        class="w-10 h-10 md:w-16 md:h-16 rounded-full bg-cover bg-center shrink-0 cursor-pointer"
        :style="{ backgroundImage: `url(${staff.photo})` }"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="$emit('avatar-click')"
        @keydown.space.prevent="$emit('avatar-click')"
      />
      <div
        v-else
        class="w-10 h-10 md:w-16 md:h-16 rounded-full shrink-0 cursor-pointer
               bg-gradient-to-br from-green-500 to-green-400
               flex items-center justify-center"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="$emit('avatar-click')"
        @keydown.space.prevent="$emit('avatar-click')"
      >
        <span class="font-semibold text-white text-base leading-5 md:text-[28px] md:leading-[33px]">
          {{ firstLetter }}
        </span>
      </div>
    </div>

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
import { computed } from 'vue'
import { getFirstLetter } from '../../utils/stringUtils'

const props = defineProps({
  staff: {
    type: Object,
    required: true,
  },
})

defineEmits(['select', 'avatar-click'])

const firstLetter = computed(() => getFirstLetter(props.staff.name))
</script>
