/**
 * Тесты для src/utils/jwt.js
 *
 * isTokenExpired проверяет срок действия JWT по полю exp в payload.
 * Используется для решения, нужен ли повторный логин.
 *
 * Для детерминированных проверок времени используется vi.useFakeTimers():
 * фиксируем "сейчас" = 2000 мс, тогда:
 *   - exp=1 → 1000 мс < 2000 мс → токен истёк
 *   - exp=3 → 3000 мс > 2000 мс → токен действителен
 *
 * makeToken — вспомогательная функция, создаёт минимальный валидный JWT
 * с нужным exp без реальной подписи (подпись в isTokenExpired не проверяется).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isTokenExpired } from '../jwt.js'

function makeToken(expSeconds) {
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
  return `header.${payload}.signature`
}

const NOW_MS = 2000

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    // Восстанавливаем реальное время, чтобы не влиять на другие тесты
    vi.useRealTimers()
  })

  it('returns false for a non-expired token', () => {
    // exp=3 → exp*1000=3000 > Date.now()=2000 → не истёк
    const token = makeToken(3)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for an expired token', () => {
    // exp=1 → exp*1000=1000 < Date.now()=2000 → истёк
    const token = makeToken(1)
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false when exp equals now exactly (strict less-than boundary)', () => {
    // exp=2 → exp*1000=2000, проверка: 2000 < 2000 = false → считается действительным
    // Граничное значение: токен с exp ровно в момент "сейчас" не считается истёкшим
    const token = makeToken(2)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for a malformed token (no payload segment)', () => {
    // Строка 'invalid' не содержит точек → split('.')[1] = undefined → JSON.parse падает
    // catch возвращает true
    expect(isTokenExpired('invalid')).toBe(true)
  })

  it('returns true for null token', () => {
    // null.split('.') бросает TypeError → catch возвращает true
    expect(isTokenExpired(null)).toBe(true)
  })

  it('returns true for token with non-JSON payload', () => {
    // Base64 декодируется, но '!!!' — не валидный JSON → JSON.parse падает → catch
    const token = 'header.!!!.signature'
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns false for token with missing exp field', () => {
    // payload.exp = undefined → undefined * 1000 = NaN → NaN < 2000 = false
    // Токен без поля exp не считается истёкшим (защитное поведение функции)
    const payload = btoa(JSON.stringify({ sub: 'user' }))
    const token = `header.${payload}.signature`
    expect(isTokenExpired(token)).toBe(false)
  })
})
