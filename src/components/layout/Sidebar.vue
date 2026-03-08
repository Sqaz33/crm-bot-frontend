<template>
  <aside
    class="sidebar"
    :class="{ expanded: isExpanded, empty: items.length === 0 }"
  >
    <template v-if="items.length > 0">
      <!-- Пункты навигации -->
      <div class="sidebar-group">
        <RouterLink
          v-for="item in processedItems"
          :key="item.path"
          :to="item.accessible ? item.path : ''"
          class="sidebar-item"
          :class="{
            active: route.path === item.path,
            disabled: !item.accessible,
          }"
          @click="!item.accessible && $event.preventDefault()"
        >
          <img :src="item.icon" :alt="item.label" class="sidebar-icon" />
          <span class="sidebar-label">{{ item.label }}</span>
        </RouterLink>
        <button v-if="showBackButton" class="back-btn" @click="goBack">
          <span class="back-btn__circle">
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
              <path d="M8.5 1L1.5 8L8.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="sidebar-label back-btn__label">Назад</span>
        </button>
      </div>

      <!-- Кнопка раскрытия/скрытия подписей -->
      <div class="sidebar-group">
        <button class="sidebar-item toggle-btn" @click="toggle">
          <img :src="expandIcon" alt="Раскрыть меню" class="sidebar-icon toggle-icon" />
          <span class="sidebar-label">Свернуть</span>
        </button>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import expandIconSrc from "../../assets/expandIcon.svg";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  showBackButton: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();
const isExpanded = ref(window.matchMedia('(min-width: 768px)').matches);
const expandIcon = expandIconSrc;

function toggle() {
  isExpanded.value = !isExpanded.value;
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

import { readVisit, VISIT_KEY } from "../../utils/visitStorage";

// Инвалидация computed при внешних изменениях данных визита
const visitDataVersion = ref(0);
const getVisitData = () => readVisit();

const handleStorageChange = (e) => {
  if (e.key === VISIT_KEY || e.key === null) {
    visitDataVersion.value++;
  }
};

const handleCustomStorageChange = () => {
  visitDataVersion.value++;
};

onMounted(() => {
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("local-storage-changed", handleCustomStorageChange);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("local-storage-changed", handleCustomStorageChange);
});

watch(() => route.path, () => {
  visitDataVersion.value++;
});

// Доступность шагов записи: сотрудник - после выбора услуг, дата - после выбора сотрудника
const processedItems = computed(() => {
  visitDataVersion.value;
  const visitData = getVisitData();

  return props.items.map((item) => {
    if (!["/services", "/choicestaff", "/datetime"].includes(item.path)) {
      return { ...item, accessible: true };
    }

    if (item.path === "/services") {
      return { ...item, accessible: true };
    }

    if (item.path === "/choicestaff") {
      const accessible =
        Array.isArray(visitData.services_id) &&
        visitData.services_id.length > 0;
      return { ...item, accessible };
    }

    if (item.path === "/datetime") {
      const accessible = visitData.staff_id && visitData.staff_id !== "";
      return { ...item, accessible };
    }

    return { ...item, accessible: true };
  });
});
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  left: 0;
  width: 51px;
  min-height: calc(100dvh - 64px);
  align-self: stretch;
  background: white;
  box-shadow: 3px 3px 6px 0px #F6F5F6;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.25s ease;
}

.sidebar.expanded {
  width: 200px;
}

.sidebar.empty {
  display: none;
}

.sidebar-group {
  display: flex;
  flex-direction: column;
}

.sidebar-item {
  position: relative;
  height: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 15px;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  cursor: pointer;
  border: none;
  background: none;
}

.sidebar-item:hover {
  background-color: #CDD3F8;
}

.sidebar-item.active {
  background: #CDD3F8;
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #666FE8;
  border-radius: 0 2px 2px 0;
}

.sidebar-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-label {
  font-family: 'Geometria', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #454558;
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity 0.2s ease, width 0.25s ease;
}

.sidebar.expanded .sidebar-label {
  opacity: 1;
  width: auto;
}

/* Поворот иконки при раскрытии */
.toggle-icon {
  transition: transform 0.25s ease;
}

.sidebar.expanded .toggle-icon {
  transform: rotate(180deg);
}

/* Кнопка «Назад» */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 51px;
  height: 50px;
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
}

.back-btn__circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #666FE8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.back-btn:hover .back-btn__circle {
  background: #4f54d8;
}

.back-btn__label {
  color: #666FE8;
  font-weight: 500;
}

/* Десктоп (expanded): показываем текст, скрываем круг */
.sidebar.expanded .back-btn__circle {
  width: 20px;
  height: 20px;
  background: none;
  color: #666FE8;
}

.sidebar.expanded .back-btn {
  width: auto;
  padding: 0 15px;
  height: 50px;
  justify-content: flex-start;
  gap: 12px;
}

.sidebar.expanded .back-btn:hover {
  background-color: #CDD3F8;
}
</style>
