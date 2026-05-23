/**
 * Тесты для src/auth/ensureSession.js
 *
 * ensureSession — главная точка входа авторизации. Каждый раз при открытии
 * приложения App.vue вызывает эту функцию. Она определяет:
 *   1. Если есть SALON_ID и /auth/me отвечает 200 — сессия валидна, возвращаем данные
 *   2. Если /auth/me вернул не-200 — нужно перелогиниться
 *   3. Авторизуемся через Telegram или MAX (зависит от sessionStorage.max_frontend)
 *   4. После логина повторно запрашиваем /auth/me
 *
 * Моки:
 *   - api/auth.js   — все HTTP-запросы (getMe, loginViaTelegram, loginViaMAX, ...)
 *   - utils/initData.js — getInitData (возвращает строку init_data или null)
 *   - utils/logger.js  — подавляет вывод debug/warn в консоль
 *
 * vi.mock() ДОЛЖНЫ быть до импортов — Vitest автоматически поднимает их выше
 * (hoisting), но явный порядок делает код читаемым.
 *
 * setActivePinia(createPinia()) изолирует состояние auth store между тестами.
 * vi.clearAllMocks() в beforeEach сбрасывает счётчики вызовов и return values моков.
 */
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
    vi.clearAllMocks()  // сбрасываем mockResolvedValueOnce и счётчики вызовов
  })

  it('returns user data immediately when SALON_ID exists and /auth/me returns 200', async () => {
    // Счастливый путь: сессия ещё живёт, второй запрос и логин не нужны
    sessionStorage.setItem('SALON_ID', '1')
    const userData = { id: 1, telegram_id: 123 }
    getMe.mockResolvedValueOnce({ status: 200, data: userData })

    const result = await ensureSession()

    expect(result).toEqual(userData)
    expect(useAuthStore().me).toEqual(userData)  // store обновлён через setMe
    expect(loginViaTelegram).not.toHaveBeenCalled()  // логин не потребовался
  })

  it('falls through to Telegram login when SALON_ID exists but /auth/me returns 401', async () => {
    // Сессия истекла: первый /auth/me вернул 401, функция идёт логиниться заново
    // getMe мокируется дважды: первый вызов → 401, второй (после логина) → 200
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
    // Нет SALON_ID и нет init_data — авторизоваться невозможно
    // Бросается специальная ошибка с code = 'NO_INIT_DATA' для обработки в App.vue
    getInitData.mockReturnValueOnce(null)

    await expect(ensureSession()).rejects.toMatchObject({ code: 'NO_INIT_DATA' })
  })

  it('logs in via Telegram when no SALON_ID and Telegram platform', async () => {
    // Первый запуск: нет SALON_ID, платформа Telegram (max_frontend не установлен)
    // Логинимся через /auth/telegram/login/, потом получаем данные через /auth/me
    const userData = { id: 2, telegram_id: 456 }
    getInitData.mockReturnValueOnce('tg_init_data')
    loginViaTelegram.mockResolvedValueOnce({})
    getMe.mockResolvedValueOnce({ status: 200, data: userData })

    const result = await ensureSession()

    expect(loginViaTelegram).toHaveBeenCalledWith('tg_init_data')
    expect(result).toEqual(userData)
  })

  it('calls loginViaMAX when SALON_ID exists and isMAX is true', async () => {
    // MAX-платформа, SALON_ID уже известен → используем /auth/max/login/ (не resolve)
    // Первый /auth/me → 401 (сессия истекла), логинимся через MAX, потом /auth/me снова
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
    expect(loginViaTelegram).not.toHaveBeenCalled()  // Telegram не должен вызываться
    expect(result).toEqual(userData)
  })

  it('resolves salon ID via MAX when no SALON_ID and isMAX is true', async () => {
    // MAX без SALON_ID: вызываем resolve-эндпоинт, который возвращает salon_id
    // salon_id сохраняется в sessionStorage для последующих запросов
    sessionStorage.setItem('max_frontend', 'true')
    const userData = { id: 4 }
    getInitData.mockReturnValueOnce('max_init_data')
    loginViaMAXResolveSalonID.mockResolvedValueOnce({ data: { salon_id: 99 } })
    getMe.mockResolvedValueOnce({ status: 200, data: userData })

    const result = await ensureSession()

    expect(loginViaMAXResolveSalonID).toHaveBeenCalledWith('max_init_data')
    // salon_id сохранён как строка (sessionStorage.setItem конвертирует числа)
    expect(sessionStorage.getItem('SALON_ID')).toBe('99')
    expect(result).toEqual(userData)
  })

  it('returns null when final /auth/me does not return 200', async () => {
    // После логина /auth/me вернул ошибку — авторизация не удалась, возвращаем null
    // App.vue покажет баннер ошибки (логику показа баннера не тестируем здесь)
    getInitData.mockReturnValueOnce('init_data')
    loginViaTelegram.mockResolvedValueOnce({})
    getMe.mockResolvedValueOnce({ status: 500, data: null })

    const result = await ensureSession()

    expect(result).toBeNull()
  })

  it('rethrows errors from /auth/me when SALON_ID exists', async () => {
    // Сетевая ошибка (не HTTP-ответ) при /auth/me пробрасывается наверх
    // Отличие от 401: здесь нет response.status, это технический сбой сети
    sessionStorage.setItem('SALON_ID', '1')
    const networkError = new Error('Network failed')
    networkError.response = { status: 503 }
    getMe.mockRejectedValueOnce(networkError)

    await expect(ensureSession()).rejects.toThrow('Network failed')
  })
})
