<template>
  <nav class="navigation-sidebar glass-panel">
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
        @click="$emit('change-view', item.view)"
      >
        <span class="menu-icon" v-html="item.icon"></span>
        <span class="menu-label">{{ item.label }}</span>
      </button>
    </div>

    <!-- User Profile Footer (點擊後進入 Settings 頁面) -->
    <div 
      class="sidebar-footer" 
      :class="{ active: currentView === 'Settings' }"
      @click="$emit('change-view', 'Settings')"
      title="進入個人設定"
    >
      <!-- 左側對話 emoji 改成設定圖示 -->
      <div class="user-avatar-group">
        <div class="user-avatar"><span class="settings-icon-svg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span></div>
        <div class="user-info">
          <div class="user-name">{{ nickname }}</div>
          <div class="user-role">{{ username }}</div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
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

defineEmits(['change-view']);

const menuItems = [
  { 
    view: 'Dashboard', 
    label: 'Dashboard', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`
  },
  { 
    view: 'UIResearch', 
    label: 'UI Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`
  },
  { 
    view: 'MotionResearch', 
    label: 'Motion Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`
  },
  { 
    view: 'Competitor', 
    label: 'Competitor Research', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
  },
  { 
    view: 'AICenter', 
    label: 'AI Center', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
  },
  { 
    view: 'Resources', 
    label: 'Resources', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`
  },
  { 
    view: 'Proposals', 
    label: '優化提案看板', 
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
  }
];
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
  padding: 2rem 1rem;
  border-radius: 20px;
  background: var(--sidebar-bg);
  z-index: 100;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.75rem 2rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
}

.logo-text {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.menu-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  color: var(--text-primary);
  background: var(--bg-subtle);
}

.menu-item.active {
  color: var(--text-primary);
  background: linear-gradient(90deg, var(--glow-primary) 0%, transparent 100%);
  border-left: 3px solid var(--color-primary);
  padding-left: calc(1rem - 3px);
}

.menu-item.active .menu-icon {
  color: var(--color-primary);
  filter: drop-shadow(0 0 6px var(--glow-primary));
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: auto;
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
  font-size: 1.15rem;
  transition: all 0.25s ease;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .navigation-sidebar {
    width: 60px;
    padding: 1.5rem 0.5rem;
    left: 0.75rem;
    top: 0.75rem;
    bottom: 0.75rem;
  }
  .logo-text, .menu-label, .user-info {
    display: none;
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
    background: var(--glow-primary);
    border-radius: 12px;
  }
  .sidebar-footer {
    justify-content: center;
    padding: 0.5rem;
  }
}

@media (max-width: 640px) {
  .navigation-sidebar {
    display: none;
  }
}
</style>
