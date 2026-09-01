// ================================================
// sheetsAPI.js — Design LAB Google Sheets 整合 (v3.0)
// ================================================

const SHEETS_URL_KEY = 'design_lab_sheets_url';

const DEFAULT_SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbx3rXEbJFV4UTOaQkMpWjgkUEjymFUjK1F6ZjJIn4CCLd1RD0cT-RLTx9yvvhKH-B1a2g/exec';

// Storage key → Google Sheet Tab Name
const KEY_MAP = {
  UI_RESEARCH:     'UI_RESEARCH',
  MOTION_RESEARCH: 'MOTION_RESEARCH',
  COMPETITORS:     'COMPETITORS',
  AI_CENTER:       'AI_CENTER',
  RESOURCES:       'RESOURCES',
  PROPOSALS:       'PROPOSALS',
  USERS:           'USERS',
  NOTIFICATIONS:   'NOTIFICATIONS'
};

// localStorage key → 各 Tab 名稱的對應
const STORAGE_KEY_MAP = {
  UI_RESEARCH:     'design_lab_ui_research',
  MOTION_RESEARCH: 'design_lab_motion_research',
  COMPETITORS:     'design_lab_competitors',
  AI_CENTER:       'design_lab_ai_center',
  RESOURCES:       'design_lab_resources',
  PROPOSALS:       'design_lab_proposals',
  USERS:           'design_lab_user_profiles',
  NOTIFICATIONS:   'design_lab_notifications'
};


const ALL_KEYS = Object.keys(KEY_MAP);

/** 取得目前設定的 Apps Script URL（如未設定則回傳預設） */
export function getSheetsUrl() {
  return localStorage.getItem(SHEETS_URL_KEY) || DEFAULT_SHEETS_URL;
}

/** 儲存新的 Apps Script URL */
export function setSheetsUrl(url) {
  localStorage.setItem(SHEETS_URL_KEY, url.trim());
}

/** 是否已啟用 Sheets 整合 */
export function hasSheetsIntegration() {
  return !!getSheetsUrl();
}

/** 讀取一個 Sheet 的所有資料 */
export async function fetchSheetData(key) {
  const url = getSheetsUrl();
  if (!url) throw new Error('Sheets URL 未設定');
  const sheetName = KEY_MAP[key] || key;
  try {
    const res = await fetch(`${url}?sheet=${sheetName}`);
    if (!res.ok) {
      console.warn(`[SheetsAPI] 擷取 ${sheetName} 失敗 (HTTP ${res.status})，改用本地暫存資料`);
      return [];
    }
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '讀取失敗');
    return json.data || [];
  } catch (err) {
    console.warn(`[SheetsAPI] 擷取 ${sheetName} 發生例外:`, err);
    return [];
  }
}

/** 新增 / 更新一筆資料（fire-and-forget） */
export function pushToSheet(key, data) {
  const url = getSheetsUrl();
  if (!url) return;
  const sheetName = KEY_MAP[key] || key;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'write', sheet: sheetName, data }),
    mode: 'no-cors'
  }).catch(e => console.warn('[SheetsAPI] Push failed:', e));
}

/** 刪除一筆資料（fire-and-forget） */
export function deleteFromSheet(key, id) {
  const url = getSheetsUrl();
  if (!url) return;
  const sheetName = KEY_MAP[key] || key;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'delete', sheet: sheetName, id }),
    mode: 'no-cors'
  }).catch(e => console.warn('[SheetsAPI] Delete failed:', e));
}

/** 專門推送整份排序後的 USERS 名單至 Sheets，確保全域順序 100% 一致 */
export function pushAllUsersToSheet(profiles) {
  const url = getSheetsUrl();
  if (!url || !Array.isArray(profiles)) return;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'overwrite_users', sheet: 'USERS', data: profiles }),
    mode: 'no-cors'
  }).catch(e => console.warn('[SheetsAPI] Push all users failed:', e));
}


/** 觸發 Google Sheets 後端全量修復標頭與格式化 */
export function forceFormatAllSheets() {
  const url = getSheetsUrl();
  if (!url) return;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'force_format_all', sheet: 'UI_RESEARCH' }),
    mode: 'no-cors'
  }).catch(e => console.warn('[SheetsAPI] Format failed:', e));
}

/** 測試連線（回傳 { ok, error }） */
export async function testSheetsConnection() {
  try {
    const url = getSheetsUrl();
    if (!url) return { ok: false, error: 'URL 未設定' };
    const res = await fetch(`${url}?sheet=UI_RESEARCH`);
    const json = await res.json();
    return { ok: json.success === true, error: json.error || null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** 從 Sheets 全量同步到 localStorage */
export async function syncAllFromSheets(onProgress) {
  const url = getSheetsUrl();
  if (!url) return { success: false, error: 'URL 未設定', counts: {} };

  const counts = {};
  const errors = [];

  let totalCount = 0;
  for (const key of ALL_KEYS) {
    try {
      const data = await fetchSheetData(key);
      if (data && data.length > 0) {
        // 雲端資料可能尚未包含本地上傳的 Base64 圖片／影片欄位。
        // 同步時保留同 ID 本地已有的媒體，避免重整後封面消失。
        const localRaw = localStorage.getItem(STORAGE_KEY_MAP[key]);
        let localData = [];
        try {
          localData = localRaw ? JSON.parse(localRaw) : [];
        } catch (e) {
          localData = [];
        }
        const localById = new Map(localData.map(item => [item.id, item]));
        const mediaFields = ['screenshot', 'cover', 'videoUrl', 'videoUrl2'];
        const mergedData = data.map(remoteItem => {
          const localItem = localById.get(remoteItem.id);
          if (!localItem) return remoteItem;

          const preservedMedia = {};
          mediaFields.forEach(field => {
            if (!remoteItem[field] && localItem[field]) {
              preservedMedia[field] = localItem[field];
            }
          });
          return { ...remoteItem, ...preservedMedia };
        });
        localStorage.setItem(STORAGE_KEY_MAP[key], JSON.stringify(mergedData));
        counts[key] = data.length;
        totalCount += data.length;
      }
      if (onProgress) onProgress({ key, done: true, count: data ? data.length : 0 });
    } catch (e) {
      errors.push({ key, error: e.message });
      if (onProgress) onProgress({ key, done: false, error: e.message });
    }
  }

  // 如果 Google Sheets 是全新的（0 筆資料），自動填入標準 Mock 資料並上傳到 Google Sheets
  if (totalCount === 0 && errors.length === 0) {
    const { resetToMockData } = await import('./storage');
    resetToMockData();
    pushAllToSheets();
    for (const key of ALL_KEYS) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MAP[key]);
        counts[key] = raw ? JSON.parse(raw).length : 0;
      } catch (e) {}
    }
  }

  return {
    success: errors.length === 0,
    counts,
    errors
  };
}

/** 把目前全量資料推送到 Sheets 並自動矯正標頭與時間格式 */
export async function pushAllToSheets() {
  forceFormatAllSheets();

  // 確保 USERS 分頁具備初始團隊成員資料
  try {
    const { getUserProfiles } = await import('./userStore');
    const profiles = getUserProfiles();
    localStorage.setItem(STORAGE_KEY_MAP.USERS, JSON.stringify(profiles));
  } catch (e) {}

  for (const key of ALL_KEYS) {
    const raw = localStorage.getItem(STORAGE_KEY_MAP[key]);
    if (!raw) continue;
    try {
      const items = JSON.parse(raw);
      for (const item of items) {
        pushToSheet(key, item);
        await new Promise(r => setTimeout(r, 120));
      }
    } catch (e) {
      console.warn(`[SheetsAPI] Push all failed for ${key}:`, e);
    }
  }
}
