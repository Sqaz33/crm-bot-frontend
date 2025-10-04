import { getMe, loginViaTelegram } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { getInitData, extractUserFromInitData } from '../utils/telegram'

/**
 * Гарантируем cookie-сессию:
 * 1) /auth/me → если 200 — ок
 * 2) если 401 — логинимся /auth/telegram/login с init_data
 * 3) повторяем /auth/me
 */
export async function ensureSession() {
  const store = useAuthStore()

  // 1) пробуем текущую сессию
  try {
    const { data } = await getMe()
    store.setMe?.(data)
    return data
  } catch (e) {
    if (e?.response?.status !== 401) throw e
  }

  // 2) логин по init_data
  const initData = getInitData()
  if (!initData) {
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    throw err
  }

  await loginViaTelegram(initData)

  // можно проставить tg_id из init_data для UX
  const u = extractUserFromInitData(initData)
  if (u?.tg_id != null) store.setTelegramId?.(u.tg_id)

  // 3) повторяем /auth/me
  const { data } = await getMe()
  store.setMe?.(data)
  return data
}