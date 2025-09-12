export function getInitDataString() {

  if (window.Telegram?.WebApp?.initData) {
    window.Telegram.WebApp.expand?.()
    return window.Telegram.WebApp.initData 
  }


  const raw = window.location.hash.slice(1) // "tgWebAppData=..."
  if (raw.startsWith('tgWebAppData=')) {
    return raw.replace('tgWebAppData=', '') 
  }

  
  const q = new URLSearchParams(window.location.search).get('init_data')
  if (q) return q

  return null
}