import axios from 'axios'

const api = axios.create({
  
  baseURL: import.meta.env.VITE_API_URL || 'https://api.crm-bot.dev.groza1338.ru',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
