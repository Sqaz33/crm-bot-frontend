export function parseTelegramLaunchData() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search))

  let tgData = {}
  const hash = window.location.hash.slice(1)
  if (hash.startsWith('tgWebAppData=')) {
    const encoded = hash.replace('tgWebAppData=', '')
    const decoded = decodeURIComponent(encoded)
    const urlp = new URLSearchParams(decoded)
    tgData = {}
    for (const [k, v] of urlp.entries()) {
      if (k === 'user') {
        try { tgData.user = JSON.parse(v) } catch { tgData.user = null }
      } else {
        tgData[k] = v
      }
    }
  }
  return { params, tgData }
}

/**
 * Универсально возвращает строку init_data:
 * 1) WebApp: window.Telegram.WebApp.initData
 * 2) Хэш: #tgWebAppData=...
 * 3) Query: ?init_data=...
 */
export function getInitDataString() {
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand?.()
    return window.Telegram.WebApp.initData
  }
  const q = new URLSearchParams(window.location.search).get('init_data')
  if (q) return q

  const raw = window.location.hash.slice(1)
  if (raw.startsWith('tgWebAppData=')) {
    const payload = raw.replace('tgWebAppData=', '').split('&tgWebAppVersion')[0]
    return decodeURIComponent(payload)
  }
  return null
}