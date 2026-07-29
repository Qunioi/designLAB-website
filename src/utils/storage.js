import {
  initialUIResearch,
  initialMotionResearch,
  initialCompetitors,
  initialAICenter,
  initialResources,
  initialProposals
} from '../data/mockData';

import { hasSheetsIntegration, pushToSheet, deleteFromSheet } from './sheetsAPI';
import { notifyItemEdit } from './notifications';

const KEYS = {
  UI_RESEARCH:     'design_lab_ui_research',
  MOTION_RESEARCH: 'design_lab_motion_research',
  COMPETITORS:     'design_lab_competitors',
  AI_CENTER:       'design_lab_ai_center',
  RESOURCES:       'design_lab_resources',
  PROPOSALS:       'design_lab_proposals'
};

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
    localStorage.setItem(KEYS.UI_RESEARCH, JSON.stringify(initialUIResearch));
  }
  if (!localStorage.getItem(KEYS.MOTION_RESEARCH)) {
    localStorage.setItem(KEYS.MOTION_RESEARCH, JSON.stringify(initialMotionResearch));
  }

  // 檢測是否為舊版 COMPETITORS 資料（若包含舊分類或不存在，即靜默覆蓋升級）
  const compDataRaw = localStorage.getItem(KEYS.COMPETITORS);
  if (!compDataRaw) {
    localStorage.setItem(KEYS.COMPETITORS, JSON.stringify(initialCompetitors));
  } else {
    try {
      const parsed = JSON.parse(compDataRaw);
      // 只要包含舊的 Knowledge Base 分類，即代表是舊資料，覆蓋為最新資料
      const hasOldData = parsed.some(item => item.category !== 'Web' && item.category !== '行動裝置');
      if (hasOldData) {
        localStorage.setItem(KEYS.COMPETITORS, JSON.stringify(initialCompetitors));
      }
    } catch (e) {
      localStorage.setItem(KEYS.COMPETITORS, JSON.stringify(initialCompetitors));
    }
  }

  if (!localStorage.getItem(KEYS.AI_CENTER)) {
    localStorage.setItem(KEYS.AI_CENTER, JSON.stringify(initialAICenter));
  }
  if (!localStorage.getItem(KEYS.RESOURCES)) {
    localStorage.setItem(KEYS.RESOURCES, JSON.stringify(initialResources));
  }
  if (!localStorage.getItem(KEYS.PROPOSALS)) {
    localStorage.setItem(KEYS.PROPOSALS, JSON.stringify(initialProposals));
  }
}

export function getStorageData(key) {
  initializeStorage();
  const data = localStorage.getItem(KEYS[key]);
  return data ? JSON.parse(data) : [];
}

export function setStorageData(key, data) {
  localStorage.setItem(KEYS[key], JSON.stringify(data));
}

import { getCurrentUserString, getCurrentUser, isAdminUser } from './userStore';

export function checkDeletePermission(item) {
  const currentUser = getCurrentUser();
  
  // 管理者 (@quni_jhuang) 擁有全站最高刪除權限
  if (isAdminUser() || currentUser.role === 'ADMIN') {
    return { allowed: true, creatorName: '管理者 (@quni_jhuang)' };
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

export function addOrUpdateItem(key, item) {
  const list = getStorageData(key);
  let savedItem;
  const currentUserObj = getCurrentUser();
  const currentUserStr = getCurrentUserString();
  const nowStr = getFormattedNow();

  if (item.id) {
    // 更新現有項目
    const index = list.findIndex(i => i.id === item.id);
    if (index !== -1) {
      const originalAuthor = list[index].createdBy || list[index].updatedBy || currentUserStr;
      list[index] = { 
        ...list[index], 
        ...item,
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
      savedItem = { 
        ...item,
        createdAt: item.createdAt || nowStr,
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
    savedItem = {
      ...item,
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

  // 背景同步到 Google Sheets（非同步，包含發佈人記錄備查）
  if (hasSheetsIntegration() && savedItem) {
    pushToSheet(key, savedItem);
  }

  return list;
}

export function deleteItem(key, id) {
  const list = getStorageData(key);
  const filtered = list.filter(i => i.id !== id);
  setStorageData(key, filtered);

  // 背景同步刪除到 Google Sheets
  if (hasSheetsIntegration()) {
    deleteFromSheet(key, id);
  }

  return filtered;
}
