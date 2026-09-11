<template>
  <AppShell :theme="currentTheme">
    <template #nav>
      <Navigation
        :current-view="currentView"
        :nickname="nickname"
        :username="username"
        :refresh-key="refreshKey"
        @change-view="handleViewChange"
      />
    </template>

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

    <template #overlays>
      <SearchModal 
        :is-open="searchOpen" 
        @close="searchOpen = false"
        @open="searchOpen = true"
        @navigate="handleNavigate"
      />

      <CRUDModal
        :is-open="crudModalOpen"
        :type="crudType"
        :item="crudItem"
        :current-theme="currentTheme"
        :saving="crudSaving"
        @close="crudModalOpen = false"
        @save="handleSave"
      />

      <ToastHost />
      <ConfirmDialog />
    </template>
  </AppShell>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide, readonly } from 'vue';
import { initializeStorage, addOrUpdateItem } from './utils/storage';
import { syncAllFromSheets, hasSheetsIntegration } from './utils/sheetsAPI';

import AppShell from './components/layout/AppShell.vue';
import Navigation from './components/Navigation.vue';
import SearchModal from './components/SearchModal.vue';
import CRUDModal from './components/CRUDModal.vue';
import ToastHost from './components/ToastHost.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import { toast } from './utils/toast';

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

// 主題 class 掛在 <html>：Teleport 到 body 的彈窗才吃得到主題，亮色主題捲動回彈、載入時也不會露出深色底。
watch(currentTheme, (theme, previous) => {
  const root = document.documentElement;
  if (previous) root.classList.remove(previous);
  [...root.classList].filter(c => c.startsWith('theme-')).forEach(c => root.classList.remove(c));
  if (theme) root.classList.add(theme);
}, { immediate: true });

const isSyncing = ref(false);
// 首次開啟、本機還沒有快取時，各頁面靠這個顯示骨架畫面，而不是空白或「沒有資料」
provide('isSyncing', readonly(isSyncing));
const crudModalOpen = ref(false);
const crudType = ref('UI_RESEARCH');
const crudItem = ref(null);
const crudSaving = ref(false);

const highlightedId = ref('');

onMounted(async () => {
  initializeStorage();
  
  syncViewFromUrl();
  window.addEventListener('popstate', syncViewFromUrl);
  window.addEventListener('hashchange', syncViewFromUrl);

  const u = getCurrentUser();
  nickname.value = u.nickname;
  username.value = u.username;
  currentTheme.value = getUserTheme();

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
  highlightedId.value = '';
  updateUrl(view);
  triggerRefresh();
};

const viewRef = ref(null);

// 不 remount view，避免閃爍
const triggerRefresh = () => {
  refreshKey.value++;
  if (viewRef.value && typeof viewRef.value.loadData === 'function') {
    viewRef.value.loadData();
  }
};

const handleTriggerCrud = ({ type, item }) => {
  crudType.value = type;
  crudItem.value = item || null;
  crudModalOpen.value = true;
};

const openCrudForCreate = (viewName) => {
  let storageKey = 'UI_RESEARCH';
  if (viewName === 'MotionResearch') storageKey = 'MOTION_RESEARCH';
  else if (viewName === 'Competitor') storageKey = 'COMPETITORS';
  
  handleTriggerCrud({ type: storageKey, item: null });
};

// 等雲端同步結束才關閉 Modal：失敗時 storage.js 的 rollbackWrite_ 已提示並還原本機資料，
// 保持開啟讓使用者直接重試或取消。
const handleSave = async ({ type, item }) => {
  const isEdit = !!crudItem.value;
  crudSaving.value = true;
  const { synced } = addOrUpdateItem(type, item);
  const result = await synced;
  crudSaving.value = false;

  if (result && result.success === false) return;

  const title = item.title || item.name;
  toast.success(`已${isEdit ? '更新' : '新增'}${title ? `「${title}」` : '資料'}`);
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

const handleCloseModalUrl = () => {
  highlightedId.value = '';
  updateUrl(currentView.value, '');
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
};

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
