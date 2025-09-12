import api from './index'

export function getClientByTelegramId(telegramId) {
  if (!telegramId && telegramId !== 0) {
    return Promise.reject(new Error('telegramId is required'))
  }
  return api.get(`/clients/${telegramId}`)
}