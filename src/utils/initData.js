// src/utils/telegram.js

import { logger } from './logger'
import { storeInitData, getStoredInitData } from '../auth/initDataVault'

/**
 * Получаем init_data из Telegram WebApp (или из hash/query при локальном запуске).
 * Использует initDataVault для безопасного хранения в sessionStorage (localStorage опционально).
 */

function getInitDataFromTG() {
  let raw = null;

  if (window.Telegram?.WebApp?.initData) {
    raw = window.Telegram.WebApp.initData;
    logger.debug('getInitDataFromTG: source=window.Telegram.WebApp.initData', { length: raw?.length });
  }

  if (!raw && window.location.hash?.startsWith('#tgWebAppData=')) {
    raw = decodeURIComponent(window.location.hash.replace('#tgWebAppData=', ''));
    logger.debug('getInitDataFromTG: source=location.hash', { length: raw?.length });
  }

  if (!raw) {
    const params = new URLSearchParams(window.location.search);
    if (params.has('init_data')) {
      raw = decodeURIComponent(params.get('init_data'));
      logger.debug('getInitDataFromTG: source=query.init_data', { length: raw?.length });
    }
  }

  if (!raw) {
    logger.warn('getInitDataFromTG: init_data not found');
    return null;
  }

  // обрезаем хвост с версией
  const idx = raw.indexOf('&tgWebAppVersion=');
  if (idx > -1) raw = raw.substring(0, idx);

  const usp = new URLSearchParams(raw);
  const keys = Array.from(usp.keys());
  logger.debug('getInitDataFromTG: keys found', { keys, length: raw.length });

  // Проверяем, что есть либо user, либо данные авторизации
  const hasUser = usp.has('user');
  const hasAuthDate = usp.has('auth_date');
  const hasHash = usp.has('hash');
  
  if (!hasHash) {
    logger.warn('getInitDataFromTG: hash is missing - initData may be invalid');
  }
  
  if (!hasAuthDate) {
    logger.warn('getInitDataFromTG: auth_date is missing');
  }

  if (!hasUser) {
    logger.warn('getInitDataFromTG: user is missing - this may be initial auth state');
    logger.debug('getInitDataFromTG: available params', { 
      params: keys.map(k => `${k}: ${usp.get(k).slice(0, 50)}...`) 
    });
  } else {
    logger.debug('getInitDataFromTG: user data present');
  }

  return raw;
}

function getInitDataFromMAX() {
  // TODO: debug init data
  let raw = null

  if (!raw && window.location.hash?.startsWith('#WebAppData=')) {
    raw = decodeURIComponent(window.location.hash.replace('#WebAppData=', ''));
    logger.debug('getInitDataFromMAX: source=location.hash', { length: raw?.length });

    const idx = raw.indexOf('&WebAppPlatform=');
    if (idx > -1) raw = raw.substring(0, idx);
  }

  if (!raw) {
    logger.warn('getInitDataFromMAX: init_data not found');
    return null;
  }

  return raw;
}

export function getInitData() {
  const isMAX = sessionStorage.getItem("max_frontend") === 'true';

  let raw

  if (isMAX) raw = getInitDataFromMAX()
  else raw = getInitDataFromTG()

  // Используем initDataVault для безопасного сохранения
  // По умолчанию сохраняет в sessionStorage, в localStorage только при VITE_SAVE_INIT_DATA_TO_STORAGE=true
  storeInitData(raw);
  logger.debug('getInitData: saved via initDataVault');

  return raw;
}

/**
 * Извлекаем user из init_data (user=… в строке запроса)
 * Возвращает null если пользователь еще не авторизовался
 */
// export function extractUserFromInitData(id) {
//   if (!id) return null;
  
//   try {
//     const usp = new URLSearchParams(id);
//     const rawUser = usp.get('user');
    
//     // Если пользователь не авторизован, возвращаем null
//     if (!rawUser) {
//       logger.debug('extractUserFromInitData: no user data - not authorized yet');
//       return null;
//     }

//     // Декодируем строку user
//     let decoded = rawUser;
//     try {
//       decoded = decodeURIComponent(rawUser);
//     } catch (e) {
//       logger.warn('extractUserFromInitData: failed to decodeURIComponent user', { error: e?.message });
//     }

//     // Пытаемся распарсить JSON
//     let userObj = null;
//     try {
//       userObj = JSON.parse(decoded);
//     } catch (e) {
//       logger.warn('extractUserFromInitData: failed to parse user JSON', { error: e?.message });
//       // Иногда может быть двойное кодирование
//       try {
//         const doubleDecoded = decodeURIComponent(decoded);
//         userObj = JSON.parse(doubleDecoded);
//       } catch (e2) {
//         logger.error('extractUserFromInitData: failed to double decode user', { error: e2?.message });
//         return null;
//       }
//     }

//     if (!userObj || !userObj.id) {
//       logger.warn('extractUserFromInitData: invalid user object or missing id', { userObj });
//       return null;
//     }

//     logger.debug('extractUserFromInitData: successfully extracted user', {
//       id: userObj.id,
//       firstName: userObj.first_name,
//       username: userObj.username
//     });

//     return {
//       firstName: userObj.first_name || '',
//       lastName: userObj.last_name || '',
//       tg_id: userObj.id,
//       username: userObj.username || '',
//       language_code: userObj.language_code || '',
//       is_premium: userObj.is_premium || false,
//       allows_write_to_pm: userObj.allows_write_to_pm || false,
//       photo_url: userObj.photo_url || ''
//     };
//   } catch (error) {
//     logger.error('[extractUserFromInitData] Error', { error: error?.message || String(error) });
//     return null;
//   }
// }

/**
 * Форматирует initData для отладки (console.table для разработчиков)
 */
// export function debugInitDataPretty(initData) {
//   if (!initData) {
//     logger.warn('debugInitDataPretty: initData is null');
//     return;
//   }
  
//   const usp = new URLSearchParams(initData);
  
//   // Выводим все параметры в читаемом виде
//   const params = Array.from(usp.entries()).map(([k, v]) => ({
//     key: k,
//     value: v.length > 120 ? v.slice(0, 120) + '...' : v,
//     length: v.length
//   }));
  
//   logger.debug('debugInitDataPretty: params', { params });

//   // Выводим user отдельно, если есть
//   const u = usp.get('user');
//   if (u) {
//     try {
//       let decoded = u;
//       try { decoded = decodeURIComponent(u); } catch {}
      
//       try {
//         const userObj = JSON.parse(decoded);
//         logger.debug('debugInitDataPretty: user', { user: userObj });
//       } catch {
//         logger.debug('debugInitDataPretty: failed to parse user', { decoded });
//       }
//     } catch (e) {
//       logger.error('debugInitDataPretty: error parsing user', { error: e?.message });
//     }
//   }

//   // Выводим auth_date в читаемом формате
//   const authDate = usp.get('auth_date');
//   if (authDate) {
//     const date = new Date(parseInt(authDate) * 1000);
//     logger.debug('debugInitDataPretty: auth_date', { authDateISO: date.toISOString(), authDate });
//   }
// }

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
 * Использует initDataVault для получения сохранённых данных
 */
export function debugInitData() {
  const val = getStoredInitData();
  if (!val) {
    logger.warn('debugInitData: no stored init data found');
    return;
  }
  
  const usp = new URLSearchParams(val);
  
  logger.debug('debugInitData: params', {
    params: Array.from(usp.entries()).map(([k, v]) => ({
      key: k,
      value: v.length > 120 ? v.slice(0, 120) + '...' : v,
      length: v.length
    }))
  });

  // Выводим user отдельно, если есть
  const u = usp.get('user');
  if (u) {
    try {
      let decoded = u;
      try { decoded = decodeURIComponent(u); } catch {}
      
      try {
        const userObj = JSON.parse(decoded);
        logger.debug('debugInitData: user', { user: userObj });
      } catch {
        logger.debug('debugInitData: failed to parse user', { decoded });
      }
    } catch (e) {
      logger.error('debugInitData: error parsing user', { error: e?.message || String(e) });
    }
  }

  // Выводим auth_date в читаемом формате
  const authDate = usp.get('auth_date');
  if (authDate) {
    const date = new Date(parseInt(authDate) * 1000);
    logger.debug('debugInitData: auth_date', { authDateISO: date.toISOString(), authDate });
  }
}

// /**
//  * Инициализация WebApp
//  */
// export function initTelegramWebApp() {
//   if (window.Telegram?.WebApp) {
//     logger.info('initTelegramWebApp: initializing');
    
//     // Развертываем приложение на весь экран
//     window.Telegram.WebApp.expand();
    
//     // Включаем кнопку "Назад"
//     window.Telegram.WebApp.BackButton.show();
    
//     // Обработка кнопки "Назад"
//     window.Telegram.WebApp.BackButton.onClick(() => {
//       window.history.back();
//     });
    
//     logger.debug('initTelegramWebApp: initialized', {
//       platform: window.Telegram.WebApp.platform,
//       version: window.Telegram.WebApp.version,
//       initDataUnsafe: window.Telegram.WebApp.initDataUnsafe
//     });
    
//     return window.Telegram.WebApp;
//   }
  
//   logger.warn('initTelegramWebApp: Telegram WebApp not available');
//   return null;
// }
