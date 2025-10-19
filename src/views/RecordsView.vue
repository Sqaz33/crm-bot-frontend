<template>
  <div class="records-page">
    <div class="records-container review-view">
      <h2 class="records-title">Мои записи</h2>

      <!-- Tabs -->
      <div class="tabs-container">
        <button
          class="tab-btn1"
          :class="{ active: activeTab === 'current' }"
          @click="switchTab('current')"
        >
          Текущие
        </button>
        <button
          class="tab-btn2"
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
            style="cursor: pointer;"
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

            <!-- Кнопка "Оставить отзыв" только для прошедших -->
            <div
              v-if="activeTab === 'past'"
              class="leave-review"
              @click.stop
            >
              <button class="leave-review-btn">
                Оставить отзыв
              </button>
            </div>
          </div>
        </div>

        <!-- Если записей нет -->
        <div v-else class="content">
          <img
            :src="activeTab === 'past'
              ? 'src/assets/emptyRecordPast.svg'
              : 'src/assets/emptyRecord.svg'"
            alt="Нет записей"
            class="empty-icon"
          />
          <p1>
            {{
              activeTab === 'past'
                ? 'Нет прошедших записей'
                : 'Увы, ничего не запланировано'
            }}
          </p1>
          <p2>
            {{
              activeTab === 'past'
                ? 'У Вас еще не было завершенных записей'
                : 'У Вас ни одной активной записи'
            }}
          </p2>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import SidebarMenu from '../components/Sidebar.vue'
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
const menuItems = [
  { label: 'Кошелёк', path: '/wallet' },
  { label: 'Магазин', path: '/shop' },
  { label: 'Отзывы', path: '/reviews' },
  { label: 'О компании', path: '/company' }
]

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



.content {
  flex: 1;
  display: flex;
  padding: 6rem;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
}
.content p1 {
  font-size: clamp(0.75rem,4vw,1.2rem);
}

.content p2{
  font-size: clamp(0.6rem,3vw,1rem);
}
.records-page {
  display: flex;
  min-height: 100vh;
  background-color: #f6f9fc;
  font-family: var(--font-primary);
}

.sidebar {
  width: 200px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 1rem;
}

.records-container {
  flex: 1;
  padding: 1.5rem;
  text-align: center;
}

.records-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.tab {
  flex: 1;
  max-width: 200px;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  background-color: #eaeaea;
  cursor: pointer;
  font-size: 1rem;
}

.review-view {
  padding: 1rem clamp(1rem, 10vw, 15rem);
  width: 100%;
  background-color: var(--light-color);
}

.tabs-container {
  display: flex;
  justify-content: center;
  box-shadow: 0 0.3px  #6f6f6f97;
  border-radius: 10px;
  margin-bottom: 1rem;
}
.tab-btn1,
.tab-btn2 {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background-color: white;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 500;
  color: #6f6f6f97;
  cursor: pointer;
  font-size: 1rem;
}
.tab.active {
  background-color: #d0d0d0;
  font-weight: 600;
}
.tab-btn1 {
  border-radius: 10px 0px 0px 10px;
}
.tab-btn2 {
  border-radius: 0px 10px 10px 0px;
}
.tab-btn1.active,
.tab-btn2.active {
  background: #ddd;
  color: var(--color-dark);
}
.tab-btn1:hover:not(.active),
.tab-btn2:hover:not(.active) {
  background: #f1f1f1;
}
.filled-content {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.appointment-card {
  border-radius: 10px;
  box-shadow: 0 0.3px  #6f6f6f97;
  padding: clamp(0.6rem, 1.2vw, 1.5rem);
  background-color: white;
}
.card-header {
  display: flex;
  gap: clamp(0.2rem, 0.7vw, 1rem);
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}
.employee-info {
  flex: 1;
}
.employee-name {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
.employee-specialty {
  color: var(--color-dark);
  font-size: 0.875rem;
}
.date-time {
  text-align: right;
}
.date {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
.time {
  color: var(--color-dark);
  font-size: 1rem;
}

.service-info {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: clamp(0.1rem, 0.3vw, 0.5rem);
  margin-bottom: 0.5rem;
  padding: clamp(0.2rem, 2vw, 0.6rem) 0;
  border-bottom: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
}
.service-name-small:nth-child(3), .price {
  text-align: right;
}
.service-name-small {
  font-weight: 300;
  color: #a9a9a9;
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
}
.quantity, .service-name, .price  {
  color: var(--color-dark);
  font-size: 1rem;
}
.service-name, .price {
  font-weight: 600;
}

.card-status {
  display: flex;
  gap: clamp(0.2rem, 0.7vw, 1rem);
  justify-content: space-between;
  padding: clamp(0.2rem, 2vw, 0.5rem) 0 0 clamp(0.2rem, 1.5vw, 0.5rem);
  align-items: flex-start;
  margin-bottom: 0.5rem;
}
.status-info{
  display: flex;
  gap: clamp(0.2rem, 0.7vw, 1rem);
  align-items: flex-start;
}
.status-icon{
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.status-badge-reason{
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.status-badge {
  padding: 0;
  font-size: 1rem;
  font-weight: 500;
}
.status-reason {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.3;
  font-style: italic;
}
.total-price {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-dark);
  white-space: nowrap;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.leave-review
{
  display: flex;
  justify-content: right;
  border-radius: 10px;
  padding: 0 0 0 70%;
  margin-bottom: 0rem;
}
.leave-review-btn
{
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background-color: #2F80EC;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 470;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
}
.leave-review-btn:hover:not(.active) 
{
  background: #3d91ff;
}
@media (max-width: 900px) {
  .review-view {
  padding: 1rem clamp(1rem, 5vw, 15rem) 1rem  clamp(2rem, 14vw, 15rem);
  width: 100%;
  }
  .leave-review
  {
    padding: 0;
  }
  .leave-review-btn
  {
    padding: 0.6rem 1rem;
    margin-top: 0.2rem;
  }
  .employee-name, .price, .total-price, .service-name, .status-badge
  {
    font-weight: 540;
  }
  .status-badge{
    font-weight: 470;
  }
}
</style>
