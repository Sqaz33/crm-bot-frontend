import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.crm-bot.dev.groza1338.ru',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Логируем исходящие запросы
api.interceptors.request.use(
  config => {
    console.groupCollapsed(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    console.log('Headers:', config.headers)
    console.log('Payload:', config.data)
    console.groupEnd()

    const token = localStorage.getItem('access_token') || ''
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Логируем ответы
api.interceptors.response.use(
  response => {
    console.groupCollapsed(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
    console.log('Status:', response.status)
    console.log('Data:', response.data)
    console.groupEnd()
    return response
  },
  error => {
    if (error.response) {
      console.groupCollapsed(` API Response Error: ${error.config.method?.toUpperCase()} ${error.config.url}`)
      console.log('Status:', error.response.status)
      console.log('Data:', error.response.data)
      console.groupEnd()
      if (error.response.status === 401) {
        console.warn('Unauthorized – you may need to log in again.')
      }
    } else {
      console.error(' API Network/Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api