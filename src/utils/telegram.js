export function getInitData() {
  let raw = null
  if (window.Telegram?.WebApp?.initData) {
    raw = window.Telegram.WebApp.initData
  }
  if (!raw && window.location.hash?.startsWith('#tgWebAppData=')) {
    raw = decodeURIComponent(window.location.hash.replace('#tgWebAppData=', ''))
  }
  if (!raw) {
    const params = new URLSearchParams(window.location.search)
    if (params.has('init_data')) raw = decodeURIComponent(params.get('init_data'))
  }
  if (!raw) return null

  // обрезаем шум, оставляем каноничную строку
  const idx = raw.indexOf('&tgWebAppVersion=')
  if (idx > -1) raw = raw.substring(0, idx)

  return raw
}

export function extractUserFromInitData(id) {
  try {
    const usp = new URLSearchParams(id)
    const rawUser = usp.get('user')
    if (!rawUser) return null

    let s1 = rawUser; try { s1 = decodeURIComponent(rawUser) } catch {}
    let s2 = s1;     try { s2 = decodeURIComponent(s1) }     catch {}

    let obj = null
    try { obj = JSON.parse(s2) } catch { try { obj = JSON.parse(s1) } catch {} }
    if (!obj) return null

    return {
      firstName: obj.first_name || '',
      lastName:  obj.last_name  || '',
      tg_id:     obj.id ?? null,
      username:  obj.username || '',
    }
  } catch { return null }
}

export function splitFullNameIfNeeded(fullName, fallback = {}) {
  if (!fullName || typeof fullName !== 'string') return {}
  const trimmed = fullName.trim().replace(/\s+/g, ' ')
  if (!trimmed) return {}
  const parts = trimmed.split(' ')
  if (parts.length === 1) {
    return { firstName: fallback.firstName || parts[0], lastName: fallback.lastName || '' }
  }
  return {
    firstName: fallback.firstName || parts.slice(0, -1).join(' '),
    lastName:  fallback.lastName  || parts.slice(-1)[0],
  }
}
