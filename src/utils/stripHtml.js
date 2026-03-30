/**
 * Удаляет HTML-теги из строки, сохраняя текст внутри них
 * @param {string} html - Строка с HTML
 * @returns {string} Строка без HTML-тегов
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') {
    return html || ''
  }
  // Удаляем HTML-теги, оставляя их содержимое
  return html.replace(/<[^>]+>/g, '')
}