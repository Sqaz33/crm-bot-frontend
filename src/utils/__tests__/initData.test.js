/**
 * Тесты для src/utils/initData.js — функция splitFullNameIfNeeded
 *
 * Остальные функции модуля (getInitData, isUserAuthorized и др.) работают с
 * window.Telegram / window.WebApp и имеют побочные эффекты (storeInitData),
 * поэтому здесь тестируется только splitFullNameIfNeeded — единственная
 * чистая функция модуля.
 *
 * splitFullNameIfNeeded разбивает ФИО на firstName/lastName.
 * Алгоритм: последнее слово → lastName, всё остальное → firstName.
 * Применяется при авторизации через MAX, где API может прислать полное имя строкой.
 *
 * Зависимости модуля мокируются, чтобы загрузка initData.js не вызывала
 * обращений к window или sessionStorage при импорте в тестовой среде.
 */
import { describe, it, expect, vi } from 'vitest'
import { splitFullNameIfNeeded } from '../initData.js'

vi.mock('../logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// Мок нужен, чтобы инициализация initDataVault не обращалась к sessionStorage при загрузке модуля
vi.mock('../../auth/initDataVault.js', () => ({
  storeInitData: vi.fn(),
  getStoredInitData: vi.fn(() => null),
  initDataVault: { get: vi.fn(), store: vi.fn(), clear: vi.fn(), has: vi.fn() },
}))

describe('splitFullNameIfNeeded', () => {
  it('splits full name into firstName and lastName', () => {
    // Стандартный случай: "Имя Фамилия"
    expect(splitFullNameIfNeeded('Иван Петров')).toEqual({
      firstName: 'Иван',
      lastName: 'Петров',
    })
  })

  it('handles three-part name (first two = firstName)', () => {
    // Отчество входит в firstName: все слова кроме последнего
    expect(splitFullNameIfNeeded('Мария Ивановна Петрова')).toEqual({
      firstName: 'Мария Ивановна',
      lastName: 'Петрова',
    })
  })

  it('returns just firstName for single-word name', () => {
    // Одно слово → lastName = '' (нет второго слова для разбивки)
    expect(splitFullNameIfNeeded('Алексей')).toEqual({
      firstName: 'Алексей',
      lastName: '',
    })
  })

  it('collapses extra whitespace', () => {
    // Лишние пробелы нормализуются через trim + replace(/\s+/g, ' ') перед split
    expect(splitFullNameIfNeeded('  Иван   Петров  ')).toEqual({
      firstName: 'Иван',
      lastName: 'Петров',
    })
  })

  it('returns empty object for null', () => {
    // Защитная проверка: !fullName || typeof fullName !== 'string'
    expect(splitFullNameIfNeeded(null)).toEqual({})
  })

  it('returns empty object for non-string', () => {
    expect(splitFullNameIfNeeded(123)).toEqual({})
  })

  it('returns empty object for empty string', () => {
    // Пустая строка: после trim → '' → if (!trimmed) return {}
    expect(splitFullNameIfNeeded('')).toEqual({})
  })

  it('returns empty object for whitespace-only string', () => {
    // Строка из пробелов после trim становится пустой → return {}
    expect(splitFullNameIfNeeded('   ')).toEqual({})
  })

  it('respects fallback for firstName when single name', () => {
    // Если fallback.firstName передан, он имеет приоритет над извлечённым значением
    // Полезно когда имя уже известно из другого источника
    expect(splitFullNameIfNeeded('Алексей', { firstName: 'Fallback' })).toEqual({
      firstName: 'Fallback',
      lastName: '',
    })
  })

  it('respects fallback for lastName in two-part name', () => {
    // Аналогично: fallback.lastName перекрывает извлечённую фамилию
    expect(splitFullNameIfNeeded('Иван Петров', { lastName: 'Override' })).toEqual({
      firstName: 'Иван',
      lastName: 'Override',
    })
  })
})
