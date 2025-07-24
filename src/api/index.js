import axios from 'axios'
import { refreshToken as refreshAccessToken } from './token'

// Функция для получения токена (сначала из cookie, потом из localStorage)
function getToken() {
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  if (match) return decodeURIComponent(match[1])
  return localStorage.getItem('access_token') || null
}

// Создаём экземпляр axios
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Перед каждым запросом — вставляем токен
api.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Обработка 401 и обновление токена ---
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Если 401 и ещё не пробовали рефреш
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
        // Запрашиваем новый токен
        const { data } = await refreshAccessToken(storedRefresh)
        const { access_token, refresh_token } = data

        // Сохраняем новые токены
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`

        // Обновляем заголовки
        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)

        // Повторяем оригинальный запрос с новым токеном
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
