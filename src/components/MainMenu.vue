<template>
  <div class="main-menu">
    <div class="salon-info">
      <div class="salon-name">{{ salon.name }}</div>
      <div class="salon-desc">{{ salon.description }}</div>
    </div>

    <nav class="menu">
      <div
        v-for="item in items"
        :key="item.label"
        class="menu-item"
        :class="{ active: activeItem === item.path }"
        @click="navigate(item)"
      >
        <span class="icon">
          <img :src="item.icon" :class="item.iconSize" alt="icon" />
        </span>
        <span>{{ item.label }}</span>
      </div>
    </nav>

    <Modal :visible="showShareModal" @close="showShareModal = false">
      <ShareModal />
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'

import Modal from './Modal.vue'
import ShareModal from './ShareModal.vue'

import AddressIcon from '../assets/map.svg'
import RecordsIcon from '../assets/appointment.svg'
import ShareIcon from '../assets/share.svg'
import ProfileIcon from '../assets/prof.svg'

const router = useRouter()
const route = useRoute()
const activeItem = ref(route.path)
const showShareModal = ref(false)

const salon = ref({
  name: 'Загрузка...',
  description: '',
  address_url: ''
})

onMounted(async () => {
  try {
    const { data } = await api.get('/salon/info')
    salon.value = {
      name: data.name,
      description: data.description,
      address_url: data.address_url || ''
    }
  } catch {
    salon.value = {
      name: 'Ошибка загрузки',
      description: '',
      address_url: ''
    }
  }
})

watch(() => route.path, (p) => {
  activeItem.value = p
})

const items = [
  { label: 'Адрес', path: '/address', icon: AddressIcon, iconSize: 'icon1' },
  { label: 'Записи', path: '/records', icon: RecordsIcon, iconSize: 'icon2' },
  { label: 'Поделиться', path: '/share', icon: ShareIcon, iconSize: 'icon1' },
  { label: 'Профиль', path: '/profile', icon: ProfileIcon, iconSize: 'icon2' }
]

function navigate(item) {
  if (item.label === 'Адрес') {
    if (salon.value.address_url) {
      const win = window.open(salon.value.address_url, '_blank')
      if (win) {
        win.opener = null
      } else {
        console.log('Браузер заблокировал всплывающее окно. Разрешите их в настройках.')
      }
    } else {
      console.log('Ссылка на адрес недоступна')
    }
  } else if (item.label === 'Поделиться') {
    showShareModal.value = true
  } else {
    activeItem.value = item.path
    router.push(item.path)
  }
}
</script>

<style scoped>
.main-menu {

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  background: var(--color-dark);
  color: white;

  padding: 0;
  box-sizing: border-box;
  width: 100%;

}

.salon-info {
  display: flex;
  flex-direction: column;
  padding: clamp(0.75rem,4vw,1rem);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box; 
  text-align: center;
}

.salon-name {
  font-size: clamp(0.75rem, 4vw, 1rem);
  font-weight: bold;
  font-family:var(--font-primary) ;
}

.salon-desc {
  font-size: clamp(0.3rem,2vw,0.6rem);
  opacity: 0.7;
  margin-top: 0.25rem;
  font-family:var(--font-primary) ;
}

.menu {
  display: flex;
  flex-wrap: nowrap;
  padding: 0.5rem 1rem;
  box-sizing: border-box;
  width: clamp(25rem, 100%, 30rem);
  justify-content: space-between;
}

.menu-item {
  text-align: center;
  padding: clamp(0.5rem, 2vw, 0.75rem);
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
 

.menu-item.active {
  background-color:var(--color-secondary);
}

.menu-item:hover:not(.active) {
  background-color: rgba(0, 123, 255, 0.2);
}

.menu-item .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;       
  margin-bottom: 0.3rem;
  
}

.menu-item .icon img {
  object-fit: contain;
}
.icon1 {
  width: clamp(1.9rem, 6vw, 2.4rem);
  height: clamp(1.9rem, 6vw, 2.4rem);
}

.icon2{
  width: clamp(1.6rem, 5vw, 1.6rem);
  height: clamp(1.6rem, 5vw, 1.6rem);
}
</style>
