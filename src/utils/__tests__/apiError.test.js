/**
 * Тесты для src/utils/apiError.js
 *
 * getErrorMessage — единая точка извлечения читаемого сообщения из ошибки axios.
 * Используется во всех местах, где нужно показать пользователю текст ошибки API.
 *
 * Приоритет источников сообщения:
 *   1. response.data (строка)
 *   2. response.data.detail (поле Django REST framework)
 *   3. err.message (сообщение JavaScript-ошибки)
 *   4. fallback (по умолчанию 'Произошла ошибка')
 */
import { describe, it, expect } from 'vitest'
import { getErrorMessage } from '../apiError.js'

describe('getErrorMessage', () => {
  it('returns fallback for null error', () => {
    // Самый частый случай при вызове без аргументов или при перехвате null
    expect(getErrorMessage(null)).toBe('Произошла ошибка')
  })

  it('returns fallback for undefined error', () => {
    expect(getErrorMessage(undefined)).toBe('Произошла ошибка')
  })

  it('uses custom fallback', () => {
    // Вызывающий код может передать контекстное сообщение вместо дефолтного
    expect(getErrorMessage(null, 'Кастомная ошибка')).toBe('Кастомная ошибка')
  })

  it('returns string response data directly', () => {
    // Некоторые API возвращают ошибку как plain text, а не JSON
    const err = { response: { data: 'Ошибка сервера' } }
    expect(getErrorMessage(err)).toBe('Ошибка сервера')
  })

  it('returns detail field from response data', () => {
    // Django REST Framework оборачивает ошибки в { detail: "..." }
    const err = { response: { data: { detail: 'Не найдено' } } }
    expect(getErrorMessage(err)).toBe('Не найдено')
  })

  it('returns err.message when no response data', () => {
    // Сетевые ошибки (timeout, offline) не имеют response — используем err.message
    const err = { message: 'Network Error' }
    expect(getErrorMessage(err)).toBe('Network Error')
  })

  it('returns fallback when response data has no detail and err has no message', () => {
    // Данные есть, но не в ожидаемом формате — безопасно деградируем до fallback
    const err = { response: { data: { other: 'value' } } }
    expect(getErrorMessage(err)).toBe('Произошла ошибка')
  })

  it('returns fallback for empty object error', () => {
    // Объект без response и message — ни один источник не подходит
    expect(getErrorMessage({})).toBe('Произошла ошибка')
  })

  it('prefers response.data string over err.message', () => {
    // response.data проверяется первым — err.message игнорируется
    const err = { response: { data: 'data error' }, message: 'message error' }
    expect(getErrorMessage(err)).toBe('data error')
  })
})
