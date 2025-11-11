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
  flex-direction: column;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 0.8rem 1rem;
  box-sizing: border-box;
  gap: 0.8rem;
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
  min-width: 0;
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

/* Меню */
.menu {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.5rem;
  width: 100%;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  color: #666;
  transition: color 0.2s;
  padding: 0.25rem;
  flex: 1;
  min-width: 0;
}

.menu-item:hover {
  color: #6267ee;
}

.menu-item.active {
  color: #6267ee;
  font-weight: 500;
}

.menu-item img {
  width: 24px;
  height: 24px;
  margin-bottom: 0.3rem;
  flex-shrink: 0;
}

.menu-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}

.icon1 {
  width: 24px;
  height: 24px;
}

/* Адаптация для широких экранов */
@media (min-width: 768px) {
  .main-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1.5rem;
  }

  .menu {
    gap: 2.5rem;
    width: auto;
    justify-content: flex-end;
  }

  .menu-item {
    flex: initial;
  }

  /* .salon-logo img {
    width: 32px;
    height: 32px;
    padding: 4px;
  } */

  .salon-name {
    font-size: 0.95rem;
  }

  .salon-desc {
    font-size: 0.75rem;
  }

  .menu-item img {
    width: 22px;
    height: 22px;
  }
}
</style>