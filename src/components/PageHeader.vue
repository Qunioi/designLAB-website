<template>
  <header class="page-header-component">
    <div class="title-area">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      <slot name="extra" />
    </div>

    <div class="header-actions">
      <!-- 允許自訂操作按鈕區域 -->
      <slot name="actions" />

      <!-- 通知鈴鐺組件 (訪客登入不顯示) -->
      <NotificationBell v-if="showNotification && !isGuest" />

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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-area {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.add-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: #ffffff !important;
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px var(--glow-primary);
  transition: all 0.2s ease;
  white-space: nowrap;
  cursor: pointer;
  border: none;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--glow-primary);
}

@media (max-width: 640px) {
  .page-header-component {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
