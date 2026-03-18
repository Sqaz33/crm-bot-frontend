<template>
  <!-- Полное меню: на главной — всегда, на остальных — только desktop -->
  <div v-if="!isHome" class="hidden md:block">
    <HomeMenu />
  </div>
  <HomeMenu v-if="isHome" />

  <!-- Простой header: на внутренних страницах, только mobile -->
  <header v-if="!isHome" class="sticky top-0 z-10 bg-white shadow-[3px_0px_9px_0px_rgba(0,0,0,0.04)] md:hidden">
    <div class="flex items-center py-3">
      <div class="w-[51px] flex items-center justify-center shrink-0">
        <Logo />
      </div>

      <h1 class="font-[Geometria,sans-serif] font-medium text-2xl leading-[30px] text-center text-[#454558] m-0 flex-1 min-w-0 truncate">{{ title }}</h1>

      <div class="w-[51px] shrink-0" />
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HomeMenu from './MainMenu.vue'
import Logo from '../ui/Logo.vue'
import { useSalonStore } from '../../stores/salon'

const route = useRoute()
const salon = useSalonStore()

onMounted(() => {
  salon.fetch()
})

const isHome = computed(() => route.name === 'home')
const title = computed(() => route.meta.title || route.name || 'Страница')
</script>
