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
      <div
        v-for="staff in staffList"
        :key="staff.id"
        class="staff-card"
        @click="
          () => {
            console.log('click', staff.id);
            onSelect(staff.id);
          }
        "
      >
        <!-- Аватар -->
        <div class="avatar-container">
          <div
            v-if="staff.photo"
            class="avatar"
            :style="{ backgroundImage: `url(${staff.photo})` }"
            @click.stop="goStaff(staff)"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="goStaff(staff)"
            @keydown.space.prevent="goStaff(staff)"
          ></div>
          <div
            v-else
            class="avatar avatar--empty"
            @click.stop="goStaff(staff)"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="goStaff(staff)"
            @keydown.space.prevent="goStaff(staff)"
          >
            <span class="avatar-letter">{{ getFirstLetter(staff.name) }}</span>
          </div>
        </div>

        <!-- Информация о сотруднике -->
        <div class="staff-info">
          <div class="staff-name">{{ staff.name }}</div>
          <div class="staff-position">
            <span v-for="(spec, i) in staff.specializations" :key="i"
              >{{ spec
              }}<span v-if="i < staff.specializations.length - 1"
                >,
              </span></span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import api from "../api";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["select", "review", "visit"]);

const tabs = ref([{ label: "Все", value: "all" }]);
const activeTab = ref("all");

const staffList = ref([]);
const selectedId = ref(null);

const VISIT_KEY = "visit_data";

const defaultVisit = {
  staff_id: "",
  services_id: [],
  visit_time: { start_time: "", end: "" },
  comment: "",
};

function readVisit() {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    if (!raw) return { ...defaultVisit };
    const parsed = JSON.parse(raw);
    return { ...defaultVisit, ...parsed };
  } catch {
    return { ...defaultVisit };
  }
}

function writeVisit(v) {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(v));
    window.dispatchEvent(new CustomEvent("local-storage-changed"));
  } catch (e) {
    console.warn("writeVisit failed:", e);
  }
}

function getStaffId(s) {
  return s?.id ?? s?.staff_id ?? s?._id ?? s?.user_id ?? null;
}

function getFirstLetter(name) {
  return name && name.length > 0 ? name.charAt(0).toUpperCase() : "";
}

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
    console.error("Error loading specializations:", error);
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
    console.error("Error loading staff:", error);
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
    console.warn("scrollToActiveTab failed:", e);
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
  console.log("onSelect, id:", id);
  if (!id) return;

  selectedId.value = id;

  const visit = readVisit();
  visit.staff_id = id;
  writeVisit(visit);

  emit("select", id);
  router.push({ path: "/datetime" });
}

function onReview(id) {
  emit("review", id);
}
function onVisit(id) {
  emit("visit", id);
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
  --sidebar-mobile: 64px;
  --gutter-mobile: 20px;

  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
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

.active-line {
  display: none;
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

.staff-card {
  display: flex;
  align-items: center;
  width: 100%;
  height: 96px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-sizing: border-box;
  position: relative;
}

.staff-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-container {
  margin-right: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar--empty {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #69ffdb 0%, #69ff03 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar-letter {
  font-family: "Geometria", sans-serif;
  font-weight: 600;
  font-size: 28px;
  line-height: 33px;
  color: #ffffff;
}

.staff-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.staff-name {
  font-family: "Geometria", sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
}

.staff-position {
  font-family: "Geometria", sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  color: #454558;
}

@media (max-width: 1200px) {
  .staff-view {
    max-width: 95%;
  }
}

@media (max-width: 768px) {
  .staff-view {
    --sidebar-mobile: 72px;
    --gutter-mobile: 12px;

    padding-left: calc(var(--sidebar-mobile) + var(--gutter-mobile));
    padding-right: var(--gutter-mobile);

    margin: 0;
    max-width: 100vw;
  }

  .tabs-container,
  .staff-list {
    width: 79%;
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
    min-width: 100px;
  }

  .staff-list {
    gap: 8px;
    margin-top: 16px;
  }

  .staff-card {
    height: 72px;
    padding: 8px 12px;
  }

  .avatar-container {
    margin-right: 12px;
  }

  .avatar,
  .avatar--empty {
    width: 40px;
    height: 40px;
  }

  .avatar-letter {
    font-size: 16px;
    line-height: 20px;
  }

  .staff-name {
    font-size: 14px;
    line-height: 18px;
  }

  .staff-position {
    font-size: 12px;
    line-height: 16px;
  }
}

@media (max-width: 412px) {
  .staff-list {
    width: calc(100vw - (var(--sidebar-mobile) + 2 * var(--gutter-mobile)));
  }

  .tabs-background::-webkit-scrollbar {
    display: none;
  }

  .tabs-container {
    height: 64px;
    margin-top: 16px;
  }

  .tab {
    font-size: 16px;
    line-height: 20px;
    min-height: 64px;
    padding: 0 16px;
    min-width: 120px;
  }

  .tabs-container,
  .staff-list {
    width: 75%;
    max-width: none;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
