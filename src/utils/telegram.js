export function getInitData() {
  let raw = null

  if (window.Telegram?.WebApp?.initData) {
    raw = window.Telegram.WebApp.initData
    console.log('[InitData] source=window.Telegram.WebApp.initData len=', raw?.length)
  }

  if (!raw && window.location.hash?.startsWith('#tgWebAppData=')) {
    raw = decodeURIComponent(window.location.hash.replace('#tgWebAppData=', ''))
    console.log('[InitData] source=location.hash len=', raw?.length)
  }

  if (!raw) {
    const params = new URLSearchParams(window.location.search)
    if (params.has('init_data')) {
      raw = decodeURIComponent(params.get('init_data'))
      console.log('[InitData] source=query.init_data len=', raw?.length)
    }
  }

  if (!raw) {
    console.warn('[InitData] not found')
    return null
  }

  // -- чистка хвоста версии
  const idx = raw.indexOf('&tgWebAppVersion=')
  if (idx > -1) raw = raw.substring(0, idx)

  // -- подробные логи
  console.group('[InitData] CLEAN')
  console.log('-----BEGIN INIT_DATA-----')
  console.log(raw)                            // печатаем целиком
  console.log('-----END INIT_DATA-----')
  console.log('length =', raw.length)

  const usp = new URLSearchParams(raw)
  const keys = Array.from(usp.keys())
  console.log('keys:', keys)

  const must = ['hash', 'auth_date', 'user']
  const missing = must.filter(k => !usp.has(k))
  if (missing.length) {
    console.warn('MISSING keys:', missing)
  } else {
    console.log('All required keys present ✓')
  }
  console.groupEnd()

  try {
    localStorage.setItem('DEBUG_INIT_DATA', raw)
    console.log('[InitData] saved to localStorage.DEBUG_INIT_DATA')
  } catch {}

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

// Удобный дебаг-хелпер из консоли:
export function debugInitData() {
  const val = localStorage.getItem('DEBUG_INIT_DATA')
  if (!val) { console.warn('DEBUG_INIT_DATA not found'); return }
  const usp = new URLSearchParams(val)
  console.table(Array.from(usp.entries()).map(([k,v]) => ({ key:k, value:v.slice(0,120) })))
  const u = usp.get('user')
  if (u) {
    let dec=u; try{dec=decodeURIComponent(u)}catch{}
    try { console.log('user JSON:', JSON.parse(dec)) } catch { console.log('user raw:', dec) }
  }
}
