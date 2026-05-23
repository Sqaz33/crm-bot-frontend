import { describe, it, expect } from 'vitest'
import { getFirstLetter, getStaffId, cap } from '../stringUtils.js'

describe('getFirstLetter', () => {
  it('returns uppercase first letter of a string', () => {
    expect(getFirstLetter('alice')).toBe('A')
    expect(getFirstLetter('Борис')).toBe('Б')
  })

  it('returns empty string for empty input', () => {
    expect(getFirstLetter('')).toBe('')
  })

  it('returns empty string for null and undefined', () => {
    expect(getFirstLetter(null)).toBe('')
    expect(getFirstLetter(undefined)).toBe('')
  })

  it('returns single character unchanged (already uppercase)', () => {
    expect(getFirstLetter('Z')).toBe('Z')
  })
})

describe('getStaffId', () => {
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
    expect(getStaffId({})).toBeNull()
  })

  it('prefers id over staff_id', () => {
    expect(getStaffId({ id: 1, staff_id: 2 })).toBe(1)
  })
})

describe('cap', () => {
  it('capitalizes first letter', () => {
    expect(cap('hello world')).toBe('Hello world')
  })

  it('returns empty string for falsy input', () => {
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
