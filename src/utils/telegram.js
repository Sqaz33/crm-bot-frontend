export function getInitDataString() {
  // 1) идеальный источник — WebApp API
  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand?.()
    return window.Telegram.WebApp.initData // raw string as-is
  }

  // 2) fallback из hash: #tgWebAppData=...
  const raw = window.location.hash.slice(1)
  if (raw.startsWith('tgWebAppData=')) {
    // возвращаем без decode/обрезки
    return raw.replace('tgWebAppData=', '')
  }

  // 3) опциональный fallback из query (?init_data=...) — тоже без decode
  const q = new URLSearchParams(window.location.search).get('init_data')
  if (q) return q

  return null
}

/**
 * Возвращает разобранные параметры запуска и tgData для автозаполнения UI,
 * НЕ для авторизации.
 * Сначала используем initDataUnsafe, иначе — парсим hash.
 */
export function parseTelegramLaunchData() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search))

  // 1) предпочтительно — готовая структура от Telegram
  if (window.Telegram?.WebApp?.initDataUnsafe) {
    return { params, tgData: window.Telegram.WebApp.initDataUnsafe }
  }

  // 2) fallback: распарсим tgWebAppData из hash
  let tgData = {}
  const hash = window.location.hash.slice(1) // "tgWebAppData=...."
  if (hash.startsWith('tgWebAppData=')) {
    // Для парсинга в объект можно декодировать — это не участвует в подписи
    const encoded = hash.replace('tgWebAppData=', '')
    const decoded = decodeURIComponent(encoded)
    const urlp = new URLSearchParams(decoded)
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