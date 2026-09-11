<template>
  <!-- 通知面板：開關、點外面關閉、Esc 都由 Dropdown 負責 -->
  <Dropdown v-model:open="showNotifPanel" class="bell-wrapper" align="end">
    <template #trigger="{ triggerProps }">
      <button
        type="button"
        class="bell-btn"
        v-bind="triggerProps"
        :aria-label="bellAriaLabel"
        aria-haspopup="dialog"
        @click="toggleNotifPanel"
        title="通知中心"
      >
        <Icon name="bell" :size="18" />
        <span class="unread-badge" v-if="unreadCount > 0" aria-hidden="true">{{ unreadCount }}</span>
      </button>
    </template>

      <div class="notif-panel">
        <div class="notif-header">
          <span class="notif-header-title">通知</span>
          <BaseButton variant="ghost" size="sm" @click="handleMarkAllRead">全標為已讀</BaseButton>
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
            <p class="notif-msg" v-html="getMsgContent(n)"></p>
          </div>
        </div>
        <EmptyState v-else size="sm" title="目前沒有新通知" class="notif-empty" />
      </div>
  </Dropdown>
</template>

<script setup>
import EmptyState from './base/EmptyState.vue';
import Icon from './base/Icon.vue';
import BaseButton from './base/BaseButton.vue';
import Dropdown from './base/Dropdown.vue';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, formatNotificationMessage, getCurrentUser } from '../utils/notifications';

const showNotifPanel = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
let timer = null;

const bellAriaLabel = computed(() => {
  if (unreadCount.value > 0) {
    return `通知中心，目前有 ${unreadCount.value} 則未讀通知`;
  }

  return '通知中心，目前沒有未讀通知';
});

const getMsgContent = (n) => {
  const user = getCurrentUser();
  return formatNotificationMessage(n, user);
};

const refreshNotifications = () => {
  notifications.value = getNotifications();
  unreadCount.value = getUnreadNotificationCount();
};

onMounted(() => {
  refreshNotifications();
  timer = setInterval(refreshNotifications, 2000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
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
  height: var(--control-height-md);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  position: relative;
  transition: background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard);
  cursor: pointer;
}

.bell-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
}

.unread-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  background: var(--action-danger);
  color: var(--action-on-danger);
  font-size: var(--fs-badge);
  font-weight: var(--fw-bold);
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: var(--lh-none);
  box-shadow: var(--shadow-sm);
  font-variant-numeric: tabular-nums;
  z-index: 2;
}

/* 面板外框（背景、框線、陰影、位置）由 Dropdown 負責，這裡只管尺寸 */
.bell-wrapper :deep(.dropdown-panel) {
  overflow: hidden;
}

.notif-panel {
  display: flex;
  flex-direction: column;
  width: 330px;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-color);
}

.notif-header-title {
  font-size: var(--fs-section-title);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.notif-list {
  max-height: 340px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
}

.notif-item {
  padding: var(--space-2) var(--space-5) var(--space-5);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: background var(--dur-base) var(--ease-standard);
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

.notif-title {
  font-size: var(--fs-body);
  font-weight: var(--fw-black);
  color: var(--color-primary);
}

.notif-time {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  font-weight: var(--fw-medium);
}

.notif-msg {
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
  line-height: var(--lh-normal);
  word-break: break-word;
}

:deep(.notif-handle) {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  opacity: 0.65;
  font-weight: normal;
  margin: 0 1px;
}

.notif-empty {
  background: var(--surface-card);
}

@media (max-width: 640px) {
  .bell-btn {
    background: transparent;
    border: none;
  }
}

/* 手機：鈴鐺不在畫面最右邊（右側還有選單鈕），330px 的面板以鈴鐺右緣對齊
   會往左超出螢幕。改成固定在手機頂列下方、左右各留邊距的滿版面板。 */
@media (max-width: 640px) {
  .bell-wrapper :deep(.dropdown-panel) {
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 5rem);
    left: var(--space-3);
    right: var(--space-3);
  }
  .notif-panel {
    width: auto;
    max-height: min(70vh, 32rem);
  }
}

@media (pointer: coarse) {
  .bell-btn {
    width: var(--control-height-lg);
    height: var(--control-height-lg);
  }
}
</style>
