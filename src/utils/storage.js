import {
  initialUIResearch,
  initialMotionResearch,
  initialCompetitors,
  initialAICenter,
  initialResources,
  initialProposals
} from '../data/mockData';

const KEYS = {
  UI_RESEARCH: 'design_lab_ui_research',
  MOTION_RESEARCH: 'design_lab_motion_research',
  COMPETITORS: 'design_lab_competitors',
  AI_CENTER: 'design_lab_ai_center',
  RESOURCES: 'design_lab_resources',
  PROPOSALS: 'design_lab_proposals'
};

export function initializeStorage() {
  if (!localStorage.getItem(KEYS.UI_RESEARCH)) {
    localStorage.setItem(KEYS.UI_RESEARCH, JSON.stringify(initialUIResearch));
  }
  if (!localStorage.getItem(KEYS.MOTION_RESEARCH)) {
    localStorage.setItem(KEYS.MOTION_RESEARCH, JSON.stringify(initialMotionResearch));
  }
  if (!localStorage.getItem(KEYS.COMPETITORS)) {
    localStorage.setItem(KEYS.COMPETITORS, JSON.stringify(initialCompetitors));
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

export function addOrUpdateItem(key, item) {
  const list = getStorageData(key);
  if (item.id) {
    const index = list.findIndex(i => i.id === item.id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item };
    }
  } else {
    const newItem = {
      ...item,
      id: `${key.toLowerCase().replace('_', '-')}-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(newItem);
  }
  setStorageData(key, list);
  return list;
}

export function deleteItem(key, id) {
  const list = getStorageData(key);
  const filtered = list.filter(i => i.id !== id);
  setStorageData(key, filtered);
  return filtered;
}
