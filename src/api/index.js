import axios from 'axios'
import { refreshToken as refreshAccessToken } from './token'

// Получение access_token (приоритет: localStorage → cookie)
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

// Перед каждым запросом вставляем токен
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- Авто-обновление токена при 401 ----
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
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const { data } = await refreshAccessToken(storedRefresh)
        const { access_token, refresh_token } = data

        // Сохраняем новые токены
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        // Записываем обновлённый токен в cookie
        document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (err) {
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
