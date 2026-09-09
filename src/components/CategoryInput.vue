<template>
  <div class="category-input-container" ref="containerRef">
    <div class="input-wrapper">
      <input
        ref="inputRef"
        type="text"
        :value="modelValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder || '請輸入或點選建議分類...'"
        :required="required"
        class="category-input-field"
      />
      <button
        type="button"
        class="dropdown-toggle-btn"
        @click.stop="toggleDropdown"
        title="切換建議選單"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="arrow-icon"
          :class="{ open: isFocused }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>

    <!-- 自訂高質感歷史建議選單 (只在 Focus 有焦點時展示) -->
    <Transition name="fade">
      <div v-if="isFocused" class="category-dropdown-menu glass-panel" @mousedown.prevent>
        <div class="dropdown-header">
          <span>{{ searchKeyword ? `篩選結果 (${filteredOptions.length})` : '歷史添加過的分類 (點擊快速套用)' }}</span>
        </div>
        
        <div class="options-list" v-if="filteredOptions.length > 0">
          <button
            type="button"
            v-for="opt in filteredOptions"
            :key="opt"
            class="option-item"
            :class="{ active: opt === modelValue }"
            @click="selectOption(opt)"
          >
            <span>{{ opt }}</span>
            <svg v-if="opt === modelValue" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        </div>

        <!-- 當打字找不到匹配歷史分類時，顯示新增自訂分類提示 -->
        <div class="no-options-item" v-else-if="searchKeyword">
          <span>無符合「{{ searchKeyword }}」的歷史分類</span>
          <button type="button" class="create-new-btn" @click="selectOption(searchKeyword)">
            ＋ 點擊使用新分類「{{ searchKeyword }}」
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
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
  }
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const containerRef = ref(null);
const inputRef = ref(null);

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

const selectOption = (opt) => {
  emit('update:modelValue', opt);
  isFocused.value = false;
};

const filteredOptions = computed(() => {
  if (!props.options || props.options.length === 0) return [];
  const q = searchKeyword.value.toLowerCase();
  
  if (!q) return props.options;
  
  return props.options.filter(opt =>
    opt && String(opt).toLowerCase().includes(q)
  );
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
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
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
  transition: transform 0.2s ease, color 0.2s ease;
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
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-surface);
  overflow-y: auto;
  z-index: 20;
  overscroll-behavior: contain;
}

.dropdown-header {
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-tiny);
  font-weight: var(--fw-bold);
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
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
  font-size: var(--fs-label);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
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
  transition: color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
  text-align: center;
}

.create-new-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
