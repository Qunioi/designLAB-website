// ================================================
// sheetsAPI.js — Design LAB Google Sheets 整合 (v5.0)
// ================================================
//
// 這支模組是前端與 Google Apps Script 後端（apps-script/Code.gs）
// 溝通的唯一入口。讀取（GET）維持公開；寫入／刪除／登入／成員管理
// 一律呼叫後端的對應 action，並附帶登入後取得的 Session Token——
// 實際的權限判斷全部在後端完成，前端這裡只是轉送與呈現錯誤訊息。

const SESSION_KEY = 'design_lab_session';

// Apps Script Web App 網址，一律由建置期環境變數 VITE_SHEETS_URL 提供（見 .env.example）。
// 不支援執行期覆寫——每個環境（本機開發／正式站）的網址跟著 .env 走，
// 與後端部署（apps-script/README.md 的 clasp 流程）綁在一起維護，避免兩邊各自為政。
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || '';

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

// 同一個 session 內，「完整資料 (JSON)」解析失敗只印一次警告，
// 避免每筆舊資料都各印一次、洗版 console（fallback 邏輯不受影響，照樣逐筆執行）。
let hasWarnedLegacyJsonParse = false;

/**
 * 相容舊版試算表欄位：舊資料會把完整內容包在「完整資料 (JSON)」，
 * 並使用大寫 ID 與中文時間欄名。所有讀取入口先在這裡還原成目前 schema。
 */
export function normalizeSheetRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return record;

  let embedded = {};
  const rawJson = record['完整資料 (JSON)'];
  if (rawJson && typeof rawJson === 'object') {
    embedded = rawJson;
  } else if (typeof rawJson === 'string' && rawJson.trim()) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) embedded = parsed;
    } catch (error) {
      if (!hasWarnedLegacyJsonParse) {
        hasWarnedLegacyJsonParse = true;
        console.warn('[SheetsAPI] 無法解析舊版完整資料 JSON（僅顯示一次，其餘同類警告已略過）:', error);
      }
    }
  }

  const normalized = { ...record, ...embedded };
  normalized.id = normalized.id || record.ID || record.Id || '';
  normalized.createdAt = normalized.createdAt || record['建立時間 (createdAt)'] || '';
  normalized.updatedAt = normalized.updatedAt || record['最後更新時間 (updatedAt)'] || '';
  normalized.updatedBy = normalized.updatedBy || record['最後操作者 (updatedBy)'] || '';
  normalized.createdBy = normalized.createdBy || record['建立者 (createdBy)'] || '';
  return normalized;
}

/** 取得目前設定的 Apps Script URL（由 VITE_SHEETS_URL 環境變數提供） */
export function getSheetsUrl() {
  return SHEETS_URL;
}

/** 是否已啟用 Sheets 整合 */
export function hasSheetsIntegration() {
  return !!SHEETS_URL;
}

// ------------------------------------------------------------
// Session（登入權杖）管理
// ------------------------------------------------------------
// 權杖本身是由後端核發、儲存在後端 CacheService 的隨機字串，
// 前端只是原樣保存與附帶送出；真正決定它是否有效、對應哪個帳號、
// 哪個角色的判斷，一律由後端在每次寫入請求時重新驗證。

/** 取得目前已登入的 Session（含 token / username / nickname / role），未登入回傳 null */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** 清除本機保存的 Session（登出、或後端回報權杖已失效時呼叫） */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getToken() {
  const session = getSession();
  return session ? session.token : '';
}

// ------------------------------------------------------------
// 底層請求：一律真正讀取回應內容（不再使用 no-cors 盲送），
// 才有辦法判斷後端是否因為權限不足而拒絕這次寫入。
// ------------------------------------------------------------

async function callAction_(action, payload = {}) {
  const url = getSheetsUrl();
  if (!url) return { success: false, error: 'Sheets URL 未設定' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
    const json = await res.json().catch(() => ({ success: false, error: '伺服器回應格式錯誤' }));
    if (json && json.code === 'AUTH_REQUIRED') {
      // 權杖已過期或不存在，清除本機 Session，讓畫面回到未登入狀態
      clearSession();
    }
    return json;
  } catch (err) {
    return { success: false, error: `無法連線至 Google Sheets：${err.message}` };
  }
}

// ------------------------------------------------------------
// 登入 / 登出 / 密碼
// ------------------------------------------------------------

/** 以帳號密碼登入，成功會回傳並保存 Session Token */
export async function loginRequest(username, password) {
  const result = await callAction_('login', { username, password });
  if (result.success && result.token) {
    setSession({
      token: result.token,
      username: result.user.username,
      nickname: result.user.nickname,
      role: result.user.role
    });
  }
  return result;
}

/** 登出：通知後端銷毀 Token，並清除本機 Session */
export async function logoutRequest() {
  const token = getToken();
  clearSession();
  if (token) await callAction_('logout', { token });
}

/** 修改自己的密碼（需要正確的舊密碼） */
export async function changePasswordRequest(oldPassword, newPassword) {
  return callAction_('changePassword', { token: getToken(), oldPassword, newPassword });
}

/** 管理員將他人密碼重設為臨時密碼，並強制對方下次登入變更 */
export async function adminResetPasswordRequest(targetUsername) {
  return callAction_('adminResetPassword', { token: getToken(), targetUsername });
}

// ------------------------------------------------------------
// 成員管理（後端會再次確認呼叫者是否為管理員，前端呼叫失敗屬正常防護）
// ------------------------------------------------------------

export async function addUserRequest(nickname, username, role) {
  return callAction_('addUser', { token: getToken(), nickname, username, role });
}

export async function removeUserRequest(targetUsername) {
  return callAction_('removeUser', { token: getToken(), targetUsername });
}

/** 送出目前排序後的帳號清單（僅用於重新排序，後端不會覆寫密碼等欄位） */
export async function reorderUsersRequest(profiles) {
  return callAction_('overwrite_users', {
    token: getToken(),
    data: profiles.map(p => ({ username: p.username }))
  });
}

// ------------------------------------------------------------
// 一般資料讀取 / 寫入 / 刪除
// ------------------------------------------------------------

/** 讀取一個 Sheet 的所有資料（公開，不需登入） */
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
    return (json.data || []).map(normalizeSheetRecord);
  } catch (err) {
    console.warn(`[SheetsAPI] 擷取 ${sheetName} 發生例外:`, err);
    return [];
  }
}

/**
 * 新增 / 更新一筆資料。回傳 `{ success, error }`；呼叫端可選擇是否
 * await 並在失敗（例如未登入、非本人建立、訪客）時將本機變更復原。
 */
export async function pushToSheet(key, data) {
  const url = getSheetsUrl();
  if (!url) return { success: false, error: 'Sheets URL 未設定' };
  const sheetName = KEY_MAP[key] || key;
  const result = await callAction_('write', { token: getToken(), sheet: sheetName, data });
  if (!result.success) console.warn('[SheetsAPI] Push failed:', result.error);
  return result;
}

/** 刪除一筆資料，回傳 `{ success, error }`。 */
export async function deleteFromSheet(key, id) {
  const url = getSheetsUrl();
  if (!url) return { success: false, error: 'Sheets URL 未設定' };
  const sheetName = KEY_MAP[key] || key;
  const result = await callAction_('delete', { token: getToken(), sheet: sheetName, id });
  if (!result.success) console.warn('[SheetsAPI] Delete failed:', result.error);
  return result;
}

/** 團隊成員重新排序後，同步順序到 Google Sheets（管理員限定，後端授權）。 */
export async function pushAllUsersToSheet(profiles) {
  if (!Array.isArray(profiles)) return { success: false, error: '資料格式錯誤' };
  const result = await reorderUsersRequest(profiles);
  if (!result.success) console.warn('[SheetsAPI] Push all users failed:', result.error);
  return result;
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
        // 雲端資料可能尚未包含本地上傳的媒體欄位（R2 公開網址）。
        // 同步時保留同 ID 本地已有的媒體，避免重整後封面消失。
        const localRaw = localStorage.getItem(STORAGE_KEY_MAP[key]);
        let localData = [];
        try {
          localData = localRaw ? JSON.parse(localRaw).map(normalizeSheetRecord) : [];
        } catch (e) {
          localData = [];
        }
        const localById = new Map(localData.map(item => [item.id, item]));
        const localByUsername = new Map(localData.filter(item => item.username).map(item => [String(item.username).toLowerCase(), item]));
        const mediaFields = ['screenshot', 'cover', 'videoUrl', 'videoUrl2'];
        const mergedData = data.map(remoteItem => {
          const localItem = localById.get(remoteItem.id) || localByUsername.get(String(remoteItem.username || '').toLowerCase());
          if (!localItem) return remoteItem;

          const preservedMedia = {};
          mediaFields.forEach(field => {
            if (!remoteItem[field] && localItem[field]) {
              preservedMedia[field] = localItem[field];
            }
          });
          if (key === 'USERS' && !remoteItem.themeClass && localItem.themeClass) {
            preservedMedia.themeClass = localItem.themeClass;
          }

          // 已讀是使用者在本機操作後的狀態。同步時採單向累積，避免
          // 尚未完成的背景回寫先被雲端舊資料覆蓋。
          if (key === 'NOTIFICATIONS') {
            const localRead = localItem.read === true || localItem.read === 'true' || localItem.read === 1 || localItem.read === '1';
            const remoteRead = remoteItem.read === true || remoteItem.read === 'true' || remoteItem.read === 1 || remoteItem.read === '1';
            preservedMedia.read = localRead || remoteRead;
            preservedMedia.readAt = localItem.readAt || remoteItem.readAt || null;
          }

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

  // 如果 Google Sheets 是全新的（0 筆資料），提示需先於 Apps Script 執行 setup 初始化
  if (totalCount === 0 && errors.length === 0) {
    errors.push({ key: 'USERS', error: '尚未初始化：請先於 Apps Script 對後端送出一次 { action: "setup" }' });
  }

  return {
    success: errors.length === 0,
    counts,
    errors
  };
}
