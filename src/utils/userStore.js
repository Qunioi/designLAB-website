// ================================================
// userStore.js — 團隊成員權限、登入狀態與本機顯示身分 (v5.0)
// ================================================
//
// 密碼驗證與角色授權已全部移到 Google Apps Script 後端
// （apps-script/Code.gs）。這支模組不再持有、也不再比對任何密碼；
// 這裡管理的是「登入後的顯示身分」（暱稱／帳號／角色快取）與
// 「訪客／身分模擬」這類純本機的畫面切換 —— 這些狀態可被使用者
// 自行竄改，但因為所有真正的寫入都需要登入時取得的 Session Token，
// 竄改顯示身分並不會取得任何實際權限。

import {
  pushToSheet, hasSheetsIntegration,
  loginRequest, logoutRequest, changePasswordRequest, adminResetPasswordRequest,
  addUserRequest, removeUserRequest, pushAllUsersToSheet,
  getSession, describeWriteFailure
} from './sheetsAPI';
import { addNotification } from './notifications';

const PROFILES_KEY = 'design_lab_user_profiles';
const NICKNAME_KEY = 'design_lab_nickname';
const USERNAME_KEY = 'design_lab_username';
const IMPERSONATOR_KEY = 'design_lab_impersonator_original';

// 僅供 Sheets 尚未同步前的顯示用預設名單（不含密碼）。
// 真正的帳號、角色與密碼一律以 Google Sheets 的 USERS 分頁為準。
const DEFAULT_PROFILES = [
  { id: 'u-1', username: '@quni_jhuang', nickname: 'Quni', role: 'Super Admin', themeClass: 'theme-cloud-canvas' },
  { id: 'u-2', username: '@ray_zhao', nickname: 'Ray', role: 'Admin', themeClass: 'theme-cloud-canvas' },
  { id: 'u-3', username: '@rita_chen', nickname: 'Rita', role: 'User', themeClass: 'theme-cloud-canvas' },
  { id: 'u-4', username: '@adosa_chang', nickname: 'Adosa', role: 'User', themeClass: 'theme-cloud-canvas' },
  { id: 'u-5', username: '@clare_chen', nickname: 'Clare', role: 'User', themeClass: 'theme-cloud-canvas' },
  { id: 'u-6', username: '@yu-na', nickname: 'Yu-na', role: 'User', themeClass: 'theme-cloud-canvas' },
  { id: 'u-7', username: '@jason_hong', nickname: 'Jason', role: 'User', themeClass: 'theme-cloud-canvas' }
];

/** 強效消除重複帳號 (以 username 忽略大小寫為唯一的 Unique ID) */
export function deduplicateProfiles(list) {
  if (!Array.isArray(list)) return [];
  const map = new Map();
  list.forEach(item => {
    if (!item || !item.username) return;
    const key = String(item.username).trim().toLowerCase();
    if (key && !map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}

/** 取得所有團隊成員 Profile 清單（本機快取；由公開的 Sheets 讀取同步填入，不含密碼欄位） */
export function getUserProfiles() {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  }
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    // 主動清除任何殘留的明文密碼欄位（例如舊版留下的本機快取）
    const cleanList = deduplicateProfiles(list).map(({ password, passwordHash, passwordSalt, ...rest }) => ({
      ...rest,
      themeClass: rest.themeClass || 'theme-cloud-canvas'
    }));
    localStorage.setItem(PROFILES_KEY, JSON.stringify(cleanList));
    return cleanList;
  } catch (e) {
    return DEFAULT_PROFILES;
  }
}

/** 管理員新增新成員（伺服器驗證呼叫者為管理員後才會建立，臨時密碼固定，強制首次登入變更） */
export async function addUserProfile({ nickname, username, role = 'User' }) {
  const cleanNick = (nickname || '').trim();
  let cleanUser = (username || '').trim();
  if (!cleanUser.startsWith('@')) cleanUser = '@' + cleanUser;

  const result = await addUserRequest(cleanNick, cleanUser, role);
  if (!result.success) {
    throw new Error(result.error || '新增成員失敗');
  }

  const profiles = getUserProfiles();
  profiles.push(result.user);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  try {
    const adminUser = getCurrentUser();
    const adminStr = `${adminUser.nickname} (${adminUser.username})`;
    addNotification({
      title: '新增成員帳號',
      message: `管理員 ${adminStr} 已成功建立新成員帳號 ${cleanNick} (${cleanUser})，身分權限：${role}。`,
      triggeredBy: adminStr,
      originalAuthor: adminUser.username,
      type: 'system'
    });
  } catch (e) {
    console.warn('通知記錄產生失敗:', e);
  }

  return profiles;
}

/** 管理員刪除成員（受保護的管理員帳號一律由伺服器拒絕刪除） */
export async function removeUserProfile(targetUsername) {
  const profiles = getUserProfiles();
  const cleanTarget = (targetUsername || '').trim().toLowerCase();
  const targetUserObj = profiles.find(p => p.username.toLowerCase() === cleanTarget);

  const result = await removeUserRequest(targetUsername);
  if (!result.success) {
    throw new Error(result.error || '刪除成員失敗');
  }

  const displayName = targetUserObj ? `${targetUserObj.nickname} (${targetUserObj.username})` : targetUsername;
  const updated = profiles.filter(p => p.username.toLowerCase() !== cleanTarget);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));

  try {
    const adminUser = getCurrentUser();
    addNotification({
      title: '刪除團隊成員',
      message: `管理員 ${adminUser.nickname} (${adminUser.username}) 已成功刪除團隊成員：${displayName}。`,
      triggeredBy: `${adminUser.nickname} (${adminUser.username})`,
      type: 'system'
    });
  } catch (e) {
    console.warn('刪除通知記錄產生失敗:', e);
  }

  return updated;
}

/** 本機重新排序成員名單，並將順序背景同步至 Sheets（伺服器僅接受管理員操作，且不覆寫密碼欄位） */
export function reorderUserProfiles(fromIndex, toIndex) {
  let profiles = getUserProfiles();
  if (fromIndex < 0 || fromIndex >= profiles.length || toIndex < 0 || toIndex >= profiles.length) {
    return { profiles, synced: Promise.resolve({ success: true }) };
  }
  const previousRaw = localStorage.getItem(PROFILES_KEY);
  const movedItem = profiles.splice(fromIndex, 1)[0];
  profiles.splice(toIndex, 0, movedItem);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  const synced = hasSheetsIntegration()
    ? pushAllUsersToSheet(profiles).then(result => {
        if (!result || !result.success) {
          // 雲端拒絕：還原排序前的本機成員清單，呼叫端需要在收到失敗後
          // 重新讀取一次 getUserProfiles()（見 Settings.vue 的 handleMoveUser）。
          if (previousRaw !== null) localStorage.setItem(PROFILES_KEY, previousRaw);
          else localStorage.removeItem(PROFILES_KEY);
          alert(`成員排序儲存失敗，變更未同步至雲端：${describeWriteFailure(result && result.error)}\n（本機畫面已還原）`);
        }
        return result;
      })
    : Promise.resolve({ success: true });

  return { profiles, synced };
}

/**
 * 取得目前顯示身分。username／nickname 是本機顯示狀態（供訪客瀏覽、
 * 身分模擬等純前端切換使用），但角色一律以 Google Sheets 上實際
 * 記錄的值為準——找不到對應成員時一律視為一般使用者，不會有任何
 * 帳號能單靠使用者名稱字串就取得管理員權限。真正能執行寫入操作的
 * 權限，來自登入時取得的 Session Token，與這裡的顯示身分無關。
 */
export function getCurrentUser() {
  const session = getSession();
  const username = localStorage.getItem(USERNAME_KEY) || (session ? session.username : '@guest');
  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());

  const savedNick = localStorage.getItem(NICKNAME_KEY);
  let nickname;
  if (matched) {
    nickname = (savedNick && savedNick !== '訪客') ? savedNick : matched.nickname;
  } else {
    nickname = (savedNick && savedNick !== '訪客') ? savedNick : (username.toLowerCase() === '@guest' ? '訪客' : username);
  }

  return {
    nickname,
    username: matched ? matched.username : username,
    role: matched ? (matched.role || 'User') : 'User'
  };
}

/**
 * 判斷當前登入者是否為管理者 (Super Admin 或 Admin)。
 * 必須「手上還握著有效的 Session Token」才算數：本機快取的角色即使寫著 Admin，
 * Token 過期後任何寫入都會被後端拒絕，這時還顯示管理按鈕只會讓使用者按了才發現存不了。
 */
export function isAdminUser() {
  if (!hasActiveSession()) return false;
  const role = (getCurrentUser().role || '').toLowerCase();
  return role === 'super admin' || role === 'admin';
}

/**
 * 是否真的握有有效的登入 Session Token——跟「本機顯示暱稱/帳號」是兩回事：
 * 暱稱、帳號、角色這些顯示身分即使 Session 過期也會繼續留在 localStorage，
 * 單看這些沒辦法判斷使用者其實已經被登出。Token 過期或遭後端拒絕時，
 * sheetsAPI.js 的 callAction_ 會清掉 Session，這裡才會如實反映「已登出」。
 */
export function hasActiveSession() {
  return !!getSession();
}

/** 判斷當前登入者是否為最高管理員 (Super Admin)，僅此角色可使用身分模擬功能 */
export function isSuperAdminUser() {
  return (getCurrentUser().role || '').toLowerCase() === 'super admin';
}

/** 格式化當前使用者字串（例如 "Quni (@quni_jhuang)"） */
export function getCurrentUserString() {
  const { nickname, username } = getCurrentUser();
  return `${nickname} (${username})`;
}

/**
 * 以帳號密碼登入。密碼比對完全在後端進行，這裡只負責呼叫並保存
 * 伺服器核發的 Session Token；Token 才是後續所有寫入操作的憑證。
 */
export async function loginByAccountID(inputID, inputPassword = '') {
  const cleanUser = (inputID || '').trim();
  if (!cleanUser) return { requiresPassword: false, user: getCurrentUser() };

  const result = await loginRequest(cleanUser, inputPassword || '');
  if (!result.success) {
    if (result.code === 'PASSWORD_REQUIRED') {
      return { requiresPassword: true, user: null, error: result.error };
    }
    return { requiresPassword: false, user: null, error: result.error || '登入失敗，請稍後再試' };
  }

  localStorage.setItem(NICKNAME_KEY, result.user.nickname);
  localStorage.setItem(USERNAME_KEY, result.user.username);

  return {
    requiresPassword: false,
    user: { nickname: result.user.nickname, username: result.user.username, role: result.user.role },
    mustChangePassword: !!result.mustChangePassword
  };
}

/** 登出：通知後端銷毀 Token，並將顯示身分還原為訪客。 */
export async function logout() {
  await logoutRequest();
  localStorage.removeItem(IMPERSONATOR_KEY);
  localStorage.setItem(NICKNAME_KEY, '訪客');
  localStorage.setItem(USERNAME_KEY, '@guest');
  return { nickname: '訪客', username: '@guest', role: 'User' };
}

/**
 * 切換「本機顯示身分」——用於訪客瀏覽與身分模擬，純前端狀態，
 * 不會、也無法異動任何雲端資料。只有在變更對象正是目前登入 Session
 * 本人時，才會把暱稱同步寫回 Google Sheets（伺服器會再次確認 Token
 * 與帳號相符）。
 */
export function setCurrentUser(nickname, username, role = 'User') {
  let cleanUser = (username || '').trim() || '@guest';
  if (!cleanUser.startsWith('@')) cleanUser = '@' + cleanUser;
  const isGuest = cleanUser.toLowerCase() === '@guest' || cleanUser.toLowerCase() === '@account';

  const profiles = getUserProfiles();
  const matchedIndex = profiles.findIndex(p => p.username.toLowerCase() === cleanUser.toLowerCase());

  let cleanNick = nickname ? nickname.trim() : '';
  if (!cleanNick || cleanNick === '訪客') {
    if (matchedIndex !== -1 && profiles[matchedIndex].nickname) {
      cleanNick = profiles[matchedIndex].nickname;
    } else if (isGuest) {
      cleanNick = '訪客';
    }
  }

  const finalRole = matchedIndex !== -1 ? (profiles[matchedIndex].role || role) : (isGuest ? 'User' : role);

  const previousNickname = localStorage.getItem(NICKNAME_KEY);
  const previousProfilesRaw = localStorage.getItem(PROFILES_KEY);

  localStorage.setItem(NICKNAME_KEY, cleanNick);
  localStorage.setItem(USERNAME_KEY, cleanUser);

  // `synced` 一律會 resolve（不丟出例外）：呼叫端可以 await 它來得知儲存
  // 按鈕該等到什麼時候才能解除 loading／重新可點擊（見 Settings.vue 的儲存暱稱按鈕）。
  let synced = Promise.resolve({ success: true });
  const session = getSession();
  if (session && matchedIndex !== -1 && session.username === cleanUser.toLowerCase()) {
    profiles[matchedIndex].nickname = cleanNick;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    if (hasSheetsIntegration()) {
      synced = pushToSheet('USERS', { username: cleanUser, nickname: cleanNick }).then(result => {
        if (!result || !result.success) {
          // 雲端拒絕（例如登入已逾期）：本機暱稱／成員列表還原成修改前的狀態，
          // 避免畫面顯示「已改好」但雲端其實沒有真的存進去。
          if (previousNickname !== null) localStorage.setItem(NICKNAME_KEY, previousNickname);
          else localStorage.removeItem(NICKNAME_KEY);
          if (previousProfilesRaw !== null) localStorage.setItem(PROFILES_KEY, previousProfilesRaw);
          else localStorage.removeItem(PROFILES_KEY);
          alert(`暱稱儲存失敗，變更未同步至雲端：${describeWriteFailure(result && result.error)}\n（本機畫面已還原）`);
        }
        return result;
      });
    }
  }

  return { nickname: cleanNick, username: cleanUser, role: finalRole, synced };
}

/** 儲存使用者的佈景主題偏好（僅本人可寫，伺服器依 Session Token 驗證） */
export function saveUserTheme(themeClass) {
  if (!themeClass) return;

  const currentUser = getCurrentUser();
  const profiles = getUserProfiles();
  const matchedIndex = profiles.findIndex(p => p.username.toLowerCase() === currentUser.username.toLowerCase());

  localStorage.setItem(`design_lab_theme_${currentUser.username.toLowerCase()}`, themeClass);

  if (matchedIndex !== -1) {
    profiles[matchedIndex].themeClass = themeClass;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }

  const session = getSession();
  if (session && session.username === currentUser.username.toLowerCase() && hasSheetsIntegration()) {
    pushToSheet('USERS', { username: currentUser.username, themeClass });
  }
}

/** 取得當前使用者的主題設定 */
export function getUserTheme() {
  const currentUser = getCurrentUser();
  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === currentUser.username.toLowerCase());
  const userTheme = localStorage.getItem(`design_lab_theme_${currentUser.username.toLowerCase()}`);
  const savedTheme = matched?.themeClass || userTheme || 'theme-cloud-canvas';
  const legacyThemeAliases = {
    'theme-midnight-slate': 'theme-midnight-indigo',
    'theme-charcoal-ember': 'theme-github-dark',
    'theme-sand-dune': 'theme-material-light',
    'theme-frost-mint': 'theme-office-access'
  };
  return legacyThemeAliases[savedTheme] || savedTheme;
}

/** 修改自己的登入密碼（需要正確的舊密碼，伺服器端驗證與雜湊儲存） */
export async function updateUserPassword(targetUsername, oldPassword, newPassword) {
  const result = await changePasswordRequest(oldPassword, newPassword);
  if (!result.success) {
    return { success: false, error: result.error || '密碼修改失敗！' };
  }
  return { success: true, message: result.message || '密碼修改成功！' };
}

/** 管理員將他人密碼重設為臨時密碼 123456，並強制對方下次登入變更（伺服器驗證呼叫者為管理員） */
export async function adminResetPassword(targetUsername) {
  const result = await adminResetPasswordRequest(targetUsername);
  if (!result.success) {
    return { success: false, error: result.error || '重設密碼失敗！' };
  }
  return { success: true, message: result.message || '已重設為臨時密碼' };
}

// ------------------------------------------------------------
// 身分模擬（僅限管理員；純前端顯示切換，見上方 setCurrentUser 說明）
// ------------------------------------------------------------

/** 檢查當前是否處於身分模擬狀態 */
export function getImpersonatorStatus() {
  const raw = localStorage.getItem(IMPERSONATOR_KEY);
  if (!raw) return { isImpersonating: false, originalUsername: '' };
  try {
    const original = JSON.parse(raw);
    return { isImpersonating: true, originalUsername: original.username || '' };
  } catch (e) {
    return { isImpersonating: false, originalUsername: '' };
  }
}

/** 管理員模擬切換為其他帳號視角 (支援模擬訪客 @guest)，用於 QA 預覽，不影響實際寫入權限 */
export function impersonateUser(targetUsername) {
  const alreadyImpersonating = !!localStorage.getItem(IMPERSONATOR_KEY);
  if (!alreadyImpersonating && !isSuperAdminUser()) {
    throw new Error('僅最高管理員 (Super Admin) 可使用身分模擬功能');
  }

  let cleanUser = (targetUsername || '').trim();
  if (!cleanUser.startsWith('@')) cleanUser = '@' + cleanUser;

  if (!alreadyImpersonating) {
    const original = getCurrentUser();
    localStorage.setItem(IMPERSONATOR_KEY, JSON.stringify({ username: original.username, nickname: original.nickname }));
  }

  if (cleanUser.toLowerCase() === '@guest' || cleanUser.toLowerCase() === '@account') {
    localStorage.setItem(NICKNAME_KEY, '訪客');
    localStorage.setItem(USERNAME_KEY, '@guest');
    return { nickname: '訪客', username: '@guest', role: 'User' };
  }

  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === cleanUser.toLowerCase());
  if (!matched) throw new Error(`找不到帳號 ${cleanUser}`);

  localStorage.setItem(NICKNAME_KEY, matched.nickname);
  localStorage.setItem(USERNAME_KEY, matched.username);
  return matched;
}

/** 停止模擬，還原為開始模擬前的原始登入身分 */
export function stopImpersonating() {
  const raw = localStorage.getItem(IMPERSONATOR_KEY);
  localStorage.removeItem(IMPERSONATOR_KEY);
  if (!raw) return getCurrentUser();
  try {
    const original = JSON.parse(raw);
    localStorage.setItem(NICKNAME_KEY, original.nickname || 'Quni');
    localStorage.setItem(USERNAME_KEY, original.username || '@guest');
  } catch (e) {
    // 解析失敗則維持目前狀態，不強制還原
  }
  return getCurrentUser();
}
