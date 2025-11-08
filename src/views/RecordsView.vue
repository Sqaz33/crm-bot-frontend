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
                  {{ visit.staff.specializations.join(', ') }}
                </div>
              </div>
              <div class="date-time">
                <div class="date">
                  {{ formatDate(visit.visit_date_time).split(' ')[0] }}
                </div>
                <div class="time">
                  {{ formatDate(visit.visit_date_time).split(' ')[1] }}
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
                  v-if="activeTab === 'past'"
                  src="../assets/checkmarkIcon.svg"
                  alt="Оплачено"
                  class="status-icon"
                />
                <img
                  v-else
                  src="../assets/crossIcon.svg"
                  alt="Не оплачено"
                  class="status-icon"
                />
                <div class="status-badge-reason">
                  <span class="status-badge">
                    {{ activeTab === 'past' ? 'Оплачено' : 'Не оплачено' }}
                  </span>
                  <div class="status-reason">
                    {{
                      activeTab === 'past'
                        ? 'Визит прошел успешно'
                        : 'Визит отменен / клиент не пришел'
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
          <p class="empty-title">
            {{
              activeTab === 'past'
                ? 'Нет прошедших записей'
                : 'Увы, ничего не запланировано'
            }}
          </p>
          <p class="empty-description">
            {{
              activeTab === 'past'
                ? 'У Вас еще не было завершенных записей'
                : 'У Вас ни одной активной записи'
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

const router = useRouter()

function goToVisit(id, isOld) {
  router.push({
    name: 'record',
    params: { id },
    query: { isOld: isOld.toString() } 
  })
}

const visits = ref([])
const loading = ref(true)
const activeTab = ref('current')

// --- КЭШ ---
const staffCache = {}
const servicesCache = {}

async function getStaff(staff_id) {
  if (staffCache[staff_id]) return staffCache[staff_id]
  const { data } = await api.get(`/salon/staff/${staff_id}`)
  staffCache[staff_id] = data
  return data
}

async function getService(service_id) {
  if (servicesCache[service_id]) return servicesCache[service_id]
  if (Object.keys(servicesCache).length === 0) {
    const { data: arr } = await api.get(`/services/`)
    arr.forEach(s => { servicesCache[s.id] = s })
  }
  return servicesCache[service_id]
}

// --- API загрузка ---
async function fetchVisits(tab) {
  loading.value = true
  visits.value = []

  const url = tab === 'current' ? '/visits/current/' : '/visits/old/'
  console.log(`Загружаем данные с: ${url}`)

  try {
    const { data: rawVisits } = await api.get(url)

    if (!Array.isArray(rawVisits)) {
      console.error('Сервер вернул не массив:', rawVisits)
      visits.value = []
      return
    }

    console.log(`Получено ${rawVisits.length} записей`)
    if (rawVisits.length > 0) console.log('Первый элемент (сырой):', rawVisits[0])

    let processedCount = 0
    const mapped = await Promise.all(
      rawVisits.map(async (v, i) => {
        const staff = await getStaff(v.staff_id)
        const service = await getService(v.service_id)
        const enriched = { ...v, staff, service }

        processedCount++
        if (i === 0) console.log('Первый элемент после обработки:', enriched)
        if (processedCount % 10 === 0 || processedCount === rawVisits.length)
          console.log(`Обработано ${processedCount} из ${rawVisits.length}`)
        return enriched
      })
    )

    visits.value = mapped
    console.log(`Всего обработано ${mapped.length} записей`)
  } catch (err) {
    console.error('Ошибка при загрузке или обработке:', err)
    visits.value = []
  } finally {
    loading.value = false
    console.log('Завершено обновление данных\n')
  }
}

function switchTab(tab) {
  activeTab.value = tab
  fetchVisits(tab)
}

function formatDate(iso) {
  const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
  
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => fetchVisits(activeTab.value))
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
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f6f9fc;
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
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tab-btn.active {
  background-color: #5073f0;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(80, 115, 240, 0.2);
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
}

.status-badge-reason {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-badge {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1a2233;
}

.status-reason {
  color: #8b9aaa;
  font-size: 0.8125rem;
  line-height: 1.3;
  font-style: italic;
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
}

.empty-icon-wrapper {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #e8eef5 0%, #f3f6fa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.7;
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

/* Responsive */
@media (max-width: 768px) {
  .filled-content {
    padding: 0.75rem;
  }

  .appointment-card {
    padding: 1rem;
  }

  .card-header {
    gap: 0.75rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .employee-name {
    font-size: 0.9375rem;
  }

  .service-info {
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .total-price {
    font-size: 1.125rem;
  }

  .empty-content {
    padding: 3rem 1.5rem;
  }

  .empty-icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
  }
}
</style>