import axios from 'axios'

/**
 * - всегда шлём куки (withCredentials: true)
 * - 401 не редиректим насильно — пусть верхний уровень решает (App.vue уже показывает баннер)
 */

const api = axios.create({
  baseURL: '/api/v2',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
})


api.interceptors.request.use(cfg => {

  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {

    return Promise.reject(err)
  }
)

export default api