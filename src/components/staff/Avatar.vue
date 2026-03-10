<template>
  <div
    class="rounded-full flex items-center justify-center text-white font-semibold overflow-hidden"
    :class="sizeClass"
    :style="avatarStyle"
  >
    <span v-if="!photo">
      {{ firstLetter }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getFirstLetter } from '../../utils/stringUtils'

const props = defineProps({
  name: String,
  photo: String,
  size: {
    type: String,
    default: 'md'
  }
})

const sizeClass = computed(() => {
  return props.size === 'lg'
    ? 'w-16 h-16 text-[28px]'
    : 'w-10 h-10 text-base'
})

const GRADIENTS = [
  ['#69FFDB', '#69FF03'],
  ['#71FF3F', '#CBEF77', '#E0FF88'],
  ['#A672F1', '#CAB6F3'],
  ['#C4C3F9', '#C5ECFD', '#8BFF8F']
]

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const avatarStyle = computed(() => {
  if (props.photo) {
    return {
      backgroundImage: `url(${props.photo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }

  const index = hashString(props.name || '') % GRADIENTS.length
  return {
    background: `linear-gradient(135deg, ${GRADIENTS[index].join(',')})`
  }
})

const firstLetter = computed(() => getFirstLetter(props.name))
</script>