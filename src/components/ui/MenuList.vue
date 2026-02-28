<template>
  <div :class="['w-full', wrapperClass]">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      :disabled="item.disabled"
      class="w-full text-left rounded-2xl px-5 py-4 flex items-center justify-between
             bg-neutral-0 shadow-card transition
             disabled:opacity-60 disabled:cursor-not-allowed"
      :class="[
        isActive(item.key) ? activeCardClass : inactiveCardClass,
        item.disabled ? disabledCardClass : enabledCardClass
      ]"
      :aria-current="isActive(item.key) ? 'page' : undefined"
      @click="onSelect(item)"
    >
      <div class="flex items-center gap-3 min-w-0">
        <img
          v-if="typeof item.icon === 'string' && item.icon"
          :src="item.icon"
          :alt="item.label"
          class="w-6 h-6 shrink-0 object-contain"
        />

        <component
          v-else-if="item.icon"
          :is="item.icon"
          class="w-6 h-6 shrink-0"
        />

        <span
          class="font-medium truncate text-[15px]"
          :class="item.disabled ? disabledTextClass : (isActive(item.key) ? activeTextClass : inactiveTextClass)"
        >
          {{ item.label }}
        </span>
      </div>

      <span
        v-if="item.badge"
        class="inline-flex items-center justify-center py-[9px] px-[22px] rounded-[32px] text-xs font-semibold"
        :class="badgeClass(item.badge.variant, item.disabled)"
      >
        {{ item.badge.text }}
      </span>

      <span
        v-else
        class="text-2xl leading-none w-8 h-8 grid place-items-center shrink-0"
        :class="item.disabled ? disabledArrowClass : (isActive(item.key) ? activeArrowClass : inactiveArrowClass)"
      >
        ›
      </span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  items: { type: Array, required: true },

  wrapperClass: { type: String, default: 'flex flex-col gap-2' },

  activeCardClass: { type: String, default: 'bg-neutral-0' },
  inactiveCardClass: { type: String, default: 'bg-neutral-0' },

  enabledCardClass: { type: String, default: 'hover:bg-neutral-100' },
  disabledCardClass: { type: String, default: 'bg-neutral-0' },

  activeTextClass: { type: String, default: 'text-neutral-800' },
  inactiveTextClass: { type: String, default: 'text-neutral-800' },
  disabledTextClass: { type: String, default: 'text-neutral-500' },

  activeArrowClass: { type: String, default: 'text-neutral-500' },
  inactiveArrowClass: { type: String, default: 'text-neutral-500' },
  disabledArrowClass: { type: String, default: 'text-neutral-300' }
})

const emit = defineEmits(['update:modelValue', 'select'])

function isActive(key) {
  return props.modelValue === key
}

function onSelect(item) {
  if (item.disabled) return
  emit('update:modelValue', item.key)
  emit('select', item)
}

function badgeClass(variant, disabled) {
  if (disabled) return 'bg-neutral-200 text-neutral-500'

  if (variant === 'orange') return 'bg-orange-500 text-neutral-0'
  if (variant === 'blue') return 'bg-brand-200 text-neutral-800'

  return 'bg-neutral-200 text-neutral-800'
}
</script>
