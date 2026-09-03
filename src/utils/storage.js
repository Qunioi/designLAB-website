import {
  initialUIResearch,
  initialMotionResearch,
  initialCompetitors,
  initialAICenter,
  initialResources,
  initialProposals
} from '../data/mockData';

import { hasSheetsIntegration, pushToSheet, deleteFromSheet } from './sheetsAPI';
import { notifyItemEdit, notifyItemAdd, notifyItemDelete } from './notifications';

const KEYS = {
  UI_RESEARCH:     'design_lab_ui_research',
  MOTION_RESEARCH: 'design_lab_motion_research',
  COMPETITORS:     'design_lab_competitors',
  AI_CENTER:       'design_lab_ai_center',
  RESOURCES:       'design_lab_resources',
  PROPOSALS:       'design_lab_proposals'
};

// Keep the persisted schema predictable while accepting records created by
// older versions of the app.
function normalizeItem(key, item) {
  const normalized = { ...item };

  if (key === 'UI_RESEARCH' || key === 'MOTION_RESEARCH') {
    normalized.sourceUrl = normalized.sourceUrl || normalized.source || normalized.link || '';
  }

  if (key === 'AI_CENTER' && !normalized.url && normalized.link) {
    normalized.url = normalized.link;
  }

  return normalized;
}

export function resetToMockData() {
  localStorage.setItem(KEYS.UI_RESEARCH, JSON.stringify(initialUIResearch));
  localStorage.setItem(KEYS.MOTION_RESEARCH, JSON.stringify(initialMotionResearch));
  localStorage.setItem(KEYS.COMPETITORS, JSON.stringify(initialCompetitors));
  localStorage.setItem(KEYS.AI_CENTER, JSON.stringify(initialAICenter));
  localStorage.setItem(KEYS.RESOURCES, JSON.stringify(initialResources));
  localStorage.setItem(KEYS.PROPOSALS, JSON.stringify(initialProposals));
}

export function initializeStorage() {
  if (!localStorage.getItem(KEYS.UI_RESEARCH)) {
    localStorage.setItem(KEYS.UI_RESEARCH, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.MOTION_RESEARCH)) {
    localStorage.setItem(KEYS.MOTION_RESEARCH, JSON.stringify([]));
  }

  // 檢測是否為舊版 COMPETITORS 資料（若包含舊分類或不存在，即靜默覆蓋升級）
  const compDataRaw = localStorage.getItem(KEYS.COMPETITORS);
  if (!compDataRaw) {
    localStorage.setItem(KEYS.COMPETITORS, JSON.stringify([]));
  } else {
    try {
      const parsed = JSON.parse(compDataRaw);
      // 只要包含舊的 Knowledge Base 分類，即代表是舊資料，覆蓋為最新資料
      const hasOldData = parsed.some(item => item.category !== 'Web' && item.category !== '行動裝置');
      if (hasOldData) {
        localStorage.setItem(KEYS.COMPETITORS, JSON.stringify([]));
      }
    } catch (e) {
      localStorage.setItem(KEYS.COMPETITORS, JSON.stringify([]));
    }
  }

  if (!localStorage.getItem(KEYS.AI_CENTER)) {
    localStorage.setItem(KEYS.AI_CENTER, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.RESOURCES)) {
    localStorage.setItem(KEYS.RESOURCES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PROPOSALS)) {
    localStorage.setItem(KEYS.PROPOSALS, JSON.stringify([]));
  }
}

export function getStorageData(key) {
  initializeStorage();
  const data = localStorage.getItem(KEYS[key]);
  return data ? JSON.parse(data).map(item => normalizeItem(key, item)) : [];
}

export function setStorageData(key, data) {
  localStorage.setItem(KEYS[key], JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('design-lab-storage-updated', { detail: { key, data } }));
  }
}

import { getCurrentUserString, getCurrentUser, isAdminUser } from './userStore';

export function checkDeletePermission(item) {
  const currentUser = getCurrentUser();
  
  // 管理員 (@quni_jhuang) 擁有全站最高刪除權限
  if (isAdminUser() || currentUser.role === 'ADMIN') {
    return { allowed: true, creatorName: '管理員 (@quni_jhuang)' };
  }

  const creator = item.createdBy || item.updatedBy || '';

  // 原建立者可以刪除自己的項目
  if (creator && (creator.includes(currentUser.username) || creator.includes(currentUser.nickname))) {
    return { allowed: true, creatorName: creator };
  }

  return { 
    allowed: false, 
    creatorName: creator || '原建立者' 
  };
}

export function isMyCreatedItem(item) {
  if (!item) return false;
  const currentUser = getCurrentUser();
  const creator = item.createdBy || item.updatedBy || item.creatorUsername || item.creatorName || '';
  if (!creator) return false;
  return (
    creator.toLowerCase().includes(currentUser.username.toLowerCase()) || 
    creator.toLowerCase().includes(currentUser.nickname.toLowerCase())
  );
}


function getFormattedNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

import { formatStandardDateTime } from './formatters';

export function addOrUpdateItem(key, item) {
  const previousRaw = localStorage.getItem(KEYS[key]);
  const list = getStorageData(key);
  const normalizedItem = normalizeItem(key, item);
  let savedItem = null;
  let isNewItem = false;
  
  const currentUserObj = getCurrentUser();
  const currentUserStr = getCurrentUserString();
  const nowStr = formatStandardDateTime(new Date());

  if (normalizedItem.id) {
    // 更新現有項目
    const index = list.findIndex(i => i.id === item.id);
    if (index !== -1) {
      const originalAuthor = list[index].createdBy || list[index].updatedBy || currentUserStr;
      list[index] = { 
        ...list[index], 
        ...normalizedItem,
        createdAt: formatStandardDateTime(list[index].createdAt || nowStr),
        updatedAt: nowStr,
        updatedBy: currentUserStr,
        lastEditorName: currentUserObj.nickname
      };
      savedItem = list[index];

      // 觸發小鈴鐺提醒給原建立者
      notifyItemEdit({
        itemTitle: savedItem.title || savedItem.name || '研究案例',
        originalAuthor: originalAuthor,
        editorName: currentUserStr
      });
    } else {
      // ID 存在但找不到，視為新增
      isNewItem = true;
      savedItem = { 
        ...normalizedItem,
        createdAt: formatStandardDateTime(item.createdAt || nowStr),
        updatedAt: nowStr,
        updatedBy: currentUserStr,
        createdBy: currentUserStr,
        creatorName: currentUserObj.nickname,
        creatorUsername: currentUserObj.username,
        creatorRole: currentUserObj.role
      };
      list.unshift(savedItem);
    }
  } else {
    // 新增項目 (完整紀錄是誰發佈的)
    isNewItem = true;
    savedItem = {
      ...normalizedItem,
      id: `${key.toLowerCase().replace(/_/g, '-')}-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
      updatedBy: currentUserStr,
      createdBy: currentUserStr,
      creatorName: currentUserObj.nickname,
      creatorUsername: currentUserObj.username,
      creatorRole: currentUserObj.role
    };
    list.unshift(savedItem);
  }

  setStorageData(key, list);

  // 觸發新增通知提醒
  if (isNewItem) {
    notifyItemAdd({
      itemTitle: savedItem.title || savedItem.name || '案例',
      creatorName: currentUserStr,
      creatorUsername: currentUserObj.username
    });
  }

  // 背景推送至 Google Sheets 資料庫；伺服器會依登入 Session 重新驗證權限，
  // 若遭拒絕（未登入、非本人建立、訪客等）則還原本機畫面並提示使用者，
  // 避免畫面顯示「已儲存」但雲端其實沒有真的寫入。
  if (hasSheetsIntegration()) {
    pushToSheet(key, savedItem).then(result => {
      if (!result || !result.success) rollbackWrite_(key, previousRaw, result && result.error);
    });
  }

  return savedItem;
}

export function deleteItem(key, id) {
  const previousRaw = localStorage.getItem(KEYS[key]);
  const list = getStorageData(key);
  const targetItem = list.find(i => i.id === id);
  const filtered = list.filter(i => i.id !== id);
  setStorageData(key, filtered);

  // 觸發案例刪除通知（非訪客時才發送）
  if (targetItem) {
    const currentUserStr = getCurrentUserString();
    notifyItemDelete({
      itemTitle: targetItem.title || targetItem.name || '案例',
      originalAuthor: targetItem.createdBy || targetItem.updatedBy || currentUserStr,
      deleterName: currentUserStr
    });
  }

  // 背景同步刪除到 Google Sheets，遭拒絕時還原本機畫面（理由同上）
  if (hasSheetsIntegration()) {
    deleteFromSheet(key, id).then(result => {
      if (!result || !result.success) rollbackWrite_(key, previousRaw, result && result.error);
    });
  }

  return filtered;
}

/** 雲端寫入被伺服器拒絕時，還原本機這份資料表到寫入前的狀態並通知使用者。 */
function rollbackWrite_(key, previousRaw, error) {
  if (previousRaw !== null) {
    localStorage.setItem(KEYS[key], previousRaw);
  } else {
    localStorage.removeItem(KEYS[key]);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('design-lab-storage-updated', { detail: { key } }));
  }
  alert(`儲存失敗，變更未同步至雲端：${error || '權限不足或登入已逾期，請重新登入後再試一次。'}\n（本機畫面已還原）`);
}
