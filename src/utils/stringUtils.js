/**
 * Строковые утилиты.
 */

/**
 * Первая буква строки (для аватаров).
 */
export function getFirstLetter(name) {
  return name && name.length > 0 ? name.charAt(0).toUpperCase() : ''
}

/**
 * Извлечь id сотрудника из объекта или значения.
 */
export function getStaffId(s) {
  return s?.id ?? s?.staff_id ?? s?._id ?? s?.user_id ?? null
}

/**
 * Заглавная буква первой буквы строки.
 */
export function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}
