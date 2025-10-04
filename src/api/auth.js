import api from './index'

export function loginViaTelegram(initDataStr) {
  return api.post('/auth/telegram/login', { init_data: initDataStr })
}

export function logoutSession() {
  return api.post('/auth/logout') 
}

export function getMe() {
  return api.get('/auth/me')       
}
