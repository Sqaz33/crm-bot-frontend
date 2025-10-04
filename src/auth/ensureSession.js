import { getMe, loginViaTelegram } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { getInitData, extractUserFromInitData } from '../utils/telegram'

let running = false

export async function ensureSession() {
  if (running) {
    console.log('[ensureSession] already running → wait')
    // простой await-петлёй можно не усложнять — App.vue ждёт промис
  }
  running = true
  const store = useAuthStore()

  try {
    // 1) пробуем текущую сессию
    console.log('[ensureSession] try GET /auth/me')
    const a1 = await getMe()
    console.log('[ensureSession] /auth/me OK →', a1.data)
    store.setMe?.(a1.data)
    return a1.data
  } catch (e) {
    const s = e?.response?.status
    console.warn('[ensureSession] /auth/me failed:', s)
    if (s !== 401) {
      running = false
      throw e
    }
  }

  // 2) достаём init_data
  const initData = getInitData()
  console.log('[ensureSession] has init_data?', !!initData)
  if (!initData) {
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    running = false
    throw err
  }

  // 3) логинимся
  console.log('[ensureSession] POST /auth/telegram/login → start')
  await loginViaTelegram(initData)
  console.log('[ensureSession] POST /auth/telegram/login → done')

  // UX: сохранить tg_id из init_data
  const u = extractUserFromInitData(initData)
  if (u?.tg_id != null) {
    try { store.setTelegramId?.(u.tg_id) } catch {}
  }

  // 4) повторный /auth/me
  console.log('[ensureSession] retry GET /auth/me')
  const a2 = await getMe()
  console.log('[ensureSession] retry OK →', a2.data)
  store.setMe?.(a2.data)
  running = false
  return a2.data
}