import { getMe, loginViaTelegram } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { getInitData, extractUserFromInitData } from '../utils/initData'
import { logger } from '../utils/logger'

export async function ensureSession() {
  const store = useAuthStore()

  try {
    logger.debug('ensureSession: пробуем /auth/me')
    const response = await getMe()
    const status = response?.status || response?.data?.status || (response?.data ? 200 : 0)
    
    if (status === 200) {
      logger.debug('ensureSession: /auth/me OK', { data: response.data })
      store.setMe?.(response.data)
      return response.data
    }
  
    logger.warn('ensureSession: /auth/me returned 401, need re-auth')
  } catch (e) {
    const status = e?.response?.status
    logger.warn('ensureSession: /auth/me failed', { status })
    throw e
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
 
  const response = await getMe()
  const status = response?.status || response?.data?.status || (response?.data ? 200 : 0)
  if (status === 200) {
    logger.info('ensureSession: авторизация успешна после логина', { userId: response.data.id })
    store.setMe?.(response.data)
    return response.data
  }

  return null
}