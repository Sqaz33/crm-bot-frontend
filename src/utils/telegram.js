function tryDecodeOnce(str) {
  try { return decodeURIComponent(str) } catch { return str }
}

export function getInitData() {

  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand?.()
    return window.Telegram.WebApp.initData
  }


  const hash = window.location.hash.slice(1) 
  if (hash.startsWith('tgWebAppData=')) {
    const encoded = hash.substring('tgWebAppData='.length)
    return tryDecodeOnce(encoded) 
  }


  const q = new URLSearchParams(window.location.search).get('init_data')
  if (q) {
    return q.startsWith('query_id=') ? q : tryDecodeOnce(q)
  }

  return null
}


export function parseTelegramLaunchData() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search))

  if (window.Telegram?.WebApp?.initDataUnsafe) {
    return { params, tgData: window.Telegram.WebApp.initDataUnsafe }
  }

  let tgData = {}
  const raw = getInitData()
  if (raw) {
    const usp = new URLSearchParams(raw)
    const userStr = usp.get('user')
    if (userStr) {
      try { tgData.user = JSON.parse(userStr) } catch { tgData.user = null }
    }

  }
  return { params, tgData }
}