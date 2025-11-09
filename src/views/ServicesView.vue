<template>
  <div class="services-view">
    <h1 class="page-title">Выберите услугу</h1>

    <div v-if="loading" class="loading">Загрузка…</div>

    <div v-else class="types-wrap">
      <section
        v-for="type in serviceTypes"
        :key="type.id"
        class="type-block"
        :class="{ open: openType === type.id }"
      >
        <button class="type-header" @click="toggle(type.id)">
          <span class="type-title">{{ type.name }}</span>
          <span class="type-meta">
            <span class="count-badge">{{ (servicesByType[type.id] || []).length }}</span>
            <span class="chev" :class="{ up: openType === type.id }">▾</span>
          </span>
        </button>

        <ul v-show="openType === type.id" class="service-list">
          <li
            v-for="svc in servicesByType[type.id]"
            :key="svc.id"
            class="service-item"
            :class="{ selected: isSelected(svc.id) }"
          >
            <div class="svc-left">
              <div class="svc-name">{{ svc.name }}</div>
            </div>

            <div class="svc-right">
              <div class="svc-price">{{ svc.price.toLocaleString('ru-RU') }} ₽</div>

              <button
                class="icon-btn"
                :class="isSelected(svc.id) ? 'danger' : 'primary'"
                @click="toggleService(svc)"
                type="button"
              >
                <span v-if="isSelected(svc.id)">×</span>
                <span v-else>＋</span>
              </button>
            </div>
          </li>
        </ul>
      </section>

      <button
        class="btn-next"
        :disabled="!selectedServiceIds.length"
        @click="confirm"
      >
        Продолжить запись<span v-if="selectedServiceIds.length"> — {{ totalPrice.toLocaleString('ru-RU') }} ₽</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const VISIT_KEY = 'visit_data'
const router = useRouter()

const loading = ref(true)
const serviceTypes = ref([])
const services = ref([])
const openType = ref(null)
const selectedServiceIds = ref([])

function loadVisit() {
  try {
    const raw = localStorage.getItem(VISIT_KEY)
    if (!raw) return { staff_id: null, services_id: [], visit_time: {}, comment: '' }
    return JSON.parse(raw)
  } catch {
    return { staff_id: null, services_id: [], visit_time: {}, comment: '' }
  }
}

function saveVisit(v) {
  const str = JSON.stringify(v)
  localStorage.setItem(VISIT_KEY, str)
  document.cookie = `${VISIT_KEY}=${encodeURIComponent(str)}; path=/; SameSite=Lax;`
}

const visit = ref(loadVisit())

onMounted(async () => {
  const { data: types } = await api.get('/services/types/')
  serviceTypes.value = types || []

  const params = {}
  if (visit.value.staff_id) params.staff_id = visit.value.staff_id
  const { data: all } = await api.get('/services/', { params })
  services.value = all || []

  if (Array.isArray(visit.value.services_id)) {
    selectedServiceIds.value = [...visit.value.services_id]
  }

  loading.value = false
})

const servicesByType = computed(() => {
  const map = {}
  serviceTypes.value.forEach(t => (map[t.id] = []))
  services.value.forEach(s => {
    if (!map[s.service_type_id]) map[s.service_type_id] = []
    map[s.service_type_id].push(s)
  })
  return map
})

const selectedServices = computed(() =>
  services.value.filter(s => selectedServiceIds.value.includes(s.id))
)

const totalPrice = computed(() =>
  selectedServices.value.reduce((sum, s) => sum + (Number(s.price) || 0), 0)
)

function toggle(typeId) {
  openType.value = openType.value === typeId ? null : typeId
}

function isSelected(id) {
  return selectedServiceIds.value.includes(id)
}

function toggleService(svc) {
  const idx = selectedServiceIds.value.indexOf(svc.id)
  if (idx >= 0) selectedServiceIds.value.splice(idx, 1)
  else selectedServiceIds.value.push(svc.id)
}

function confirm() {
  if (!selectedServiceIds.value.length) return
  visit.value.services_id = [...selectedServiceIds.value]
  saveVisit(visit.value)
  router.push({ name: 'appointmant' })
}
</script>

<style scoped>
.services-view {
  --sidebar-mobile: 64px;
  --gutter-mobile: 12px;
  --top-gap-mobile: 12px;
  --brand: #5c6cf0;
  --brand-100: #eef0ff;
  --text: #2b3240;
  --muted: #8d99ad;
  --card: #ffffff;
  --card-muted: #f3f5f8;
  --stroke: #e6eaf2;

  max-width: 720px;
  margin: 24px auto;
  padding: 0 12px;
  color: var(--text);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 12px 0;
}

.loading { text-align: center; padding: 24px; }

.types-wrap { display: flex; flex-direction: column; gap: 12px; }

.type-block { background: transparent; border-radius: 14px; }
.type-header {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  background: var(--card-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
}
.type-block.open .type-header { background: var(--brand-100); }

.type-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.type-meta { display: inline-flex; align-items: center; gap: 10px; }
.count-badge {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--stroke);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.chev { transition: transform .15s ease; }
.chev.up { transform: rotate(180deg); }

.service-list {
  list-style: none;
  margin: 10px 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.service-item {
  background: var(--card);
  border: 1px solid var(--stroke);
  border-radius: 14px;
  padding: 14px 14px 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.service-item.selected {
  border-color: #ffa940;
  box-shadow: inset 3px 0 0 0 #ffa940;
}

.svc-left { min-width: 0; }
.svc-name {
  font-weight: 600;
  line-height: 1.25;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.svc-right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-left: 12px;
  flex-shrink: 0;
}
.svc-price { font-weight: 700; }

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
  border: 2px solid var(--brand);
  color: var(--brand);
  background: #fff;
}
.icon-btn.primary:hover { filter: brightness(0.96); }
.icon-btn.danger {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.btn-next {
  width: 100%;
  padding: 14px 18px;
  border-radius: 12px;
  border: none;
  background: var(--brand);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  margin-top: 8px;
  cursor: pointer;
}
.btn-next:disabled { background: #c4cdd5; cursor: not-allowed; }

@media (max-width: 430px) {
  .services-view {
    margin: 0;
    padding-top: var(--top-gap-mobile);
    padding-left: calc(var(--sidebar-mobile) + var(--gutter-mobile));
    padding-right: calc(var(--sidebar-mobile) + var(--gutter-mobile));
  }
  .page-title { margin-bottom: 8px; font-size: 18px; }
  .type-header { padding: 12px 14px; font-size: 15px; }
  .count-badge { min-width: 30px; height: 30px; font-size: 14px; }
  .service-item { padding: 12px 12px 12px 14px; }
  .svc-name { font-size: 14px; }
  .svc-price { font-size: 15px; }
  .icon-btn { width: 34px; height: 34px; font-size: 18px; }
}
</style>
