// src/api/auth.js
import api from './index'

/**
 * Логин через Telegram Login Widget
 * POST /auth/telegram/login  -> { temporary_token }
 */
export function loginViaTelegram(initDataStr) {
  return api.post('/auth/telegram/login', { init_data: initDataStr })
}

/**
 * Обмен временного токена на обычные токены
 * POST /auth/telegram/exchange -> { access_token, refresh_token }
 */
export function exchangeToken(tmpToken) {
  return api.post('/auth/telegram/exchange', { temporary_token: tmpToken })
}
