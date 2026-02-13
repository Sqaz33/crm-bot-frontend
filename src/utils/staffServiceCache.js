/**
 * Кэшированные запросы staff и services.
 * Используется в RecordView и RecordsView для обогащения визитов.
 */

import api from '../api'
import { logger } from '../utils/logger'

const staffCache = {}
const servicesCache = {}

/**
 * Получить сотрудника по id (с кэшированием).
 * @param {string|number} staff_id
 * @returns {Promise<Object>}
 */
export async function getStaff(staff_id) {
  if (staffCache[staff_id]) return staffCache[staff_id]
  try {
    const { data } = await api.get(`/staff/${staff_id}`)
    staffCache[staff_id] = data
    return data
  } catch (error) {
    logger.error('getStaff: ошибка при запросе сотрудника', {
      staff_id,
      status: error?.response?.status,
      responseData: error?.response?.data,
      message: error?.message
    })
    throw error
  }
}

/**
 * Получить услугу по id (с кэшированием).
 * @param {string|number} service_id
 * @returns {Promise<Object>}
 */
export async function getService(service_id) {
  if (servicesCache[service_id]) return servicesCache[service_id]
  try {
    if (Object.keys(servicesCache).length === 0) {
      const { data: arr } = await api.get('/services/')
      arr.forEach((s) => {
        servicesCache[s.id] = s
      })
    }
    return servicesCache[service_id]
  } catch (error) {
    logger.error('getService: ошибка при запросе услуги', {
      service_id,
      status: error?.response?.status,
      responseData: error?.response?.data,
      message: error?.message
    })
    throw error
  }
}
