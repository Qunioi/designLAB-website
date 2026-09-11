<template>
  <!-- 可輸入、也可從歷史類型點選的欄位（combobox）。只能從固定選項挑的情境請用 base/Select.vue -->
  <div class="category-input-container" ref="containerRef">
    <div class="input-wrapper">
      <input
        ref="inputRef"
        :id="inputId || undefined"
        type="text"
        :value="modelValue"
        role="combobox"
        :aria-expanded="String(isFocused)"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.esc="isFocused = false"
        :placeholder="placeholder || '請輸入或點選建議類型...'"
        :required="required"
        class="category-input-field"
      />
      <button
        type="button"
        class="dropdown-toggle-btn"
        tabindex="-1"
        @click.stop="toggleDropdown"
        title="切換建議選單"
      >
        <Icon name="chevron-down" :size="12" :stroke-width="2.2" class="arrow-icon" :class="{ open: isFocused }" />
      </button>
    </div>

    <Transition name="fade">
      <div v-if="isFocused" class="category-dropdown-menu dropdown-surface" @mousedown.prevent>
        <div class="dropdown-heading">
          <span>{{ searchKeyword ? `篩選結果 (${filteredOptions.length})` : '歷史添加過的類型 (點擊快速套用)' }}</span>
        </div>

        <div class="options-list" v-if="filteredOptions.length > 0" role="listbox">
          <button
            type="button"
            v-for="opt in filteredOptions"
            :key="opt.value"
            class="option-item"
            :class="{ active: opt.value === modelValue }"
            role="option"
            :aria-selected="opt.value === modelValue"
            @click="selectOption(opt.value)"
          >
            <span>{{ opt.label }}</span>
            <Icon name="check" :size="14" :stroke-width="2.5" v-if="opt.value === modelValue" class="check-icon" />
          </button>
        </div>

        <div class="no-options-item" v-else-if="searchKeyword">
          <span>無符合「{{ searchKeyword }}」的歷史類型</span>
          <button type="button" class="create-new-btn" @click="selectOption(searchKeyword)">
            ＋ 點擊使用新類型「{{ searchKeyword }}」
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import Icon from './base/Icon.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  // 字串陣列，或 { value, label } 物件陣列（存的是 value、畫面上顯示 label）
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  inputId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const containerRef = ref(null);
const inputRef = ref(null);

const normalizedOptions = computed(() => (props.options || [])
  .filter(opt => opt !== null && opt !== undefined && opt !== '')
  .map(opt => (typeof opt === 'object' ? { value: String(opt.value), label: String(opt.label ?? opt.value) } : { value: String(opt), label: String(opt) })));

const searchKeyword = computed(() => (props.modelValue || '').trim());

const handleInput = (e) => {
  emit('update:modelValue', e.target.value);
  isFocused.value = true;
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false;
  }, 180);
};

const toggleDropdown = () => {
  if (isFocused.value) {
    inputRef.value?.blur();
    isFocused.value = false;
  } else {
    inputRef.value?.focus();
    isFocused.value = true;
  }
};

const selectOption = (value) => {
  emit('update:modelValue', value);
  isFocused.value = false;
};

const filteredOptions = computed(() => {
  const list = normalizedOptions.value;
  const q = searchKeyword.value.toLowerCase();
  if (!q) return list;
  return list.filter(opt => opt.label.toLowerCase().includes(q));
});

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isFocused.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.category-input-container {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.category-input-field {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  outline: none;
  transition: background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard);
  font-family: var(--font-body);
}

.category-input-field::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

.category-input-field:focus {
  border-color: var(--color-primary);
  outline: none;
}


.dropdown-toggle-btn {
  position: absolute;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: var(--space-1);
  transition: transform var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard);
}

.dropdown-toggle-btn:hover {
  color: var(--text-primary);
}

.category-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: min(240px, 32vh);
  overflow-y: auto;
  z-index: var(--z-dropdown);
  overscroll-behavior: contain;
}


.options-list {
  list-style: none;
  padding: var(--space-1);
  margin: 0;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-family: var(--font-body);
}

.option-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.option-item.active {
  background: var(--bg-hover);
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
}

.check-icon {
  color: var(--color-primary);
}

.no-options-item {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--fs-meta);
  color: var(--text-muted);
}

.create-new-btn {
  background: var(--bg-subtle);
  color: var(--color-primary);
  border: 1px solid var(--border-color);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
  text-align: center;
}

.create-new-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

.fade-enter-active, .fade-leave-active { transition: opacity var(--dur-fast) var(--ease-standard); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
