import axios from 'axios'
import { refreshToken as refreshAccessToken } from './token'

// Получение access_token из localStorage или cookie
function getToken() {
  const fromStorage = localStorage.getItem('access_token')
  if (fromStorage) return fromStorage

  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

// Сброс токенов и редирект на корень
function logoutAndRedirect() {
  console.warn('[API] Сброс сессии: токен битый или невалидный')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('telegram_init')
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
  window.location.href = '/'
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Добавляем Authorization для каждого запроса
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Очередь запросов при обновлении токена
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  failedQueue = []
}

// Обработка 401 и обновление токена
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Только если это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Ждём, пока токен обновится
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const storedRefresh = localStorage.getItem('refresh_token')
      if (!storedRefresh) {
        logoutAndRedirect()
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        // Обновляем токен, обязательно передавая init_data (для telegram_id)
        const { data } = await refreshAccessToken(storedRefresh)
        const { access_token, refresh_token } = data

        if (!access_token) throw new Error('Invalid refreshed token')

        // Сохраняем токены
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (err) {
        console.error('[API] Refresh не удался:', err)
        logoutAndRedirect()
        processQueue(err, null)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
