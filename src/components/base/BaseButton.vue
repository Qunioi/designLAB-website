<template>
  <!-- 全站文字按鈕：4 種外觀（primary / secondary / ghost / danger）× 3 種尺寸（sm / md / lg）
       有 href 時渲染成 <a>（例如「前往網站」），其餘都是 <button>。
       loading 時：左側換成 Spinner、文字換成 loadingText、aria-busy，並一律 disabled。
       slot：icon 文字左側圖示、default 文字、end 文字右側（例如數字徽章）。 -->
  <component
    :is="href ? 'a' : 'button'"
    :type="href ? undefined : type"
    :href="href || undefined"
    :disabled="href ? undefined : (disabled || loading)"
    :aria-busy="loading ? 'true' : undefined"
    class="base-btn"
    :class="[`base-btn--${variant}`, `base-btn--${size}`, { 'is-block': block, 'is-loading': loading, 'has-icon': loading || $slots.icon }]"
  >
    <span v-if="loading || $slots.icon" class="base-btn-icon">
      <Spinner v-if="loading" />
      <slot v-else name="icon" />
    </span>
    <span class="base-btn-label">
      <template v-if="loading">{{ loadingText }}</template>
      <slot v-else />
    </span>
    <span v-if="$slots.end && !loading" class="base-btn-end">
      <slot name="end" />
    </span>
  </component>
</template>

<script setup>
import Spinner from './Spinner.vue';

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'ghost', 'danger'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  type: { type: String, default: 'button' },
  href: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: '儲存中…' },
  // 撐滿父層寬度
  block: { type: Boolean, default: false }
});
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--control-height-md);
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-fast) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
  text-box: trim-both cap alphabetic;
}

.base-btn:active:not(:disabled) {
  transition-duration: var(--dur-instant);
}

/* 元件內有 outline: none 也蓋不掉這個焦點框 */
.base-btn:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.base-btn-icon,
.base-btn-label,
.base-btn-end {
  display: inline-flex;
  align-items: center;
  gap: inherit;
  text-box: trim-both cap alphabetic;
}

.base-btn.is-block {
  display: flex;
  width: 100%;
}

/* 滿版按鈕：整組置中會讓文字被圖示往右推、看起來歪一邊，
   改成文字置中、圖示掛在文字左側、end slot（數字徽章）掛在右側（兩側 1fr 等寬） */
.base-btn.is-block.has-icon {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}

.base-btn.is-block.has-icon .base-btn-icon {
  justify-self: end;
}

.base-btn.is-block.has-icon .base-btn-end {
  justify-self: start;
}

.base-btn--sm {
  min-height: var(--control-height-sm);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-meta);
  gap: var(--space-1);
}

.base-btn--lg {
  min-height: var(--control-height-lg);
  padding: 0 var(--space-5);
  font-size: var(--fs-body);
}

.base-btn--primary {
  background: var(--action-primary);
  color: var(--action-on-primary);
  box-shadow: var(--shadow-sm);
}

/* 只有 hover 帶主色光暈 */
.base-btn--primary:hover:not(:disabled) {
  background: var(--action-primary-hover);
  box-shadow: var(--shadow-hover);
  transform: translateY(-1px);
}

.base-btn--primary:active:not(:disabled) {
  box-shadow: var(--shadow-sm);
  transform: translateY(0);
}

.base-btn--secondary {
  background: var(--bg-subtle);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.base-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
}

.base-btn--secondary:hover:not(:disabled),
.base-btn--ghost:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--border-color-hover);
  color: var(--text-primary);
}

.base-btn--ghost:hover:not(:disabled) {
  border-color: transparent;
}

.base-btn--secondary:active:not(:disabled),
.base-btn--ghost:active:not(:disabled) {
  background: color-mix(in srgb, var(--bg-hover), var(--text-primary) 6%);
}

.base-btn--danger {
  background: var(--action-danger);
  color: var(--action-on-danger);
}

/* 危險按鈕不加主色光暈 */
.base-btn--danger:hover:not(:disabled) {
  background: var(--action-danger-hover);
  transform: translateY(-1px);
}

.base-btn--danger:active:not(:disabled) {
  transform: translateY(0);
}

/* ── 停用／載入中：一律靠 disabled 屬性 ── */
.base-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.base-btn.is-loading:disabled {
  cursor: progress;
}

/* 觸控裝置：每種尺寸的可點高度都至少 44px（字級、內距不變） */
@media (pointer: coarse) {
  .base-btn,
  .base-btn--sm {
    min-height: var(--control-height-lg);
  }
}
</style>
