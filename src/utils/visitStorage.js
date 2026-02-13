/**
 * Утилиты для работы с visit_data в localStorage.
 * Используется при записи на приём (услуги, сотрудник, дата/время).
 */

import { logger } from '../utils/logger'

export const VISIT_KEY = 'visit_data'

export const DEFAULT_VISIT = {
  staff_id: '',
  services_id: [],
  visit_time: { start_time: '', end: '' },
  comment: ''
}

/**
 * Читает данные визита из localStorage.
 * @returns {Object} Объект визита (с дефолтными значениями при ошибке)
 */
export function readVisit() {
  try {
    const raw = localStorage.getItem(VISIT_KEY)
    if (!raw) return { ...DEFAULT_VISIT }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_VISIT, ...parsed }
  } catch {
    return { ...DEFAULT_VISIT }
  }
}

/**
 * Записывает данные визита в localStorage и опционально в cookie.
 * @param {Object} visit - Объект визита
 * @param {Object} [options] - Опции
 * @param {boolean} [options.syncCookie] - Синхронизировать в cookie (по умолчанию false)
 */
export function writeVisit(visit, options = {}) {
  try {
    const str = JSON.stringify(visit)
    localStorage.setItem(VISIT_KEY, str)
    window.dispatchEvent(new CustomEvent('local-storage-changed'))

    if (options.syncCookie) {
      const cookieValue = encodeURIComponent(str)
      document.cookie = `${VISIT_KEY}=${cookieValue}; path=/; SameSite=Lax;`
    }
  } catch (e) {
    logger.warn('writeVisit: ошибка записи', { error: e?.message })
  }
}

/**
 * Удаляет данные визита из localStorage и cookie.
 */
export function clearVisit() {
  try {
    localStorage.removeItem(VISIT_KEY)
    window.dispatchEvent(new CustomEvent('local-storage-changed'))
    document.cookie = `${VISIT_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
  } catch (e) {
    logger.warn('clearVisit: ошибка очистки', { error: e?.message })
  }
}

/**
 * Сырое чтение без дефолтов (для случаев, когда нужна другая структура).
 * @returns {Object|null} Распарсенные данные или null
 */
export function getRawVisit() {
  try {
    const raw = localStorage.getItem(VISIT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Ожидает появления visit_time в localStorage (например, после возврата со страницы DateTime).
 * @param {number} [timeoutMs=300000]
 * @param {number} [intervalMs=100]
 * @returns {Promise<string>} start_time
 */
export async function waitForVisitTime(timeoutMs = 300000, intervalMs = 100) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const raw = localStorage.getItem(VISIT_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data?.visit_time?.start_time) {
          return data.visit_time.start_time
        }
      } catch (e) {
    logger.warn('waitForVisitTime: ошибка парсинга localStorage', { error: e?.message })
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error('Дата визита не появилась в localStorage за отведенное время.')
}
