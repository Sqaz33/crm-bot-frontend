/**
 * Logger - система логирования для Vue приложения
 * 
 * @example
 * // В компонентах Vue:
 * this.$logger.info('Сообщение', { data });
 * this.$logger.warn('Предупреждение', { info });
 * this.$logger.error('Ошибка', { error });
 * 
 * @example
 * // Вне компонентов:
 * import { logger } from '@/utils/logger';
 * logger.info('Событие', { userId: 123 });
 * 
 * @features
 * - 3 уровня логирования: ERROR, WARN, INFO
 * - Цветной вывод в консоль (только development)
 * - Автоматический перехват ошибок Vue компонентов
 * - Автоматический перехват глобальных JS ошибок
 * - Отправка ERROR логов на сервер в production
 * - Автоматическое скрытие чувствительных данных
 * - Защита от циклических ссылок
 * - Ограничение глубины объектов (3 уровня)
 */

const CONFIG = {
  level: import.meta.env?.DEV ? 'info' : 'error',
  colors: {
    error: '#ff4444',
    warn: '#ffbb33',
    info: '#0099cc',
  },
  sensitiveFields: ['password', 'token', 'secret', 'accessToken', 'refreshToken', 'apiKey'],
  maxDepth: 3,
};

const LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
};

/**
 * Проверяет разрешен ли вывод для данного уровня
 * @param {string} levelName - Уровень логирования
 * @returns {boolean}
 */
function canLog(levelName) {
  return LEVELS[levelName] >= LEVELS[CONFIG.level.toUpperCase()];
}

/**
 * Глубокое клонирование объекта с ограничением глубины и защитой от циклических ссылок
 * @param {any} obj - Объект для обработки
 * @param {number} depth - Текущая глубина
 * @param {WeakSet} visited - Множество посещённых объектов
 * @returns {any}
 */
function sanitizeObject(obj, depth = 0, visited = new WeakSet()) {
  if (depth > CONFIG.maxDepth) return '[MAX_DEPTH_EXCEEDED]';
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (visited.has(obj)) return '[CIRCULAR_REFERENCE]';
  visited.add(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth, visited));
  }
  
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Скрытие чувствительных полей
      const isSensitive = CONFIG.sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (isSensitive) {
        result[key] = '[HIDDEN]';
      } else {
        result[key] = sanitizeObject(obj[key], depth + 1, visited);
      }
    }
  }
  
  return result;
}

/**
 * Форматирует сообщение лога
 * @param {string} level - Уровень
 * @param {string} message - Сообщение
 * @param {object} data - Дополнительные данные
 * @returns {object}
 */
function formatMessage(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const sanitizedData = sanitizeObject(data);
  
  return {
    timestamp,
    level,
    message,
    data: sanitizedData,
  };
}

/**
 * Отправляет лог на сервер (только ERROR в production)
 * @param {object} logData - Данные лога
 */
async function sendToServer(logData) {
  const isProduction = !import.meta.env?.DEV;
  
  // Только ERROR логи в production
  if (isProduction && logData.level !== 'ERROR') {
    return;
  }
  
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
  } catch {
    // Игнорируем ошибки сети - нет retry, очередей или батчинга
  }
}

/**
 * Вывод в консоль с цветами (только development)
 * @param {string} level - Уровень логирования
 * @param {string} message - Сообщение
 * @param {any} data - Данные
 */
function consoleOutput(level, message, data) {
  const color = CONFIG.colors[level.toLowerCase()];
  const style = `color: ${color}; font-weight: bold;`;
  const prefix = `[${level}]`;
  
  if (level === 'ERROR') {
    console.error(`%c${prefix}`, style, message, data);
  } else if (level === 'WARN') {
    console.warn(`%c${prefix}`, style, message, data);
  } else {
    console.log(`%c${prefix}`, style, message, data);
  }
}

/**
 * Основная функция логирования
 * @param {string} level - Уровень (ERROR, WARN, INFO)
 * @param {string} message - Сообщение
 * @param {object} data - Дополнительные данные
 */
function log(level, message, data = {}) {
  if (!canLog(level)) return;
  
  const logData = formatMessage(level, message, data);
  
  // Вывод в консоль с цветами (только development)
  if (import.meta.env?.DEV) {
    consoleOutput(level, message, data);
  }
  
  // Отправка на сервер
  sendToServer(logData);
}

/**
 * @typedef {Object} Logger
 * @property {Function} info - Лог уровня INFO
 * @property {Function} warn - Лог уровня WARN
 * @property {Function} error - Лог уровня ERROR
 */

/** @type {Logger} */
export const logger = {
  /**
   * INFO уровень - информационные сообщения
   * @param {string} message - Сообщение
   * @param {object} [data] - Дополнительные данные
   * @example this.$logger.info('Пользователь авторизовался', { userId: 123 })
   */
  error: (message, data) => log('ERROR', message, data),
  
  /**
   * WARN уровень - предупреждения
   * @param {string} message - Сообщение
   * @param {object} [data] - Дополнительные данные
   * @example this.$logger.warn('Сессия скоро истечёт', { expiresIn: 300 })
   */
  warn: (message, data) => log('WARN', message, data),
  
  /**
   * ERROR уровень - ошибки
   * @param {string} message - Сообщение
   * @param {object} [data] - Дополнительные данные
   * @example this.$logger.error('Ошибка API', { url: '/api', status: 500 })
   */
  info: (message, data) => log('INFO', message, data),
};

/**
 * Vue плагин для интеграции логгера
 * 
 * @example
 * // main.js
 * import { LoggerPlugin } from '@/utils/logger';
 * app.use(LoggerPlugin);
 * 
 * // В компонентах
 * this.$logger.info('Сообщение', { data });
 * 
 * @property {Logger} $logger - Доступ через this.$logger в компонентах
 */
export const LoggerPlugin = {
  /**
   * Устанавливает плагин в Vue приложение
   * @param {import('vue').App} app - Экземпляр Vue приложения
   * @param {object} [options] - Конфигурация
   * @param {string} [options.level] - Уровень логирования ('error'|'warn'|'info')
   */
  install(app, options = {}) {
    // Применение опций
    if (options.level) CONFIG.level = options.level;
    
    // Добавление $logger во все компоненты
    app.config.globalProperties.$logger = logger;
    
    // Обработчик ошибок Vue компонентов
    app.config.errorHandler = (err, instance, info) => {
      logger.error('Vue Component Error', {
        error: err?.message || String(err),
        component: instance?.$options?.name || 'Unknown',
        info,
        stack: err?.stack,
      });
    };
    
    // Обработчик глобальных JS ошибок
    window.onerror = (message, source, lineno, colno, error) => {
      logger.error('Global JavaScript Error', {
        message,
        source,
        lineno,
        colno,
        error: error?.message || String(error),
        stack: error?.stack,
      });
    };
    
    // Примечание: Promise rejections намеренно НЕ обрабатываются
  },
};

export default logger;