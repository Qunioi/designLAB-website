/**
 * 通用資料格式化與解析工具
 */

/**
 * 自動補齊網址通訊協定 (當缺少 http:// 或 https:// 時自動添加 https://)
 * @param {string} url
 * @returns {string}
 */
export function ensureProtocol(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 如果已經包含協定 (http://, https://, ftp://, data:, blob:) 則保持原樣
  if (/^(https?:\/\/|ftp:\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // 否則自動補齊 https://
  return `https://${trimmed}`;
}

/**
 * 彈性解析字串或陣列為乾淨的獨立項目陣列 (支援逗號, 井號 #, 斜線 /, 換行分割)
 * @param {string|Array} val
 * @returns {Array<string>}
 */
export function parseList(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}
