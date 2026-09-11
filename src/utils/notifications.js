
import { pushToSheet, hasSheetsIntegration } from './sheetsAPI';
export { checkDeletePermission } from './storage';


const NOTIFICATIONS_KEY = 'design_lab_notifications';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

import { getCurrentUser as getUserFromStore } from './userStore';

export function getCurrentUser() {
  const u = getUserFromStore();
  return {
    nickname: u.nickname,
    username: u.username,
    role: u.role,
    fullName: `${u.nickname} (${u.username})`
  };
}

export function isGuestUser(user) {
  const u = user || getCurrentUser();
  const uname = (u.username || '').toLowerCase();
  const nick = (u.nickname || '').toLowerCase();
  return uname === '@guest' || uname === 'guest' || nick === '訪客' || u.role === 'GUEST';
}

/** 排除訪客產生的記錄；已讀超過 3 天的隱藏；一般使用者只看與自己相關的 */
export function getNotifications() {
  let list = [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    list = raw ? JSON.parse(raw) : getInitialNotifications();
  } catch (e) {
    list = getInitialNotifications();
  }

  list = list.filter(n => {
    const trig = String(n.triggeredBy || '').toLowerCase();
    const msg = String(n.message || '').toLowerCase();
    return !trig.includes('@guest') && !trig.includes('訪客') && !msg.includes('訪客 (@guest)');
  });

  const now = Date.now();
  let validNotifications = list.filter(n => {
    if (!n.read) return true;
    const readTime = n.readAt ? new Date(n.readAt).getTime() : (n.createdAt ? new Date(n.createdAt).getTime() : 0);
    if (!readTime) return true;
    return (now - readTime) < THREE_DAYS_MS;
  });

  // 管理者看全部，一般使用者只看自己發起、自己的文章被異動、指定給自己的
  const currentUser = getCurrentUser();
  const myUser = (currentUser.username || '').toLowerCase();
  const myNick = (currentUser.nickname || '').toLowerCase();
  const isAdmin = currentUser.role === 'ADMIN' || myUser === '@quni_jhuang' || myUser === 'quni_jhuang';

  if (!isAdmin) {
    validNotifications = validNotifications.filter(n => {
      const triggered = String(n.triggeredBy || '').toLowerCase();
      const target = String(n.targetUser || n.targetUsername || '').toLowerCase();
      const author = String(n.originalAuthor || n.creatorUsername || '').toLowerCase();

      const isTriggeredByMe = triggered.includes(myUser) || (myNick && triggered.includes(myNick));
      const isMyArticleAffected = author.includes(myUser) || (myNick && author.includes(myNick));
      const isTargetedToMe = target.includes(myUser) || (myNick && target.includes(myNick));

      return isTriggeredByMe || isMyArticleAffected || isTargetedToMe;
    });
  }

  validNotifications.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return validNotifications;
}


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


export function addNotification({ title, message, triggeredBy, type = 'edit', originalAuthor = '', targetUser = '' }) {
  const currentUser = getCurrentUser();
  const trig = triggeredBy || currentUser.fullName;

  // 訪客操作不產生通知
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

  if (hasSheetsIntegration()) {
    pushToSheet('NOTIFICATIONS', newNotif);
  }

  return newNotif;
}

export function stripEmoji(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[👤👑🛠️⚡🔴↩️]/gu, '').trim();
}

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
    resultStr = stripEmoji(resultStr);
    return resultStr.replace(/\s*(\(@[\w.-]+\))/g, ' <span class="notif-handle">$1</span>');
  } else {
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
    resultStr = stripEmoji(resultStr);
    return resultStr.replace(/\s*\(@[\w.-]+\)/g, '');
  }
}

function extractTitle(msg) {
  if (!msg) return '《研究案例》';
  const match = String(msg).match(/《.*》/);
  return match ? match[0] : `《${msg}》`;
}

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

export function getUnreadNotificationCount() {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

/** readAt 供 3 天過期判斷 */
export function markAllNotificationsAsRead() {
  const notifications = getNotifications();
  const nowStr = new Date().toISOString();
  const updated = notifications.map(n => ({
    ...n,
    read: true,
    readAt: n.readAt || nowStr
  }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

  // 已讀狀態也要同步回 Google Sheets，否則重新整理時會被雲端的未讀資料覆蓋。
  if (hasSheetsIntegration()) {
    updated.forEach(notification => pushToSheet('NOTIFICATIONS', notification));
  }

  return updated;
}
