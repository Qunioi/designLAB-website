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
  /* margin-bottom: 1rem; */
  /* gap: 0.35rem; */
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
  font-size: var(--fs-h1);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
  margin-top: 0.15rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.add-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: #ffffff !important;
  padding: 0.55rem 1.15rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.88rem;
  box-shadow: 0 4px 15px var(--glow-primary);
  transition: all 0.2s ease;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  flex-shrink: 0;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--glow-primary);
}

@media (max-width: 768px) {
  .page-header-bell {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 1.5rem;
  }
  .add-btn {
    padding: 0.45rem 0.85rem;
    font-size: 0.82rem;
    border-radius: 10px;
  }
  .page-subtitle {
    font-size: 0.82rem;
  }
}
</style>
