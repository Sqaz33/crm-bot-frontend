
export function getInitData() {
  let raw = null;


  if (window.Telegram?.WebApp?.initData) {
    raw = window.Telegram.WebApp.initData;
  }


  if (!raw && window.location.hash.startsWith('#tgWebAppData=')) {
    raw = decodeURIComponent(window.location.hash.replace('#tgWebAppData=', ''));
  }


  if (!raw) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('init_data')) {
      raw = decodeURIComponent(params.get('init_data'));
    }
  }

  if (!raw) return null;


  console.group('[INIT_DATA RAW]');
  console.log('-----BEGIN RAW INIT_DATA-----');
  console.log(raw);
  console.log('-----END RAW INIT_DATA-----');
  console.log('Длина строки:', raw.length);
  console.groupEnd();


  const idx = raw.indexOf('&tgWebAppVersion=');
  if (idx > -1) {
    raw = raw.substring(0, idx);
  }


  console.group('[INIT_DATA CLEAN]');
  console.log('-----BEGIN CLEAN INIT_DATA-----');
  console.log(raw);
  console.log('-----END CLEAN INIT_DATA-----');
  console.log('Длина строки:', raw.length);
  console.groupEnd();

  return raw;
}

export function parseTelegramLaunchData() {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    const hash = window.location.hash || '';
    if (hash.includes('user=')) {
      const match = decodeURIComponent(hash).match(/user=({.*?})/);
      if (match) {
        return JSON.parse(match[1]);
      }
    }
  } catch (e) {
    console.error('parseTelegramLaunchData error:', e);
  }
  return null;
}
