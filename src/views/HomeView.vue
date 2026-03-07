<template>
  <div class="min-h-screen flex flex-col pt-8">
    <button class="b_button w-full! mb-6" @click="goTo('appointmant')">
      Персональные услуги
    </button>

    <MenuList
      v-model="active"
      :items="menuItems"
      @select="onSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'


import MenuList from '../components/ui/MenuList.vue'

import walletIcon from '../assets/walletIcon.svg'
import shopIcon from '../assets/shopIcon.svg'
import reviewIcon from '../assets/reviewIcon.svg'
import companyIcon from '../assets/companyIcon.svg'

const router = useRouter()
const route = useRoute()

const active = ref(route.name ?? 'wallet')

watch(
  () => route.name,
  (name) => { if (name) active.value = name }
)

const menuItems = computed(() => ([
  { key: 'wallet',  label: 'Кошелёк',    icon: walletIcon,  badge: { text: '0', variant: 'orange' } },
  { key: 'shop',    label: 'Магазин',    icon: shopIcon },
  { key: 'reviews', label: 'Отзывы',     icon: reviewIcon,  badge: { text: '0' } },
  { key: 'company', label: 'О компании', icon: companyIcon }
]))

function onSelect(item) {
  goTo(item.key)
}

function goTo(name) {
  router.push({ name })
}
</script>
