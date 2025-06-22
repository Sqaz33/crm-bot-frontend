import api from './index'

/**
 * Логинимся через Telegram WebApp.
 */
export function loginViaTelegram(initData) {
  return api.post('/auth/telegram/login', {
    init_data: initData
  })
}

/**
 * Обмениваем временный токен на пару access/refresh.
 */
export function exchangeToken(temporaryToken) {
  return api.post('/auth/telegram/exchange', {
    temporary_token: temporaryToken
  })
}

/**
 * Обновляем access-токен по refresh-токену.
 */
export function refreshToken(refreshToken) {
  return api.post('/auth/refresh', {
    refresh_token: refreshToken
  })
}