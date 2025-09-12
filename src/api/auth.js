import api from './index'

// POST /auth/telegram/login  -> { access_token }
export function loginViaTelegram(initDataStr) {
  return api.post('/auth/telegram/login', { init_data: initDataStr })
}

// POST /auth/logout  -> { message }
export function logoutWithToken(accessToken) {
  return api.post('/auth/logout', { access_token: accessToken })
}