<template>
  <!-- 放在 AppShell 的 overlays 裡；主題 class 也掛在 <html> 上，CSS 變數一定吃得到 -->
  <div class="toast-host" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="item in toastState.items"
        :key="item.id"
        class="toast-item"
        :class="`is-${item.type}`"
        :role="item.type === 'error' ? 'alert' : 'status'"
      >
        <span class="toast-icon" aria-hidden="true">
          <Icon name="check" :size="16" :stroke-width="2.5" v-if="item.type === 'success'" />
          <Icon name="alert-circle" :size="16" :stroke-width="2.5" v-else-if="item.type === 'error'" />
          <Icon name="info" :size="16" :stroke-width="2.5" v-else />
        </span>
        <div class="toast-text">
          <p class="toast-title">{{ item.title }}</p>
          <p v-if="item.detail" class="toast-detail">{{ item.detail }}</p>
        </div>
        <button type="button" class="toast-close" aria-label="關閉提示" @click="dismissToast(item.id)">
          <Icon name="close" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import Icon from './base/Icon.vue';
import { toastState, dismissToast } from '../utils/toast';
</script>

<style scoped>
.toast-host {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: min(420px, calc(100vw - 2rem));
  transform: translateX(-50%);
  pointer-events: none;
}

.toast-item {
  --toast-accent: var(--color-primary);
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-primary);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.toast-item.is-success { --toast-accent: var(--color-success); }
.toast-item.is-error { --toast-accent: var(--color-danger); }

/* 類型只靠圖示區分：圖示放在同色系的淡底圓形裡，不另外加彩色側邊框 */
.toast-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--toast-accent) 14%, transparent);
  color: var(--toast-accent);
}

.toast-text {
  flex: 1;
  min-width: 0;
  padding-top: 4px; /* 讓第一行文字跟 28px 的圓形圖示垂直置中 */
}

.toast-title {
  margin: 0;
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  line-height: 1.45;
}

.toast-detail {
  margin: var(--space-1) 0 0;
  font-size: var(--fs-meta);
  line-height: 1.5;
  color: var(--text-secondary);
  white-space: pre-line;
}

.toast-close {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.toast-close:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
}
.toast-leave-active {
  transition-duration: var(--dur-fast); /* 離場比進場快 */
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.toast-move {
  transition: transform var(--dur-base) var(--ease-standard);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }
}
</style>
