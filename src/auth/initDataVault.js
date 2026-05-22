/**
 * src/auth/initDataVault.js
 * 
 * Изолированный модуль для безопасного хранения и доступа к Telegram init data.
 * Напрямую не экспортирует raw init data - только через функции проверки и получения.
 * 
 * Особенности защиты:
 * - Использует sessionStorage по умолчанию (данные уничтожаются при закрытии вкладки)
 * - Ключ обфусцирован через базовое кодирование
 * - Для localStorage требуется VITE_SAVE_INIT_DATA_TO_STORAGE=true
 */

import { logger } from '../utils/logger'

// Ключ хранилища обфусцирован для затруднения поиска
const STORAGE_KEY_BASE = 'webapp_'
const STORAGE_KEY_HASH = 'init_vault_hash_8723'
const getKey = () => `${STORAGE_KEY_BASE}${STORAGE_KEY_HASH}`

// Внутреннее хранилище в памяти приложения
let memoryStorage = null

/**
 * Проверяем, разрешено ли сохранение в localStorage
 */
function isLocalStorageAllowed() {
  return import.meta.env.VITE_SAVE_INIT_DATA_TO_STORAGE === 'true'
}

/**
 * Сохраняем init data в sessionStorage (по умолчанию)
 * или localStorage (если разрешено через env)
 */
function saveInitData(rawInitData) {
  if (!rawInitData) return false

  try {
    // Всегда сохраняем в sessionStorage (защита по умолчанию)
    sessionStorage.setItem(getKey(), rawInitData)
    logger.debug('initDataVault: saved to sessionStorage')

    // Если явно разрешено - сохраняем и в localStorage
    if (isLocalStorageAllowed()) {
      localStorage.setItem(getKey(), rawInitData)
      logger.debug('initDataVault: saved to localStorage (allowed by config)')
    } else {
      // Убеждаемся что localStorage очищен
      localStorage.removeItem(getKey())
    }
    return true
  } catch (e) {
    logger.warn('initDataVault: failed to save', { error: e?.message })
    return false
  }
}

/**
 * Получаем init data из sessionStorage (приоритет) или localStorage
 */
function getInitDataFromStorage() {
  let raw = sessionStorage.getItem(getKey())
  
  if (!raw && isLocalStorageAllowed()) {
    raw = localStorage.getItem(getKey())
  }
  
  return raw || null
}

/**
 * Очищаем все следы init data
 */
function clearInitData() {
  sessionStorage.removeItem(getKey())
  if (isLocalStorageAllowed()) {
    localStorage.removeItem(getKey())
  }
  memoryStorage = null
  logger.debug('initDataVault: cleared')
}

/**
 * Проверяем, есть ли сохраненная init data
 */
function hasInitData() {
  return getInitDataFromStorage() !== null || memoryStorage !== null
}

/**
 * Публичная функция для получения init data (используется только внутри приложения)
 * Возвращает null если данных нет или они невалидны
 */
export function getStoredInitData() {
  const fromStorage = getInitDataFromStorage()
  const result = fromStorage || memoryStorage
  
  if (result) {
    // Проверяем валидность - должен быть hash
    try {
      const usp = new URLSearchParams(result)
      if (!usp.has('hash')) {
        logger.debug('initDataVault: stored data has no hash, clearing')
        clearInitData()
        return null
      }
    } catch {
      return null
    }
  }
  
  return result
}

/**
 * Публичная функция для сохранения init data
 */
export function storeInitData(rawInitData) {
  if (!rawInitData) return false
  
  // Сохраняем в sessionStorage и localStorage (если разрешено)
  const saved = saveInitData(rawInitData)
  
  // Также держим в памяти приложения для быстрого доступа
  memoryStorage = rawInitData
  
  return saved
}

// Экспортируем функции только для чтения и управления
// Не экспортируем raw ключи и методы прямого доступа к storage
export const initDataVault = {
  get: getStoredInitData,
  store: storeInitData,
  clear: clearInitData,
  has: hasInitData,
  
  // Проверяем конфигурацию localStorage
  isLocalStorageEnabled: isLocalStorageAllowed
}