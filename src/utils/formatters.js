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
 * 統一格式化日期時間為 yyyy-mm-dd HH:mm:ss (台北時間格式)
 * @param {string|Date|number} dateInput
 * @returns {string}
 */
export function formatStandardDateTime(dateInput) {
  if (!dateInput) {
    const now = new Date();
    return formatSingleDate(now);
  }
  
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}

function formatSingleDate(d) {
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
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
}/**
 * 格式化日期時間字串為「YYYY-MM-DD HH:mm:ss」(年月日 時分秒)
 * @param {string|Date|number} dateVal
 * @returns {string}
 */
export function formatDateTime(dateVal) {
  if (!dateVal) return '';
  let d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    d = new Date(String(dateVal).replace(/-/g, '/'));
    if (isNaN(d.getTime())) return String(dateVal);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}
