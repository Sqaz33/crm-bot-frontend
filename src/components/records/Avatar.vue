<template>
  <div
    class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
    :style="{ backgroundColor: avatarColor }"
  >
    <span class="text-white font-bold text-lg">{{ firstLetter }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: ''
  }
})

const COLORS = [
  '#6366F1', // indigo-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#F43F5E', // rose-500
  '#F97316', // orange-500
  '#EAB308', // yellow-500
  '#22C55E', // green-500
  '#14B8A6', // teal-500
  '#0EA5E9', // sky-500
  '#3B82F6', // blue-500
]

const firstLetter = computed(() => {
  const nm = (props.name || '').trim()
  if (!nm) return '?'
  return nm[0].toUpperCase()
})

const avatarColor = computed(() => {
  if (!props.name) return COLORS[0]
  
  // Генерируем индекс на основе имени для консистентности
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
})
</script>
