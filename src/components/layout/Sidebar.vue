<template>
  <aside
    class="fixed top-0 left-0 h-dvh bg-white shadow-[3px_3px_6px_0_#F6F5F6] z-40
           flex flex-col justify-between overflow-hidden transition-[width] duration-[250ms] ease-in-out"
    :class="[
      isExpanded ? 'w-[200px]' : 'w-[51px]',
      items.length === 0 ? 'hidden' : '',
    ]"
    :style="{ paddingTop: headerOffset + 'px' }"
  >
    <template v-if="items.length > 0">
      <!-- Пункты навигации -->
      <div class="flex flex-col">
        <RouterLink
          v-for="item in processedItems"
          :key="item.path"
          :to="item.accessible ? item.path : ''"
          class="relative h-[50px] flex items-center gap-3 px-[15px] no-underline whitespace-nowrap
                 transition-colors duration-200 cursor-pointer border-none bg-transparent
                 hover:bg-brand-200"
          :class="{
            'bg-brand-200 before:content-[\'\'] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-brand-500 before:rounded-r-sm': route.path === item.path,
            'opacity-40 cursor-not-allowed pointer-events-none': !item.accessible,
          }"
          @click="!item.accessible && $event.preventDefault()"
        >
          <img :src="item.icon" :alt="item.label" class="w-5 h-5 object-contain shrink-0" />
          <span
            class="font-[Geometria,sans-serif] text-sm font-normal text-neutral-800
                   overflow-hidden transition-[opacity,width] duration-200"
            :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
          >
            {{ item.label }}
          </span>
        </RouterLink>

        <button
          v-if="showBackButton"
          class="group flex items-center border-none bg-transparent cursor-pointer whitespace-nowrap h-[50px]"
          :class="isExpanded
            ? 'w-auto px-[15px] justify-start gap-3 hover:bg-brand-200'
            : 'w-[51px] justify-center gap-0'"
          @click="goBack"
        >
          <span
            class="rounded-full flex items-center justify-center shrink-0 transition-colors duration-200"
            :class="isExpanded
              ? 'w-5 h-5 bg-transparent text-brand-500'
              : 'w-8 h-8 bg-brand-500 text-white group-hover:opacity-80'"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
              <path d="M8.5 1L1.5 8L8.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span
            class="font-[Geometria,sans-serif] text-sm font-normal text-brand-500 font-medium
                   overflow-hidden transition-[opacity,width] duration-200"
            :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
          >
            Назад
          </span>
        </button>
      </div>

      <!-- Кнопка раскрытия/скрытия подписей -->
      <div class="flex flex-col">
        <button
          class="relative h-[50px] flex items-center gap-3 px-[15px] whitespace-nowrap
                 transition-colors duration-200 cursor-pointer border-none bg-transparent
                 hover:bg-brand-200"
          @click="toggle"
        >
          <img
            :src="expandIcon"
            alt="Раскрыть меню"
            class="w-5 h-5 object-contain shrink-0 transition-transform duration-[250ms]"
            :class="isExpanded ? 'rotate-180' : ''"
          />
          <span
            class="font-[Geometria,sans-serif] text-sm font-normal text-neutral-800
                   overflow-hidden transition-[opacity,width] duration-200"
            :class="isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
          >
            Свернуть
          </span>
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
  expanded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:expanded']);

const route = useRoute();
const router = useRouter();
const expandIcon = expandIconSrc;

const isExpanded = computed(() => props.expanded);
const headerOffset = ref(0);
let rafId = null;

function updateHeaderOffset() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    const header = document.getElementById('header-wrapper');
    if (header) {
      headerOffset.value = Math.max(0, header.getBoundingClientRect().bottom);
    }
    rafId = null;
  });
}

function toggle() {
  emit('update:expanded', !props.expanded);
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
  updateHeaderOffset();
  window.addEventListener("scroll", updateHeaderOffset, { passive: true });
  window.addEventListener("resize", updateHeaderOffset, { passive: true });
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("local-storage-changed", handleCustomStorageChange);
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener("scroll", updateHeaderOffset);
  window.removeEventListener("resize", updateHeaderOffset);
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


