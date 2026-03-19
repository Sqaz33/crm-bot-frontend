<template>
  <div
    class="bg-white rounded-xl shadow-card p-3 md:p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    @click="goToVisit"
  >
    <div class="flex items-start gap-3 mb-2.5 md:mb-3">
      <Avatar :name="safeStaffName" size="sm" class="md:size-normal" />

      <div class="flex-1 min-w-0">
        <div class="font-semibold text-neutral-800 text-sm md:text-base leading-tight mb-0.5">
          {{ safeStaffName }}
        </div>
        <div class="text-neutral-600 text-xs md:text-sm leading-tight">
          {{ safeSpecializations }}
        </div>
      </div>
    </div>

    <div class="text-neutral-500 text-xs md:text-sm mb-2">
      {{ formatDateShort(visit.visit_date_time) }}, {{ formatTimeOnly(visit.visit_date_time) }}
    </div>

    <div class="border-t border-neutral-200 mb-2.5 md:mb-3"></div>

    <div class="flex justify-between items-start gap-3">
      <VisitStatus :status="visit.status" compact size="sm" />

      <div class="font-medium text-neutral-800 text-sm md:text-base whitespace-nowrap flex-shrink-0 leading-tight">
        {{ safePrice }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDateShort, formatTimeOnly } from '../../utils/dateFormatters'
import Avatar from '../staff/Avatar.vue'
import VisitStatus from '../record/VisitStatus.vue'

const props = defineProps({
  visit: {
    type: Object,
    required: true
  },
  isOld: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const safeStaffName = computed(() => {
  return props.visit?.staff?.name ?? '-'
})

const safeSpecializations = computed(() => {
  const specs = props.visit?.staff?.specializations
  return Array.isArray(specs) && specs.length ? specs.join(', ') : '-'
})

const safePrice = computed(() => {
  const price = props.visit?.service?.price
  return price != null ? `${price} ₽` : '-'
})

function goToVisit() {
  router.push({
    name: 'record',
    params: { id: props.visit.id },
    query: { isOld: props.isOld.toString() }
  })
}
</script>