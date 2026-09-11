<template>
  <nav class="navigation-sidebar glass-panel" aria-label="主要導覽">
    <div class="logo-area">
      <div class="logo-icon">D</div>
      <span class="logo-text">Design<span class="logo-highlight">LAB</span></span>
    </div>

    <div class="menu-links">
      <button
        v-for="item in menuItems"
        :key="item.view"
        class="menu-item"
        :class="{ active: currentView === item.view }"
        :aria-current="currentView === item.view ? 'page' : undefined"
        :aria-label="item.labelZh"
        :title="item.labelZh"
        @click="handleChangeView(item.view)"
      >
        <span class="menu-icon"><Icon :name="item.icon" :size="18" /></span>
        <div class="menu-label-group">
          <span class="menu-title-zh">{{ item.labelZh }}</span>
          <span class="menu-subtitle-en">{{ item.labelEn }}</span>
        </div>
        <span v-if="item.storageKey && showCount(item)" class="menu-count" :aria-label="`共 ${itemCounts[item.view]} 筆`">{{ itemCounts[item.view] }}</span>
        <span class="compact-tooltip" aria-hidden="true">{{ item.labelZh }}</span>
      </button>
    </div>

    <button
      type="button"
      class="sidebar-footer"
      :class="{ active: currentView === 'Settings' }"
      title="進入個人設定"
      :aria-current="currentView === 'Settings' ? 'page' : undefined"
      @click="handleChangeView('Settings')"
    >
      <div class="user-avatar-group">
        <div class="user-avatar"><span class="settings-icon-svg"><Icon name="settings" :size="18" /></span></div>
        <div class="user-info">
          <div class="user-name">{{ nickname }}</div>
          <div class="user-role">{{ username }}</div>
        </div>
      </div>
    </button>
  </nav>

  <div class="mobile-nav-shell">
    <div class="mobile-nav-trigger glass-panel">
      <div class="mobile-nav-brand">
        <div class="logo-icon">D</div>
        <div class="mobile-nav-title">
          <span class="mobile-brand-text">Design<span class="logo-highlight">LAB</span></span>
          <span class="mobile-current-view">{{ currentViewLabel.labelZh }}</span>
        </div>
      </div>
      <div class="mobile-header-actions">
        <NotificationBell v-if="!isGuest" />
        <button
          type="button"
          class="mobile-menu-btn"
          :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
          aria-controls="mobile-nav-drawer"
          aria-label="開啟主要導覽"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span class="mobile-menu-icon" aria-hidden="true">
            <Icon name="menu" :size="18" />
          </span>
        </button>
      </div>
    </div>

    <Transition name="mobile-drawer">
      <div v-if="isMobileMenuOpen" class="mobile-nav-backdrop" @click="closeMobileMenu">
        <div id="mobile-nav-drawer" class="mobile-nav-drawer glass-panel" @click.stop>
          <div class="mobile-drawer-header">
            <div>
              <div class="mobile-drawer-title">主要導覽</div>
              <div class="mobile-drawer-subtitle">{{ nickname }} · {{ username }}</div>
            </div>
            <CloseButton label="關閉導覽" @click="closeMobileMenu" />
          </div>

          <div class="mobile-menu-links">
            <button
              v-for="item in menuItems"
              :key="`mobile-${item.view}`"
              type="button"
              class="mobile-menu-item"
              :class="{ active: currentView === item.view }"
              :aria-current="currentView === item.view ? 'page' : undefined"
              :aria-label="item.labelZh"
              @click="handleChangeView(item.view)"
            >
              <span class="menu-icon"><Icon :name="item.icon" :size="18" /></span>
              <div class="menu-label-group">
                <span class="menu-title-zh">{{ item.labelZh }}</span>
                <span class="menu-subtitle-en">{{ item.labelEn }}</span>
              </div>
              <span v-if="item.storageKey && showCount(item)" class="menu-count" :aria-label="`共 ${itemCounts[item.view]} 筆`">{{ itemCounts[item.view] }}</span>
            </button>
          </div>

          <button
            type="button"
            class="mobile-settings-entry"
            :class="{ active: currentView === 'Settings' }"
            :aria-current="currentView === 'Settings' ? 'page' : undefined"
            @click="handleChangeView('Settings')"
          >
            <div class="user-avatar-group">
              <div class="user-avatar"><span class="settings-icon-svg"><Icon name="settings" :size="18" /></span></div>
              <div class="user-info">
                <div class="user-name">個人設定</div>
                <div class="user-role">{{ nickname }} · {{ username }}</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import CloseButton from './base/CloseButton.vue';
import Icon from './base/Icon.vue';
import { computed, ref, watch, onMounted, onUnmounted, inject } from 'vue';
import { identityVersion } from '../utils/identity';
import NotificationBell from './NotificationBell.vue';
import { getCurrentUser } from '../utils/userStore';
import { getStorageData } from '../utils/storage';

const isGuest = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  const u = getCurrentUser();
  const uname = (u.username || '').toLowerCase();
  return !uname || uname === '@guest' || uname === '@account' || u.nickname === '訪客';
});

const props = defineProps({
  currentView: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  // App.vue 在雲端同步完成、儲存或刪除後會遞增這個值，側邊選單的筆數跟著重算
  refreshKey: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['change-view']);
const isMobileMenuOpen = ref(false);

const menuItems = [
  { 
    view: 'Dashboard', 
    labelZh: '首頁',
    labelEn: 'Dashboard', 
    icon: 'home'
  },
  { 
    view: 'UIResearch', 
    storageKey: 'UI_RESEARCH',
    labelZh: 'UI 設計研究', 
    labelEn: 'UI Research', 
    icon: 'lightbulb'
  },
  { 
    view: 'MotionResearch', 
    storageKey: 'MOTION_RESEARCH',
    labelZh: '動態研究',
    labelEn: 'Motion Research', 
    icon: 'video'
  },
  { 
    view: 'Competitor', 
    storageKey: 'COMPETITORS',
    labelZh: '競品分析',
    labelEn: 'Competitor Research', 
    icon: 'bar-chart'
  },
  { 
    view: 'AICenter', 
    storageKey: 'AI_CENTER',
    labelZh: 'AI 工具中心', 
    labelEn: 'AI Center', 
    icon: 'sparkles'
  },
  { 
    view: 'Resources', 
    storageKey: 'RESOURCES',
    labelZh: '設計資源',
    labelEn: 'Resources', 
    icon: 'folder-rounded'
  }
];

// localStorage 不是響應式：靠 refreshKey 與 design-lab-storage-updated 事件重算筆數
const storageVersion = ref(0);
const handleStorageUpdated = () => {
  storageVersion.value++;
};
onMounted(() => window.addEventListener('design-lab-storage-updated', handleStorageUpdated));
onUnmounted(() => window.removeEventListener('design-lab-storage-updated', handleStorageUpdated));

const itemCounts = computed(() => {
  const _ = [props.refreshKey, storageVersion.value];
  const counts = {};
  menuItems.forEach(item => {
    if (item.storageKey) counts[item.view] = getStorageData(item.storageKey).length;
  });
  return counts;
});

const isSyncing = inject('isSyncing', ref(false));
const showCount = (item) => !(isSyncing.value && !itemCounts.value[item.view]);

// 不在選單裡、但仍可用網址進入的頁面（優化提案刻意不放進導覽）
const HIDDEN_VIEW_LABELS = {
  Proposals: { labelZh: '優化提案', labelEn: 'Proposals' }
};

const currentViewLabel = computed(() => {
  const matchedItem = menuItems.find((item) => item.view === props.currentView);
  if (matchedItem) {
    return matchedItem;
  }
  if (HIDDEN_VIEW_LABELS[props.currentView]) {
    return HIDDEN_VIEW_LABELS[props.currentView];
  }

  return {
    labelZh: '個人設定',
    labelEn: 'Settings'
  };
});

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleChangeView = (view) => {
  closeMobileMenu();
  emit('change-view', view);
};

watch(() => props.currentView, () => {
  closeMobileMenu();
});
</script>

<style scoped>
.navigation-sidebar {
  position: fixed;
  top: 1.25rem;
  left: 1.25rem;
  bottom: 1.25rem;
  width: calc(var(--sidebar-width) - 1.25rem);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-2xl);
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  z-index: var(--z-sticky);
  padding: var(--space-2) var(--space-1);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-2);
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--action-primary);
  color: var(--action-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fw-black);
  font-size: calc(var(--fs-glyph) * 0.65);
  font-family: var(--font-title);
  box-shadow: var(--shadow-sm);
}

.logo-text {
  font-family: var(--font-title);
  font-size: var(--fs-section-title);
  font-weight: var(--fw-black);
  letter-spacing: -0.02em;
}

.logo-highlight {
  color: var(--color-primary);
  margin-left: 2px;
}

.menu-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
  padding: 0 var(--space-1);
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  color: var(--text-secondary);
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
  width: 100%;
  text-align: left;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.menu-item:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.menu-item.active {
  color: var(--color-primary);
  background: var(--bg-hover);
  border-color: var(--border-color);
  font-weight: var(--fw-semibold);
}

/* 圖示固定尺寸，圖示列空間不夠時也不會被壓扁 */
.menu-icon svg {
  flex-shrink: 0;
  min-width: 18px;
}

.menu-item.active .menu-icon {
  color: var(--color-primary);
}

.compact-tooltip {
  display: none;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  transition: color var(--dur-base) var(--ease-standard), background-color var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
  flex-shrink: 0;
}

.menu-label-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: var(--lh-tight);
}

.menu-title-zh {
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
  transition: color var(--dur-fast) var(--ease-standard);
}

.menu-subtitle-en {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  letter-spacing: 0.02em;
  margin-top: var(--space-1);
  transition: color var(--dur-fast) var(--ease-standard);
}

.menu-item.active .menu-title-zh {
  color: var(--color-primary);
  font-weight: var(--fw-bold);
}

.menu-item.active .menu-subtitle-en {
  color: var(--color-secondary);
}

.menu-count {
  margin-left: auto;
  min-width: 1.5rem;
  padding: 0 var(--space-1);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  font-variant-numeric: tabular-nums;
  line-height: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  border-radius: var(--radius-full);
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.menu-item:hover .menu-count {
  color: var(--text-secondary);
}

.menu-item.active .menu-count,
.mobile-menu-item.active .menu-count {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.sidebar-footer {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: color var(--dur-base) var(--ease-standard), background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard);
  margin-top: auto;
  width: 100%;
}

.sidebar-footer:hover {
  background: var(--bg-subtle);
  border-color: var(--border-color);
}

.sidebar-footer.active {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

.sidebar-footer.active .user-avatar {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

.user-avatar-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--fs-glyph) * 0.8);
  transition: color var(--dur-base) var(--ease-standard), background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: var(--lh-tight);
}

.user-name {
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.user-role {
  font-size: var(--fs-meta);
  color: var(--text-muted);
}

.mobile-nav-shell {
  display: none;
}

.mobile-nav-trigger,
.mobile-menu-item,
.mobile-settings-entry {
  font-family: var(--font-body);
}

@media (max-width: 1023px) {
  .navigation-sidebar {
    width: 60px;
    padding: var(--space-6) var(--space-2);
    left: 0.75rem;
    top: 0.75rem;
    bottom: 0.75rem;
  }
  .logo-text,
  .menu-label-group,
  .navigation-sidebar .menu-count,
  .user-info {
    display: none;
  }

  .navigation-sidebar .compact-tooltip {
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    z-index: var(--z-dropdown);
    display: block;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--text-primary);
    font-size: var(--fs-meta);
    line-height: var(--lh-tight);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translate(-4px, -50%);
    box-shadow: var(--shadow-md);
    transition: opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard);
  }

  .navigation-sidebar .menu-item:hover .compact-tooltip,
  .navigation-sidebar .menu-item:focus-visible .compact-tooltip {
    opacity: 1;
    transform: translate(0, -50%);
  }

  .logo-area {
    padding: 0 0 var(--space-6) 0;
    justify-content: center;
  }
  /* 圖示列只有 34px 寬：左右不留內距，圖示才有完整的 18px（左右各 12px 時只剩 8px，
     Safari 會把圖示壓扁成一條線） */
  .menu-item {
    justify-content: center;
    padding: var(--space-3) 0;
  }
  .menu-item.active {
    padding-left: 0;
  }
  .sidebar-footer {
    justify-content: center;
    padding-left: 0;
  }
  .user-avatar-group {
    padding-left: 0;
  }
  .menu-links {
    margin-top: var(--space-4);
  }
}

@media (max-width: 640px) {
  .navigation-sidebar {
    display: none;
  }

  .mobile-nav-shell {
    display: block;
  }

  .mobile-nav-trigger {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 0.75rem);
    left: 1rem;
    right: 1rem;
    z-index: var(--z-sticky);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-1) var(--space-2) var(--space-1) var(--space-4);
    background: var(--sidebar-bg);
    border-radius: var(--radius-xl);
  }

  .mobile-nav-brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  .mobile-nav-title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  }

  .mobile-brand-text {
    font-size: var(--fs-section-title);
    font-weight: var(--fw-black);
    color: var(--text-primary);
  }

  .mobile-current-view {
    font-size: var(--fs-meta);
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 190px;
  }

  .mobile-header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

.mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    color: var(--text-primary);
    cursor: pointer;
    transition: background-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard);
  }

  .mobile-menu-btn:hover {
    background: var(--bg-hover);
    border-color: var(--color-primary);
  }

  .mobile-menu-icon {
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mobile-nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: var(--z-drawer);
    background: var(--scrim);
    -webkit-backdrop-filter: blur(var(--scrim-blur));
    backdrop-filter: blur(var(--scrim-blur));
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: calc(env(safe-area-inset-top, 0px) + 0.75rem) 0.75rem 0.75rem;
  }

  .mobile-nav-drawer {
    width: min(86vw, 340px);
    max-height: calc(100vh - env(safe-area-inset-top, 0px) - 1.5rem);
    background: var(--sidebar-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-2xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .mobile-drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4);
    border-bottom: 1px solid var(--border-color);
  }

  .mobile-drawer-title {
    font-size: var(--fs-body);
    font-weight: var(--fw-bold);
    color: var(--text-primary);
  }

  .mobile-drawer-subtitle {
    font-size: var(--fs-meta);
    color: var(--text-muted);
    margin-top: var(--space-1);
  }

  .mobile-menu-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3);
    overflow-y: auto;
  }

  .mobile-menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-4);
    border-radius: var(--radius-lg);
    color: var(--text-secondary);
    text-align: left;
    transition: background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard);
  }

  /* The desktop compact-sidebar rule hides this group below 1024px. The
     mobile drawer is intentionally expanded, so its labels must remain part
     of the visible navigation and not only the accessible name. */
  .mobile-menu-item .menu-label-group {
    display: flex;
    min-width: 0;
  }

  .mobile-menu-item .menu-title-zh,
  .mobile-menu-item .menu-subtitle-en {
    color: var(--text-primary);
  }

  .mobile-menu-item .menu-subtitle-en {
    color: var(--text-muted);
  }

  .mobile-settings-entry .user-info {
    display: flex;
    min-width: 0;
  }

  .mobile-settings-entry .user-name,
  .mobile-settings-entry .user-role {
    color: var(--text-primary);
  }

  .mobile-settings-entry .user-role {
    color: var(--text-muted);
  }

  .mobile-menu-item.active .menu-title-zh {
    color: var(--color-primary);
  }

  .mobile-menu-item.active .menu-subtitle-en {
    color: var(--color-secondary);
  }

  .mobile-menu-item.active,
  .mobile-settings-entry.active {
    background: var(--glow-primary);
    border-color: var(--color-primary);
    color: var(--text-primary);
  }

  .mobile-menu-item.active .menu-icon {
    color: var(--color-primary);
  }

  .mobile-settings-entry {
    margin: var(--space-1) var(--space-3) var(--space-3);
    width: calc(100% - 1.6rem);
    display: flex;
    align-items: center;
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--bg-subtle);
    border: 1px solid var(--border-color);
    transition: background-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
  }

  .mobile-drawer-enter-active,
  .mobile-drawer-leave-active {
    transition: opacity var(--dur-base) var(--ease-standard);
  }
  .mobile-drawer-leave-active {
    transition-duration: var(--dur-fast); /* 離場比進場快 */
  }

  .mobile-drawer-enter-from,
  .mobile-drawer-leave-to {
    opacity: 0;
  }

}
</style>
