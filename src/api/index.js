import axios from 'axios'
import { getEnv } from '../config'
import { logger } from '../utils/logger'

/**
 * - всегда шлём куки (withCredentials: true)
 * - 401 не редиректим насильно — пусть верхний уровень решает (App.vue уже показывает баннер)
 */

const api = axios.create({
  baseURL: getEnv('API_BASE', '/api'),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // Не считать HTTP ошибки (4xx, 5xx) как exception, чтобы axios не выводил в console
  validateStatus: () => true,
})


api.interceptors.request.use(cfg => {
  logger.info('API Request', {
    method: cfg.method?.toUpperCase(),
    url: cfg.url,
    params: cfg.params,
  })
  return cfg
})

api.interceptors.response.use(
  r => {
    logger.info('API Response', {
      url: r.config.url,
      status: r.status,
    })
    return r
  },
  err => {
    logger.error('API Error', {
      url: err.config?.url,
      method: err.config?.method?.toUpperCase(),
      status: err.response?.status,
      message: err.message,
    })
    return Promise.reject(err)
  }
)

api.interceptors.request.use(cfg => {
  const salonId = sessionStorage.getItem('SALON_ID')

  if (salonId) {
    cfg.url = `/${salonId}${cfg.url}`
  }

  return cfg
})

export default api
