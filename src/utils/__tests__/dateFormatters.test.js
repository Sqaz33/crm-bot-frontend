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

// 2026-03-26 is Thursday. Verified: 2026-01-01 is Thu, +84 days (12 weeks) = still Thu.
const THURSDAY_ISO = '2026-03-26T19:45:00+00:00'
const THURSDAY_ISO_WITH_OFFSET = '2026-03-26T19:45:00+10:00'

describe('formatDate', () => {
  it('formats ISO string with timezone offset correctly', () => {
    expect(formatDate(THURSDAY_ISO_WITH_OFFSET)).toBe('26.03.2026, 19:45')
  })

  it('preserves salon time regardless of timezone offset', () => {
    expect(formatDate('2026-06-15T09:30:00-05:00')).toBe('15.06.2026, 09:30')
  })

  it('pads single-digit time components', () => {
    expect(formatDate('2026-01-05T08:05:00+00:00')).toBe('05.01.2026, 08:05')
  })

  it('returns "-" for null', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('returns "-" for empty string', () => {
    expect(formatDate('')).toBe('-')
  })
})

describe('formatDateShort', () => {
  it('returns DD/MM/YY format', () => {
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
  it('slices characters 11-16 (HH:mm)', () => {
    expect(formatTime('2026-03-26T19:45:00+10:00')).toBe('19:45')
  })

  it('returns empty string for null', () => {
    expect(formatTime(null)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(formatTime('')).toBe('')
  })
})

describe('formatSlotDateTime', () => {
  it('formats slot datetime identically to formatDate', () => {
    expect(formatSlotDateTime(THURSDAY_ISO_WITH_OFFSET)).toBe('26.03.2026, 19:45')
  })

  it('returns null for null input', () => {
    expect(formatSlotDateTime(null)).toBeNull()
  })
})

describe('humanizeDateTime', () => {
  it('returns empty strings for null', () => {
    expect(humanizeDateTime(null)).toEqual({ d: '', t: '' })
  })

  it('returns correct time part', () => {
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.t).toBe('19:45')
  })

  it('contains month name in Russian', () => {
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.d).toContain('марта')
  })

  it('contains correct weekday in Russian (Thursday = четверг)', () => {
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.d).toContain('четверг')
  })

  it('contains day number', () => {
    const result = humanizeDateTime(THURSDAY_ISO)
    expect(result.d).toContain('26')
  })
})

describe('formatDateForCalendar', () => {
  it('formats Date object to YYYY-MM-DD', () => {
    expect(formatDateForCalendar(new Date(2026, 2, 26))).toBe('2026-03-26')
  })

  it('pads single-digit month and day', () => {
    expect(formatDateForCalendar(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('handles December correctly', () => {
    expect(formatDateForCalendar(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('parseDateComponents', () => {
  it('returns empty strings for null', () => {
    expect(parseDateComponents(null)).toEqual({ day: '', month: '', weekday: '' })
  })

  it('returns correct day number as string', () => {
    expect(parseDateComponents(THURSDAY_ISO).day).toBe('26')
  })

  it('returns month name in Russian genitive', () => {
    expect(parseDateComponents(THURSDAY_ISO).month).toBe('марта')
  })

  it('returns weekday abbreviation in Russian (Thursday = чт)', () => {
    expect(parseDateComponents(THURSDAY_ISO).weekday).toBe('чт')
  })

  it('handles January correctly', () => {
    const result = parseDateComponents('2026-01-01T12:00:00+00:00')
    expect(result.month).toBe('января')
  })
})

describe('parseDateForComparison', () => {
  it('returns null for null input', () => {
    expect(parseDateForComparison(null)).toBeNull()
  })

  it('returns correct year, month, day', () => {
    const result = parseDateForComparison(THURSDAY_ISO)
    expect(result.year).toBe(2026)
    expect(result.month).toBe(3)
    expect(result.day).toBe(26)
  })

  it('returns correct hours, minutes, seconds', () => {
    const result = parseDateForComparison('2026-03-26T19:45:30+00:00')
    expect(result.hours).toBe(19)
    expect(result.minutes).toBe(45)
    expect(result.seconds).toBe(30)
  })

  it('returns a numeric time value for sorting', () => {
    const result = parseDateForComparison(THURSDAY_ISO)
    expect(typeof result.time).toBe('number')
    expect(result.time).toBeGreaterThan(0)
  })

  it('earlier date has smaller time value than later date', () => {
    const earlier = parseDateForComparison('2026-01-01T00:00:00+00:00')
    const later = parseDateForComparison('2026-12-31T23:59:59+00:00')
    expect(earlier.time).toBeLessThan(later.time)
  })
})
