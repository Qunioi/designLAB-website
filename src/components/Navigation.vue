<template>
  <nav class="navigation-sidebar glass-panel" aria-label="主要導覽">
    <!-- Logo -->
    <div class="logo-area">
      <div class="logo-icon"></div>
      <span class="logo-text">Design<span class="text-gradient">LAB</span></span>
    </div>

    <!-- Menu Links -->
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
        <span class="menu-icon" v-html="item.icon"></span>
        <div class="menu-label-group">
          <span class="menu-title-zh">{{ item.labelZh }}</span>
          <span class="menu-subtitle-en">{{ item.labelEn }}</span>
        </div>
        <span class="compact-tooltip" aria-hidden="true">{{ item.labelZh }}</span>
      </button>
    </div>

    <!-- User Profile Footer (點擊後進入 Settings 頁面) -->
    <button
      type="button"
      class="sidebar-footer"
      :class="{ active: currentView === 'Settings' }"
      title="進入個人設定"
      :aria-current="currentView === 'Settings' ? 'page' : undefined"
      @click="handleChangeView('Settings')"
    >
      <div class="user-avatar-group">
        <div class="user-avatar"><span class="settings-icon-svg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span></div>
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
        <div class="logo-icon"></div>
        <div class="mobile-nav-title">
          <span class="mobile-brand-text">Design<span class="text-gradient">LAB</span></span>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
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
            <button type="button" class="mobile-drawer-close" aria-label="關閉導覽" @click="closeMobileMenu">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
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
              <span class="menu-icon" v-html="item.icon"></span>
              <div class="menu-label-group">
                <span class="menu-title-zh">{{ item.labelZh }}</span>
                <span class="menu-subtitle-en">{{ item.labelEn }}</span>
              </div>
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
              <div class="user-avatar"><span class="settings-icon-svg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span></div>
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
import { computed, ref, watch } from 'vue';
import NotificationBell from './NotificationBell.vue';
import { getCurrentUser } from '../utils/userStore';

const isGuest = computed(() => {
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
  }
});

const emit = defineEmits(['change-view']);
const isMobileMenuOpen = ref(false);

const menuItems = [
  { 
    view: 'Dashboard', 
    labelZh: '首頁',
    labelEn: 'Dashboard', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`
  },
  { 
    view: 'UIResearch', 
    labelZh: 'UI 研究案例', 
    labelEn: 'UI Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`
  },
  { 
    view: 'MotionResearch', 
    labelZh: '動態設計研究',
    labelEn: 'Motion Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`
  },
  { 
    view: 'Competitor', 
    labelZh: '競品分析',
    labelEn: 'Competitor Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 1 0 7.75"></path></svg>`
  },
  { 
    view: 'AICenter', 
    labelZh: 'AI 工具中心', 
    labelEn: 'AI Center', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
  },
  { 
    view: 'Resources', 
    labelZh: '設計資源',
    labelEn: 'Resources', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
  },
  { 
    view: 'Proposals', 
    labelZh: '產品優化提案', 
    labelEn: 'Proposals Board', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
  }
];

const currentViewLabel = computed(() => {
  const matchedItem = menuItems.find((item) => item.view === props.currentView);
  if (matchedItem) {
    return matchedItem;
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
  top: 1.5rem;
  left: 1.5rem;
  bottom: 1.5rem;
  width: calc(var(--sidebar-width) - 1.5rem);
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: var(--sidebar-bg);
  z-index: 100;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  box-shadow: 0 0 15px var(--glow-primary);
}


.logo-text {
  font-family: var(--font-title);
  font-size: 1.188rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.menu-links {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-top: 0.1rem;
  flex: 1;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  border-radius: 0;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  color: var(--text-primary);
  background: var(--bg-subtle);
}

.menu-item.active {
  color: var(--text-primary);
  background: var(--bg-hover);
  border-left-color: var(--color-primary);
  border-radius: 0;
  padding-left: calc(1rem + 3px);
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
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.menu-label-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.menu-title-zh {
  font-size: 0.8175rem;
  font-weight: 500;
  color: var(--text-primary);
}

.menu-subtitle-en {
  font-size: 0.6175rem;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  margin-top: 0.1rem;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: auto;
  width: 100%;
}

.sidebar-footer:hover {
  background: var(--bg-subtle);
  border-color: var(--border-color);
}

.sidebar-footer.active {
  background: linear-gradient(90deg, var(--glow-primary) 0%, transparent 100%);
  border-color: var(--color-primary);
}

.sidebar-footer.active .user-avatar {
  background: var(--glow-primary);
  border-color: var(--color-primary);
}

.user-avatar-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  font-size: 1.087rem;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 0.7875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.mobile-nav-shell {
  display: none;
}

.mobile-nav-trigger,
.mobile-menu-item,
.mobile-settings-entry,
.mobile-drawer-close {
  font-family: var(--font-body);
}

@media (max-width: 1024px) {
  .navigation-sidebar {
    width: 60px;
    padding: 1.5rem 0.5rem;
    left: 0.75rem;
    top: 0.75rem;
    bottom: 0.75rem;
  }
  .logo-text,
  .menu-label-group,
  .user-info {
    display: none;
  }

  .navigation-sidebar .compact-tooltip {
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    z-index: 300;
    display: block;
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: 0.7375rem;
    line-height: 1.2;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translate(-4px, -50%);
    box-shadow: var(--shadow-md);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  .navigation-sidebar .menu-item:hover .compact-tooltip,
  .navigation-sidebar .menu-item:focus-visible .compact-tooltip {
    opacity: 1;
    transform: translate(0, -50%);
  }

  .logo-area {
    padding: 0 0 1.5rem 0;
    justify-content: center;
  }
  .menu-item {
    justify-content: center;
    padding: 0.75rem;
  }
  .menu-item.active {
    padding-left: 0.75rem;
    border-left: none;
    background: var(--bg-hover);
    border-radius: 12px;
  }
  .sidebar-footer {
    justify-content: center;
    padding: 0.5rem;
  }
  .menu-links {
    margin-top: 1rem;
  }
}

@media (max-width: 900px) {
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
    z-index: 220;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.25rem .5rem 0.25rem 1rem;
    background: var(--sidebar-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-md);
  }

  .mobile-nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .mobile-nav-title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  }

  .mobile-brand-text {
    font-size: 0.9375rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .mobile-current-view {
    font-size: 0.6575rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 190px;
  }

  .mobile-header-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-shrink: 0;
  }

.mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    /* background: var(--bg-subtle); */
    /* border: 1px solid var(--border-color); */
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
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
    z-index: 250;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
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
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .mobile-drawer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .mobile-drawer-title {
    font-size: 0.8875rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .mobile-drawer-subtitle {
    font-size: 0.6875rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
  }

  .mobile-drawer-close {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--bg-subtle);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mobile-menu-links {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.8rem;
    overflow-y: auto;
  }

  .mobile-menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.9rem 0.95rem;
    border-radius: 14px;
    color: var(--text-secondary);
    text-align: left;
    transition: all 0.2s ease;
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
    margin: 0.2rem 0.8rem 0.8rem;
    width: calc(100% - 1.6rem);
    display: flex;
    align-items: center;
    padding: 0.9rem;
    border-radius: 14px;
    background: var(--bg-subtle);
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
  }

  .mobile-drawer-enter-active,
  .mobile-drawer-leave-active {
    transition: opacity 0.2s ease;
  }

  .mobile-drawer-enter-from,
  .mobile-drawer-leave-to {
    opacity: 0;
  }

  .mobile-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 210;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0.5rem 0.25rem calc(env(safe-area-inset-bottom, 0px) + 0.35rem);
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .bottom-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    flex: 1;
    padding: 0.35rem 0;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .bottom-bar-item.active {
    color: var(--color-primary);
  }

  .bottom-bar-item .bottom-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-bar-item .bottom-label {
    font-size: 0.6175rem;
    font-weight: 600;
  }
}
</style>
