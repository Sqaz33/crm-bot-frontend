import { describe, it, expect, vi } from 'vitest'
import {
  readVisit,
  writeVisit,
  clearVisit,
  getRawVisit,
  DEFAULT_VISIT,
  VISIT_KEY,
} from '../visitStorage.js'

vi.mock('../logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

describe('readVisit', () => {
  it('returns default visit when localStorage is empty', () => {
    const result = readVisit()
    expect(result).toEqual(DEFAULT_VISIT)
  })

  it('returns parsed visit merged with defaults', () => {
    localStorage.setItem(VISIT_KEY, JSON.stringify({ staff_id: '42' }))
    const result = readVisit()
    expect(result.staff_id).toBe('42')
    expect(result.services_id).toEqual([])
  })

  it('returns full visit when all fields are present', () => {
    const visit = {
      staff_id: '1',
      services_id: [2, 3],
      visit_time: { start_time: '2026-03-26T10:00:00', end: '2026-03-26T11:00:00' },
      comment: 'test',
    }
    localStorage.setItem(VISIT_KEY, JSON.stringify(visit))
    expect(readVisit()).toEqual(visit)
  })

  it('returns default visit for corrupted JSON', () => {
    localStorage.setItem(VISIT_KEY, 'not-json{{{')
    expect(readVisit()).toEqual(DEFAULT_VISIT)
  })
})

describe('writeVisit', () => {
  it('saves visit to localStorage', () => {
    const visit = { ...DEFAULT_VISIT, staff_id: '7' }
    writeVisit(visit)
    expect(JSON.parse(localStorage.getItem(VISIT_KEY))).toEqual(visit)
  })

  it('dispatches local-storage-changed event', () => {
    const handler = vi.fn()
    window.addEventListener('local-storage-changed', handler)

    writeVisit({ ...DEFAULT_VISIT })

    expect(handler).toHaveBeenCalledOnce()
    window.removeEventListener('local-storage-changed', handler)
  })

  it('does not sync cookie by default', () => {
    writeVisit({ ...DEFAULT_VISIT })
    expect(document.cookie).not.toContain(VISIT_KEY)
  })

  it('syncs to cookie when syncCookie option is true', () => {
    const visit = { ...DEFAULT_VISIT, staff_id: '5' }
    writeVisit(visit, { syncCookie: true })
    expect(document.cookie).toContain(VISIT_KEY)
  })
})

describe('clearVisit', () => {
  it('removes visit from localStorage', () => {
    localStorage.setItem(VISIT_KEY, JSON.stringify(DEFAULT_VISIT))
    clearVisit()
    expect(localStorage.getItem(VISIT_KEY)).toBeNull()
  })

  it('dispatches local-storage-changed event on clear', () => {
    const handler = vi.fn()
    window.addEventListener('local-storage-changed', handler)

    clearVisit()

    expect(handler).toHaveBeenCalledOnce()
    window.removeEventListener('local-storage-changed', handler)
  })
})

describe('getRawVisit', () => {
  it('returns null when localStorage is empty', () => {
    expect(getRawVisit()).toBeNull()
  })

  it('returns parsed object when data exists', () => {
    const visit = { staff_id: '3', services_id: [1] }
    localStorage.setItem(VISIT_KEY, JSON.stringify(visit))
    expect(getRawVisit()).toEqual(visit)
  })

  it('returns null for corrupted JSON', () => {
    localStorage.setItem(VISIT_KEY, '{{bad')
    expect(getRawVisit()).toBeNull()
  })
})
