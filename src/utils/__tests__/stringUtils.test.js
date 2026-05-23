/**
 * Тесты для src/utils/stringUtils.js
 *
 * Покрывает три вспомогательные функции:
 *   - getFirstLetter  — первая буква имени (используется в аватарах)
 *   - getStaffId      — универсальное извлечение id сотрудника из разных форматов объекта
 *   - cap             — заглавная первая буква строки
 *
 * Все функции чистые (нет побочных эффектов), моки не нужны.
 */
import { describe, it, expect } from 'vitest'
import { getFirstLetter, getStaffId, cap } from '../stringUtils.js'

describe('getFirstLetter', () => {
  it('returns uppercase first letter of a string', () => {
    expect(getFirstLetter('alice')).toBe('A')
    expect(getFirstLetter('Борис')).toBe('Б')
  })

  it('returns empty string for empty input', () => {
    // Пустая строка — falsy, поэтому условие name && name.length > 0 не проходит
    expect(getFirstLetter('')).toBe('')
  })

  it('returns empty string for null and undefined', () => {
    // Оба значения falsy — функция защищена через короткое замыкание &&
    expect(getFirstLetter(null)).toBe('')
    expect(getFirstLetter(undefined)).toBe('')
  })

  it('returns single character unchanged (already uppercase)', () => {
    expect(getFirstLetter('Z')).toBe('Z')
  })
})

describe('getStaffId', () => {
  /**
   * API может возвращать сотрудника в разных форматах в зависимости от эндпоинта.
   * Функция перебирает поля по приоритету: id → staff_id → _id → user_id.
   */
  it('extracts id field', () => {
    expect(getStaffId({ id: 42 })).toBe(42)
  })

  it('falls back to staff_id', () => {
    expect(getStaffId({ staff_id: 7 })).toBe(7)
  })

  it('falls back to _id', () => {
    expect(getStaffId({ _id: 99 })).toBe(99)
  })

  it('falls back to user_id', () => {
    expect(getStaffId({ user_id: 5 })).toBe(5)
  })

  it('returns null for null input', () => {
    expect(getStaffId(null)).toBeNull()
  })

  it('returns null for empty object', () => {
    // Ни одно из ожидаемых полей не найдено — цепочка ?. возвращает undefined ?? null = null
    expect(getStaffId({})).toBeNull()
  })

  it('prefers id over staff_id', () => {
    // Когда объект содержит оба поля, id имеет приоритет
    expect(getStaffId({ id: 1, staff_id: 2 })).toBe(1)
  })
})

describe('cap', () => {
  it('capitalizes first letter', () => {
    // Остаток строки остаётся без изменений (toLowerCase не применяется)
    expect(cap('hello world')).toBe('Hello world')
  })

  it('returns empty string for falsy input', () => {
    // Функция защищена через тернарный оператор: s ? ... : ''
    expect(cap('')).toBe('')
    expect(cap(null)).toBe('')
    expect(cap(undefined)).toBe('')
  })

  it('does not double-capitalize already uppercase string', () => {
    expect(cap('ABC')).toBe('ABC')
  })

  it('capitalizes single character', () => {
    expect(cap('a')).toBe('A')
  })
})
