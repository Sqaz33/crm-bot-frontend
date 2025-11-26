// src/debug/telegramDebug.js

import { ensureSession } from '../auth/ensureSession'

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
    console.log('[debug:init] setting Telegram.WebApp.initData…', rawInitData)

    const w = window
    w.Telegram = w.Telegram || {}
    w.Telegram.WebApp = w.Telegram.WebApp || {}
    w.Telegram.WebApp.initData = rawInitData

    try {
      const me = await ensureSession()
      console.log('[debug:init] ensureSession OK:', me)
      return { ok: true, me }
    } catch (err) {
      console.error('[debug:init] ensureSession ERROR:', err)
      return { ok: false, error: err }
    }
  }

  console.log(
    '%c[debug] Готово: ты авторизовался")',
    'color:#4caf50'
  )
}
