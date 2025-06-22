import api from './index'

/**
 * Получить пользователя по telegram_id.
 * GET /users/{telegramId}
 */
export function fetchUser(telegramId) {
  return api.get(`/users/${telegramId}`)
}

/**
 * Создать пользователя.
 * POST /users
 * Тело — весь объект user от Telegram
 */
export function createUser(userPayload) {
  return api.post('/users', userPayload)
}
