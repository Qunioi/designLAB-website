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

// 即時關鍵字過濾
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
  background: var(--bg-input);
  border: 1px solid transparent;
  padding: 0.6rem 2.2rem 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.7875rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-family: var(--font-body);
}

.category-input-field::placeholder {
  color: var(--text-muted) !important;
  opacity: 1 !important;
  -webkit-text-fill-color: var(--text-muted) !important;
}

.category-input-field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px var(--glow-primary);
  outline: none;
}

.dropdown-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.2rem;
  transition: color 0.2s ease;
}

.dropdown-toggle-btn:hover {
  color: var(--color-primary);
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.arrow-icon.open {
  transform: rotate(180deg);
  color: var(--color-primary);
}

/* ── 自訂歷史建議下拉選單 ─────────────────────── */
.category-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  z-index: 500;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-header {
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.6625rem;
  font-weight: 700;
  color: var(--text-muted);
}

.options-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.85rem;
  border-radius: 6px;
  font-size: 0.7875rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  font-family: var(--font-body);
}

.option-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.option-item.active {
  background: var(--glow-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.check-icon {
  color: var(--color-primary);
}

.no-options-item {
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.7375rem;
  color: var(--text-muted);
}

.create-new-btn {
  background: var(--glow-primary);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.7375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.create-new-btn:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
