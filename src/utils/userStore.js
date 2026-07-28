// ================================================
// userStore.js — 團隊成員權限、管理者密碼驗證與帳號管理 (v4.0)
// ================================================

import { pushToSheet, deleteFromSheet, hasSheetsIntegration } from './sheetsAPI';
import { addNotification } from './notifications';


const PROFILES_KEY = 'design_lab_user_profiles';
const NICKNAME_KEY = 'design_lab_nickname';
const USERNAME_KEY = 'design_lab_username';
const ADMIN_PASSCODE_KEY = 'design_lab_admin_passcode';
const ADMIN_UNLOCKED_KEY = 'design_lab_admin_unlocked';

/** 預設管理者密碼 */
const DEFAULT_ADMIN_PASSCODE = 'admin123';

/** 系統預設成員名單（僅留管理者基礎 fallback，其餘全由 Excel / Google Sheets 同步載入） */
export const DEFAULT_PROFILES = [
  { id: 'u-1', username: '@quni_jhuang', nickname: 'Quni', role: 'ADMIN' }
];

/** 取得目前設定的管理者密碼 */
export function getAdminPasscode() {
  return localStorage.getItem(ADMIN_PASSCODE_KEY) || DEFAULT_ADMIN_PASSCODE;
}

/** 修改管理者密碼 */
export function setAdminPasscode(newCode) {
  if (newCode && newCode.trim()) {
    localStorage.setItem(ADMIN_PASSCODE_KEY, newCode.trim());
    return true;
  }
  return false;
}

/** 檢查是否已成功解鎖管理者身份 */
export function isAdminUnlocked() {
  return localStorage.getItem(ADMIN_UNLOCKED_KEY) === 'true';
}

/** 驗證管理者密碼 */
export function verifyAdminPasscode(inputCode) {
  const correct = getAdminPasscode();
  if (inputCode && inputCode.trim() === correct) {
    localStorage.setItem(ADMIN_UNLOCKED_KEY, 'true');
    setCurrentUser('Quni', '@quni_jhuang', 'ADMIN');
    return true;
  }
  return false;
}

/** 退出管理者解鎖狀態 */
export function lockAdmin() {
  localStorage.setItem(ADMIN_UNLOCKED_KEY, 'false');
}

/** 取得所有團隊成員 Profile 清單 */
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
    return list;
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
    createdAt: new Date().toISOString()
  };

  profiles.push(newMember);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  // 發送系統 Notification 通知並自動寫入 Google Sheets 的 NOTIFICATIONS 分頁
  try {
    addNotification({
      title: '新增成員帳號',
      message: `管理者已成功建立新成員帳號 ${cleanNick} (${cleanUser})，身分權限：${role === 'ADMIN' ? '👑 管理者' : '👤 一般使用者'}。`,
      triggeredBy: 'Quni (@quni_jhuang)',
      type: 'system'
    });
  } catch (e) {
    console.warn('通知記錄產生中離:', e);
  }

  if (hasSheetsIntegration()) {
    pushToSheet('USERS', newMember);
  }

  return profiles;
}


/** 管理者刪除成員 */
export function removeUserProfile(targetUsername) {
  if (targetUsername.toLowerCase() === '@quni_jhuang' || targetUsername.toLowerCase() === 'quni_jhuang') {
    throw new Error('無法刪除管理者帳號 quni_jhuang！');
  }

  let profiles = getUserProfiles();
  const targetUserObj = profiles.find(p => p.username.toLowerCase() === targetUsername.toLowerCase());
  const displayName = targetUserObj ? `${targetUserObj.nickname} (${targetUserObj.username})` : targetUsername;

  profiles = profiles.filter(p => p.username.toLowerCase() !== targetUsername.toLowerCase());
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  // 發送刪除成員 Notification 通知並自動寫入 Google Sheets 的 NOTIFICATIONS 分頁
  try {
    addNotification({
      title: '刪除團隊成員',
      message: `管理者 @quni_jhuang 已成功刪除團隊成員：${displayName}。`,
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

  return profiles;
}



/** 取得目前活躍的使用者 */
export function getCurrentUser() {
  const username = localStorage.getItem(USERNAME_KEY) || '@quni_jhuang';
  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
  
  const isQuni = (username.toLowerCase() === '@quni_jhuang' || username.toLowerCase() === 'quni_jhuang');
  
  if (matched) {
    return { 
      nickname: localStorage.getItem(NICKNAME_KEY) || matched.nickname, 
      username: matched.username,
      role: (isQuni && isAdminUnlocked()) ? 'ADMIN' : 'USER'
    };
  }

  const nickname = localStorage.getItem(NICKNAME_KEY) || 'Quni';
  return { 
    nickname, 
    username, 
    role: (isQuni && isAdminUnlocked()) ? 'ADMIN' : 'USER'
  };
}

/** 判斷當前登入者是否為已解鎖之管理者 (quni_jhuang) */
export function isAdminUser() {
  const u = getCurrentUser();
  const isQuni = (u.username.toLowerCase() === '@quni_jhuang' || u.username.toLowerCase() === 'quni_jhuang');
  return isQuni && isAdminUnlocked();
}

/** 格式化當前使用者字串（例如 "Quni (@quni_jhuang)"） */
export function getCurrentUserString() {
  const { nickname, username } = getCurrentUser();
  return `${nickname} (${username})`;
}

/** 依據輸入的 ID 切換身分 */
export function loginByAccountID(inputID) {
  let cleanUser = inputID.trim();
  if (!cleanUser) return getCurrentUser();

  if (!cleanUser.startsWith('@')) {
    cleanUser = '@' + cleanUser;
  }

  if (cleanUser.toLowerCase() === '@quni_jhuang') {
    if (!isAdminUnlocked()) {
      return { requiresPassword: true, username: '@quni_jhuang' };
    }
  } else {
    lockAdmin();
  }

  const profiles = getUserProfiles();
  const matched = profiles.find(p => p.username.toLowerCase() === cleanUser.toLowerCase());

  let nickname = '';
  let role = 'USER';
  if (matched) {
    nickname = matched.nickname;
    role = (cleanUser.toLowerCase() === '@quni_jhuang' && isAdminUnlocked()) ? 'ADMIN' : 'USER';
  } else {
    const rawName = cleanUser.replace('@', '');
    nickname = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }

  const user = setCurrentUser(nickname, cleanUser, role);
  return { requiresPassword: false, user };
}

/** 切換或保存當前使用者 */
export function setCurrentUser(nickname, username, role = 'USER') {
  const cleanNick = nickname.trim() || 'Quni';
  let cleanUser = username.trim() || '@quni_jhuang';
  if (!cleanUser.startsWith('@')) {
    cleanUser = '@' + cleanUser;
  }

  const isQuni = (cleanUser.toLowerCase() === '@quni_jhuang');
  const finalRole = (isQuni && isAdminUnlocked()) ? 'ADMIN' : 'USER';

  localStorage.setItem(NICKNAME_KEY, cleanNick);
  localStorage.setItem(USERNAME_KEY, cleanUser);

  const profiles = getUserProfiles();
  const existsIndex = profiles.findIndex(p => p.username.toLowerCase() === cleanUser.toLowerCase());
  
  let targetProfile;
  if (existsIndex === -1) {
    targetProfile = {
      id: `u-${Date.now()}`,
      username: cleanUser,
      nickname: cleanNick,
      role: finalRole,
      createdAt: new Date().toISOString()
    };
    profiles.push(targetProfile);
  } else {
    profiles[existsIndex].nickname = cleanNick;
    profiles[existsIndex].role = finalRole;
    targetProfile = profiles[existsIndex];
  }
  
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

  if (hasSheetsIntegration()) {
    pushToSheet('USERS', targetProfile);
  }

  return { nickname: cleanNick, username: cleanUser, role: finalRole };
}
