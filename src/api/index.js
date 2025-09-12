import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const AUTH_WHITELIST = [
  '/auth/telegram/login',
  '/auth/logout',
]

const AUTH_SCHEME = 'Bearer' // 'JWT'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
})

// Берём токен из Pinia (память) или из sessionStorage (на случай обновления страницы)
function getAccess() {
  try {
    const store = useAuthStore()
    if (store?.accessToken) return store.accessToken
  } catch {}
  const ss = sessionStorage.getItem('access_token')
  return ss || null
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
      // токен умер/невалиден — чищаем хранилища и ведём на авторизацию
      try {
        const store = useAuthStore()
        store.logout({ silent: true })
      } catch {}
      window.location.replace('/') // страница, где получим init_data и залогинимся
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
