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

@media (max-width: 768px) {
  .page-header-bell {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 1.438rem;
  }
  .add-btn {
    padding: 0.45rem 0.85rem;
    font-size: 0.7575rem;
    border-radius: 10px;
  }
  .page-subtitle {
    font-size: 0.7575rem;
  }
}
</style>
