import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { isTokenExpired } from '../utils/jwt'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
})


api.interceptors.request.use(async config => {
  const store = useAuthStore()
  store.initFromLocal()

  if (store.accessToken) {
   
    if (isTokenExpired(store.accessToken) && store.refreshToken) {
      try {
        const { data } = await api.post('/refresh', {
          refresh_token: store.refreshToken
        })
        store.setTokens(data)
      } catch {
        store.logout()
        
      }
    }
    config.headers.Authorization = `Bearer ${store.accessToken}`
  }
  return config
})

export default api