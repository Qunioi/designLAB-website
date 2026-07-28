// ================================================
// notifications.js — 設計部通知、過期清理與 Google Sheets 同步
// ================================================

import { pushToSheet, hasSheetsIntegration } from './sheetsAPI';
export { checkDeletePermission } from './storage';


const NOTIFICATIONS_KEY = 'design_lab_notifications';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // 3 天毫秒數

/** 取得目前登入使用者 */
export function getCurrentUser() {
  const nickname = localStorage.getItem('design_lab_nickname') || 'Quni';
  const username = localStorage.getItem('design_lab_username') || '@quni_jhuang';
  return {
    nickname,
    username,
    fullName: `${nickname} (${username})`
  };
}

/** 取得所有有效通知（自動過濾「已讀且超過 3 天」的訊息） */
export function getNotifications() {
  let list = [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    list = raw ? JSON.parse(raw) : getInitialNotifications();
  } catch (e) {
    list = getInitialNotifications();
  }

  const now = Date.now();
  // 篩選：未讀訊息永久保留；已讀訊息若 readAt 或 createdAt 超過 3 天則自動清除隱藏
  const validNotifications = list.filter(n => {
    if (!n.read) return true;
    const readTime = n.readAt ? new Date(n.readAt).getTime() : (n.createdAt ? new Date(n.createdAt).getTime() : 0);
    if (!readTime) return true;
    return (now - readTime) < THREE_DAYS_MS;
  });

  if (validNotifications.length !== list.length) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(validNotifications));
  }

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
      createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      time: '10 分鐘前',
      read: false,
      readAt: null
    },
    {
      id: 'notif-2',
      type: 'system',
      title: 'Google Sheets 異動同步',
      message: '成功從 Google Sheets 同步 28 筆最新研究案例！',
      triggeredBy: '系統自動連線',
      createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      time: '1 小時前',
      read: true,
      readAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initial));
  return initial;
}

/** 新增一筆通知並自動同步至 Google Sheets NOTIFICATIONS 表單 */
export function addNotification({ title, message, triggeredBy, type = 'edit' }) {
  const notifications = getNotifications();
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const newNotif = {
    id: `notif-${Date.now()}`,
    type: type,
    title: title || '團隊訊息通知',
    message: message,
    triggeredBy: triggeredBy || getCurrentUser().fullName,
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

/** 新增案例/提案被編輯通知 */
export function notifyItemEdit({ itemTitle, originalAuthor, editorName }) {
  return addNotification({
    title: '案例異動通知',
    message: `${editorName} 編輯了《${itemTitle}》`,
    triggeredBy: editorName,
    type: 'edit'
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
