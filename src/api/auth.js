import api from './index'

/**
 * Логинимся через Telegram WebApp.
 * @param {string} initData — строка initData
 * @returns {Promise<{ data: { temporary_token: string } }>}
 */
export function loginViaTelegram(initData) {
  return api.post('/auth/telegram/login', { init_data: initData })
}

/**
 * Обмениваем временный токен на пару access/refresh.
 * @param {string} tmpToken
 * @returns {Promise<{ data: { access_token: string, refresh_token: string } }>}
 */
export function exchangeToken(tmpToken) {
  return api.post('/auth/telegram/exchange', { temporary_token: tmpToken })
}

/**
 * Обновляем access-токен по refresh-токену.
 * @param {string} refreshToken
 * @returns {Promise<{ data: { access_token: string, refresh_token: string } }>}
 */
export function refreshToken(refreshToken) {
  return api.post('/auth/refresh', { refresh_token: refreshToken })
}