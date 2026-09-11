<template>
  <!-- 單選選單：取代原生 <select>，外觀跟輸入框一致，選單跟全站下拉同一套樣式。
       鍵盤：按鈕上 ↓／↑／Enter／空白鍵打開；選單裡 ↑↓ 移動、Home／End 到頭尾、
       Enter 選取、Esc 關閉並回到按鈕。 -->
  <Dropdown v-model:open="open" class="select" :class="{ 'is-disabled': disabled }" :width="menuWidth">
    <template #trigger="{ triggerProps }">
      <button
        :id="id || undefined"
        ref="triggerRef"
        type="button"
        class="select-trigger"
        v-bind="triggerProps"
        aria-haspopup="listbox"
        :aria-label="ariaLabel || undefined"
        :disabled="disabled"
        @click="open = !open"
        @keydown="handleTriggerKeydown"
      >
        <span class="select-value" :class="{ 'is-placeholder': !selected }">{{ selected ? selected.label : placeholder }}</span>
        <Icon name="chevron-down" :size="12" class="select-arrow" :class="{ 'is-open': open }" />
      </button>
    </template>

    <div ref="menuRef" class="select-menu" role="listbox" :aria-label="menuTitle || ariaLabel || undefined">
      <div v-if="menuTitle" class="dropdown-heading">{{ menuTitle }}</div>
      <div class="select-options">
        <button
          v-for="opt in normalized"
          :key="opt.value"
          type="button"
          role="option"
          class="select-option"
          :class="{ 'is-active': opt.value === modelValue }"
          :aria-selected="opt.value === modelValue ? 'true' : 'false'"
          :disabled="opt.disabled"
          @click="choose(opt.value)"
          @keydown="handleOptionKeydown"
        >
          <span>{{ opt.label }}</span>
          <Icon v-if="opt.value === modelValue" name="check" :size="14" :stroke-width="2.5" />
        </button>
      </div>
    </div>
  </Dropdown>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import Dropdown from './Dropdown.vue';
import Icon from './Icon.vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  // 字串陣列，或 { value, label, disabled } 物件陣列
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '請選擇' },
  id: { type: String, default: '' },
  // 沒有可見 label 時的報讀名稱
  ariaLabel: { type: String, default: '' },
  menuTitle: { type: String, default: '' },
  menuWidth: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'change']);

const open = ref(false);
const triggerRef = ref(null);
const menuRef = ref(null);

const normalized = computed(() => (props.options || [])
  .filter(opt => opt !== null && opt !== undefined && opt !== '')
  .map(opt => (typeof opt === 'object'
    ? { value: opt.value, label: String(opt.label ?? opt.value), disabled: Boolean(opt.disabled) }
    : { value: opt, label: String(opt), disabled: false })));

const selected = computed(() => normalized.value.find(opt => opt.value === props.modelValue) || null);

const choose = (value) => {
  if (value !== props.modelValue) {
    emit('update:modelValue', value);
    emit('change', value);
  }
  open.value = false;
  triggerRef.value?.focus();
};

const optionButtons = () => [...(menuRef.value?.querySelectorAll('.select-option:not(:disabled)') || [])];

watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  const list = optionButtons();
  (list.find(el => el.classList.contains('is-active')) || list[0])?.focus();
});

const handleTriggerKeydown = (e) => {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
    e.preventDefault();
    open.value = true;
  }
};

const handleOptionKeydown = (e) => {
  const list = optionButtons();
  const i = list.indexOf(document.activeElement);
  let next = null;
  if (e.key === 'ArrowDown') next = list[Math.min(i + 1, list.length - 1)];
  else if (e.key === 'ArrowUp') next = list[Math.max(i - 1, 0)];
  else if (e.key === 'Home') next = list[0];
  else if (e.key === 'End') next = list[list.length - 1];
  else if (e.key === 'Tab') { open.value = false; return; }
  if (next) { e.preventDefault(); next.focus(); }
};
</script>

<style scoped>
.select {
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  min-height: var(--control-height-md);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-standard);
}

.select-trigger:hover:not(:disabled) {
  border-color: var(--border-color-hover);
}

.select-trigger[aria-expanded="true"],
.select-trigger:focus-visible {
  border-color: var(--color-primary);
}

.select-trigger:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.select-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-value.is-placeholder {
  color: var(--text-muted);
}

.select-arrow {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform var(--dur-fast) var(--ease-standard);
}

.select-arrow.is-open {
  transform: rotate(180deg);
}

.select-options {
  max-height: min(260px, 40vh);
  overflow-y: auto;
  padding: var(--space-1);
  overscroll-behavior: contain;
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  min-height: 36px;
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
}

.select-option:hover:not(:disabled),
.select-option:focus-visible {
  background: var(--bg-hover);
  color: var(--text-primary);
  outline: none;
}

.select-option.is-active {
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
}

.select-option:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (pointer: coarse) {
  .select-trigger,
  .select-option {
    min-height: var(--control-height-lg);
  }
}
</style>
