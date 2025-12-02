// src/utils/telegram.js

/**
 * Получаем init_data из Telegram WebApp (или из hash/query при локальном запуске).
 * Логируем источник, длину строки и сохраняем копию в localStorage.DEBUG_INIT_DATA.
 */
export function getInitData() {
  let raw = null;

  if (window.Telegram?.WebApp?.initData) {
    raw = window.Telegram.WebApp.initData;
    console.log('[InitData] source=window.Telegram.WebApp.initData len=', raw?.length);
  }

  if (!raw && window.location.hash?.startsWith('#tgWebAppData=')) {
    raw = decodeURIComponent(window.location.hash.replace('#tgWebAppData=', ''));
    console.log('[InitData] source=location.hash len=', raw?.length);
  }

  if (!raw) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('init_data')) {
      raw = decodeURIComponent(params.get('init_data'));
      console.log('[InitData] source=query.init_data len=', raw?.length);
    }
  }

  if (!raw) {
    console.warn('[InitData] not found');
    return null;
  }

  // обрезаем хвост с версией
  const idx = raw.indexOf('&tgWebAppVersion=');
  if (idx > -1) raw = raw.substring(0, idx);

  console.group('[InitData] CLEAN');
  console.log('-----BEGIN INIT_DATA-----');
  console.log(raw);
  console.log('-----END INIT_DATA-----');
  console.log('length =', raw.length);

  const usp = new URLSearchParams(raw);
  const keys = Array.from(usp.keys());
  console.log('keys found:', keys);

  // Проверяем, что есть либо user, либо данные авторизации
  const hasUser = usp.has('user');
  const hasAuthDate = usp.has('auth_date');
  const hasHash = usp.has('hash');
  
  console.log('has user:', hasUser);
  console.log('has auth_date:', hasAuthDate);
  console.log('has hash:', hasHash);

  if (!hasHash) {
    console.warn('WARNING: hash is missing - initData may be invalid');
  }
  
  if (!hasAuthDate) {
    console.warn('WARNING: auth_date is missing');
  }

  // Если нет user, это может быть предварительная авторизация
  if (!hasUser) {
    console.warn('WARNING: user is missing - this may be initial auth state');
    console.log('Available params:');
    keys.forEach(key => {
      console.log(`  ${key}: ${usp.get(key).slice(0, 50)}...`);
    });
  } else {
    console.log('User data present ✓');
  }
  
  console.groupEnd();

  try {
    localStorage.setItem('DEBUG_INIT_DATA', raw);
    console.log('[InitData] saved to localStorage.DEBUG_INIT_DATA');
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  return raw;
}

/**
 * Извлекаем user из init_data (user=… в строке запроса)
 * Возвращает null если пользователь еще не авторизовался
 */
export function extractUserFromInitData(id) {
  if (!id) return null;
  
  try {
    const usp = new URLSearchParams(id);
    const rawUser = usp.get('user');
    
    // Если пользователь не авторизован, возвращаем null
    if (!rawUser) {
      console.log('[extractUserFromInitData] No user data - not authorized yet');
      return null;
    }

    // Декодируем строку user
    let decoded = rawUser;
    try {
      decoded = decodeURIComponent(rawUser);
    } catch (e) {
      console.warn('Failed to decodeURIComponent user:', e);
    }

    // Пытаемся распарсить JSON
    let userObj = null;
    try {
      userObj = JSON.parse(decoded);
    } catch (e) {
      console.warn('Failed to parse user JSON:', e);
      // Иногда может быть двойное кодирование
      try {
        const doubleDecoded = decodeURIComponent(decoded);
        userObj = JSON.parse(doubleDecoded);
      } catch (e2) {
        console.error('Failed to double decode user:', e2);
        return null;
      }
    }

    if (!userObj || !userObj.id) {
      console.warn('Invalid user object or missing id:', userObj);
      return null;
    }

    console.log('[extractUserFromInitData] Successfully extracted user:', {
      id: userObj.id,
      firstName: userObj.first_name,
      username: userObj.username
    });

    return {
      firstName: userObj.first_name || '',
      lastName: userObj.last_name || '',
      tg_id: userObj.id,
      username: userObj.username || '',
      language_code: userObj.language_code || '',
      is_premium: userObj.is_premium || false,
      allows_write_to_pm: userObj.allows_write_to_pm || false,
      photo_url: userObj.photo_url || ''
    };
  } catch (error) {
    console.error('[extractUserFromInitData] Error:', error);
    return null;
  }
}

/**
 * Получаем полную информацию об initData
 */
export function getInitDataInfo() {
  const initData = getInitData();
  if (!initData) {
    return { raw: null, user: null, params: null };
  }

  const usp = new URLSearchParams(initData);
  const params = Object.fromEntries(usp.entries());
  const user = extractUserFromInitData(initData);

  // Также получаем auth_date
  const authDate = params.auth_date ? parseInt(params.auth_date) * 1000 : null;
  const authDateFormatted = authDate ? new Date(authDate).toISOString() : null;

  return {
    raw: initData,
    user,
    params,
    auth_date: authDate,
    auth_date_formatted: authDateFormatted,
    hash: params.hash,
    isAuthorized: !!user
  };
}

/**
 * Проверяем, авторизован ли пользователь
 */
export function isUserAuthorized() {
  const initData = getInitData();
  if (!initData) return false;
  
  const usp = new URLSearchParams(initData);
  return usp.has('user');
}

/**
 * Разделяем строку ФИО на firstName/lastName
 */
export function splitFullNameIfNeeded(fullName, fallback = {}) {
  if (!fullName || typeof fullName !== 'string') return {};
  const trimmed = fullName.trim().replace(/\s+/g, ' ');
  if (!trimmed) return {};

  const parts = trimmed.split(' ');
  if (parts.length === 1) {
    return {
      firstName: fallback.firstName || parts[0],
      lastName: fallback.lastName || ''
    };
  }

  return {
    firstName: fallback.firstName || parts.slice(0, -1).join(' '),
    lastName: fallback.lastName || parts.slice(-1)[0]
  };
}

/**
 * Вспомогательная функция для отладки:
 * Печатает сохранённый init_data из localStorage.DEBUG_INIT_DATA
 */
export function debugInitData() {
  const val = localStorage.getItem('DEBUG_INIT_DATA');
  if (!val) {
    console.warn('DEBUG_INIT_DATA not found');
    return;
  }
  
  console.group('[DEBUG INIT_DATA]');
  
  const usp = new URLSearchParams(val);
  
  // Выводим все параметры
  console.table(
    Array.from(usp.entries()).map(([k, v]) => ({
      key: k,
      value: v.length > 120 ? v.slice(0, 120) + '...' : v,
      length: v.length
    }))
  );

  // Выводим user отдельно, если есть
  const u = usp.get('user');
  if (u) {
    console.group('User data:');
    try {
      let decoded = u;
      try { decoded = decodeURIComponent(u); } catch {}
      
      try {
        const userObj = JSON.parse(decoded);
        console.log('Parsed successfully:', userObj);
      } catch {
        console.log('Failed to parse, raw decoded:', decoded);
        console.log('Raw:', u);
      }
    } catch (e) {
      console.error('Error parsing user:', e);
    }
    console.groupEnd();
  }

  // Выводим auth_date в читаемом формате
  const authDate = usp.get('auth_date');
  if (authDate) {
    const date = new Date(parseInt(authDate) * 1000);
    console.log('Auth date:', date.toISOString(), `(${authDate})`);
  }

  console.groupEnd();
}

/**
 * Инициализация WebApp
 */
export function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    console.log('[Telegram WebApp] Initializing...');
    
    // Развертываем приложение на весь экран
    window.Telegram.WebApp.expand();
    
    // Включаем кнопку "Назад"
    window.Telegram.WebApp.BackButton.show();
    
    // Обработка кнопки "Назад"
    window.Telegram.WebApp.BackButton.onClick(() => {
      window.history.back();
    });
    
    // Логируем версию и платформу
    console.log('[Telegram WebApp] Platform:', window.Telegram.WebApp.platform);
    console.log('[Telegram WebApp] Version:', window.Telegram.WebApp.version);
    console.log('[Telegram WebApp] InitDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
    
    return window.Telegram.WebApp;
  }
  
  console.warn('[Telegram WebApp] Not available');
  return null;
}