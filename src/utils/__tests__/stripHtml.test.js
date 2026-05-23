import { describe, it, expect } from 'vitest'
import { stripHtml } from '../stripHtml.js'

describe('stripHtml', () => {
  it('removes simple tags', () => {
    expect(stripHtml('<b>text</b>')).toBe('text')
  })

  it('removes multiple tags', () => {
    expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
  })

  it('removes self-closing tags', () => {
    expect(stripHtml('before<br/>after')).toBe('beforeafter')
  })

  it('removes tags with attributes', () => {
    expect(stripHtml('<a href="https://example.com" class="link">click</a>')).toBe('click')
  })

  it('returns empty string for null', () => {
    expect(stripHtml(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(stripHtml(undefined)).toBe('')
  })

  it('returns plain string unchanged', () => {
    expect(stripHtml('no tags here')).toBe('no tags here')
  })

  it('returns truthy non-string input as-is', () => {
    expect(stripHtml(42)).toBe(42)
  })

  it('returns empty string for falsy non-string input', () => {
    // false is falsy → html || '' evaluates to ''
    expect(stripHtml(false)).toBe('')
  })
})
