<template>
  <!-- 標籤／徽章：4 種
       tag    適用情境等標籤（前面自動加 #）
       tool   製作工具（不加 #）
       type   內容類型（主色實底，例如「Visual Style」）
       status 狀態（例如成員身分；tone 決定主色或中性）
       有 @click（或 clickable）時自動變成 <button>，可用鍵盤操作；active 代表「已選為篩選條件」。 -->
  <component
    :is="isClickable ? 'button' : 'span'"
    :type="isClickable ? 'button' : undefined"
    class="chip"
    :class="[`chip--${variant}`, variant === 'status' ? `chip--${tone}` : '', { 'is-active': active, 'is-clickable': isClickable }]"
    :aria-pressed="isClickable && (variant === 'tag' || variant === 'tool') ? String(active) : undefined"
  >
    <span v-if="variant === 'tag'" class="chip-prefix" aria-hidden="true">#</span>
    <slot />
  </component>
</template>

<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'tag',
    validator: v => ['tag', 'tool', 'type', 'status'].includes(v)
  },
  active: { type: Boolean, default: false },
  // status 用：primary（主色）／neutral（中性）
  tone: { type: String, default: 'neutral' },
  // 不給時看有沒有綁 @click 自動判斷；給 false 可以強制當成純文字
  clickable: { type: Boolean, default: undefined }
});

const attrs = useAttrs();
const isClickable = computed(() => (props.clickable === undefined ? Boolean(attrs.onClick) : props.clickable));
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  max-width: 100%;
  border: 1px solid transparent;
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  white-space: nowrap;
  user-select: none;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
  text-box: trim-both cap alphabetic;
}

button.chip {
  cursor: pointer;
}

.chip:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.chip--tag,
.chip--tool {
  padding: 0.15rem 0.45rem;
  border-color: var(--border-color);
  font-size: var(--chip-font-size, var(--fs-meta));
  border-radius: var(--radius-xs);
  background: var(--bg-subtle);
  color: var(--text-muted);
}

.chip--tag.is-clickable:hover,
.chip--tool.is-clickable:hover {
  border-color: var(--border-color-hover);
  background: var(--bg-hover);
  color: var(--text-primary);
}

.chip--tag.is-active,
.chip--tool.is-active {
  border-color: var(--color-primary);
  background: var(--bg-hover);
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
}

.chip-prefix {
  opacity: 0.75;
}

.chip--type {
  padding: 0.22rem 0.65rem;
  border-radius: var(--radius-sm);
  background: var(--action-primary);
  color: var(--action-on-primary);
  font-weight: var(--fw-semibold);
  font-size: var(--chipType-font-size, var(--fs-card-title));
  margin-bottom: var(--space-1);
}

.chip--type.is-clickable:hover {
  background: var(--action-primary-hover);
}

.chip--status {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
  font-weight: var(--fw-semibold);
}

.chip--primary {
  background: var(--glow-primary);
  color: var(--color-primary);
}

.chip--neutral {
  background: var(--bg-subtle);
  color: var(--text-secondary);
}
</style>
