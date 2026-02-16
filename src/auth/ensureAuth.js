import { getMe, loginViaTelegram } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { getInitData, extractUserFromInitData } from '../utils/telegram'
import { logger } from '../utils/logger'

/**
 * Гарантируем актуальную cookie-сессию:
 * 1) Пытаемся /auth/me
 * 2) Если 401 → логинимся через /auth/telegram/login (init_data), сервер ставит cookie
 * 3) Снова /auth/me
 * Возвращаем объект me или кидаем ошибку.
 */
export async function ensureSession() {
  const store = useAuthStore()

  logger.info('ensureSession: проверка сессии')

  // 1) пробуем текущую сессию
  try {
    const { data } = await getMe()
    store.setMe(data)
    logger.info('ensureSession: сессия активна', { userId: data?.id })
    return data
  } catch (e) {
    if (e?.response?.status !== 401) {
      logger.error('ensureSession: ошибка при проверке сессии', { error: e.message })
      throw e
    }
    logger.warn('ensureSession: сессия не найдена, пробуем Telegram login')
  }

  // 2) логиним через Telegram init_data
  const initData = getInitData()
  if (!initData) {
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    logger.error('ensureSession: отсутствует init_data', { code: err.code })
    throw err
  }

  logger.info('ensureSession: выполняем Telegram login')
  await loginViaTelegram(initData)

  // сохраним базовый профиль из init_data (для UX)
  const u = extractUserFromInitData(initData)
  if (u) {
    store.setTelegramId(u.tg_id)
    logger.info('ensureSession: Telegram user получен', { tgId: u.tg_id })
  }

  // 3) снова /auth/me
  const { data } = await getMe()
  store.setMe(data)
  logger.info('ensureSession: успешная авторизация', { userId: data?.id })
  return data
}
