import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const AUTH_WHITELIST = [
  '/auth/telegram/login',
  '/auth/logout',
]
const AUTH_SCHEME = 'Bearer' 

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
})

function getAccess() {
  try {
    const store = useAuthStore()
    if (store?.accessToken) return store.accessToken
  } catch {}
  return sessionStorage.getItem('access_token')
}

api.interceptors.request.use(cfg => {
  if (!AUTH_WHITELIST.includes(cfg.url)) {
    const token = getAccess()
    if (token) cfg.headers.Authorization = `${AUTH_SCHEME} ${token}`
  }
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    const status = err.response?.status
    const url = err.config?.url
    if (status === 401 && !AUTH_WHITELIST.includes(url)) {
      try { useAuthStore().logout({ silent: true }) } catch {}
      window.location.replace('/')
    }
    return Promise.reject(err)
  }
)

export default api

// Пример использования перед защищённым запросом
// import api from './api'
// import { ensureAccess } from '@/auth/ensureAuth'

// async function createVisit(payload) {
//   await ensureAccess() // гарантируем токен (пока так не ебу чё мы там с серёгой и ильясом придумаем)
//   return api.post('/visits/', payload)
// }
