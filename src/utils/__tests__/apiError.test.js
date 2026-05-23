import { describe, it, expect } from 'vitest'
import { getErrorMessage } from '../apiError.js'

describe('getErrorMessage', () => {
  it('returns fallback for null error', () => {
    expect(getErrorMessage(null)).toBe('Произошла ошибка')
  })

  it('returns fallback for undefined error', () => {
    expect(getErrorMessage(undefined)).toBe('Произошла ошибка')
  })

  it('uses custom fallback', () => {
    expect(getErrorMessage(null, 'Кастомная ошибка')).toBe('Кастомная ошибка')
  })

  it('returns string response data directly', () => {
    const err = { response: { data: 'Ошибка сервера' } }
    expect(getErrorMessage(err)).toBe('Ошибка сервера')
  })

  it('returns detail field from response data', () => {
    const err = { response: { data: { detail: 'Не найдено' } } }
    expect(getErrorMessage(err)).toBe('Не найдено')
  })

  it('returns err.message when no response data', () => {
    const err = { message: 'Network Error' }
    expect(getErrorMessage(err)).toBe('Network Error')
  })

  it('returns fallback when response data has no detail and err has no message', () => {
    const err = { response: { data: { other: 'value' } } }
    expect(getErrorMessage(err)).toBe('Произошла ошибка')
  })

  it('returns fallback for empty object error', () => {
    expect(getErrorMessage({})).toBe('Произошла ошибка')
  })

  it('prefers response.data string over err.message', () => {
    const err = { response: { data: 'data error' }, message: 'message error' }
    expect(getErrorMessage(err)).toBe('data error')
  })
})
