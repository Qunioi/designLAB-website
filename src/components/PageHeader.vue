<template>
  <header class="page-header-component">
    <div class="header-main-row">
      <div class="title-wrap">
        <h1 class="page-title">{{ title }}</h1>
        <slot name="extra" />
      </div>

      <div class="header-actions">
        <!-- 允許自訂操作按鈕區域 -->
        <slot name="actions" />

        <!-- 通知鈴鐺組件 (訪客登入不顯示，行動版下收納至頂部 Header 欄內) -->
        <NotificationBell v-if="showNotification && !isGuest" class="page-header-bell" />

        <!-- 新增按鈕 (訪客登入不顯示) -->
        <button
          v-if="addBtnLabel && !isGuest"
          type="button"
          class="add-btn"
          @click="$emit('add-click')"
        >
          {{ addBtnLabel }}
        </button>
      </div>
    </div>

    <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import NotificationBell from './NotificationBell.vue';
import { getCurrentUser } from '../utils/userStore';

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  addBtnLabel: {
    type: String,
    default: ''
  },
  showNotification: {
    type: Boolean,
    default: true
  }
});

defineEmits(['add-click']);

const isGuest = computed(() => {
  const u = getCurrentUser();
  const uname = (u.username || '').toLowerCase();
  return !uname || uname === '@guest' || uname === '@account' || u.nickname === '訪客';
});
</script>

<style scoped>
.page-header-component {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
  padding-top: 0.25rem;
}

.header-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.page-title {
  font-family: var(--font-title);
  font-size: var(--fs-h1);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--text-primary);
}

.page-subtitle {
  font-size: var(--fs-body);
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 680px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Navigation owns the notification entry on every mobile layout. Keep the
   page-level action for desktop only so tablet widths do not duplicate it. */
@media (max-width: 1024px) {
  .page-header-bell {
    display: none;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 1.35rem;
  }
  .add-btn {
    padding: 0.45rem 0.85rem;
    font-size: 0.75rem;
    border-radius: var(--radius-sm);
  }
  .page-subtitle {
    font-size: 0.75rem;
  }
}
</style>
