import axios from 'axios'
import { refreshToken as refreshAccessToken } from './token'

// Декод JWT для проверки payload
function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

// Получение токена из localStorage или cookie
function getToken() {
  const fromStorage = localStorage.getItem('access_token')
  if (fromStorage) return fromStorage

  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Перед каждым запросом вставляем токен и логируем его
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    const payload = decodeJWT(token)
    console.log('[API] Используем токен:', token)
    console.log('[API] Payload токена:', payload)

    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('[API] Нет токена!')
  }
  return config
})

// ---- Рефреш токена при 401 ----
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const storedRefresh = localStorage.getItem('refresh_token')
      if (!storedRefresh) {
        console.warn('[REFRESH] Нет refresh_token!')
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        console.log('[REFRESH] Пытаемся обновить токен...')
        const { data } = await refreshAccessToken(storedRefresh)

        const { access_token, refresh_token } = data
        console.log('[REFRESH] Новый access_token:', access_token)
        console.log('[REFRESH] Новый refresh_token:', refresh_token)
        console.log('[REFRESH] Payload нового токена:', decodeJWT(access_token))

        // Сохраняем токены
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        // Обновляем куку
        document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (err) {
        console.error('[REFRESH] Ошибка обновления токена:', err)
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
