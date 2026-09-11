<template>
  <!-- 搜尋框：放大鏡＋輸入框＋有內容時出現的清除鈕。
       有內容時按 Esc 先清空（不會順便關掉外層彈窗），空了才讓 Esc 往外傳。 -->
  <div class="search-input" :class="`search-input--${size}`">
    <Icon name="search" :size="size === 'sm' ? 14 : 16" class="search-input-icon" />
    <input
      ref="inputRef"
      :id="id || undefined"
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      :aria-label="ariaLabel || placeholder"
      autocomplete="off"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown.esc="handleEsc"
    />
    <button
      v-if="modelValue"
      type="button"
      class="search-input-clear"
      aria-label="清除搜尋"
      title="清除搜尋"
      @click="clear"
    >
      <Icon name="close" :size="12" :stroke-width="2.5" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Icon from './Icon.vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜尋…' },
  ariaLabel: { type: String, default: '' },
  id: { type: String, default: '' },
  // sm：彈窗工具列（32px）；md：頁面篩選列（38px）
  size: { type: String, default: 'md' }
});

const emit = defineEmits(['update:modelValue']);
const inputRef = ref(null);

const clear = () => {
  emit('update:modelValue', '');
  inputRef.value?.focus();
};

const handleEsc = (e) => {
  if (!props.modelValue) return;
  e.stopPropagation();
  emit('update:modelValue', '');
};

defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<style scoped>
.search-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  height: var(--control-height-md);
  padding: 0 var(--space-2) 0 var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-input);
  transition: border-color var(--dur-fast) var(--ease-standard);
}

.search-input:hover {
  border-color: var(--border-color-hover);
}

.search-input:focus-within {
  border-color: var(--color-primary);
}

.search-input--sm {
  height: var(--control-height-sm);
  border-radius: var(--radius-sm);
}

.search-input-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.search-input input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-body);
}

.search-input--sm input {
  font-size: var(--fs-meta);
}

.search-input input::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

/* 用自己的清除鈕，拿掉瀏覽器內建的 × */
.search-input input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

.search-input-clear {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--bg-hover);
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.search-input-clear:hover {
  color: var(--text-primary);
}

.search-input-clear:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

@media (pointer: coarse) {
  .search-input,
  .search-input--sm {
    height: var(--control-height-lg);
  }
}
</style>
