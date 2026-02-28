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
import { useRoute } from "vue-router";
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import expandIconSrc from "../../assets/expandIcon.svg";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const route = useRoute();
const isExpanded = ref(false);
const expandIcon = expandIconSrc;

function toggle() {
  isExpanded.value = !isExpanded.value;
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
  background: #FFFFFF;
  box-shadow: 3px 3px 6px 0px #F0F1F5;
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
  background-color: #E8EBF9;
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
</style>
