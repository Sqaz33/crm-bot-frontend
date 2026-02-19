<template>
  <HomeMenu v-if="isHome" />

  <template v-else>
    <!-- Top Bar (название бота) -->
    <div class="topbar">
      <div class="salon-logo">
          <img :src="logo" alt="logo" class="cursor-pointer" @click="$router.push('/')" />
      </div>
      <div class="salon-text">
        <div class="salon-name">{{ salon.name }}</div>
        <div class="salon-desc">{{ salon.description }}</div>
      </div>
    </div>

    <header class="header">
      <div class="header-content">
        <!-- Кнопка меню (для страниц со сайдбаром) -->
        <button
            v-if="!notShowSidebarButton"
            class="menu-button"
            @click="clickSidebarButton"
        >
          <img src="@/assets/sidebarIcon.svg" alt="Меню" />
        </button>

        <!-- Кнопка назад (для остальных страниц) -->
        <!-- <button
            v-if="notShowSidebarButton"
            class="back-button"
            @click="goBack()"
        >
          <span class="arrow-back">←</span>
          <span class="back-text">Назад</span>
        </button> -->

        <h1 class="page-title">{{ title }}</h1>

        <div class="header-actions">
          <slot name="actions" />
        </div>
      </div>
    </header>
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeMenu from './MainMenu.vue'
import api from '../../api'
import logo from '../../assets/logo.svg'

const route = useRoute()
const router = useRouter()

const isHome = computed(() => route.name === 'home')
const title = computed(() => route.meta.title || route.name || 'Страница')

const notShowSidebarButton = computed(() => route.name === 'appointmant')

const emit = defineEmits(['sidebarButtonClick'])

const salon = ref({
  name: '',
  description: '',

})

function clickSidebarButton() {
  emit('sidebarButtonClick')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/salon/info/')
    salon.value = {
      name: data.name,
      description: data.description || '',
      address_url: data.address_url || ''
    }
  } catch {
    salon.value = {
      name: 'Ошибка загрузки',
      description: ''
    }
  }
})

function goHome() {
  router.push({ name: 'home' })
}

function goBack() {
  router.back()
}
</script>

<style scoped>
/* Top Bar */
.topbar {
  padding: 0.875rem 1rem;
  background-color: white;
  border-bottom: 1px solid #e8eef5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Salon Logo */
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

/* Bot Name */
.bot-name {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #5073f0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.bot-name:hover {
  color: #3d5dd4;
}

/* Header */
.header {
  background-color: white;
  border-bottom: 1px solid #e8eef5;
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}

.header-content {
  display: flex;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
  gap: 1rem;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

/* Menu Button */
.menu-button {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 0;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.menu-button:hover {
  background-color: #f3f6fa;
}

.menu-button img {
  width: 24px;
  height: 24px;
}

/* Back Button */
.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--font-primary);
  font-size: 0.9375rem;
  color: #5073f0;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background-color: #f3f6fa;
  color: #3d5dd4;
}

.arrow-back {
  font-size: 1.25rem;
  font-weight: 300;
}

.back-text {
  font-weight: 500;
}

/* Page Title - ИСПРАВЛЕННЫЕ СТИЛИ ПОД FIGMA */
.page-title {
  font-family: 'Geometria', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 30px;
  line-height: 36px;
  text-align: center;
  color: #454558;
  margin: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
    flex: 1 1 auto;
  min-width: 0;
}

/* Header Actions */
.header-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Salon Info (если понадобится) */
.salon-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
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

/* Responsive */
@media (max-width: 768px) {
  .topbar {
    padding: 0.75rem 1rem;
  }

  .salon-logo img {
    width: 36px;
    height: 36px;
    padding: 5px;
  }

  .bot-name {
    font-size: 0.8125rem;
  }

  .header-content {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }

  .menu-button {
    width: 36px;
    height: 36px;
  }

  .menu-button img {
    width: 22px;
    height: 22px;
  }

  .back-button {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }

  .arrow-back {
    font-size: 1.125rem;
  }

  .page-title {
    font-size: 24px;
    line-height: 30px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
    line-height: 24px;
  }
  .topbar{
    display: none;
  }
  .back-button{display: none;}
}
</style>