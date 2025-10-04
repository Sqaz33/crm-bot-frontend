import { getMe, loginViaTelegram } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { getInitData, extractUserFromInitData } from '../utils/telegram'

export async function ensureSession() {
  const store = useAuthStore()

  try {
    console.log('[ensureSession] try /auth/me')
    const { data } = await getMe()
    console.log('[ensureSession] /auth/me OK →', data)
    store.setMe?.(data)
    return data
  } catch (e) {
    console.warn('[ensureSession] /auth/me failed:', e?.response?.status)
    if (e?.response?.status !== 401) throw e
  }

  const initData = getInitData()
  if (!initData) {
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    throw err
  }

  console.log('[ensureSession] login via /auth/telegram/login, initData len=', initData.length)
  await loginViaTelegram(initData)
  console.log('[ensureSession] login done (проверь Set-Cookie в Network → Response Headers у POST /auth/telegram/login)')

  const u = extractUserFromInitData(initData)
  if (u) console.log('[ensureSession] parsed user:', u)

  console.log('[ensureSession] retry /auth/me')
  const { data } = await getMe()
  console.log('[ensureSession] /auth/me after login →', data)
  store.setMe?.(data)
  return data
}