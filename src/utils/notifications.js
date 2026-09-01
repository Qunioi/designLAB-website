// ================================================
// notifications.js — 設計部通知、過期清理與 Google Sheets 同步
// ================================================

import { pushToSheet, hasSheetsIntegration } from './sheetsAPI';
export { checkDeletePermission } from './storage';


const NOTIFICATIONS_KEY = 'design_lab_notifications';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 天毫秒數

import { getCurrentUser as getUserFromStore } from './userStore';

/** 取得目前登入使用者完整資訊 (包含 ADMIN / USER 權限身分) */
export function getCurrentUser() {
  const u = getUserFromStore();
  return {
    nickname: u.nickname,
    username: u.username,
    role: u.role,
    fullName: `${u.nickname} (${u.username})`
  };
}

/** 判斷是否為訪客身分 */
export function isGuestUser(user) {
  const u = user || getCurrentUser();
  const uname = (u.username || '').toLowerCase();
  const nick = (u.nickname || '').toLowerCase();
  return uname === '@guest' || uname === 'guest' || nick === '訪客' || u.role === 'GUEST';
}

/** 取得所有有效通知（自動針對一般使用者過濾「僅與自己相關」的訊息，且過濾已讀超過 3 天的訊息，徹底排除訪客記錄） */
export function getNotifications() {
  let list = [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    list = raw ? JSON.parse(raw) : getInitialNotifications();
  } catch (e) {
    list = getInitialNotifications();
  }

  // 篩選 0：徹底過濾訪客 (@guest / 訪客) 所產生的任何異動記錄
  list = list.filter(n => {
    const trig = String(n.triggeredBy || '').toLowerCase();
    const msg = String(n.message || '').toLowerCase();
    return !trig.includes('@guest') && !trig.includes('訪客') && !msg.includes('訪客 (@guest)');
  });

  const now = Date.now();
  // 篩選 1：未讀訊息永久保留；已讀訊息若超過 3 天則自動清除隱藏
  let validNotifications = list.filter(n => {
    if (!n.read) return true;
    const readTime = n.readAt ? new Date(n.readAt).getTime() : (n.createdAt ? new Date(n.createdAt).getTime() : 0);
    if (!readTime) return true;
    return (now - readTime) < THREE_DAYS_MS;
  });

  // 篩選 2：個人化訊息過濾（管理者可看全量；一般使用者僅看與自己切身相關的訊息）
  const currentUser = getCurrentUser();
  const myUser = (currentUser.username || '').toLowerCase();
  const myNick = (currentUser.nickname || '').toLowerCase();
  const isAdmin = currentUser.role === 'ADMIN' || myUser === '@quni_jhuang' || myUser === 'quni_jhuang';

  if (!isAdmin) {
    validNotifications = validNotifications.filter(n => {
      const triggered = String(n.triggeredBy || '').toLowerCase();
      const target = String(n.targetUser || n.targetUsername || '').toLowerCase();
      const author = String(n.originalAuthor || n.creatorUsername || '').toLowerCase();

      // 1. 自己發起的動作 (如: 自己新增文章)
      const isTriggeredByMe = triggered.includes(myUser) || (myNick && triggered.includes(myNick));
      // 2. 自己的文章/提案被編輯異動
      const isMyArticleAffected = author.includes(myUser) || (myNick && author.includes(myNick));
      // 3. 指定發給自己的訊息
      const isTargetedToMe = target.includes(myUser) || (myNick && target.includes(myNick));

      return isTriggeredByMe || isMyArticleAffected || isTargetedToMe;
    });
  }

  // 由新到舊強效倒序排序 (最新時間在上)
  validNotifications.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return validNotifications;
}


/** 初始化範例通知 */
function getInitialNotifications() {
  const now = new Date();
  const initial = [
    {
      id: 'notif-1',
      type: 'edit',
      title: '案例異動通知',
      message: 'Alex (@alex_designer) 編輯了您的優化提案《內部首頁 Bento Grid 改版提案》',
      triggeredBy: 'Alex (@alex_designer)',
      targetUser: 'Quni (@quni_jhuang)',
      editor: 'Alex (@alex_designer)',
      createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      time: '1 小時前',
      read: false,
      readAt: null
    },
    {
      id: 'notif-2',
      type: 'system',
      title: 'Google Sheets 異動同步',
      message: '成功從 Google Sheets 同步 28 筆最新研究案例！',
      triggeredBy: '系統自動連線',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      time: '2 小時前',
      read: true,
      readAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initial));
  return initial;
}


/** 新增一筆通知並自動同步至 Google Sheets NOTIFICATIONS 表單 (訪客身分不記錄) */
export function addNotification({ title, message, triggeredBy, type = 'edit', originalAuthor = '', targetUser = '' }) {
  const currentUser = getCurrentUser();
  const trig = triggeredBy || currentUser.fullName;

  // ⚠️ 訪客操作不產生任何通知
  if (isGuestUser(currentUser) || String(trig).includes('@guest') || String(trig).includes('訪客')) {
    return null;
  }

  const notifications = getNotifications();
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const newNotif = {
    id: `notif-${Date.now()}`,
    type: type,
    title: title || '團隊訊息通知',
    message: message,
    triggeredBy: trig,
    originalAuthor: originalAuthor,
    targetUser: targetUser,
    createdAt: now.toISOString(),
    time: timeStr,
    read: false,
    readAt: null
  };

  notifications.unshift(newNotif);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

  // 背景同步推送至 Google Sheets 的 NOTIFICATIONS 工作表
  if (hasSheetsIntegration()) {
    pushToSheet('NOTIFICATIONS', newNotif);
  }

  return newNotif;
}

/** 徹底洗淨移除字串中的所有表情符號 (Emoji) */
export function stripEmoji(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[👤👑🛠️⚡🔴↩️]/gu, '').trim();
}

/** 依據閱讀者身分 (ADMIN / USER) 動態格式化通知 HTML 內文 */
export function formatNotificationMessage(n, currentUser) {
  if (!n) return '';
  const user = currentUser || getCurrentUser();
  const myUser = (user.username || '').toLowerCase();
  const isAdmin = user.role === 'ADMIN' || myUser === '@quni_jhuang' || myUser === 'quni_jhuang';

  const triggered = stripEmoji(n.triggeredBy || '團隊成員');
  const rawMsg = stripEmoji(n.message || '');
  const titlePart = extractTitle(rawMsg);

  let resultStr = '';
  if (isAdmin) {
    // 【管理員視角】：明確呈現「誰」建立、「誰」編輯、「誰」刪除
    if (n.type === 'add') {
      resultStr = `${triggered} 建立了全新案例 ${titlePart}`;
    } else if (n.type === 'edit') {
      resultStr = `${triggered} 編輯調整了 ${titlePart}`;
    } else if (n.type === 'delete') {
      resultStr = `${triggered} 刪除了案例 ${titlePart}`;
    } else if (rawMsg.startsWith('管理者已成功建立') || rawMsg.startsWith('管理員已成功建立')) {
      resultStr = rawMsg.replace(/管理[者員]已成功建立/, `管理員 ${triggered} 已成功建立`);
    } else {
      resultStr = rawMsg;
    }
    // 洗淨 Emoji 並把 (@id) 轉為小字
    resultStr = stripEmoji(resultStr);
    return resultStr.replace(/\s*(\(@[\w.-]+\))/g, ' <span class="notif-handle">$1</span>');
  } else {
    // 【一般使用者視角】
    if (n.type === 'add') {
      resultStr = `您已成功建立了全新案例 ${titlePart}`;
    } else if (n.type === 'edit') {
      resultStr = `您的案例 ${titlePart} 已被編輯更新`;
    } else if (n.type === 'delete') {
      resultStr = `您的案例 ${titlePart} 已被移除刪除`;
    } else if (rawMsg.includes('已成功建立新成員帳號')) {
      resultStr = `管理團隊已成功建立新成員帳號${rawMsg.split('已成功建立新成員帳號')[1] || ''}`;
    } else {
      resultStr = rawMsg;
    }
    // 洗淨 Emoji 並徹底移除 (@id)
    resultStr = stripEmoji(resultStr);
    return resultStr.replace(/\s*\(@[\w.-]+\)/g, '');
  }
}

function extractTitle(msg) {
  if (!msg) return '《研究案例》';
  const match = String(msg).match(/《.*》/);
  return match ? match[0] : `《${msg}》`;
}

/** 新增全新案例/提案發布通知 */
export function notifyItemAdd({ itemTitle, creatorName, creatorUsername }) {
  const currentUser = getCurrentUser();
  if (isGuestUser(currentUser)) return null;

  const creator = creatorName || currentUser.fullName;
  const authorUser = creatorUsername || currentUser.username;

  return addNotification({
    title: '新增案例成功',
    message: `${creator} 建立了全新案例《${itemTitle}》`,
    triggeredBy: creator,
    originalAuthor: authorUser,
    targetUser: authorUser,
    type: 'add'
  });
}

/** 新增案例/提案被編輯通知 */
export function notifyItemEdit({ itemTitle, originalAuthor, editorName }) {
  const currentUser = getCurrentUser();
  if (isGuestUser(currentUser)) return null;

  const editor = editorName || currentUser.fullName;

  return addNotification({
    title: '案例異動通知',
    message: `${editor} 編輯了《${itemTitle}》`,
    triggeredBy: editor,
    originalAuthor: originalAuthor,
    targetUser: originalAuthor,
    type: 'edit'
  });
}

/** 新增案例/提案被刪除通知 */
export function notifyItemDelete({ itemTitle, originalAuthor, deleterName }) {
  const currentUser = getCurrentUser();
  if (isGuestUser(currentUser)) return null;

  const deleter = deleterName || currentUser.fullName;

  return addNotification({
    title: '案例刪除通知',
    message: `${deleter} 刪除了案例《${itemTitle}》`,
    triggeredBy: deleter,
    originalAuthor: originalAuthor,
    targetUser: originalAuthor,
    type: 'delete'
  });
}

/** 取得未讀通知數量 */
export function getUnreadNotificationCount() {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

/** 將全部通知設為已讀，並記錄已讀時間 readAt (供 3 天過期邏輯判斷) */
export function markAllNotificationsAsRead() {
  const notifications = getNotifications();
  const nowStr = new Date().toISOString();
  const updated = notifications.map(n => ({
    ...n,
    read: true,
    readAt: n.readAt || nowStr
  }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  return updated;
}
