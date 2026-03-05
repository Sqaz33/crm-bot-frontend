<template>
  <div class="min-h-screen bg-neutral-100 pt-6">
    <div class="max-w-phone mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Tabs -->
      <div class="mb-8 flex justify-center">
        <TabsButton
          :tabs="tabsList"
          :active-tab="activeTab"
          @select="switchTab"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-neutral-600 text-base">Загрузка...</div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Records List -->
        <div v-if="visits.length > 0" class="space-y-3 pb-8">
          <VisitCard
            v-for="visit in visits"
            :key="visit.id"
            :visit="visit"
            :is-old="activeTab === 'past'"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-16">
          <div class="w-32 h-32 bg-gradient-to-br from-neutral-200 to-neutral-100 rounded-full flex items-center justify-center mb-6">
            <img
              src="../assets/emptyRecord.svg"
              alt="Нет записей"
              class="w-16 h-16 opacity-70"
            />
          </div>
          <p class="text-neutral-600 text-base text-center max-w-xs">
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
import { getStaff, getService } from '../utils/staffServiceCache'
import { formatDateShort, formatTimeOnly } from '../utils/dateFormatters'
import { logger } from '../utils/logger'
import TabsButton from '../components/ui/TabsButton.vue'
import VisitCard from '../components/VisitCard.vue'

const tabsList = [
  { id: 'current', label: 'Текущие' },
  { id: 'past', label: 'Прошедшие' }
]

// AbortController для отмены предыдущего запроса при переключении вкладок
let currentAbortController = null
// Отслеживаем, какая вкладка была запрошена (для защиты от устаревших ответов)
let requestedTab = null

const visits = ref([])
const loading = ref(true)
const activeTab = ref('current')
const tabKey = 'ACTIVE_TAB'

// --- API загрузка ---
async function fetchVisits(tab) {
  // Отменяем предыдущий запрос, если он ещё выполняется
  if (currentAbortController) {
    currentAbortController.abort();
  }
  
  currentAbortController = new AbortController();
  requestedTab = tab;
  
  loading.value = true;
  visits.value = [];

  const url = tab === "current" ? "/visits/current/" : "/visits/old/";
  logger.info('fetchVisits: загрузка записей', { tab, url });

  try {
    const { data: rawVisits } = await api.get(url, {
      signal: currentAbortController.signal
    });

    // Проверяем, что вкладка не изменилась с момента начала запроса
    if (requestedTab !== tab) {
      logger.debug('fetchVisits: вкладка изменилась, игнорируем ответ', { requestedTab, currentTab: tab });
      return;
    }

    if (!Array.isArray(rawVisits)) {
      logger.error('fetchVisits: сервер вернул не массив', { rawVisits });
      visits.value = [];
      return;
    }

    logger.info('fetchVisits: получено записей', { count: rawVisits.length });

    let processedCount = 0;
    const mapped = await Promise.all(
      rawVisits.map(async (v, i) => {
        const staff = await getStaff(v.staff_id)
        const service = await getService(v.service_id)
        const enriched = { ...v, staff, service }

        processedCount++;
        if (processedCount % 10 === 0 || processedCount === rawVisits.length) {
        logger.debug?.('fetchVisits: обработано записей', { processed: processedCount, total: rawVisits.length });
        }
        return enriched;
      })
    );

    // СОРТИРОВКА: первые записи первыми
    const sortedVisits = mapped.sort((a, b) => {
      return new Date(a.visit_date_time) - new Date(b.visit_date_time);
    });

    visits.value = sortedVisits;
    logger.info('fetchVisits: завершено', { total: mapped.length });
  } catch (err) {
    // Игнорируем ошибку отмены запроса
    if (err.name === 'AbortError') {
      logger.debug('fetchVisits: запрос отменён', { tab });
      return;
    }
    logger.error('fetchVisits: ошибка загрузки', { error: err.message, url });
    visits.value = [];
  } finally {
    loading.value = false;
    // Очищаем ссылку на AbortController после завершения
    if (currentAbortController?.signal.aborted === false) {
      currentAbortController = null;
    }
  }
}

function switchTab(tab) {
  activeTab.value = tab;
  localStorage.setItem(tabKey, tab);
  fetchVisits(tab);
}

function loadCurTab() {
  activeTab.value = localStorage.getItem(tabKey) || "current";
}

onMounted(() => {
  loadCurTab();
  fetchVisits(activeTab.value);
});
</script>

