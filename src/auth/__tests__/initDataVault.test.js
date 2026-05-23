/**
 * Тесты для src/auth/initDataVault.js
 *
 * initDataVault — изолированное хранилище Telegram init_data.
 * Данные сохраняются в sessionStorage (и опционально localStorage).
 * Это критически важный модуль: потеря init_data = невозможность переавторизоваться.
 *
 * Что тестируется:
 * - storeInitData: корректное сохранение в sessionStorage
 * - getStoredInitData: чтение с валидацией (обязательно поле hash)
 * - initDataVault.has: проверка наличия данных
 * - initDataVault.clear: полная очистка, включая in-memory хранилище
 * - initDataVault.get: псевдоним для getStoredInitData
 *
 * Обфусцированный ключ хранилища ('webapp_init_vault_hash_8723') намеренно
 * проверяется явно — если ключ изменится, тесты сразу сломаются.
 *
 * В beforeEach вызывается initDataVault.clear() — сбрасывает и sessionStorage,
 * и in-memory переменную memoryStorage внутри модуля.
 * Без этого состояние утекало бы между тестами.
 *
 * logger мокируется чтобы вызовы logger.debug() внутри clear() и store()
 * не генерировали вывод в консоль при прогоне тестов.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { getStoredInitData, storeInitData, initDataVault } from '../initDataVault.js'

// Минимально валидная init_data: URL-encoded JSON пользователя + auth_date + hash
const VALID_INIT_DATA = 'user=%7B%22id%22%3A1%7D&auth_date=1234567890&hash=abc123'

describe('initDataVault', () => {
  beforeEach(() => {
    // clear() сбрасывает sessionStorage И внутреннюю переменную memoryStorage
    initDataVault.clear()
  })

  describe('storeInitData', () => {
    it('returns false for falsy input', () => {
      // Защита от случайного сохранения null/undefined/'' вместо реальных данных
      expect(storeInitData(null)).toBe(false)
      expect(storeInitData('')).toBe(false)
    })

    it('saves to sessionStorage', () => {
      storeInitData(VALID_INIT_DATA)
      // Проверяем по обфусцированному ключу — он должен оставаться стабильным
      expect(sessionStorage.getItem('webapp_init_vault_hash_8723')).toBe(VALID_INIT_DATA)
    })

    it('returns true on successful save', () => {
      // true = данные сохранены, можно продолжать авторизацию
      expect(storeInitData(VALID_INIT_DATA)).toBe(true)
    })
  })

  describe('getStoredInitData', () => {
    it('returns null when nothing is stored', () => {
      // После clear() хранилище пустое — возвращаем null, а не пустую строку
      expect(getStoredInitData()).toBeNull()
    })

    it('returns stored init data when it has a hash field', () => {
      // Данные валидны (содержат hash) — возвращаем как есть
      storeInitData(VALID_INIT_DATA)
      expect(getStoredInitData()).toBe(VALID_INIT_DATA)
    })

    it('returns null and clears storage for data without hash', () => {
      // Данные без поля hash — невалидны (нельзя верифицировать подпись Telegram)
      // getStoredInitData их удаляет и возвращает null
      const noHash = 'user=%7B%22id%22%3A1%7D&auth_date=1234567890'
      sessionStorage.setItem('webapp_init_vault_hash_8723', noHash)
      expect(getStoredInitData()).toBeNull()
      // Убеждаемся, что невалидные данные были удалены из storage
      expect(sessionStorage.getItem('webapp_init_vault_hash_8723')).toBeNull()
    })
  })

  describe('initDataVault.has', () => {
    it('returns false when vault is empty', () => {
      expect(initDataVault.has()).toBe(false)
    })

    it('returns true after storing data', () => {
      // has() проверяет sessionStorage И in-memory переменную
      storeInitData(VALID_INIT_DATA)
      expect(initDataVault.has()).toBe(true)
    })
  })

  describe('initDataVault.clear', () => {
    it('removes data from sessionStorage', () => {
      storeInitData(VALID_INIT_DATA)
      initDataVault.clear()
      expect(sessionStorage.getItem('webapp_init_vault_hash_8723')).toBeNull()
    })

    it('makes has() return false after clearing', () => {
      // clear() должен сбросить и sessionStorage, и memoryStorage
      storeInitData(VALID_INIT_DATA)
      initDataVault.clear()
      expect(initDataVault.has()).toBe(false)
    })

    it('makes getStoredInitData return null after clearing', () => {
      storeInitData(VALID_INIT_DATA)
      initDataVault.clear()
      expect(getStoredInitData()).toBeNull()
    })
  })

  describe('initDataVault.get', () => {
    it('is an alias for getStoredInitData', () => {
      // Объект initDataVault.get должен возвращать то же самое, что getStoredInitData
      storeInitData(VALID_INIT_DATA)
      expect(initDataVault.get()).toBe(getStoredInitData())
    })
  })
})
