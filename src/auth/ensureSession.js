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

  // логинимся
  const initData = getInitData()
  if (!initData) {
    console.error('[ensureSession] init_data отсутствует!')
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    throw err
  }

  console.log('[ensureSession] POST /auth/telegram/login, initData len=', initData.length)
  try {
    await loginViaTelegram(initData)
    console.log('[ensureSession] login done')
  } catch (e) {
    console.error('[ensureSession] loginViaTelegram failed:', e)
    throw e
  }

  const u = extractUserFromInitData(initData)
  if (u) console.log('[ensureSession] parsed user from init_data:', u)

  // повторно /auth/me
  console.log('[ensureSession] retry /auth/me')
  const { data } = await getMe()
  console.log('[ensureSession] /auth/me after login →', data)
  store.setMe?.(data)
  return data
}
