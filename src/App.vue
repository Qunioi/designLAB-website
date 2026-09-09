<template>
  <div class="app-container" :class="currentTheme">
    <Navigation
      :current-view="currentView" 
      :nickname="nickname"
      :username="username"
      @change-view="handleViewChange" 
    />

    <main class="main-content">
      <Transition name="fade" mode="out-in">
          <component
            :is="currentViewComponent"
            :key="currentView"
            ref="viewRef"
            :highlighted-id="highlightedId"
            :nickname="nickname"
            :username="username"
            :current-theme="currentTheme"
            @change-view="handleViewChange"
            @open-search="searchOpen = true"
            @trigger-crud="handleTriggerCrud"
            @delete-done="triggerRefresh"
            @navigate-detail="handleNavigate"
            @navigate-to-view="handleNavigate"
            @open-lightbox="(id) => updateUrl(currentView, id)"
            @close-lightbox="handleCloseModalUrl"
            @update-nickname="handleNicknameUpdate"
            @update-user="handleUserUpdate"
            @select-theme="handleThemeSelect"
          />
      </Transition>
    </main>

    <!-- Global Search Modal (Cmd+K) -->
    <SearchModal 
      :is-open="searchOpen" 
      @close="searchOpen = false"
      @open="searchOpen = true"
      @navigate="handleNavigate"
    />

    <!-- Universal CRUD Modal -->
    <CRUDModal
      :is-open="crudModalOpen"
      :type="crudType"
      :item="crudItem"
      :current-theme="currentTheme"
      :saving="crudSaving"
      @close="crudModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { initializeStorage, addOrUpdateItem } from './utils/storage';
import { syncAllFromSheets, hasSheetsIntegration } from './utils/sheetsAPI';

// 引入全域與 Modal 元件
import Navigation from './components/Navigation.vue';
import SearchModal from './components/SearchModal.vue';
import CRUDModal from './components/CRUDModal.vue';

// 引入各視圖元件
import Dashboard from './views/Dashboard.vue';
import UIResearch from './views/UIResearch.vue';
import MotionResearch from './views/MotionResearch.vue';
import Competitor from './views/Competitor.vue';
import AICenter from './views/AICenter.vue';
import Resources from './views/Resources.vue';
import Proposals from './views/Proposals.vue';
import Settings from './views/Settings.vue';

const currentView = ref('Dashboard');
const refreshKey = ref(0);
const searchOpen = ref(false);

const viewComponentMap = {
  Dashboard,
  UIResearch,
  MotionResearch,
  Competitor,
  AICenter,
  Resources,
  Proposals,
  Settings
};
const currentViewComponent = computed(() => viewComponentMap[currentView.value] || Dashboard);

// 網址 Route 與 View 名稱雙向對照
const VIEW_ROUTES = {
  Dashboard: 'dashboard',
  UIResearch: 'ui-research',
  MotionResearch: 'motion-research',
  Competitor: 'competitor',
  AICenter: 'ai-center',
  Resources: 'resources',
  Proposals: 'proposals',
  Settings: 'settings'
};

const ROUTE_VIEWS = Object.fromEntries(
  Object.entries(VIEW_ROUTES).map(([view, slug]) => [slug, view])
);

/** 更新網址 Hash (例如 #/ui-research 或 #/ui-research/2) */
const updateUrl = (view, itemId = '') => {
  const slug = VIEW_ROUTES[view] || 'dashboard';
  let newHash = `#/${slug}`;
  if (itemId) {
    newHash += `/${itemId}`;
  }
  if (window.location.hash !== newHash) {
    window.history.pushState({ view, itemId }, '', newHash);
  }
};

/** 從網址列同步讀取 View 與 Item ID */
const syncViewFromUrl = () => {
  const hashStr = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  const parts = hashStr.split('/');
  const rawSlug = (parts[0] || '').toLowerCase();
  const rawId = parts[1] || '';

  const matchedView = ROUTE_VIEWS[rawSlug];
  if (matchedView) {
    currentView.value = matchedView;
    if (rawId) {
      highlightedId.value = rawId;
    }
  } else {
    currentView.value = 'Dashboard';
    updateUrl('Dashboard');
  }
};

import { getCurrentUser, saveUserTheme, getUserTheme } from './utils/userStore';

const nickname = ref('訪客');
const username = ref('@account');

const currentTheme = ref('theme-cloud-canvas');

const isSyncing = ref(false);
const crudModalOpen = ref(false);
const crudType = ref('UI_RESEARCH');
const crudItem = ref(null);
const crudSaving = ref(false);

// 被高亮的項目 ID（用於搜尋/關聯跳轉後自動定位）
const highlightedId = ref('');

// 初始化 LocalStorage 與偏好設定
onMounted(async () => {
  initializeStorage();
  
  // 優先根據網址帶入頁面（確保重整留在該頁）
  syncViewFromUrl();
  window.addEventListener('popstate', syncViewFromUrl);
  window.addEventListener('hashchange', syncViewFromUrl);

  // 載入當前使用者與其偏好設定的雲端 Theme 佈景主題
  const u = getCurrentUser();
  nickname.value = u.nickname;
  username.value = u.username;
  currentTheme.value = getUserTheme();

  // 從 Google Sheets 同步最新資料（背景執行，完成後還原該使用者選定之雲端 Theme）
  if (hasSheetsIntegration()) {
    isSyncing.value = true;
    try {
      await syncAllFromSheets();
      currentTheme.value = getUserTheme();
      triggerRefresh();
    } catch (e) {
      console.warn('[App] Sheets sync failed:', e);
    } finally {
      isSyncing.value = false;
    }
  }
});

const handleViewChange = (view) => {
  currentView.value = view;
  highlightedId.value = ''; // 清除高亮
  updateUrl(view);
  triggerRefresh();
};

const viewRef = ref(null);

// 刷新目前頁面資料 (不強行銷毀 Remount View，保證 0 閃爍)
const triggerRefresh = () => {
  refreshKey.value++;
  if (viewRef.value && typeof viewRef.value.loadData === 'function') {
    viewRef.value.loadData();
  }
};

// 處理來自各頁面的新增/編輯請求
const handleTriggerCrud = ({ type, item }) => {
  crudType.value = type;
  crudItem.value = item || null;
  crudModalOpen.value = true;
};

// 處理來自首頁等快捷入口的新增
const openCrudForCreate = (viewName) => {
  let storageKey = 'UI_RESEARCH';
  if (viewName === 'MotionResearch') storageKey = 'MOTION_RESEARCH';
  else if (viewName === 'Competitor') storageKey = 'COMPETITORS';
  
  handleTriggerCrud({ type: storageKey, item: null });
};

// 處理表單儲存：先寫入本機（畫面已同步更新），儲存按鈕維持 loading，
// 等雲端 Sheets 真的同步完成（成功或失敗都算「結束等待」）才關閉 Modal 並刷新頁面。
// 同步失敗時 storage.js 的 rollbackWrite_ 已經跳出 alert 並還原本機資料，
// 這裡讓 Modal 保持開啟，使用者可以直接看著表單重試或取消，不會誤以為存好了。
const handleSave = async ({ type, item }) => {
  crudSaving.value = true;
  const { synced } = addOrUpdateItem(type, item);
  const result = await synced;
  crudSaving.value = false;

  if (result && result.success === false) return;

  crudModalOpen.value = false;
  highlightedId.value = '';
  updateUrl(currentView.value, '');
  triggerRefresh();
};

const handleNavigate = ({ view, id }) => {
  currentView.value = view;
  highlightedId.value = id || '';
  updateUrl(view, id);
  triggerRefresh();
};

// 處理關閉 Lightbox 彈窗時還原網址與清除 Focus 高亮效果
const handleCloseModalUrl = () => {
  highlightedId.value = '';
  updateUrl(currentView.value, '');
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
};

// 處理主題切換選擇與雲端備份儲存
const handleThemeSelect = (themeClass) => {
  currentTheme.value = themeClass;
  saveUserTheme(themeClass);
};

const handleNicknameUpdate = (newNickname) => {
  nickname.value = newNickname;
  localStorage.setItem('design_lab_nickname', newNickname);
};

const handleUserUpdate = (u) => {
  if (u) {
    nickname.value = u.nickname;
    username.value = u.username;
    currentTheme.value = getUserTheme();
  }
};

</script>

<style>
/* 全域轉場動畫 (Airy Smooth Transition) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
