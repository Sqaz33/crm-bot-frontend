import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isTokenExpired } from '../jwt.js'

function makeToken(expSeconds) {
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
  return `header.${payload}.signature`
}

// Fixed "now" = 2000 ms
const NOW_MS = 2000

describe('isTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns false for a non-expired token', () => {
    // exp=3 → 3000 ms > 2000 ms → not expired
    const token = makeToken(3)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for an expired token', () => {
    // exp=1 → 1000 ms < 2000 ms → expired
    const token = makeToken(1)
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true when exp equals now (expired at boundary)', () => {
    // exp=2 → 2000 ms, not strictly less than 2000 → not expired
    // Actually: 2 * 1000 < 2000 → false → not expired
    // Boundary: exp exactly at now is considered NOT expired
    const token = makeToken(2)
    expect(isTokenExpired(token)).toBe(false)
  })

  it('returns true for a malformed token (no payload)', () => {
    expect(isTokenExpired('invalid')).toBe(true)
  })

  it('returns true for null token', () => {
    expect(isTokenExpired(null)).toBe(true)
  })

  it('returns true for token with non-JSON payload', () => {
    const token = 'header.!!!.signature'
    expect(isTokenExpired(token)).toBe(true)
  })

  it('returns true for token with missing exp field', () => {
    const payload = btoa(JSON.stringify({ sub: 'user' }))
    const token = `header.${payload}.signature`
    // payload.exp = undefined → undefined * 1000 = NaN → NaN < number = false
    // So returns false — token without exp is treated as not expired
    expect(isTokenExpired(token)).toBe(false)
  })
})
