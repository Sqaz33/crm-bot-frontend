import { describe, it, expect, vi } from 'vitest'
import { splitFullNameIfNeeded } from '../initData.js'

vi.mock('../logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('../../auth/initDataVault.js', () => ({
  storeInitData: vi.fn(),
  getStoredInitData: vi.fn(() => null),
  initDataVault: { get: vi.fn(), store: vi.fn(), clear: vi.fn(), has: vi.fn() },
}))

describe('splitFullNameIfNeeded', () => {
  it('splits full name into firstName and lastName', () => {
    expect(splitFullNameIfNeeded('Иван Петров')).toEqual({
      firstName: 'Иван',
      lastName: 'Петров',
    })
  })

  it('handles three-part name (first two = firstName)', () => {
    expect(splitFullNameIfNeeded('Мария Ивановна Петрова')).toEqual({
      firstName: 'Мария Ивановна',
      lastName: 'Петрова',
    })
  })

  it('returns just firstName for single-word name', () => {
    expect(splitFullNameIfNeeded('Алексей')).toEqual({
      firstName: 'Алексей',
      lastName: '',
    })
  })

  it('collapses extra whitespace', () => {
    expect(splitFullNameIfNeeded('  Иван   Петров  ')).toEqual({
      firstName: 'Иван',
      lastName: 'Петров',
    })
  })

  it('returns empty object for null', () => {
    expect(splitFullNameIfNeeded(null)).toEqual({})
  })

  it('returns empty object for non-string', () => {
    expect(splitFullNameIfNeeded(123)).toEqual({})
  })

  it('returns empty object for empty string', () => {
    expect(splitFullNameIfNeeded('')).toEqual({})
  })

  it('returns empty object for whitespace-only string', () => {
    expect(splitFullNameIfNeeded('   ')).toEqual({})
  })

  it('respects fallback for firstName when single name', () => {
    expect(splitFullNameIfNeeded('Алексей', { firstName: 'Fallback' })).toEqual({
      firstName: 'Fallback',
      lastName: '',
    })
  })

  it('respects fallback for lastName in two-part name', () => {
    expect(splitFullNameIfNeeded('Иван Петров', { lastName: 'Override' })).toEqual({
      firstName: 'Иван',
      lastName: 'Override',
    })
  })
})
