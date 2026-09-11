<template>
  <!-- 只有圖示的按鈕：3 種尺寸（sm 32 / md 38 / lg 40）× 3 種語意（default / edit / delete）。
       label 必填：同時當 aria-label 和滑過提示。hover 只變色，不放大。
       loading 時圖示換成 Spinner 並停用（例如成員列表的刪除、重設密碼）。 -->
  <button
    :type="type"
    class="icon-btn"
    :class="[`icon-btn--${size}`, `icon-btn--${variant}`, { 'is-round': round, 'is-solid': solid }]"
    :aria-label="label"
    :title="label"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
  >
    <Spinner v-if="loading" :size="ICON_SIZE[size]" />
    <slot v-else>
      <Icon :name="icon" :size="ICON_SIZE[size]" :stroke-width="strokeWidth" />
    </slot>
  </button>
</template>

<script setup>
import Icon from './Icon.vue';
import Spinner from './Spinner.vue';

const ICON_SIZE = { sm: 14, md: 16, lg: 18 };

defineProps({
  icon: { type: String, default: '' },
  label: { type: String, required: true },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  // edit：hover 變警示橘；delete：hover 變危險紅
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'edit', 'delete'].includes(v)
  },
  round: { type: Boolean, default: false },
  // 實色底：疊在會捲動的內容上方時用（例如燈箱右上的關閉鈕）
  solid: { type: Boolean, default: false },
  strokeWidth: { type: [Number, String], default: 2 },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--control-height-md);
  height: var(--control-height-md);
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.icon-btn--sm {
  width: var(--control-height-sm);
  height: var(--control-height-sm);
  border-radius: var(--radius-sm);
}

.icon-btn--lg {
  width: var(--modal-control-size);
  height: var(--modal-control-size);
}

.icon-btn.is-round {
  border-radius: 50%;
}

.icon-btn.is-solid {
  background: var(--surface-raised);
  box-shadow: var(--shadow-sm);
}

.icon-btn:hover:not(:disabled) {
  border-color: var(--border-color-hover);
  color: var(--text-primary);
}

.icon-btn--edit:hover:not(:disabled) {
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.icon-btn--delete:hover:not(:disabled) {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.icon-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.icon-btn[aria-busy="true"] {
  cursor: progress;
}

@media (pointer: coarse) {
  .icon-btn,
  .icon-btn--sm,
  .icon-btn--lg {
    min-width: var(--control-height-lg);
    min-height: var(--control-height-lg);
  }
}
</style>
