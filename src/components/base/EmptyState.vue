<template>
  <!-- 空狀態／載入中／錯誤：圖示（淡底圓形）＋標題＋說明＋動作按鈕。
       size：lg 整頁（列表沒有資料）、md 彈窗內、sm 小區塊（通知面板、看板欄，不顯示圖示）。
       fill：在彈窗裡撐滿剩下的高度並置中。 -->
  <div
    class="empty-state"
    :class="[`empty-state--${size}`, { 'is-fill': fill, 'is-bordered': bordered, 'is-danger': tone === 'danger' }]"
    :role="tone === 'danger' ? 'alert' : undefined"
  >
    <div v-if="size !== 'sm' && (icon || $slots.icon)" class="empty-state-icon" aria-hidden="true">
      <slot name="icon">
        <Icon :name="icon" :size="size === 'lg' ? 28 : 26" :stroke-width="1.8" />
      </slot>
    </div>
    <p v-if="title" class="empty-state-title">{{ title }}</p>
    <p v-if="description || $slots.default" class="empty-state-description">
      <slot>{{ description }}</slot>
    </p>
    <div v-if="$slots.actions" class="empty-state-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  fill: { type: Boolean, default: false },
  // 虛線框（看板欄這種「可以放東西進來」的空位）
  bordered: { type: Boolean, default: false },
  tone: { type: String, default: 'default' }
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  color: var(--text-muted);
}

.empty-state--lg {
  padding: 4rem var(--space-8);
}

.empty-state--sm {
  gap: var(--space-1);
  padding: var(--space-6) var(--space-4);
}

.empty-state.is-fill {
  flex: 1;
  min-height: 0;
}

.empty-state.is-bordered {
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
}

.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-bottom: var(--space-2);
  border-radius: 50%;
  background: var(--bg-subtle);
  color: var(--text-muted);
}

.empty-state.is-danger .empty-state-icon {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}

.empty-state-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--fs-card-title);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-card-title);
}

.empty-state--sm .empty-state-title {
  color: var(--text-secondary);
  font-size: var(--fs-body);
  font-weight: var(--fw-regular);
}

.empty-state.is-danger .empty-state-title {
  color: var(--color-danger);
}

.empty-state-description {
  max-width: 42ch;
  margin: 0;
  font-size: var(--fs-body);
  line-height: var(--lh-normal);
  color: var(--text-muted);
}

.empty-state-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
</style>
