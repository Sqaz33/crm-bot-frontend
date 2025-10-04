export async function ensureSession() {
  const store = useAuthStore()

  // 1) пробуем /auth/me
  try {
    console.log('[ensureSession] try /auth/me')
    const { data } = await getMe()
    console.log('[ensureSession] /auth/me OK →', data)
    store.setMe?.(data)
    return data
  } catch (e) {
    console.warn('[ensureSession] /auth/me 401?', e?.response?.status)
    if (e?.response?.status !== 401) throw e
  }

  // 2) берём init_data
  const initData = getInitData()
  console.log('[ensureSession] init_data exists?', !!initData)
  if (!initData) {
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    throw err
  }

  // 3) логинимся
  console.log('[ensureSession] POST /auth/telegram/login')
  await loginViaTelegram(initData)

  // 4) повторный /auth/me
  console.log('[ensureSession] retry /auth/me')
  const { data } = await getMe()
  store.setMe?.(data)
  return data
}