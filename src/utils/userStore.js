// ================================================
// userStore.js — 團隊成員權限、管理者密碼驗證與帳號管理 (v4.0)
// ================================================

import { pushToSheet, deleteFromSheet, pushAllUsersToSheet, hasSheetsIntegration } from './sheetsAPI';
import { addNotification } from './notifications';



const PROFILES_KEY = 'design_lab_user_profiles';
const NICKNAME_KEY = 'design_lab_nickname';
const USERNAME_KEY = 'design_lab_username';
const ADMIN_PASSCODE_KEY = 'design_lab_admin_passcode';
const ADMIN_UNLOCKED_KEY = 'design_lab_admin_unlocked';
const IMPERSONATOR_KEY = 'design_lab_impersonator_original';

const DEFAULT_PROFILES = [
  { id: 'u-1', username: '@quni_jhuang', nickname: 'Quni', role: 'Super Admin', password: '123456', themeClass: 'theme-cloud-canvas' },
  { id: 'u-2', username: '@ray_zhao', nickname: 'Ray', role: 'Admin', password: '123456', themeClass: 'theme-cloud-canvas' },
  { id: 'u-3', username: '@rita_chen', nickname: 'Rita', role: 'User', password: '123456', themeClass: 'theme-cloud-canvas' },
  { id: 'u-4', username: '@adosa_chang', nickname: 'Adosa', role: 'User', password: '123456', themeClass: 'theme-cloud-canvas' },
  { id: 'u-5', username: '@clare_chen', nickname: 'Clare', role: 'User', password: '123456', themeClass: 'theme-cloud-canvas' },
  { id: 'u-6', username: '@yu-na', nickname: 'Yu-na', role: 'User', password: '123456', themeClass: 'theme-cloud-canvas' },
  { id: 'u-7', username: '@jason_hong', nickname: 'Jason', role: 'User', password: '123456', themeClass: 'theme-cloud-canvas' }
];

/** 修改指定使用者的密碼 */
export function updateUserPassword(targetUsername, oldPassword, newPassword) {
  const cleanNew = (newPassword || '').trim();
  if (!cleanNew) {
    return { success: false, error: '新密碼不能為空！' };
  }

  if (cleanNew.length < 4) {
    return { success: false, error: '新密碼長度不得低於 4 個字元！' };
  }

  const profiles = getUserProfiles();
  const matchedIndex = profiles.findIndex(p => p.username.toLowerCase() === targetUsername.toLowerCase());

  if (matchedIndex === -1) {
    return { success: false, error: '找不到該使用者！' };
  }

  const currentPass = profiles[matchedIndex].password || '123456';
  if (oldPassword !== currentPass) {
    return { success: false, error: '舊密碼不正確！請重新輸入。' };
  }

  if (cleanNew === currentPass) {
    return { success: false, error: '新密碼不可與舊密碼相同！' };
  }

  profiles[matchedIndex].password = cleanNew;
  profiles[matchedIndex].updatedAt = new Date().toISOString();
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  if (hasSheetsIntegration()) {
    const cleanProfiles = deduplicateProfiles(profiles);
    pushToSheet('USERS', cleanProfiles[matchedIndex] || profiles[matchedIndex]);
  }

  return { success: true, message: '密碼修改成功！' };
}

/** 退出管理者解鎖狀態 */
export function lockAdmin() {
  localStorage.setItem(ADMIN_UNLOCKED_KEY, 'false');
}

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

/** 取得所有團隊成員 Profile 清單 (自動進行 Unique ID 唯一性去重與密碼補齊) */
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
    const cleanList = deduplicateProfiles(list).map(p => ({
      ...p,
      password: p.password || '123456',
      themeClass: p.themeClass || 'theme-cloud-canvas'
    }));
    localStorage.setItem(PROFILES_KEY, JSON.stringify(cleanList));
    return cleanList;
  } catch (e) {
    return DEFAULT_PROFILES;
  }
}


/** 管理者新增新成員 */
export function addUserProfile({ nickname, username, role = 'USER' }) {
  const cleanNick = nickname.trim();
  let cleanUser = username.trim();
  if (!cleanUser.startsWith('@')) {
    cleanUser = '@' + cleanUser;
  }

  const profiles = getUserProfiles();
  const exists = profiles.some(p => p.username.toLowerCase() === cleanUser.toLowerCase());
  if (exists) {
    throw new Error(`帳號 ID ${cleanUser} 已存在！`);
  }

  const newMember = {
    id: `u-${Date.now()}`,
    username: cleanUser,
    nickname: cleanNick,
    role: role,
    password: '123456',
    themeClass: 'theme-cloud-canvas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  profiles.push(newMember);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  // 發送系統 Notification 通知並自動寫入 Google Sheets 的 NOTIFICATIONS 分頁
  try {
    const adminUser = getCurrentUser();
    const adminStr = `${adminUser.nickname} (${adminUser.username})`;
    addNotification({
      title: '新增成員帳號',
      message: `管理員 ${adminStr} 已成功建立新成員帳號 ${cleanNick} (${cleanUser})，身分權限：${role === 'ADMIN' ? '管理員' : '一般使用者'}。`,
      triggeredBy: adminStr,
      originalAuthor: adminUser.username,
      type: 'system'
    });
  } catch (e) {
    console.warn('通知記錄產生中離:', e);
  }

  if (hasSheetsIntegration()) {
    pushToSheet('USERS', newMember);
    pushAllUsersToSheet(profiles);
  }

  return profiles;
}


/** 管理員刪除成員 (保護所有 Super Admin & Admin 不得刪除) */
export function removeUserProfile(targetUsername) {
  let profiles = getUserProfiles();
  const cleanTarget = (targetUsername || '').trim().toLowerCase();
  const targetUserObj = profiles.find(p => p.username.toLowerCase() === cleanTarget);

  if (targetUserObj) {
    const roleLower = (targetUserObj.role || '').toLowerCase();
    if (roleLower.includes('admin') || cleanTarget === '@quni_jhuang' || cleanTarget === 'quni_jhuang' || cleanTarget === '@ray_zhao' || cleanTarget === 'ray_zhao') {
      throw new Error(`無法刪除管理員帳號 ${targetUserObj.username}！`);
    }
  }

  const displayName = targetUserObj ? `${targetUserObj.nickname} (${targetUserObj.username})` : targetUsername;

  profiles = profiles.filter(p => p.username.toLowerCase() !== targetUsername.toLowerCase());
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  // 發送刪除成員 Notification 通知並自動寫入 Google Sheets 的 NOTIFICATIONS 分頁
  try {
    addNotification({
      title: '刪除團隊成員',
      message: `管理員 @quni_jhuang 已成功刪除團隊成員：${displayName}。`,
      triggeredBy: 'Quni (@quni_jhuang)',
      type: 'system'
    });
  } catch (e) {
    console.warn('刪除通知記錄產生失敗:', e);
  }

  if (hasSheetsIntegration()) {
    deleteFromSheet('USERS', targetUsername);
  }

  return profiles;
}

/** 管理者自訂重新排序成員名單 */
export function reorderUserProfiles(fromIndex, toIndex) {
  let profiles = getUserProfiles();
  if (fromIndex < 0 || fromIndex >= profiles.length || toIndex < 0 || toIndex >= profiles.length) {
    return profiles;
  }
  
  const movedItem = profiles.splice(fromIndex, 1)[0];
  profiles.splice(toIndex, 0, movedItem);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  if (hasSheetsIntegration()) {
    pushAllUsersToSheet(profiles);
  }

  return profiles;
}




/** 取得目前活躍的使用者 */
export function getCurrentUser() {
  const username = localStorage.getItem(USERNAME_KEY) || '@guest';
  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
  
  const isQuni = (username.toLowerCase() === '@quni_jhuang' || username.toLowerCase() === 'quni_jhuang');
  
  let role = matched ? (matched.role || 'User') : 'User';
  if (isQuni) {
    role = matched ? (matched.role || 'Super Admin') : 'Super Admin';
  }

  if (matched) {
    const savedNick = localStorage.getItem(NICKNAME_KEY);
    const effectiveNick = (savedNick && savedNick !== '訪客') ? savedNick : matched.nickname;
    return { 
      nickname: effectiveNick || matched.nickname, 
      username: matched.username,
      role: matched.role || (isQuni ? 'Super Admin' : 'User')
    };
  }

  const savedNick = localStorage.getItem(NICKNAME_KEY);
  const nickname = (savedNick && savedNick !== '訪客') ? savedNick : (isQuni ? 'Quni' : '訪客');
  return { 
    nickname, 
    username, 
    role: isQuni ? 'Super Admin' : role
  };
}

/** 判斷當前登入者是否為管理者 (Super Admin 或 Admin) */
export function isAdminUser() {
  const u = getCurrentUser();
  const isQuni = (u.username.toLowerCase() === '@quni_jhuang' || u.username.toLowerCase() === 'quni_jhuang');
  const roleLower = (u.role || '').toLowerCase();
  return isQuni || roleLower === 'super admin' || roleLower === 'admin' || roleLower === 'super_admin';
}

/** 格式化當前使用者字串（例如 "Quni (@quni_jhuang)"） */
export function getCurrentUserString() {
  const { nickname, username } = getCurrentUser();
  return `${nickname} (${username})`;
}

/** 依據輸入的 ID 與密碼切換身分 (嚴格比對：僅允許管理員建立之帳號與正確密碼登入) */
export function loginByAccountID(inputID, inputPassword = '') {
  let cleanUser = (inputID || '').trim();
  if (!cleanUser) return { requiresPassword: false, user: getCurrentUser() };

  if (!cleanUser.startsWith('@')) {
    cleanUser = '@' + cleanUser;
  }

  const isQuni = (cleanUser.toLowerCase() === '@quni_jhuang' || cleanUser.toLowerCase() === 'quni_jhuang');
  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === cleanUser.toLowerCase());

  // ⚠️ 關鍵防護：非名單中的帳號且非 quni，嚴禁登入並拒絕自動創建用戶！
  if (!matched && !isQuni) {
    return { 
      requiresPassword: false, 
      user: null, 
      error: `帳號 ID "${cleanUser}" 不存在！請聯繫管理員建立帳號。` 
    };
  }

  const expectedPassword = (matched && matched.password) ? matched.password : '123456';
  const cleanPass = (inputPassword || '').trim();

  if (!cleanPass) {
    return {
      requiresPassword: true,
      user: null,
      error: '請輸入登入密碼！'
    };
  }

  if (cleanPass !== expectedPassword) {
    return {
      requiresPassword: true,
      user: null,
      error: '登入密碼不正確！請重新輸入。'
    };
  }

  let nickname = matched ? matched.nickname : 'Quni';
  let role = matched ? (matched.role || 'USER') : (isQuni ? 'ADMIN' : 'USER');

  const user = setCurrentUser(nickname, cleanUser, role);
  return { requiresPassword: false, user };
}

/** 切換或保存當前使用者 (絕不自動為未授權帳號創建與寫入 Google Sheets) */
export function setCurrentUser(nickname, username, role = 'USER') {
  let cleanUser = (username || '').trim() || '@guest';
  if (!cleanUser.startsWith('@')) {
    cleanUser = '@' + cleanUser;
  }

  const isQuni = (cleanUser.toLowerCase() === '@quni_jhuang');
  const isGuest = (cleanUser.toLowerCase() === '@guest');
  const profiles = getUserProfiles();
  const matchedIndex = profiles.findIndex(p => p.username.toLowerCase() === cleanUser.toLowerCase());

  let cleanNick = nickname ? nickname.trim() : '';
  if (!cleanNick || cleanNick === '訪客') {
    if (matchedIndex !== -1 && profiles[matchedIndex].nickname) {
      cleanNick = profiles[matchedIndex].nickname;
    } else if (isQuni) {
      cleanNick = 'Quni';
    } else if (isGuest) {
      cleanNick = '訪客';
    }
  }

  let finalRole = matchedIndex !== -1 ? (profiles[matchedIndex].role || role) : role;
  if (isQuni) {
    finalRole = 'ADMIN';
  }

  localStorage.setItem(NICKNAME_KEY, cleanNick);
  localStorage.setItem(USERNAME_KEY, cleanUser);

  // 只有既有合法成員修改暱稱時，才更新 local profiles 與同步 Google Sheets
  if (matchedIndex !== -1 && !isGuest) {
    profiles[matchedIndex].nickname = cleanNick;
    profiles[matchedIndex].role = finalRole;
    profiles[matchedIndex].updatedAt = new Date().toISOString();
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

    if (hasSheetsIntegration()) {
      pushToSheet('USERS', profiles[matchedIndex]);
    }
  }

  return { nickname: cleanNick, username: cleanUser, role: finalRole };
}

/** 儲存使用者的佈景主題偏好 (同時備份至 LocalStorage 與 Google Sheets 資料庫) */
export function saveUserTheme(themeClass) {
  if (!themeClass) return;

  const currentUser = getCurrentUser();
  const profiles = getUserProfiles();
  const matchedIndex = profiles.findIndex(p => p.username.toLowerCase() === currentUser.username.toLowerCase());

  if (matchedIndex !== -1) {
    profiles[matchedIndex].themeClass = themeClass;
    localStorage.setItem(`design_lab_theme_${currentUser.username.toLowerCase()}`, themeClass);
    profiles[matchedIndex].updatedAt = new Date().toISOString();
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

    if (hasSheetsIntegration()) {
      pushToSheet('USERS', profiles[matchedIndex]);
    }
  }
}

/** 取得當前使用者的主題設定 */
export function getUserTheme() {
  const currentUser = getCurrentUser();
  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === currentUser.username.toLowerCase());
  const userTheme = localStorage.getItem(`design_lab_theme_${currentUser.username.toLowerCase()}`);
  return matched?.themeClass || userTheme || 'theme-cloud-canvas';
}

/** 檢查當前是否處於開發者模擬帳號狀態 */
export function getImpersonatorStatus() {
  const original = localStorage.getItem(IMPERSONATOR_KEY);
  if (!original) return { isImpersonating: false, originalUsername: '' };
  return { isImpersonating: true, originalUsername: original };
}

/** 開發者 Quni 模擬切換為其他帳號 (支援模擬訪客 @guest) */
export function impersonateUser(targetUsername) {
  let cleanUser = (targetUsername || '').trim();
  if (!cleanUser.startsWith('@')) cleanUser = '@' + cleanUser;

  if (cleanUser.toLowerCase() === '@guest' || cleanUser.toLowerCase() === '@account') {
    localStorage.setItem(IMPERSONATOR_KEY, '@quni_jhuang');
    localStorage.setItem(NICKNAME_KEY, '訪客');
    localStorage.setItem(USERNAME_KEY, '@guest');
    return { nickname: '訪客', username: '@guest', role: 'USER' };
  }

  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === cleanUser.toLowerCase());
  if (!matched) {
    throw new Error(`找不到帳號 ${cleanUser}`);
  }

  // 紀錄原始開發者帳號為 Quni (@quni_jhuang)
  localStorage.setItem(IMPERSONATOR_KEY, '@quni_jhuang');
  localStorage.setItem(NICKNAME_KEY, matched.nickname);
  localStorage.setItem(USERNAME_KEY, matched.username);

  return matched;
}

/** 一鍵停止模擬，恢復為原始 Quni 開發者身分 */
export function stopImpersonating() {
  localStorage.removeItem(IMPERSONATOR_KEY);
  localStorage.setItem(ADMIN_UNLOCKED_KEY, 'true');
  return setCurrentUser('Quni', '@quni_jhuang', 'ADMIN');
}
