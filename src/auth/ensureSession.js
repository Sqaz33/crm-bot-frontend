import { getMe, loginViaTelegram } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { getInitData, extractUserFromInitData } from '../utils/telegram'
import { logger } from '../utils/logger'

export async function ensureSession() {
  const store = useAuthStore()

  try {
    logger.debug('ensureSession: пробуем /auth/me')
    const { data } = await getMe()
    logger.debug('ensureSession: /auth/me OK', { data })
    store.setMe?.(data)
    return data
  } catch (e) {
    logger.warn('ensureSession: /auth/me failed', { status: e?.response?.status })
    if (e?.response?.status !== 401) throw e
  }

  const initData = getInitData()
  if (!initData) {
    const err = new Error('init_data отсутствует (WebApp/hash/query)')
    err.code = 'NO_INIT_DATA'
    throw err
  }

  logger.debug('ensureSession: логинимся через /auth/telegram/login', { initDataLen: initData.length })
  await loginViaTelegram(initData)
  logger.debug('ensureSession: логин завершён')

  const u = extractUserFromInitData(initData)
  if (u) logger.debug('ensureSession: распарсен user', { userId: u.id })

  logger.debug('ensureSession: повторный запрос /auth/me')
  const { data } = await getMe()
  logger.info('ensureSession: авторизация успешна после логина', { userId: data.id })
  store.setMe?.(data)
  return data
}