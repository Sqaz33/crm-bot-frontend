<template>
  <div class="staff-view">
    <!-- Табы -->
    <div class="tabs-container">
      <div class="tabs-background">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="selectTab(tab.value)"
        >
          {{ tab.label }}
          <span class="tab-underline"></span>
        </button>
      </div>
    </div>

    <!-- Список сотрудников -->
    <div class="staff-list">
      <div v-if="staffList.length === 0" class="no-staff">Нет сотрудников</div>
      <StaffCard
        v-for="staff in staffList"
        :key="staff.id"
        :staff="staff"
        @select="onSelect(staff.id)"
        @avatar-click="goStaff(staff)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'
import { readVisit, writeVisit } from '../utils/visitStorage'
import { getStaffId } from '../utils/stringUtils'
import { logger } from '../utils/logger'
import StaffCard from '../components/staff/StaffCard.vue'

const router = useRouter()
const emit = defineEmits(['select'])

const tabs = ref([{ label: 'Все', value: 'all' }])
const activeTab = ref('all')
const staffList = ref([])
const selectedId = ref(null)

async function loadSpecializations() {
  try {
    const visit = readVisit();
    const params = {};

    if (visit?.services_id?.length) {
      params.service_id = visit.services_id[0];
    }

    const { data } = await api.get("/staff/specializations/", { params });

    tabs.value = [
      { label: "Все", value: "all" },
      ...data.map((spec) => ({
        label: spec,
        value: spec,
      })),
    ];
  } catch (error) {
    logger.error('ChoiceStaff: ошибка загрузки специализаций', { error: error?.message || String(error) });
  }
}

async function loadStaff(specId) {
  try {
    const visit = readVisit();
    const params = {};

    if (visit?.services_id?.length) params.service_id = visit.services_id[0];
    if (visit?.visit_time?.start_time)
      params.start_time = visit.visit_time.start_time;

    if (specId && specId !== "all") params.specialization = specId;

    const { data } = await api.get("/staff/", { params });
    staffList.value = data;

    if (
      selectedId.value &&
      !staffList.value.some((s) => getStaffId(s) === selectedId.value)
    ) {
      selectedId.value = null;
      const v = readVisit();
      v.staff_id = "";
      writeVisit(v);
    }
  } catch (error) {
    logger.error('ChoiceStaff: ошибка загрузки сотрудников', { error: error?.message || String(error) });
  }
}

function scrollToActiveTab() {
  try {
    nextTick(() => {
      const container = document.querySelector(".tabs-background");
      if (!container) return;

      const activeButton = container.querySelector(".tab.active");
      if (!activeButton) return;

      const containerWidth = container.clientWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;
      const scrollTo = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({ left: Math.max(0, scrollTo), behavior: "smooth" });
    });
  } catch (e) {
    logger.warn('ChoiceStaff: scrollToActiveTab failed', { error: e?.message || String(e) });
  }
}

function selectTab(v) {
  activeTab.value = v;
  nextTick(() => {
    scrollToActiveTab();
  });
}

function goStaff(idOrStaff) {
  const id = typeof idOrStaff === "object" ? getStaffId(idOrStaff) : idOrStaff;
  if (!id) return;
  router.push({ name: "staff", params: { id } });
}

function onSelect(idOrStaff) {
  const id = typeof idOrStaff === "object" ? getStaffId(idOrStaff) : idOrStaff;
  logger.debug('ChoiceStaff: выбран сотрудник', { staffId: id });
  if (!id) return;

  selectedId.value = id;

  const visit = readVisit();
  visit.staff_id = id;
  writeVisit(visit);

  emit("select", id);
  router.push({ path: "/datetime" });
}

watch(activeTab, (v) => loadStaff(v));

onMounted(async () => {
  await loadSpecializations();
  await loadStaff();

  const v = readVisit();
  if (v?.staff_id) selectedId.value = v.staff_id;
});
</script>

<style scoped>
.staff-view {
  width: 100%;
  padding: 0;
  background: #f6f5f6;
}

.tabs-container {
  position: relative;
  width: 100%;
  height: 96px;
  margin: 24px auto 0 auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  z-index: 1;
}

.tabs-background {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-background::-webkit-scrollbar {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: "Geometria", sans-serif;
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  color: #454558;
  transition: color 0.3s ease;
  padding: 0 24px;
  margin: 0;
  min-height: 96px;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
  position: relative;
}

.tab.active {
  color: #454558;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: transparent;
  border-radius: 2.5px;
  transition: background 0.3s ease;
}

.tab.active .tab-underline {
  background: #666fe8;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 28px auto 0 auto;
  width: 100%;
  z-index: 2;
}

.no-staff {
  text-align: center;
  color: #8097b1;
  font-family: "Geometria", sans-serif;
  font-size: 18px;
  padding: 2rem;
}

@media (max-width: 768px) {
  .staff-view {
    max-width: 100%;
    padding: 0;
  }

  .tabs-container,
  .staff-list {
    width: 100%;
    max-width: none;
    margin-left: 0;
    margin-right: 0;
  }

  .tabs-container {
    height: 56px;
    margin-top: 12px;
  }

  .tab {
    font-size: 14px;
    line-height: 18px;
    min-height: 56px;
    padding: 0 12px;
    min-width: 0;
  }

  .staff-list {
    gap: 8px;
    margin-top: 16px;
  }
}

@media (max-width: 412px) {
  .tabs-container {
    height: 48px;
    margin-top: 12px;
  }

  .tab {
    font-size: 13px;
    line-height: 16px;
    min-height: 48px;
    padding: 0 10px;
    min-width: 0;
  }
}
</style>
