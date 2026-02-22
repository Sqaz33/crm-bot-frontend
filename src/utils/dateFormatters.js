/**
 * Форматирование дат и времени для отображения.
 */

/**
 * Полная дата и время (например: 06.02.2025, 14:30)
 */
export function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Короткая дата (дд/мм/гг)
 */
export function formatDateShort(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

/**
 * Только время (ЧЧ:мм)
 */
export function formatTimeOnly(iso) {
  const d = new Date(iso)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Время из ISO-строки (HH:mm) — для слотов из API
 */
export function formatTime(iso) {
  return iso ? iso.slice(11, 16) : ''
}

/**
 * Человекочитаемая дата и время (например: 6 февраля, среда 14:30)
 */
export function humanizeDateTime(iso) {
  if (!iso) return { d: '', t: '' }
  const d = new Date(iso)
  if (isNaN(d)) return { d: '', t: '' }
  return {
    d: d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', weekday: 'long' }),
    t: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }
}

/**
 * Формат даты для календаря YYYY-MM-DD
 */
export function formatDateForCalendar(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

/**
 * Разбор даты на компоненты для DateTimeCard
 * Возвращает: day, month, weekday
 */
export function parseDateComponents(iso) {
  if (!iso) return { day: '', month: '', weekday: '' }
  const d = new Date(iso)
  if (isNaN(d)) return { day: '', month: '', weekday: '' }
  
  const weekdayShort = d.toLocaleDateString('ru-RU', { weekday: 'short' })
  const weekdayAbbrev = weekdayShort.charAt(0).toUpperCase() + weekdayShort.slice(1)
  
  // Capitalize first letter of month
  const monthRaw = d.toLocaleDateString('ru-RU', { month: 'long' })
  const monthCapitalized = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1)
  
  return {
    day: String(d.getDate()),
    month: monthCapitalized,
    weekday: weekdayAbbrev
  }
}
