import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../../api/auth.js', () => ({
  getMe: vi.fn(),
  loginViaTelegram: vi.fn(),
  loginViaMAX: vi.fn(),
  loginViaMAXResolveSalonID: vi.fn(),
}))

vi.mock('../../utils/initData.js', () => ({
  getInitData: vi.fn(),
}))

vi.mock('../../utils/logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { ensureSession } from '../ensureSession.js'
import { getMe, loginViaTelegram, loginViaMAX, loginViaMAXResolveSalonID } from '../../api/auth.js'
import { getInitData } from '../../utils/initData.js'
import { useAuthStore } from '../../stores/auth.js'

describe('ensureSession', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('returns user data immediately when SALON_ID exists and /auth/me returns 200', async () => {
    sessionStorage.setItem('SALON_ID', '1')
    const userData = { id: 1, telegram_id: 123 }
    getMe.mockResolvedValueOnce({ status: 200, data: userData })

    const result = await ensureSession()

    expect(result).toEqual(userData)
    expect(useAuthStore().me).toEqual(userData)
    expect(loginViaTelegram).not.toHaveBeenCalled()
  })

  it('falls through to Telegram login when SALON_ID exists but /auth/me returns 401', async () => {
    sessionStorage.setItem('SALON_ID', '1')
    const userData = { id: 1, telegram_id: 123 }
    getMe
      .mockResolvedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ status: 200, data: userData })
    getInitData.mockReturnValueOnce('init_data_string')
    loginViaTelegram.mockResolvedValueOnce({})

    const result = await ensureSession()

    expect(loginViaTelegram).toHaveBeenCalledWith('init_data_string')
    expect(result).toEqual(userData)
  })

  it('throws error with code NO_INIT_DATA when initData is absent', async () => {
    getInitData.mockReturnValueOnce(null)

    await expect(ensureSession()).rejects.toMatchObject({ code: 'NO_INIT_DATA' })
  })

  it('logs in via Telegram when no SALON_ID and Telegram platform', async () => {
    const userData = { id: 2, telegram_id: 456 }
    getInitData.mockReturnValueOnce('tg_init_data')
    loginViaTelegram.mockResolvedValueOnce({})
    getMe.mockResolvedValueOnce({ status: 200, data: userData })

    const result = await ensureSession()

    expect(loginViaTelegram).toHaveBeenCalledWith('tg_init_data')
    expect(result).toEqual(userData)
  })

  it('calls loginViaMAX when SALON_ID exists and isMAX is true', async () => {
    sessionStorage.setItem('SALON_ID', '5')
    sessionStorage.setItem('max_frontend', 'true')
    const userData = { id: 3 }
    getMe
      .mockResolvedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ status: 200, data: userData })
    getInitData.mockReturnValueOnce('max_init_data')
    loginViaMAX.mockResolvedValueOnce({})

    const result = await ensureSession()

    expect(loginViaMAX).toHaveBeenCalledWith('max_init_data')
    expect(loginViaTelegram).not.toHaveBeenCalled()
    expect(result).toEqual(userData)
  })

  it('resolves salon ID via MAX when no SALON_ID and isMAX is true', async () => {
    sessionStorage.setItem('max_frontend', 'true')
    const userData = { id: 4 }
    getInitData.mockReturnValueOnce('max_init_data')
    loginViaMAXResolveSalonID.mockResolvedValueOnce({ data: { salon_id: 99 } })
    getMe.mockResolvedValueOnce({ status: 200, data: userData })

    const result = await ensureSession()

    expect(loginViaMAXResolveSalonID).toHaveBeenCalledWith('max_init_data')
    expect(sessionStorage.getItem('SALON_ID')).toBe('99')
    expect(result).toEqual(userData)
  })

  it('returns null when final /auth/me does not return 200', async () => {
    getInitData.mockReturnValueOnce('init_data')
    loginViaTelegram.mockResolvedValueOnce({})
    getMe.mockResolvedValueOnce({ status: 500, data: null })

    const result = await ensureSession()

    expect(result).toBeNull()
  })

  it('rethrows errors from /auth/me when SALON_ID exists', async () => {
    sessionStorage.setItem('SALON_ID', '1')
    const networkError = new Error('Network failed')
    networkError.response = { status: 503 }
    getMe.mockRejectedValueOnce(networkError)

    await expect(ensureSession()).rejects.toThrow('Network failed')
  })
})
