// src/api/index.js
import axios from 'axios'
import { refreshToken } from './auth'

const api = axios.create({
    baseURL: 'https://api.crm-bot.dev.groza1338.ru',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
})

// передаём access_token в заголовках
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// флаг, чтобы не зациклиться
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else      prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // пока идёт рефреш, ставим запрос в очередь
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

      const refreshTokenStored = localStorage.getItem('refresh_token')
      if (!refreshTokenStored) {
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const { data } = await refreshToken(refreshTokenStored)
        const newAccess = data.access_token
        const newRefresh = data.refresh_token

        // сохраняем новые токены
        localStorage.setItem('access_token', newAccess)
        localStorage.setItem('refresh_token', newRefresh)

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        processQueue(null, newAccess)

        // повторяем оригинальный запрос
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
