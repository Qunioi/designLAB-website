<template>
  <div class="bell-wrapper" ref="bellRef">
    <button class="bell-btn" @click="toggleNotifPanel" title="通知中心">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span class="unread-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
    </button>

    <!-- 小鈴鐺通知下拉彈窗（不透明實色背景，高對比大字） -->
    <Transition name="fade">
      <div class="notif-panel solid-panel" v-if="showNotifPanel" @click.stop>
        <div class="notif-header">
          <span class="notif-header-title">團隊異動通知</span>
          <button class="mark-read-btn" @click="handleMarkAllRead">全標為已讀</button>
        </div>
        <div class="notif-list" v-if="notifications.length">
          <div 
            v-for="n in notifications" 
            :key="n.id" 
            class="notif-item"
            :class="{ unread: !n.read }"
          >
            <div class="notif-item-header">
              <span class="notif-title">{{ n.title }}</span>
              <span class="notif-time">{{ n.time }}</span>
            </div>
            <!-- 高清晰高對比描述文字 -->
            <p class="notif-msg">{{ n.message }}</p>
          </div>
        </div>
        <div class="notif-empty" v-else>
          <span>目前沒有新通知</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead } from '../utils/notifications';

const bellRef = ref(null);
const showNotifPanel = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
let timer = null;

const refreshNotifications = () => {
  notifications.value = getNotifications();
  unreadCount.value = getUnreadNotificationCount();
};

const handleClickOutside = (e) => {
  if (bellRef.value && !bellRef.value.contains(e.target)) {
    showNotifPanel.value = false;
  }
};

onMounted(() => {
  refreshNotifications();
  timer = setInterval(refreshNotifications, 2000);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  document.removeEventListener('click', handleClickOutside);
});

const toggleNotifPanel = () => {
  showNotifPanel.value = !showNotifPanel.value;
  refreshNotifications();
};

const handleMarkAllRead = () => {
  notifications.value = markAllNotificationsAsRead();
  unreadCount.value = 0;
};
</script>

<style scoped>
.bell-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.bell-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.bell-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  line-height: 1;
}

/* 通知下拉面板 (完全不透明實色背景，避免透光) */
.notif-panel.solid-panel {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  width: 330px;
  background: var(--bg-elevated); /* 實心背景，不含半透明 opacity */
  border: 1px solid var(--border-color-hover);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 1 !important;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.95rem 1.2rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

/* 標題字大、清楚清晰 */
.notif-header-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.mark-read-btn {
  font-size: 0.78rem;
  color: var(--color-primary);
  background: transparent;
  cursor: pointer;
  font-weight: 700;
  transition: opacity 0.2s ease;
}

.mark-read-btn:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.notif-list {
  max-height: 340px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
}

.notif-item {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: background 0.2s ease;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item.unread {
  background: var(--bg-subtle);
  border-left: 3px solid var(--color-primary);
}

.notif-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 每條通知大字標題 */
.notif-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--color-primary);
}

.notif-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* 描述文字：深色背景下高亮純白，淺色背景下純黑 */
.notif-msg {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary); /* 在深色主題自動為白色，淺色主題自動為黑色 */
  line-height: 1.5;
  word-break: break-word;
}

.notif-empty {
  padding: 2.2rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
  background: var(--bg-card);
}

/* 淡入動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
