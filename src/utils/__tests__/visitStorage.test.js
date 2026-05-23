/**
 * Тесты для src/utils/visitStorage.js
 *
 * Модуль управляет данными записи (визита) в localStorage: сотрудник, услуги,
 * дата/время, комментарий. Эти данные передаются между шагами многостраничного
 * флоу записи (выбор услуги → выбор времени → подтверждение).
 *
 * Особенности:
 * - writeVisit и clearVisit диспатчат кастомный DOM-событие 'local-storage-changed',
 *   чтобы компоненты Vue могли реактивно обновляться (localStorage не реактивен сам по себе).
 * - writeVisit поддерживает опциональную синхронизацию в cookie (syncCookie: true)
 *   для случаев, когда данные нужны на стороне сервера.
 *
 * logger мокируется, чтобы предупреждения не попадали в вывод тестов.
 */
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
    // Первый запуск флоу — хранилище пустое, возвращаем безопасные дефолты
    const result = readVisit()
    expect(result).toEqual(DEFAULT_VISIT)
  })

  it('returns parsed visit merged with defaults', () => {
    // Частично заполненные данные (только staff_id) дополняются дефолтами
    // Это защищает от ситуации, когда в storage неполная структура
    localStorage.setItem(VISIT_KEY, JSON.stringify({ staff_id: '42' }))
    const result = readVisit()
    expect(result.staff_id).toBe('42')
    expect(result.services_id).toEqual([])  // дефолт подставился
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
    // Если localStorage повреждён — JSON.parse бросит исключение, catch вернёт дефолт
    localStorage.setItem(VISIT_KEY, 'not-json{{{')
    expect(readVisit()).toEqual(DEFAULT_VISIT)
  })
})

describe('writeVisit', () => {
  it('saves visit to localStorage', () => {
    const visit = { ...DEFAULT_VISIT, staff_id: '7' }
    writeVisit(visit)
    // Проверяем через прямое чтение из localStorage (не через readVisit)
    expect(JSON.parse(localStorage.getItem(VISIT_KEY))).toEqual(visit)
  })

  it('dispatches local-storage-changed event', () => {
    // Vue-компоненты подписаны на этот ивент для реактивного обновления
    const handler = vi.fn()
    window.addEventListener('local-storage-changed', handler)

    writeVisit({ ...DEFAULT_VISIT })

    expect(handler).toHaveBeenCalledOnce()
    window.removeEventListener('local-storage-changed', handler)
  })

  it('does not sync cookie by default', () => {
    // Без явного { syncCookie: true } cookie не трогаем (приватность данных)
    writeVisit({ ...DEFAULT_VISIT })
    expect(document.cookie).not.toContain(VISIT_KEY)
  })

  it('syncs to cookie when syncCookie option is true', () => {
    // При syncCookie: true данные записываются и в cookie
    const visit = { ...DEFAULT_VISIT, staff_id: '5' }
    writeVisit(visit, { syncCookie: true })
    expect(document.cookie).toContain(VISIT_KEY)
  })
})

describe('clearVisit', () => {
  it('removes visit from localStorage', () => {
    // Сначала записываем, потом проверяем, что очистка работает
    localStorage.setItem(VISIT_KEY, JSON.stringify(DEFAULT_VISIT))
    clearVisit()
    expect(localStorage.getItem(VISIT_KEY)).toBeNull()
  })

  it('dispatches local-storage-changed event on clear', () => {
    // Компоненты должны узнать об очистке так же, как и о записи
    const handler = vi.fn()
    window.addEventListener('local-storage-changed', handler)

    clearVisit()

    expect(handler).toHaveBeenCalledOnce()
    window.removeEventListener('local-storage-changed', handler)
  })
})

describe('getRawVisit', () => {
  /**
   * В отличие от readVisit, getRawVisit НЕ дополняет данные дефолтами.
   * Используется когда нужна оригинальная структура без примесей.
   */
  it('returns null when localStorage is empty', () => {
    expect(getRawVisit()).toBeNull()
  })

  it('returns parsed object when data exists', () => {
    const visit = { staff_id: '3', services_id: [1] }
    localStorage.setItem(VISIT_KEY, JSON.stringify(visit))
    expect(getRawVisit()).toEqual(visit)
  })

  it('returns null for corrupted JSON', () => {
    // catch перехватывает ошибку парсинга и возвращает null (не дефолт, как в readVisit)
    localStorage.setItem(VISIT_KEY, '{{bad')
    expect(getRawVisit()).toBeNull()
  })
})
