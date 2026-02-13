/**
 * Кэшированные запросы staff и services.
 * Используется в RecordView и RecordsView для обогащения визитов.
 */

import api from '../api'
import { logger } from '../utils/logger'

const staffCache = {}
const servicesCache = {}
let staffPromises = null
let servicesPromise = null

/**
 * Получить сотрудника по id (с кэшированием).
 * @param {string|number} staff_id
 * @returns {Promise<Object>}
 */
export async function getStaff(staff_id) {
  if (staffCache[staff_id]) return staffCache[staff_id]
  
  // Если промис уже существует, ждём его результат
  if (staffPromises[staff_id]) {
    await staffPromises[staff_id]
    return staffCache[staff_id]
  }
  
  try {
    staffPromises[staff_id] = api.get(`/staff/${staff_id}`)
    const { data } = await staffPromises[staff_id]
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
  } finally {
    delete staffPromises[staff_id]
  }
}

/**
 * Получить услугу по id (с кэшированием).
 * @param {string|number} service_id
 * @returns {Promise<Object>}
 */
export async function getService(service_id) {
  if (servicesCache[service_id]) return servicesCache[service_id]
  
  // Если промис уже существует, ждём его результат
  if (servicesPromise) {
    await servicesPromise
    return servicesCache[service_id]
  }
  
  try {
    servicesPromise = api.get('/services/')
    const { data: arr } = await servicesPromise
    arr.forEach((s) => {
      servicesCache[s.id] = s
    })
    return servicesCache[service_id]
  } catch (error) {
    logger.error('getService: ошибка при запросе услуги', {
      service_id,
      status: error?.response?.status,
      responseData: error?.response?.data,
      message: error?.message
    })
    throw error
  } finally {
    servicesPromise = null
  }
}
