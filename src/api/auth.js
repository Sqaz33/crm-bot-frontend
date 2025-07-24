import api from './index'

export function loginViaTelegram(initData) {
  return api.post('/auth/telegram/login', { init_data: initData })
}

export function exchangeToken(tmpToken) {
  return api.post('/auth/telegram/exchange', { temporary_token: tmpToken })
}

export function refreshToken(refreshToken) {
  return api.post('/auth/refresh', { refresh_token: refreshToken })
}
