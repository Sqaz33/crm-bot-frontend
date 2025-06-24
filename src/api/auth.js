import api from './index'

/**
 * Логинимся через Telegram WebApp.
 * POST /api/telegram/login
 */
export function loginViaTelegram(initData) {
  return api.post('/telegram/login', { init_data: initData })
}

/**
 * Обмениваем temporary_token на пару access/refresh.
 * POST /api/telegram/exchange
 */
export function exchangeToken(temporaryToken) {
  return api.post('/telegram/exchange', { temporary_token: temporaryToken })
}

/**
 * Обновляем access-токен по refresh-токену.
 * POST /api/refresh
 */
export function refreshToken(refreshToken) {
  return api.post('/refresh', { refresh_token: refreshToken })
}