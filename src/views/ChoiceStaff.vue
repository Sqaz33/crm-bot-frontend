<template>
  <div class="w-full">
    <!-- Табы специализаций -->
    <StaffFilter
      v-model="activeTab"
      :tabs="tabs"
      class="mt-3 md:mt-6"
    />

    <!-- Список сотрудников -->
    <div class="flex flex-col gap-2 md:gap-3 mt-4 md:mt-7 w-full">
      <div v-if="staffList.length === 0" class="text-center text-neutral-500 text-lg py-8">
        Нет сотрудников
      </div>
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
import { ref, onMounted, watch } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'
import { readVisit, writeVisit } from '../utils/visitStorage'
import { getStaffId } from '../utils/stringUtils'
import { logger } from '../utils/logger'
import StaffCard from '../components/staff/StaffCard.vue'
import StaffFilter from '../components/staff/StaffFilter.vue'

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
