import api from './index' 

/**
 * Логинимся через Telegram WebApp.
 * @param {string} initData – строка initData из window.Telegram.WebApp.initData
 * @returns {Promise<{ data: { temporary_token: string } }>}
 */
export function loginViaTelegram(initData) {
  return api.post('/auth/telegram/login', {
    init_data: initData
  })
}

/**
 * Обмениваем временный токен на пару access/refresh.
 * @param {string} temporaryToken
 * @returns {Promise<{ data: { access_token: string, refresh_token: string, telegram_id?: string } }>}
 */
export function exchangeToken(temporaryToken) {
  return api.post('/auth/telegram/exchange', {
    temporary_token: temporaryToken
  })
}

/**
 * Обновляем access-токен по refresh-токену.
 * @param {string} refreshToken
 * @returns {Promise<{ data: { access_token: string, refresh_token: string } }>}
 */
export function refreshToken(refreshToken) {
  return api.post('/auth/refresh', {
    refresh_token: refreshToken
  })
}