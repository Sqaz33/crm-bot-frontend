// src/debug/telegramDebug.js

import { ensureSession } from '../auth/ensureSession'
import { useSalonStore } from '../stores/salon'
import { logger } from '../utils/logger'

/**
 * Подключает глобальную функцию:
 * 
 *   await window.__debugInitData("query_id=...&user=...")
 *
 * Она:
 *   1) проставляет window.Telegram.WebApp.initData
 *   2) извлекает SALON_ID из start_param
 *   3) вызывает ensureSession()
 *   4) перезагружает salon store
 *   5) возвращает { ok: true, me } или { ok: false, error }
 */
export function attachDebugInitSender() {
  if (typeof window === 'undefined') return

  window.__debugInitData = async function (rawInitData) {
    logger.debug('debug:init: устанавливаем Telegram.WebApp.initData', { rawInitDataLen: rawInitData?.length })

    const w = window
    w.Telegram = w.Telegram || {}
    w.Telegram.WebApp = w.Telegram.WebApp || {}
    w.Telegram.WebApp.initData = rawInitData

    // Extract and save SALON_ID from initData
    try {
      const usp = new URLSearchParams(rawInitData)
      const salonId = usp.get('start_param')
      if (salonId) {
        sessionStorage.setItem('SALON_ID', salonId)
        logger.debug('debug:init: SALON_ID saved', { salonId })
      }
    } catch (e) {
      logger.warn('debug:init: failed to extract SALON_ID', { error: e?.message })
    }

    try {
      const me = await ensureSession()
      if (me) {
        logger.debug('ensureSession OK', { me })
      } else {
        logger.error('ensureSession err')
      }

      // Re-fetch salon data with new session and SALON_ID
      try {
        const salonStore = useSalonStore()
        salonStore.$reset()
        await salonStore.fetch()
      } catch (e) {
        logger.warn('debug:init: salon refetch failed', { error: e?.message })
      }

      return { ok: true, me }
    } catch (err) {
      logger.error('debug:init: ensureSession ERROR', { error: err?.message })
      return { ok: false, error: err }
    }
  }

  logger.debug('debug: функция __debugInitData доступна')
}
