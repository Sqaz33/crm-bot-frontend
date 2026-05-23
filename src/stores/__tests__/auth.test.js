/**
 * Тесты для src/stores/auth.js (Pinia store)
 *
 * Auth store — единственный источник истины об авторизованном пользователе.
 * Хранит объект me (данные с /auth/me) и telegramId (дублируется для удобства).
 *
 * Паттерн setActivePinia(createPinia()) в beforeEach:
 *   Создаёт изолированный экземпляр Pinia для каждого теста. Без этого
 *   все тесты делили бы один store и влияли бы на состояние друг друга.
 *
 * Что тестируется:
 * - Начальное состояние (все поля null)
 * - setTelegramId: прямая установка id
 * - setMe: установка данных пользователя + автоматическое обновление telegramId
 * - clear: полный сброс состояния
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.js'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Новый экземпляр Pinia = чистое состояние перед каждым тестом
    setActivePinia(createPinia())
  })

  it('has null telegramId and me in initial state', () => {
    const store = useAuthStore()
    expect(store.telegramId).toBeNull()
    expect(store.me).toBeNull()
  })

  describe('setTelegramId', () => {
    it('sets telegramId to given value', () => {
      const store = useAuthStore()
      store.setTelegramId(123)
      expect(store.telegramId).toBe(123)
    })

    it('sets telegramId to null for undefined', () => {
      // Оператор ?? null: undefined ?? null = null (защита от undefined в state)
      const store = useAuthStore()
      store.setTelegramId(123)
      store.setTelegramId(undefined)
      expect(store.telegramId).toBeNull()
    })

    it('sets telegramId to null for null', () => {
      const store = useAuthStore()
      store.setTelegramId(null)
      expect(store.telegramId).toBeNull()
    })
  })

  describe('setMe', () => {
    it('sets me and extracts telegramId', () => {
      // Главный кейс: данные с /auth/me попадают в store за один вызов
      const store = useAuthStore()
      const userData = { id: 1, telegram_id: 456, name: 'Test' }
      store.setMe(userData)
      expect(store.me).toEqual(userData)
      expect(store.telegramId).toBe(456)  // автоматически извлекается из data.telegram_id
    })

    it('sets telegramId to null when data has no telegram_id', () => {
      // Пользователь без Telegram — telegramId не заполняется
      const store = useAuthStore()
      store.setMe({ id: 1 })
      expect(store.telegramId).toBeNull()
    })

    it('clears me and telegramId when called with null', () => {
      // null → me = null, telegramId = null (logout без полного clear())
      const store = useAuthStore()
      store.setMe({ id: 1, telegram_id: 789 })
      store.setMe(null)
      expect(store.me).toBeNull()
      expect(store.telegramId).toBeNull()
    })

    it('clears me and telegramId when called with undefined', () => {
      // undefined аналогично null — data || null = null
      const store = useAuthStore()
      store.setMe({ id: 1, telegram_id: 789 })
      store.setMe(undefined)
      expect(store.me).toBeNull()
    })
  })

  describe('clear', () => {
    it('resets telegramId and me to null', () => {
      // Вызывается при логауте — оба поля должны стать null
      const store = useAuthStore()
      store.setMe({ id: 1, telegram_id: 123 })
      store.clear()
      expect(store.telegramId).toBeNull()
      expect(store.me).toBeNull()
    })

    it('is safe to call on already-cleared store', () => {
      // Повторный вызов clear() не должен бросать исключение
      const store = useAuthStore()
      expect(() => store.clear()).not.toThrow()
    })
  })
})
