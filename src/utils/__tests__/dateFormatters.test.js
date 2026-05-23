/**
 * Тесты для src/utils/dateFormatters.js
 *
 * Ключевая особенность модуля: API возвращает время уже в timezone салона
 * (например, "2026-03-26T19:45:00+10:00"). Функции извлекают компоненты
 * даты напрямую из строки, без конвертации в локальную timezone браузера.
 * Тесты проверяют именно это: время 19:45 должно остаться 19:45 независимо
 * от смещения (+10:00, -05:00 и т.д.).
 *
 * Константы:
 *   THURSDAY_ISO            — 2026-03-26 UTC+00, четверг (без смещения)
 *   THURSDAY_ISO_WITH_OFFSET — 2026-03-26 с +10:00 (проверяет игнорирование offset)
 *
 * Обоснование выбора даты: 2026-01-01 — четверг, +84 дня (12 недель) = тоже четверг.
 * Это позволяет проверять расчёт дня недели без хардкода магических чисел.
 */
import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateShort,
  formatTimeOnly,
  formatTime,
  formatSlotDateTime,
  humanizeDateTime,
  formatDateForCalendar,
  parseDateComponents,
  parseDateForComparison,
} from '../dateFormatters.js'

const THURSDAY_ISO = '2026-03-26T19:45:00+00:00'
const THURSDAY_ISO_WITH_OFFSET = '2026-03-26T19:45:00+10:00'

describe('formatDate', () => {
  it('formats ISO string with timezone offset correctly', () => {
    // +10:00 не должен конвертировать время: ожидаем 19:45, а не 09:45 UTC
    expect(formatDate(THURSDAY_ISO_WITH_OFFSET)).toBe('26.03.2026, 19:45')
  })

  it('preserves salon time regardless of timezone offset', () => {
    // Другой offset (-05:00) — поведение то же: показываем время салона как есть
    expect(formatDate('2026-06-15T09:30:00-05:00')).toBe('15.06.2026, 09:30')
  })

  it('pads single-digit time components', () => {
    // Месяц '1' → '01', день '5' → '05', час '8' → '08', минута '5' → '05'
    expect(formatDate('2026-01-05T08:05:00+00:00')).toBe('05.01.2026, 08:05')
  })

  it('returns "-" for null', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('returns "-" for empty string', () => {
    // parseSalonDateTime возвращает null на пустой строке → функция возвращает '-'
    expect(formatDate('')).toBe('-')
  })
})

describe('formatDateShort', () => {
  it('returns DD/MM/YY format', () => {
    // Короткий год: 2026 → '26'
    expect(formatDateShort(THURSDAY_ISO_WITH_OFFSET)).toBe('26/03/26')
  })

  it('pads day and month', () => {
    expect(formatDateShort('2026-01-05T08:05:00+00:00')).toBe('05/01/26')
  })

  it('returns "-" for null', () => {
    expect(formatDateShort(null)).toBe('-')
  })
})

describe('formatTimeOnly', () => {
  it('extracts HH:mm from ISO string', () => {
    expect(formatTimeOnly(THURSDAY_ISO)).toBe('19:45')
  })

  it('pads single-digit hours and minutes', () => {
    expect(formatTimeOnly('2026-03-26T09:05:00+00:00')).toBe('09:05')
  })

  it('returns "-" for null', () => {
    expect(formatTimeOnly(null)).toBe('-')
  })
})

describe('formatTime', () => {
  /**
   * Упрощённая версия: просто берёт символы [11..15] из ISO-строки.
   * Используется для слотов, где строгость форматирования не нужна.
   */
  it('slices characters 11-16 (HH:mm)', () => {
    expect(formatTime('2026-03-26T19:45:00+10:00')).toBe('19:45')
  })

  it('returns empty string for null', () => {
    // Условие: iso ? iso.slice(...) : '' → null даёт ''
    expect(formatTime(null)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(formatTime('')).toBe('')
  })
})

describe('formatSlotDateTime', () => {
  /**
   * Форматирование для сводки записи (summary экрана подтверждения).
   * По логике идентично formatDate, но возвращает null вместо '-' при ошибке.
   */
  it('formats slot datetime identically to formatDate', () => {
    expect(formatSlotDateTime(THURSDAY_ISO_WITH_OFFSET)).toBe('26.03.2026, 19:45')
  })

  it('returns null for null input', () => {
    // Отличие от formatDate: null вместо '-', чтобы вызывающий код мог это проверить
    expect(formatSlotDateTime(null)).toBeNull()
  })
})

describe('humanizeDateTime', () => {
  /**
   * Возвращает объект { d, t } для отображения в карточке записи.
   * d — "26 марта, четверг", t — "19:45"
   * День недели вычисляется через Date.UTC, чтобы не зависеть от локальной TZ.
   */
  it('returns empty strings for null', () => {
    expect(humanizeDateTime(null)).toEqual({ d: '', t: '' })
  })

  it('returns correct time part', () => {
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.t).toBe('19:45')
  })

  it('contains month name in Russian', () => {
    // Март → 'марта' (родительный падеж)
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.d).toContain('марта')
  })

  it('contains correct weekday in Russian (Thursday = четверг)', () => {
    // 2026-03-26 — четверг, проверяем расчёт через getUTCDay()
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.d).toContain('четверг')
  })

  it('contains day number', () => {
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.d).toContain('26')
  })
})

describe('formatDateForCalendar', () => {
  /**
   * Принимает объект Date (выбранный пользователем через датапикер),
   * возвращает строку YYYY-MM-DD для передачи в API.
   */
  it('formats Date object to YYYY-MM-DD', () => {
    // new Date(2026, 2, 26) — месяц 2 = март (0-based)
    expect(formatDateForCalendar(new Date(2026, 2, 26))).toBe('2026-03-26')
  })

  it('pads single-digit month and day', () => {
    // Январь = 0, день 5 → '01' и '05'
    expect(formatDateForCalendar(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('handles December correctly', () => {
    // Декабрь = 11 (0-based) → '12' в результате
    expect(formatDateForCalendar(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('parseDateComponents', () => {
  /**
   * Используется в DateTimeCard для отображения части даты:
   * day="26", month="марта", weekday="чт"
   * День недели вычисляется через Date.UTC — независимо от timezone браузера.
   */
  it('returns empty strings for null', () => {
    expect(parseDateComponents(null)).toEqual({ day: '', month: '', weekday: '' })
  })

  it('returns correct day number as string', () => {
    // day возвращается как строка, не число
    expect(parseDateComponents(THURSDAY_ISO).day).toBe('26')
  })

  it('returns month name in Russian genitive', () => {
    // Март → 'марта' (массив monthNames в родительном падеже)
    expect(parseDateComponents(THURSDAY_ISO).month).toBe('марта')
  })

  it('returns weekday abbreviation in Russian (Thursday = чт)', () => {
    // weekdayNames[4] = 'чт' (0=вс, 1=пн, ..., 4=чт)
    expect(parseDateComponents(THURSDAY_ISO).weekday).toBe('чт')
  })

  it('handles January correctly', () => {
    // Граничный случай: первый элемент массива monthNames
    const result = parseDateComponents('2026-01-01T12:00:00+00:00')
    expect(result.month).toBe('января')
  })
})

describe('parseDateForComparison', () => {
  /**
   * Используется в RecordsView для сортировки записей.
   * Возвращает числовые компоненты даты и поле time (ms от эпохи) для сравнения.
   * Важно: компоненты берутся из строки напрямую, не из браузерного Date,
   * чтобы сортировка не зависела от timezone среды выполнения.
   */
  it('returns null for null input', () => {
    expect(parseDateForComparison(null)).toBeNull()
  })

  it('returns correct year, month, day', () => {
    const result = parseDateForComparison(THURSDAY_ISO)
    expect(result.year).toBe(2026)
    expect(result.month).toBe(3)  // month числовой (не 0-based), март = 3
    expect(result.day).toBe(26)
  })

  it('returns correct hours, minutes, seconds', () => {
    const result = parseDateForComparison('2026-03-26T19:45:30+00:00')
    expect(result.hours).toBe(19)
    expect(result.minutes).toBe(45)
    expect(result.seconds).toBe(30)
  })

  it('returns a numeric time value for sorting', () => {
    // Поле time — миллисекунды от эпохи (Date.UTC), используется как fallback при сортировке
    const result = parseDateForComparison(THURSDAY_ISO)
    expect(typeof result.time).toBe('number')
    expect(result.time).toBeGreaterThan(0)
  })

  it('earlier date has smaller time value than later date', () => {
    // Гарантирует корректный порядок сортировки по возрастанию
    const earlier = parseDateForComparison('2026-01-01T00:00:00+00:00')
    const later = parseDateForComparison('2026-12-31T23:59:59+00:00')
    expect(earlier.time).toBeLessThan(later.time)
  })
})
