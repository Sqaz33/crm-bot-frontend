import { getMe, loginViaTelegram } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { getInitData, extractUserFromInitData } from '../utils/telegram'

/**
 * Гарантируем актуальную cookie-сессию:
 * 1) Пытаемся /auth/me
 * 2) Если 401 → логинимся через /auth/telegram/login (init_data), сервер ставит cookie
 * 3) Снова /auth/me
 * Возвращаем объект me или кидаем ошибку.
 */
export async function ensureSession() {
  const store = useAuthStore()

  // 1) пробуем текущую сессию
  try {
    const { data } = await getMe()
    store.setMe(data)
    return data
  } catch (e) {
    if (e?.response?.status !== 401) throw e
  }

  // 2) логиним через Telegram init_data
  const initData = getInitData()
  if (!initData) {
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    throw err
  }

  await loginViaTelegram(initData)

  // сохраним базовый профиль из init_data (для UX)
  const u = extractUserFromInitData(initData)
  if (u) store.setTelegramId(u.tg_id)

  // 3) снова /auth/me
  const { data } = await getMe()
  store.setMe(data)
  return data
}
