import api from './index'

export function getClientByTelegramId(telegramId) {
  if (telegramId === undefined || telegramId === null) {
    return Promise.reject(new Error('telegramId is required'))
  }
  return api.get(`/clients/${telegramId}`)
}