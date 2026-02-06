<template>
  <div class="records-page">
    <div class="records-container">
      <!-- Tabs -->
      <div class="tabs-container">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'current' }"
          @click="switchTab('current')"
        >
          Текущие
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'past' }"
          @click="switchTab('past')"
        >
          Прошедшие
        </button>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="loading">Загрузка...</div>

      <!-- Содержимое -->
      <div v-else>
        <!-- Если есть записи -->
        <div v-if="visits.length > 0" class="filled-content">
          <div
            v-for="visit in visits"
            :key="visit.id"
            class="appointment-card"
            @click="goToVisit(visit.id, activeTab === 'past')"
          >
            <div class="card-header">
              <img
                src="../assets/emptyAvatar.svg"
                alt="Нет фото"
                class="avatar"
              />
              <div class="employee-info">
                <div class="employee-name">{{ visit.staff.name }}</div>
                <div class="employee-specialty">
                  {{ visit.staff.specializations.join(", ") }}
                </div>
              </div>
              <div class="date-time">
                <div class="date">
                  {{ formatDateShort(visit.visit_date_time) }}
                </div>
                <div class="time">
                  {{ formatTimeOnly(visit.visit_date_time) }}
                </div>
              </div>
            </div>

            <div class="service-info">
              <div class="service-name-small">Услуга</div>
              <div class="service-name-small">Количество</div>
              <div class="service-name-small">Стоимость</div>

              <div class="service-name">{{ visit.service.name }}</div>
              <div class="quantity">1</div>
              <div class="price">{{ visit.service.price }} ₽</div>
            </div>

            <div class="card-status">
              <div class="status-info">
                <img
                  :src="statusMessage[visit.status].icon"
                  :alt="statusMessage[visit.status].title"
                  :class="[`status-icon`, statusMessage[visit.status].bgClass]"
                />

                <div class="status-badge-reason">
                  <span class="status-badge">

                    {{ statusMessage[visit.status].title}}
                  </span>
                  <div class="status-reason">
                    {{
                      statusMessage[visit.status].subtitle

                    }}
                  </div>
                </div>
              </div>
              <div class="total-price">{{ visit.service.price }} ₽</div>
            </div>
          </div>
        </div>

        <!-- Если записей нет -->
        <div v-else class="empty-content">
          <div class="empty-icon-wrapper">
            <img
              src="../assets/emptyRecord.svg"
              alt="Нет записей"
              class="empty-icon"
            />
          </div>
          <p class="empty-description">
            {{
              activeTab === "past"
                ? "У Вас еще не было завершенных записей"
                : "У Вас ни одной активной записи"
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'
import crossIcon from '../assets/crossIcon.svg'
import checkmarkIcon from '../assets/checkmarkIcon.svg'

const router = useRouter();

/* Преобразование статуса в сообщение пользователю */
const statusMessage = {
    "waiting": {icon: crossIcon, bgClass: 'status-icon-unpaid', title: "Ожидание", subtitle: "Мы вас ждём, вы придёте?"},
    "confirmed": {icon: crossIcon, bgClass: 'status-icon-unpaid', title:"Подтверждено", subtitle: "Вы подтвердили, что придёте. Мы вас ждём!"},
    "missing": {icon: crossIcon, bgClass: 'status-icon-unpaid', title:"Не оплачено", subtitle: "Визит отменен / клиент не пришел "},
    "success": {icon: checkmarkIcon, bgClass: 'status-icon-paid', title: "Оплачено", subtitle: "Услуга оказана"},
}

function goToVisit(id, isOld) {
  router.push({
    name: "record",
    params: { id },
    query: { isOld: isOld.toString() },
  });
}

const visits = ref([]);
const loading = ref(true);
const activeTab = ref("current");

// --- КЭШ ---
const staffCache = {};
const servicesCache = {};
const tabKey = "ACTIVE_TAB";

async function getStaff(staff_id) {
  if (staffCache[staff_id]) return staffCache[staff_id];
  try {
    const { data } = await api.get(`/staff/${staff_id}`);
    staffCache[staff_id] = data;
    return data;
  } catch (error) {
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    console.error("[getStaff] Ошибка при запросе сотрудника", {
      staff_id,
      status,
      responseData,
      message: error?.message,
    });
    throw error;
  }
}

async function getService(service_id) {
  if (servicesCache[service_id]) return servicesCache[service_id];
  try {
    if (Object.keys(servicesCache).length === 0) {
      const { data: arr } = await api.get(`/services/`);
      arr.forEach((s) => {
        servicesCache[s.id] = s;
      });
    }
    return servicesCache[service_id];
  } catch (error) {
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    console.error("[getService] Ошибка при запросе услуги", {
      service_id,
      status,
      responseData,
      message: error?.message,
    });
    throw error;
  }
}

// --- API загрузка ---
async function fetchVisits(tab) {
  loading.value = true;
  visits.value = [];

  const url = tab === "current" ? "/visits/current/" : "/visits/old/";
  console.log(`Загружаем данные с: ${url}`);

  try {
    const { data: rawVisits } = await api.get(url);

    if (!Array.isArray(rawVisits)) {
      console.error("Сервер вернул не массив:", rawVisits);
      visits.value = [];
      return;
    }

    console.log(`Получено ${rawVisits.length} записей`);
    if (rawVisits.length > 0)
      console.log("Первый элемент (сырой):", rawVisits[0]);

    let processedCount = 0;
    const mapped = await Promise.all(
      rawVisits.map(async (v, i) => {

        const staff = await getStaff(v.staff_id)
        const service = await getService(v.service_id)
        const enriched = { ...v, staff, service }
        const recordStatus = v.status;
        console.log(`Сатус секущего заказа: ${recordStatus}`)


        processedCount++;
        if (i === 0) console.log("Первый элемент после обработки:", enriched);
        if (processedCount % 10 === 0 || processedCount === rawVisits.length)
          console.log(`Обработано ${processedCount} из ${rawVisits.length}`);
        return enriched;
      })
    );

    // СОРТИРОВКА: первые записи первыми
    const sortedVisits = mapped.sort((a, b) => {
      return new Date(a.visit_date_time) - new Date(b.visit_date_time);
    });

    visits.value = sortedVisits;
    console.log(`Всего обработано ${mapped.length} записей, отсортировано`);
  } catch (err) {
    console.error("Ошибка при загрузке или обработке:", err);
    visits.value = [];
  } finally {
    loading.value = false;
    console.log("Завершено обновление данных\n");
  }
}

function switchTab(tab) {
  activeTab.value = tab;
  localStorage.setItem(tabKey, tab);
  fetchVisits(tab);
}

function formatDateShort(iso) {
  // const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function formatTimeOnly(iso) {
  // const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  const d = new Date(iso)
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function loadCurTab() {
  activeTab.value = localStorage.getItem(tabKey) || "current";
}

onMounted(() => {
  loadCurTab();
  fetchVisits(activeTab.value);
});
</script>

<style scoped>
.records-page {
  display: flex;
  min-height: 100vh;
  background-color: #f6f9fc;
  font-family: var(--font-primary);
}

.records-container {
  flex: 1;
  padding: 0;
  max-width: 80%;
  margin: 0 auto;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 0;
  padding: 1rem;
  background-color: #f6f9fc;
  border-radius: 12px;
  background-color: transparent;
  position: relative;
}

.tab-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  background-color: white;
  font-family: var(--font-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  color: #6b7688;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

/* Первая кнопка - скругления слева */
.tab-btn:first-child {
  border-radius: 8px 0 0 8px;
}

/* Последняя кнопка - скругления справа */
.tab-btn:last-child {
  border-radius: 0 8px 8px 0;
}

/* Активная кнопка - другой стиль */
.tab-btn.active {
  background-color: #5073f0;
  color: white;
  font-weight: 600;
}

/* Убираем скругления у средних кнопок (если будет больше двух) */
.tab-btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}

.tab-btn:hover:not(.active) {
  background-color: #f8f9fb;
  color: #5073f0;
}

/* Loading */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  font-size: 1rem;
  color: #8b9aaa;
}

/* Filled Content */
.filled-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.appointment-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 1.25rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.appointment-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.employee-info {
  flex: 1;
  min-width: 0;
}

.employee-name {
  font-weight: 600;
  color: #1a2233;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.employee-specialty {
  color: #6b7688;
  font-size: 0.875rem;
}

.date-time {
  text-align: right;
  flex-shrink: 0;
}

.date {
  font-weight: 500;
  color: #1a2233;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
}

.time {
  color: #6b7688;
  font-size: 0.875rem;
}

.service-info {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid #e8eef5;
  border-top: 1px solid #e8eef5;
  margin-bottom: 1rem;
}

.service-name-small {
  font-weight: 400;
  color: #9aa5b5;
  font-size: 0.75rem;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.service-name-small:nth-child(3),
.price {
  text-align: right;
}

.service-name,
.quantity,
.price {
  color: #1a2233;
  font-size: 0.9375rem;
}

.service-name {
  font-weight: 500;
}

.price {
  font-weight: 600;
}

.card-status {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.status-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.status-icon-paid {
  background-color: #00BB83;
}

.status-icon-unpaid {
  background-color: #DE5D93;
}

.status-badge-reason {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-badge {
  font-family: Geometria, var(--font-primary), sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: rgba(69, 69, 88, 1);
}

.status-reason {
  font-family: Geometria, var(--font-primary), sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5rem;
  color: rgba(69, 69, 88, 1);
}

.total-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a2233;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Empty State */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 50vh;
}

.empty-icon-wrapper {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #e8eef5 0%, #f3f6fa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  position: relative;
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.7;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a2233;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.9375rem;
  color: #8b9aaa;
  max-width: 320px;
}

.records-page {
  --sidebar-mobile: 64px;
  --gutter-mobile: 16px;
}
@media (max-width: 768px) {
  .records-page {
    --sidebar-mobile: 54px;
    --gutter-mobile: 16px;
    padding: 0;
    padding-top: 12px;
    padding-left: calc(var(--sidebar-mobile) + var(--gutter-mobile));
    padding-right: var(--gutter-mobile);
    min-height: 100vh;
  }

  .records-container {
    max-width: none;
    margin: 0;
    padding: 0;
  }

  .tabs-container {
    padding: 12px 0;
    gap: 0;
  }
  .tab-btn {
    padding: 12px 14px;
    font-size: 0.9rem;
    border-radius: 10px 0 0 10px;
  }

  .tab-btn:last-child {
    border-radius: 0 10px 10px 0;
  }

  .filled-content {
    padding: 12px 0;
  }
  .appointment-card {
    padding: 14px;
    border-radius: 12px;
  }

  .card-header {
    align-items: center;
  }
  .avatar {
    width: 38px;
    height: 38px;
  }
  .employee-name {
    font-size: 0.95rem;
  }
  .employee-specialty {
    font-size: 0.8rem;
  }
  .date-time {
    min-width: 74px;
  }
  .date {
    font-size: 0.9rem;
  }
  .time {
    font-size: 0.8rem;
  }

  .service-info {
    grid-template-columns: 1fr auto auto;
    gap: 8px;
    padding: 10px 0;
    margin-bottom: 12px;
  }
  .service-name-small {
    font-size: 0.72rem;
    margin-bottom: 6px;
  }
  .service-name,
  .quantity,
  .price {
    font-size: 0.9rem;
  }
  .price {
    text-align: right;
  }

  .status-icon {
    width: 36px;
    height: 36px;
  }
  .status-badge {
    font-size: 0.95rem;
  }
  .status-reason {
    font-size: 0.8rem;
  }
  .total-price {
    font-size: 1.1rem;
  }

  .empty-content {
    padding: 3rem 1.5rem;
  }

  .empty-icon-wrapper {
    width: 100px;
    height: 100px;
    position: relative;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

@media (max-width: 360px) {
  .records-page {
    --gutter-mobile: 12px;
  }
  .tab-btn {
    padding: 10px 12px;
    font-size: 0.85rem;
    border-radius: 8px 0 0 8px;
  }

  .tab-btn:last-child {
    border-radius: 0 8px 8px 0;
  }

  .appointment-card {
    padding: 12px;
  }
  .employee-name {
    font-size: 0.9rem;
  }
  .service-name,
  .quantity,
  .price {
    font-size: 0.875rem;
  }
  .status-icon {
    width: 32px;
    height: 32px;
  }
  .total-price {
    font-size: 1rem;
  }

  .empty-icon-wrapper {
    width: 90px;
    height: 90px;
    position: relative;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
