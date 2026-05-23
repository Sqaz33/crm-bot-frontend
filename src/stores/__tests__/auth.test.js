import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.js'

describe('useAuthStore', () => {
  beforeEach(() => {
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
      const store = useAuthStore()
      const userData = { id: 1, telegram_id: 456, name: 'Test' }
      store.setMe(userData)
      expect(store.me).toEqual(userData)
      expect(store.telegramId).toBe(456)
    })

    it('sets telegramId to null when data has no telegram_id', () => {
      const store = useAuthStore()
      store.setMe({ id: 1 })
      expect(store.telegramId).toBeNull()
    })

    it('clears me and telegramId when called with null', () => {
      const store = useAuthStore()
      store.setMe({ id: 1, telegram_id: 789 })
      store.setMe(null)
      expect(store.me).toBeNull()
      expect(store.telegramId).toBeNull()
    })

    it('clears me and telegramId when called with undefined', () => {
      const store = useAuthStore()
      store.setMe({ id: 1, telegram_id: 789 })
      store.setMe(undefined)
      expect(store.me).toBeNull()
    })
  })

  describe('clear', () => {
    it('resets telegramId and me to null', () => {
      const store = useAuthStore()
      store.setMe({ id: 1, telegram_id: 123 })
      store.clear()
      expect(store.telegramId).toBeNull()
      expect(store.me).toBeNull()
    })

    it('is safe to call on already-cleared store', () => {
      const store = useAuthStore()
      expect(() => store.clear()).not.toThrow()
    })
  })
})
