<template>
  <img
    :src="salon.logoUrl || defaultLogo"
    alt="На главную"
    class="w-10 h-10 rounded-[10px] p-1.5 object-contain block cursor-pointer transition-opacity hover:opacity-80
           md:w-[60px] md:h-[60px] md:p-0"
    @click="router.push('/')"
    @error="(e) => e.target.src = defaultLogo"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSalonStore } from '../../stores/salon'
import defaultLogo from '../../assets/logo.svg'

const router = useRouter()
const salon = useSalonStore()
</script>
