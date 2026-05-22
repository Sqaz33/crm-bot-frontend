import api from './index'

export function loginViaTelegram(initDataStr) {
  return api.post('/auth/telegram/login/', { init_data: initDataStr })
}

export function logoutSession() {
  return api.post('/auth/logout/') 
}

export function getMe() {
  return api.get('/auth/me/')       
}

export function loginViaMAX(initDataStr) {
  return api.post('/auth/max/login/', { init_data: initDataStr })
}

export function loginViaMAXResolveSalonID(initDataStr) {
  return api.post('/auth/max/login/resolve/', { init_data: initDataStr })
}