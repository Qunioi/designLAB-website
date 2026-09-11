<template>
  <div class="tag-input-container" ref="containerRef" @click="focusInput">
    <div class="tag-chips-wrapper">
      <div v-for="(tag, index) in tags" :key="index" class="tag-input-chip">
        <span># {{ tag }}</span>
        <button type="button" class="remove-btn" @click.stop="removeTag(index)" title="移除標籤">
          <Icon name="close" :size="8" :stroke-width="3" />
        </button>
      </div>

      <input
        ref="inputRef"
        :id="inputId || undefined"
        v-model="inputQuery"
        type="text"
        :placeholder="tags.length === 0 ? placeholder : '新增標籤...'"
        @keydown.enter.prevent="addCurrentInput"
        @keydown.comma.prevent="addCurrentInput"
        @keydown.delete="handleBackspace"
        @focus="handleFocus"
        @blur="handleBlur"
        class="chip-input"
      />
    </div>

    <Transition name="fade">
      <div v-show="isFocused && filteredSuggestions.length > 0" class="suggestions-dropdown dropdown-surface" :class="{ 'drop-up': dropUp }" @mousedown.prevent>
        <div class="dropdown-heading">
          <span>歷史添加過的標籤 (點擊快速新增)</span>
        </div>
        <div class="suggestions-list">
          <button
            type="button"
            v-for="suggest in filteredSuggestions"
            :key="suggest"
            class="suggestion-item"
            @click="selectSuggestion(suggest)"
          >
            <span># {{ suggest }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import Icon from './base/Icon.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  suggestedTags: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '請輸入標籤，按 Enter 或逗號分隔'
  },
  inputId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const tags = ref([...props.modelValue]);
const inputQuery = ref('');
const isFocused = ref(false);
const inputRef = ref(null);
const containerRef = ref(null);
const dropUp = ref(false);

// 表單欄位可能被排到彈窗接近底部（例如放在最後一個內容區塊），下方空間
// 不夠時建議選單改往上開，避免被固定在下方的「取消／儲存」按鈕列擋住。
const DROPDOWN_ESTIMATED_HEIGHT = 220;
const handleFocus = () => {
  isFocused.value = true;
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    dropUp.value = spaceBelow < DROPDOWN_ESTIMATED_HEIGHT && rect.top > DROPDOWN_ESTIMATED_HEIGHT;
  }
};

watch(() => props.modelValue, (newVal) => {
  tags.value = [...(newVal || [])];
}, { deep: true });

const focusInput = () => {
  inputRef.value?.focus();
};

const addTag = (text) => {
  if (!text) return;
  const clean = text.trim().replace(/^#/, '');
  if (clean && !tags.value.includes(clean)) {
    tags.value.push(clean);
    emit('update:modelValue', [...tags.value]);
  }
  inputQuery.value = '';
};

const addCurrentInput = () => {
  addTag(inputQuery.value);
};

const removeTag = (index) => {
  tags.value.splice(index, 1);
  emit('update:modelValue', [...tags.value]);
};

const handleBackspace = () => {
  if (inputQuery.value === '' && tags.value.length > 0) {
    tags.value.pop();
    emit('update:modelValue', [...tags.value]);
  }
};

const handleBlur = () => {
  if (inputQuery.value.trim()) {
    addCurrentInput();
  }
  setTimeout(() => {
    isFocused.value = false;
  }, 180);
};

const selectSuggestion = (suggest) => {
  addTag(suggest);
  focusInput();
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    if (inputQuery.value.trim()) {
      addCurrentInput();
    }
    isFocused.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

const filteredSuggestions = computed(() => {
  const q = inputQuery.value.trim().toLowerCase();
  const available = props.suggestedTags.filter(t => t && !tags.value.includes(t));
  if (!q) return available.slice(0, 12);
  return available.filter(t => t.toLowerCase().includes(q)).slice(0, 12);
});
</script>

<style scoped>
.tag-input-container {
  position: relative;
  width: 100%;
}

.tag-chips-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  min-height: 40px;
  transition: border-color var(--dur-fast) var(--ease-standard);
  cursor: text;
}

.tag-chips-wrapper:focus-within {
  border-color: var(--color-primary);
}

.tag-input-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  line-height: var(--lh-tight);
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.tag-input-chip span {
  text-box: trim-both cap alphabetic;
}

.tag-input-chip:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: var(--fs-meta);
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.remove-btn:hover {
  background: var(--action-primary);
  color: var(--action-on-primary);
}

.chip-input {
  flex: 1;
  min-width: 120px;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--fs-body);
  color: var(--text-primary);
  padding: var(--space-1) var(--space-1);
}

.chip-input::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  overflow: hidden;
}

.suggestions-dropdown.drop-up {
  top: auto;
  bottom: calc(100% + 4px);
}


.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  padding: var(--space-2);
  max-height: 160px;
  overflow-y: auto;
}

.suggestion-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}

.suggestion-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
  transform: translateY(-1px);
}

.fade-enter-active, .fade-leave-active { transition: opacity var(--dur-base) var(--ease-standard); }
.fade-leave-active {
  transition-duration: var(--dur-fast); /* 離場比進場快 */
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
