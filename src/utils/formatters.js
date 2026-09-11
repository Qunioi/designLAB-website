
export function ensureProtocol(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 如果已經包含協定 (http://, https://, ftp://, data:, blob:) 則保持原樣
  if (/^(https?:\/\/|ftp:\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

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
}

/**
 * 把一行一項的純文字（或陣列）拆成條列項目陣列，只用換行分割——
 * 跟 parseList() 不同，不會誤把句子裡本來就有的逗號、斜線切開。
 * 適合「值得參考」「優點」「缺點」這類一行一項的長條列文字。
 * @param {string|Array} val
 * @returns {Array<string>}
 */
export function parseLines(val) {
  if (!val) return [];
  const source = Array.isArray(val) ? val : String(val).split(/[\r\n]+/);
  return source.map(line => String(line).trim()).filter(Boolean);
}

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

/**
 * 格式化日期字串為「YYYY-MM-DD」(僅年月日，不含時分秒)。
 * 專供畫面顯示使用——底層資料仍保留完整的時分秒，只是不在畫面上
 * 顯示出來；需要完整時間請改用 formatDateTime()。
 * @param {string|Date|number} dateVal
 * @returns {string}
 */
export function formatDateOnly(dateVal) {
  if (!dateVal) return '';
  let d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    d = new Date(String(dateVal).replace(/-/g, '/'));
    if (isNaN(d.getTime())) return String(dateVal);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
