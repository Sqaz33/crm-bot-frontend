import api from './index'

export function loginViaTelegram(initData) {
  return api.post('/auth/telegram/login', { init_data: initData })
}

export function exchangeToken(tmpToken) {
  return api.post('/auth/telegram/exchange', { temporary_token: tmpToken })
}