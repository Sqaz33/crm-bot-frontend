// src/api/index.js
import axios from 'axios'
import { refreshToken as refreshAccessToken } from './token'

function getToken() {
  const ls = localStorage.getItem('access_token')
  if (ls) return ls
  const m = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : null
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
})

// не подмешиваем Authorization на эндпоинты авторизации
const AUTH_WHITELIST = [
  '/auth/telegram/login',
  '/auth/telegram/exchange',
  '/auth/refresh',
]

api.interceptors.request.use(cfg => {
  if (!AUTH_WHITELIST.includes(cfg.url)) {
    const token = getToken()
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

// --- refresh 401 ---
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config
    const status = err.response?.status

    if (status === 401 && !original._retry && !AUTH_WHITELIST.includes(original.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true
      const storedRefresh = localStorage.getItem('refresh_token')
      if (!storedRefresh) { isRefreshing = false; return Promise.reject(err) }

      try {
        const { data } = await refreshAccessToken(storedRefresh)
        const { access_token, refresh_token } = data
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        document.cookie = `access_token=${access_token}; path=/; max-age=3600; SameSite=Lax`
        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)
        original.headers.Authorization = `Bearer ${access_token}`
        return api(original)
      } catch (e) {
        processQueue(e, null)
        throw e
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api
