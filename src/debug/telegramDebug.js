// src/debug/telegramDebug.js

import { ensureSession } from '../auth/ensureSession'
import { logger } from '../utils/logger'

/**
 * Подключает глобальную функцию:
 * 
 *   await window.__debugInitData("query_id=...&user=...")
 *
 * Она:
 *   1) проставляет window.Telegram.WebApp.initData
 *   2) вызывает ensureSession()
 *   3) возвращает { ok: true, me } или { ok: false, error }
 */
export function attachDebugInitSender() {
  if (typeof window === 'undefined') return

  window.__debugInitData = async function (rawInitData) {
    logger.debug('debug:init: устанавливаем Telegram.WebApp.initData', { rawInitDataLen: rawInitData?.length })

    const w = window
    w.Telegram = w.Telegram || {}
    w.Telegram.WebApp = w.Telegram.WebApp || {}
    w.Telegram.WebApp.initData = rawInitData

    try {
      const me = await ensureSession()
      logger.debug('debug:init: ensureSession OK', { me })
      return { ok: true, me }
    } catch (err) {
      logger.error('debug:init: ensureSession ERROR', { error: err?.message })
      return { ok: false, error: err }
    }
  }

  logger.debug('debug: функция __debugInitData доступна')
}
