/**
 * Парсит:
 * 1) Query-параметры ?user_id=…&sig=…
 * 2) Хэш-параметры после #tgWebAppData=
 */
export function parseTelegramLaunchData() {
  // 1. Query
  const params = Object.fromEntries(new URLSearchParams(window.location.search))

  // 2. Hash
  let tgData = {}
  const hash = window.location.hash.slice(1) // убираем '#'
  if (hash.startsWith('tgWebAppData=')) {
    const encoded = hash.replace('tgWebAppData=', '')
    const decoded = decodeURIComponent(encoded)
    const urlp = new URLSearchParams(decoded)
    tgData = {}
    for (const [k, v] of urlp.entries()) {
      if (k === 'user') {
        try {
          tgData.user = JSON.parse(v)
        } catch {
          console.warn('Не удалось распарсить user JSON')
          tgData.user = null
        }
      } else {
        tgData[k] = v
      }
    }
  }
  return { params, tgData }
}
