<template>
  <nav class="navigation-sidebar glass-panel" aria-label="主要導覽">
    <!-- Logo -->
    <div class="logo-area">
      <div class="logo-icon">D</div>
      <span class="logo-text">Design<span class="logo-highlight">LAB</span></span>
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
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7"></path><path d="M5 9v11h14V9"></path><path d="M9 20v-6h6v6"></path></svg>`
  },
  { 
    view: 'UIResearch', 
    labelZh: 'UI 設計研究', 
    labelEn: 'UI Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.05V18h6v-1.25c0-.85.4-1.55 1-2.05A7 7 0 0 0 12 2Z"></path></svg>`
  },
  { 
    view: 'MotionResearch', 
    labelZh: '動態研究',
    labelEn: 'Motion Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`
  },
  { 
    view: 'Competitor', 
    labelZh: '競品分析',
    labelEn: 'Competitor Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="14"></line><line x1="12" y1="20" x2="12" y2="8"></line><line x1="18" y1="20" x2="18" y2="4"></line></svg>`
  },
  { 
    view: 'AICenter', 
    labelZh: 'AI 工具中心', 
    labelEn: 'AI Center', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"></path></svg>`
  },
  { 
    view: 'Resources', 
    labelZh: '設計資源',
    labelEn: 'Resources', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>`
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
  top: 1.25rem;
  left: 1.25rem;
  bottom: 1.25rem;
  width: calc(var(--sidebar-width) - 1.25rem);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-2xl);
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  z-index: 100;
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
  border-radius: 8px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fw-black);
  font-size: var(--fs-label);
  font-family: var(--font-title);
  box-shadow: var(--shadow-sm);
}

.logo-text {
  font-family: var(--font-title);
  font-size: var(--fs-h3);
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
  transition: color 0.18s ease, background-color 0.18s ease;
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
  transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.menu-label-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: var(--lh-tight);
}

.menu-title-zh {
  font-size: var(--fs-label);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
  transition: color 0.18s ease;
}

.menu-subtitle-en {
  font-size: var(--fs-tiny);
  color: var(--text-muted);
  letter-spacing: 0.02em;
  margin-top: var(--space-1);
  transition: color 0.18s ease;
}

.menu-item.active .menu-title-zh {
  color: var(--color-primary);
  font-weight: var(--fw-bold);
}

.menu-item.active .menu-subtitle-en {
  color: var(--color-secondary);
}

.sidebar-footer {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-3);
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
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
  font-size: var(--fs-h3);
  transition: color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: var(--lh-tight);
}

.user-name {
  font-size: var(--fs-label);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.user-role {
  font-size: var(--fs-tiny);
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
    padding: var(--space-6) var(--space-2);
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
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: var(--fs-meta);
    line-height: var(--lh-tight);
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
    padding: 0 0 var(--space-6) 0;
    justify-content: center;
  }
  .menu-item {
    justify-content: center;
    padding: var(--space-3);
  }
  .menu-item.active {
    padding-left: var(--space-3);
    border-left: none;
    background: var(--bg-hover);
    border-radius: 12px;
  }
  .sidebar-footer {
    justify-content: center;
    padding: var(--space-2);
  }
  .menu-links {
    margin-top: var(--space-4);
  }
}

@media (max-width: 1024px) {
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
    gap: var(--space-4);
    padding: var(--space-1) var(--space-2) var(--space-1) var(--space-4);
    background: var(--sidebar-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: var(--shadow-md);
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
    font-size: var(--fs-body-lg);
    font-weight: var(--fw-black);
    color: var(--text-primary);
  }

  .mobile-current-view {
    font-size: var(--fs-tiny);
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
    transition: background-color 0.2s ease, color 0.2s ease;
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
    font-size: var(--fs-tiny);
    color: var(--text-muted);
    margin-top: var(--space-1);
  }

  .mobile-drawer-close {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
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
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
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
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  }

  .mobile-drawer-enter-active,
  .mobile-drawer-leave-active {
    transition: opacity 0.2s ease;
  }

  .mobile-drawer-enter-from,
  .mobile-drawer-leave-to {
    opacity: 0;
  }

}
</style>
