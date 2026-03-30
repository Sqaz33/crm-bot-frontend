/**
 * Форматирование дат и времени для отображения.
 * Важно: API возвращает время уже в timezone салона (с UTC-офсетом),
 * поэтому при парсинге нужно извлекать компоненты даты/времени напрямую
 * из строки, чтобы избежать автоматической конвертации в локальную timezone.
 */

/**
 * Извлекает компоненты даты/времени из ISO-строки с офсетом.
 * Возвращает локальное время салона (без конвертации в timezone браузера).
 */
function parseSalonDateTime(isoString) {
  if (!isoString) return null
  
  // Формат: "2026-03-26T19:45:00+10:00" или "2026-03-26T19:45:00Z"
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!match) {
    // Fallback: если формат неожиданный, используем стандартный парсинг
    const d = new Date(isoString)
    if (isNaN(d)) return null
    return d
  }
  
  const [, year, month, day, hour, minute, second = '0'] = match
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
    hour: parseInt(hour, 10),
    minute: parseInt(minute, 10),
    second: parseInt(second, 10)
  }
}

/**
 * Полная дата и время (например: 26.03.2026, 19:45)
 */
export function formatDate(iso) {
  const d = parseSalonDateTime(iso)
  if (!d) return '-'
  
  if (d instanceof Date) {
    return d.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const day = String(d.day).padStart(2, '0')
  const month = String(d.month).padStart(2, '0')
  const year = d.year
  const hour = String(d.hour).padStart(2, '0')
  const minute = String(d.minute).padStart(2, '0')
  
  return `${day}.${month}.${year}, ${hour}:${minute}`
}

/**
 * Короткая дата (дд/мм/гг)
 */
export function formatDateShort(iso) {
  const d = parseSalonDateTime(iso)
  if (!d) return '-'
  
  if (d instanceof Date) {
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  }
  
  const day = String(d.day).padStart(2, '0')
  const month = String(d.month).padStart(2, '0')
  const year = String(d.year).slice(-2)
  
  return `${day}/${month}/${year}`
}

/**
 * Только время (ЧЧ:мм)
 */
export function formatTimeOnly(iso) {
  const d = parseSalonDateTime(iso)
  if (!d) return '-'
  
  if (d instanceof Date) {
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
  
  const hour = String(d.hour).padStart(2, '0')
  const minute = String(d.minute).padStart(2, '0')
  
  return `${hour}:${minute}`
}

/**
 * Время из ISO-строки (HH:mm) — для слотов из API
 */
export function formatTime(iso) {
  return iso ? iso.slice(11, 16) : ''
}

/**
 * Форматирование даты и времени слота для отображения в summary
 * (например: "26.03.2026, 19:45")
 * Использует parseSalonDateTime для корректной работы с timezone салона
 */
export function formatSlotDateTime(iso) {
  const d = parseSalonDateTime(iso)
  if (!d) return null
  
  if (d instanceof Date) {
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const day = String(d.day).padStart(2, '0')
  const month = String(d.month).padStart(2, '0')
  const year = d.year
  const hour = String(d.hour).padStart(2, '0')
  const minute = String(d.minute).padStart(2, '0')
  
  return `${day}.${month}.${year}, ${hour}:${minute}`
}

/**
 * Человекочитаемая дата и время (например: 26 марта, четверг 19:45)
 */
export function humanizeDateTime(iso) {
  if (!iso) return { d: '', t: '' }
  
  const d = parseSalonDateTime(iso)
  if (!d) return { d: '', t: '' }
  
  // Создаём дату в UTC для корректного определения дня недели
  let dateObj
  if (d instanceof Date) {
    dateObj = d
  } else {
    // Используем UTC для получения корректного weekday
    dateObj = new Date(Date.UTC(d.year, d.month - 1, d.day, d.hour, d.minute, d.second))
  }
  
  if (isNaN(dateObj)) return { d: '', t: '' }
  
  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const weekdayNames = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
  
  if (d instanceof Date) {
    return {
      d: `${d.getDate()} ${monthNames[d.getMonth()]}, ${weekdayNames[d.getDay()]}`,
      t: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
  }
  
  return {
    d: `${d.day} ${monthNames[d.month - 1]}, ${weekdayNames[dateObj.getUTCDay()]}`,
    t: `${String(d.hour).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}`
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
  
  const d = parseSalonDateTime(iso)
  if (!d) return { day: '', month: '', weekday: '' }
  
  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  const weekdayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
  
  if (d instanceof Date) {
    return {
      day: String(d.getDate()),
      month: monthNames[d.getMonth()],
      weekday: weekdayNames[d.getDay()]
    }
  }
  
  // Создаём дату в UTC для получения weekday
  const dateObj = new Date(Date.UTC(d.year, d.month - 1, d.day, d.hour, d.minute, d.second))
  
  return {
    day: String(d.day),
    month: monthNames[d.month - 1],
    weekday: weekdayNames[dateObj.getUTCDay()]
  }
}

/**
 * Сравнение двух дат для сортировки (для RecordsView)
 * Возвращает компоненты для безопасного сравнения без timezone конвертации
 */
export function parseDateForComparison(iso) {
  const d = parseSalonDateTime(iso)
  if (!d) return null
  
  if (d instanceof Date) {
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: d.getSeconds(),
      // Для fallback сортировки
      time: d.getTime()
    }
  }
  
  return {
    year: d.year,
    month: d.month,
    day: d.day,
    hours: d.hour,
    minutes: d.minute,
    seconds: d.second,
    // Создаём время для fallback сортировки
    time: new Date(Date.UTC(d.year, d.month - 1, d.day, d.hour, d.minute, d.second)).getTime()
  }
}