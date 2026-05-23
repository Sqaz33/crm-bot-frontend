/**
 * Тесты для src/utils/stripHtml.js
 *
 * Функция stripHtml используется в salon store для очистки HTML из полей
 * name/description/about_company, которые приходят с сервера с разметкой.
 *
 * Ключевые сценарии: сложные теги с атрибутами, самозакрывающиеся теги,
 * graceful degradation для нестроковых и пустых значений.
 */
import { describe, it, expect } from 'vitest'
import { stripHtml } from '../stripHtml.js'

describe('stripHtml', () => {
  it('removes simple tags', () => {
    expect(stripHtml('<b>text</b>')).toBe('text')
  })

  it('removes multiple tags', () => {
    // Вложенные теги тоже убираются, текст внутри сохраняется
    expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
  })

  it('removes self-closing tags', () => {
    // <br/> не содержит текста, поэтому символы вокруг слипаются
    expect(stripHtml('before<br/>after')).toBe('beforeafter')
  })

  it('removes tags with attributes', () => {
    // Регулярное выражение /<[^>]+>/g захватывает всё между < и >, включая атрибуты
    expect(stripHtml('<a href="https://example.com" class="link">click</a>')).toBe('click')
  })

  it('returns empty string for null', () => {
    // Условие: !html — true для null → возвращает html || '' = null || '' = ''
    expect(stripHtml(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(stripHtml(undefined)).toBe('')
  })

  it('returns plain string unchanged', () => {
    // Строка без тегов не затрагивается регулярным выражением
    expect(stripHtml('no tags here')).toBe('no tags here')
  })

  it('returns truthy non-string input as-is', () => {
    // Число — не строка, но truthy → входит в ветку typeof !== 'string'
    // → возвращает html || '' = 42 || '' = 42
    expect(stripHtml(42)).toBe(42)
  })

  it('returns empty string for falsy non-string input', () => {
    // false — falsy → возвращает html || '' = false || '' = ''
    // Итог: не сам false, а пустая строка
    expect(stripHtml(false)).toBe('')
  })
})
