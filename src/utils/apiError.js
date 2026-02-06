/**
 * Извлечение сообщения об ошибке из ответа axios/API.
 */

/**
 * Получить читаемое сообщение об ошибке из объекта ошибки axios.
 * @param {Error} err - Ошибка от axios
 * @param {string} [fallback] - Сообщение по умолчанию
 * @returns {string}
 */
export function getErrorMessage(err, fallback = 'Произошла ошибка') {
  if (!err) return fallback
  const data = err.response?.data
  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  if (err.message) return err.message
  return fallback
}
