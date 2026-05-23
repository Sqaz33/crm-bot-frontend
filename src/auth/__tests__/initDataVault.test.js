import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { getStoredInitData, storeInitData, initDataVault } from '../initDataVault.js'

const VALID_INIT_DATA = 'user=%7B%22id%22%3A1%7D&auth_date=1234567890&hash=abc123'

describe('initDataVault', () => {
  beforeEach(() => {
    initDataVault.clear()
  })

  describe('storeInitData', () => {
    it('returns false for falsy input', () => {
      expect(storeInitData(null)).toBe(false)
      expect(storeInitData('')).toBe(false)
    })

    it('saves to sessionStorage', () => {
      storeInitData(VALID_INIT_DATA)
      expect(sessionStorage.getItem('webapp_init_vault_hash_8723')).toBe(VALID_INIT_DATA)
    })

    it('returns true on successful save', () => {
      expect(storeInitData(VALID_INIT_DATA)).toBe(true)
    })
  })

  describe('getStoredInitData', () => {
    it('returns null when nothing is stored', () => {
      expect(getStoredInitData()).toBeNull()
    })

    it('returns stored init data when it has a hash field', () => {
      storeInitData(VALID_INIT_DATA)
      expect(getStoredInitData()).toBe(VALID_INIT_DATA)
    })

    it('returns null and clears storage for data without hash', () => {
      const noHash = 'user=%7B%22id%22%3A1%7D&auth_date=1234567890'
      sessionStorage.setItem('webapp_init_vault_hash_8723', noHash)
      expect(getStoredInitData()).toBeNull()
      expect(sessionStorage.getItem('webapp_init_vault_hash_8723')).toBeNull()
    })
  })

  describe('initDataVault.has', () => {
    it('returns false when vault is empty', () => {
      expect(initDataVault.has()).toBe(false)
    })

    it('returns true after storing data', () => {
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
      storeInitData(VALID_INIT_DATA)
      expect(initDataVault.get()).toBe(getStoredInitData())
    })
  })
})
