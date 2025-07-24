import axios from 'axios'
import { refreshToken as refreshAccessToken } from './token'

// Получение токена (access_token) из localStorage или cookie
function getToken() {
  const fromStorage = localStorage.getItem('access_token')
  if (fromStorage) return fromStorage

  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

// Проверка токена на валидность (наличие telegram_id)
function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return !!payload.telegram_id
  } catch {
    return false
  }
}

// Сброс сессии (если токен битый)
function logoutAndRedirect() {
  console.warn('[API] Сброс сессии: токен битый или невалидный')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  document.cookie = 'access_token=; path=/; max-age=0'
  window.location.href = '/login'
}

// Создаём axios-инстанс
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Перед каждым запросом вставляем токен
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    if (!isTokenValid(token)) {
      logoutAndRedirect()
      return Promise.reject(new Error('Invalid token'))
    }
    config.headers.Authorization = `Bearer ${token}`
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

    // Ловим только 401 (просрочен токен)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        const { data } = await refreshAccessToken(storedRefresh)
        const { access_token, refresh_token } = data

        // Проверяем новый токен (есть ли telegram_id)
        if (!isTokenValid(access_token)) {
          logoutAndRedirect()
          return Promise.reject(new Error('Invalid refreshed token'))
        }

        // Сохраняем новые токены
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)

        // Перезапускаем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        logoutAndRedirect()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
