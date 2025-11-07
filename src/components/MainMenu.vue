<template>
  <header class="main-header">
    <div class="salon-info">
      <div class="salon-logo">
        <img src="../assets/logo.svg" alt="Логотип" />
      </div>
      <div class="salon-text">
        <div class="salon-name">{{ salon.name }}</div>
        <div class="salon-desc">{{ salon.description }}</div>
      </div>
    </div>

    <nav class="menu">
      <div
        v-for="item in items"
        :key="item.label"
        class="menu-item"
        :class="{ active: activeItem === item.path }"
        @click="navigate(item)"
      >
        <img :src="item.icon" :class="item.iconSize" alt="icon" />
        <span>{{ item.label }}</span>
      </div>
    </nav>

    <Modal :visible="showShareModal" @close="showShareModal = false">
      <ShareModal />
    </Modal>
  </header>
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
  name: 'Название',
  description: 'тип заведения',
  address_url: ''
})

onMounted(async () => {
  try {
    const { data } = await api.get('/salon/info')
    salon.value = {
      name: data.name,
      description: data.description || 'тип заведения',
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
  { label: 'Записи', path: '/records', icon: RecordsIcon, iconSize: 'icon1' },
  { label: 'Поделиться', path: '/share', icon: ShareIcon, iconSize: 'icon1' },
  { label: 'Профиль', path: '/profile', icon: ProfileIcon, iconSize: 'icon1' }
]

function navigate(item) {
  if (item.label === 'Адрес') {
    if (salon.value.address_url) {
      const win = window.open(salon.value.address_url, '_blank')
      if (win) win.opener = null
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
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 0.75rem 1.5rem;
  box-sizing: border-box;
  min-height: 60px;
}

/* Левая часть — логотип и текст */
.salon-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.salon-logo {
  flex-shrink: 0;
}

.salon-logo img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #6267ee;
  padding: 6px;
  display: block;
}

.salon-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0; /* Для корректной работы text-overflow */
}

.salon-name {
  font-size: 1rem;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.salon-desc {
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Меню справа */
.menu {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-shrink: 0;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 0.75rem;
  color: #333;
  transition: color 0.2s;
  white-space: nowrap;
}

.menu-item:hover {
  color: #6267ee;
}

.menu-item.active {
  color: #6267ee;
}

.menu-item img {
  width: 24px;
  height: 24px;
  margin-bottom: 0.25rem;
}

.icon1 {
  width: 24px;
  height: 24px;
}

/* Адаптация для планшетов */
@media (max-width: 1024px) {
  .main-header {
    padding: 0.75rem 1rem;
  }
  
  .menu {
    gap: 1.5rem;
  }
  
  .salon-logo img {
    width: 36px;
    height: 36px;
  }
  
  .salon-name {
    font-size: 0.9rem;
  }
  
  .salon-desc {
    font-size: 0.75rem;
  }
}

/* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .main-header {
    padding: 0.5rem 0.75rem;
    min-height: 56px;
  }
  
  .salon-info {
    gap: 0.5rem;
    max-width: 40%;
  }
  
  .salon-logo img {
    width: 32px;
    height: 32px;
    padding: 4px;
  }
  
  .salon-name {
    font-size: 0.85rem;
  }
  
  .salon-desc {
    font-size: 0.7rem;
  }
  
  .menu {
    gap: 1rem;
  }
  
  .menu-item {
    font-size: 0.65rem;
  }
  
  .menu-item img {
    width: 20px;
    height: 20px;
    margin-bottom: 0.15rem;
  }
  
  .icon1 {
    width: 20px;
    height: 20px;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .main-header {
    padding: 0.5rem;
  }
  
  .salon-info {
    gap: 0.4rem;
    max-width: 35%;
  }
  
  .salon-logo img {
    width: 28px;
    height: 28px;
    padding: 3px;
  }
  
  .salon-name {
    font-size: 0.75rem;
  }
  
  .salon-desc {
    font-size: 0.65rem;
  }
  
  .menu {
    gap: 0.75rem;
  }
  
  .menu-item {
    font-size: 0.6rem;
  }
  
  .menu-item img {
    width: 18px;
    height: 18px;
  }
  
  .icon1 {
    width: 18px;
    height: 18px;
  }
}
</style>