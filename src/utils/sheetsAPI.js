// 前端與 Apps Script 後端（apps-script/Code.gs）溝通的唯一入口。讀取公開；寫入、登入、成員管理
// 一律附帶 Session Token，權限判斷全在後端，這裡只轉送請求與呈現錯誤。

import { bumpIdentity } from './identity';

const SESSION_KEY = 'design_lab_session';

// 網址只由建置期環境變數 VITE_SHEETS_URL 提供（見 .env.example），不支援執行期覆寫
const SHEETS_URL = import.meta.env.VITE_SHEETS_URL || '';

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

// 「完整資料 (JSON)」解析失敗只警告一次，避免舊資料逐筆洗版 console
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

  // record 有這個欄位就以 record 為準，完全沒有（真正的舊格式）才用 embedded 補。
  // 反過來會讓每次編輯都被夾帶的舊 JSON 快照蓋回舊值。
  const normalized = { ...embedded, ...record };
  normalized.id = normalized.id || record.ID || record.Id || '';
  normalized.createdAt = normalized.createdAt || record['建立時間 (createdAt)'] || '';
  normalized.updatedAt = normalized.updatedAt || record['最後更新時間 (updatedAt)'] || '';
  normalized.updatedBy = normalized.updatedBy || record['最後操作者 (updatedBy)'] || '';
  normalized.createdBy = normalized.createdBy || record['建立者 (createdBy)'] || '';
  return normalized;
}

/**
 * 寫入失敗時要顯示給使用者的說明文字。
 * 後端回的「登入已逾期，請重新登入」本身沒說要去哪裡登入，這裡統一補上路徑，
 * 避免使用者只看到「請重新登入」卻找不到入口，反覆按儲存反覆失敗。
 */
export function describeWriteFailure(error) {
  const reason = error || '權限不足或登入已逾期';
  const needsLogin = !getSession() || /登入|逾期|權限/.test(String(reason));
  return needsLogin
    ? `${reason}。請到左側選單最下方的「個人設定」重新登入後再試一次。`
    : `${reason}。`;
}

export function getSheetsUrl() {
  return SHEETS_URL;
}

export function hasSheetsIntegration() {
  return !!SHEETS_URL;
}

// 權杖由後端核發與驗證，前端只保存並原樣送出

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
  bumpIdentity();
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  bumpIdentity();
}

function getToken() {
  const session = getSession();
  return session ? session.token : '';
}

// 一律讀取回應內容（不用 no-cors），才能知道後端是否拒絕這次寫入

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
      clearSession();
    }
    return json;
  } catch (err) {
    return { success: false, error: `無法連線至 Google Sheets：${err.message}` };
  }
}

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

export async function logoutRequest() {
  const token = getToken();
  clearSession();
  if (token) await callAction_('logout', { token });
}

export async function changePasswordRequest(oldPassword, newPassword) {
  return callAction_('changePassword', { token: getToken(), oldPassword, newPassword });
}

export async function adminResetPasswordRequest(targetUsername) {
  return callAction_('adminResetPassword', { token: getToken(), targetUsername });
}

// 成員管理：後端會再次確認呼叫者是管理員

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

/** 公開讀取，不需登入 */
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

export async function deleteFromSheet(key, id) {
  const url = getSheetsUrl();
  if (!url) return { success: false, error: 'Sheets URL 未設定' };
  const sheetName = KEY_MAP[key] || key;
  const result = await callAction_('delete', { token: getToken(), sheet: sheetName, id });
  if (!result.success) console.warn('[SheetsAPI] Delete failed:', result.error);
  return result;
}

export async function pushAllUsersToSheet(profiles) {
  if (!Array.isArray(profiles)) return { success: false, error: '資料格式錯誤' };
  const result = await reorderUsersRequest(profiles);
  if (!result.success) console.warn('[SheetsAPI] Push all users failed:', result.error);
  return result;
}

export async function syncAllFromSheets(onProgress) {
  const url = getSheetsUrl();
  if (!url) return { success: false, error: 'URL 未設定', counts: {} };

  const counts = {};
  const errors = [];

  let totalCount = 0;
  // 並行抓取所有表；寫入 localStorage 仍照原順序。fetchSheetData 失敗會回傳 []，不會中斷 Promise.all
  const fetched = await Promise.all(ALL_KEYS.map(key =>
    fetchSheetData(key)
      .then(data => ({ key, data }))
      .catch(error => ({ key, data: null, error }))
  ));

  for (const { key, data, error } of fetched) {
    try {
      if (error) throw error;
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

  if (totalCount === 0 && errors.length === 0) {
    errors.push({ key: 'USERS', error: '尚未初始化：請先於 Apps Script 對後端送出一次 { action: "setup" }' });
  }

  // 成員名單（含角色）可能跟著雲端更新，依賴身分的畫面要重算
  bumpIdentity();

  // 同步直接寫 localStorage、沒經過 setStorageData，要自己廣播，否則首頁、⌘K 搜尋、表單建議都不會重讀
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('design-lab-storage-updated', { detail: { key: 'ALL' } }));
  }

  return {
    success: errors.length === 0,
    counts,
    errors
  };
}
