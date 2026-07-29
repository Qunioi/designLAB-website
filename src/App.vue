<template>
  <!-- 最外層容器動態套用當前主題 class -->
  <div class="app-container" :class="currentTheme">
    <!-- Navigation Sidebar -->
    <Navigation 
      :current-view="currentView" 
      :nickname="nickname"
      :username="username"
      @change-view="handleViewChange" 
    />

    <!-- Main Content Area -->
    <main class="main-content">
      <Transition name="fade" mode="out-in">
        <div :key="currentView + refreshKey">
          <Dashboard 
            v-if="currentView === 'Dashboard'"
            @change-view="handleViewChange"
            @open-search="searchOpen = true"
            @trigger-crud="openCrudForCreate"
            @navigate-detail="handleNavigate"
          />
          <UIResearch 
            v-else-if="currentView === 'UIResearch'"
            :highlighted-id="highlightedId"
            @trigger-crud="handleTriggerCrud"
            @delete-done="triggerRefresh"
          />
          <MotionResearch 
            v-else-if="currentView === 'MotionResearch'"
            :highlighted-id="highlightedId"
            @trigger-crud="handleTriggerCrud"
            @delete-done="triggerRefresh"
          />
          <Competitor 
            v-else-if="currentView === 'Competitor'"
            :highlighted-id="highlightedId"
            @trigger-crud="handleTriggerCrud"
            @delete-done="triggerRefresh"
          />
          <AICenter 
            v-else-if="currentView === 'AICenter'"
            :highlighted-id="highlightedId"
            @trigger-crud="handleTriggerCrud"
            @delete-done="triggerRefresh"
          />
          <Resources 
            v-else-if="currentView === 'Resources'"
            :highlighted-id="highlightedId"
            @trigger-crud="handleTriggerCrud"
            @delete-done="triggerRefresh"
          />
          <Proposals 
            v-else-if="currentView === 'Proposals'"
            @trigger-crud="handleTriggerCrud"
            @delete-done="triggerRefresh"
            @navigate-to-view="handleNavigate"
          />
          <Settings 
            v-else-if="currentView === 'Settings'"
            :nickname="nickname"
            :username="username"
            :current-theme="currentTheme"
            @update-nickname="handleNicknameUpdate"
            @update-user="handleUserUpdate"
            @select-theme="handleThemeSelect"
          />

        </div>
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
      @close="crudModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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

/** 更新網址 Hash (例如 #/ui-research) */
const updateUrl = (view) => {
  const slug = VIEW_ROUTES[view] || 'dashboard';
  const newHash = `#/${slug}`;
  if (window.location.hash !== newHash) {
    window.history.pushState({ view }, '', newHash);
  }
};

/** 從網址列同步讀取 View */
const syncViewFromUrl = () => {
  const rawHash = window.location.hash.replace(/^#\/?/, '').split('?')[0].toLowerCase();
  const matchedView = ROUTE_VIEWS[rawHash];
  if (matchedView) {
    currentView.value = matchedView;
  } else {
    currentView.value = 'Dashboard';
    updateUrl('Dashboard');
  }
};

import { getCurrentUser } from './utils/userStore';

// 個人資訊狀態
const nickname = ref('Quni');
const username = ref('@quni_jhuang');

// 主題切換狀態
const currentTheme = ref('theme-midnight-slate');

// 背景同步狀態
const isSyncing = ref(false);
const crudModalOpen = ref(false);
const crudType = ref('UI_RESEARCH');
const crudItem = ref(null);

// 被高亮的項目 ID（用於搜尋/關聯跳轉後自動定位）
const highlightedId = ref('');

// 初始化 LocalStorage 與偏好設定
onMounted(async () => {
  initializeStorage();
  
  // 優先根據網址帶入頁面（確保重整留在該頁）
  syncViewFromUrl();
  window.addEventListener('popstate', syncViewFromUrl);
  window.addEventListener('hashchange', syncViewFromUrl);

  // 載入已儲存的主題風格
  const savedTheme = localStorage.getItem('design_lab_theme');
  if (savedTheme) {
    currentTheme.value = savedTheme;
  }
  
  // 載入當前使用者
  const u = getCurrentUser();
  nickname.value = u.nickname;
  username.value = u.username;

  // 從 Google Sheets 同步最新資料（背景執行，完成後刷新畫面）
  if (hasSheetsIntegration()) {
    isSyncing.value = true;
    try {
      await syncAllFromSheets();
      triggerRefresh();
    } catch (e) {
      console.warn('[App] Sheets sync failed:', e);
    } finally {
      isSyncing.value = false;
    }
  }
});

// 切換分頁
const handleViewChange = (view) => {
  currentView.value = view;
  highlightedId.value = ''; // 清除高亮
  updateUrl(view);
  triggerRefresh();
};

// 刷新目前頁面資料
const triggerRefresh = () => {
  refreshKey.value++;
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

// 處理表單儲存
const handleSave = ({ type, item }) => {
  addOrUpdateItem(type, item);
  triggerRefresh();
};

// 處理跳轉高亮
const handleNavigate = ({ view, id }) => {
  currentView.value = view;
  highlightedId.value = id;
  updateUrl(view);
  triggerRefresh();
  
  setTimeout(() => {
    highlightedId.value = '';
  }, 3000);
};

// 處理主題切換選擇
const handleThemeSelect = (themeClass) => {
  currentTheme.value = themeClass;
  localStorage.setItem('design_lab_theme', themeClass);
};

// 處理個人暱稱變更
const handleNicknameUpdate = (newNickname) => {
  nickname.value = newNickname;
  localStorage.setItem('design_lab_nickname', newNickname);
};

const handleUserUpdate = (u) => {
  if (u) {
    nickname.value = u.nickname;
    username.value = u.username;
  }
};

</script>

<style>
/* 全域轉場動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
