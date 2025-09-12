export function getInitDataString() {
  // 1) основной источник — внутри Telegram WebApp
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand?.()
    return window.Telegram.WebApp.initData // raw query string
  }

  // 2) fallback из hash
  const hash = window.location.hash.slice(1) // "tgWebAppData=...."
  if (hash.startsWith('tgWebAppData=')) {
    const encoded = hash.replace(/^tgWebAppData=/, '')
    // превращаем %3D → "=", %26 → "&", и т.д.
    return decodeURIComponent(encoded)
  }

  // 3) fallback из query (?init_data=...)
  const q = new URLSearchParams(window.location.search).get('init_data')
  if (q) {
    // если пришло закодированным — декодируем до сырого query-string
    try { return decodeURIComponent(q) } catch { return q }
  }

  return null
}

// Для UI (автоподстановка имени), не для подписи.
export function parseTelegramLaunchData() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search))

  if (window.Telegram?.WebApp?.initDataUnsafe) {
    return { params, tgData: window.Telegram.WebApp.initDataUnsafe }
  }

  let tgData = {}
  const hash = window.location.hash.slice(1)
  if (hash.startsWith('tgWebAppData=')) {
    const decoded = decodeURIComponent(hash.replace(/^tgWebAppData=/, ''))
    const usp = new URLSearchParams(decoded)
    for (const [k, v] of usp.entries()) {
      if (k === 'user') {
        try { tgData.user = JSON.parse(v) } catch { tgData.user = null }
      } else {
        tgData[k] = v
      }
    }
  }
  return { params, tgData }
}