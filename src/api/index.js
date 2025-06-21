import axios from 'axios'

const api = axios.create({
  // так мы не делаем
  baseURL: import.meta.env.API_URL || 'https://api.crm-bot.dev.groza1338.ru',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token') || ''
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized, redirect to login if needed')
      
    }
    return Promise.reject(error)
  }
)

export default api