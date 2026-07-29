<template>
  <div class="tag-input-container" ref="containerRef" @click="focusInput">
    <div class="tag-chips-wrapper">
      <span v-for="(tag, index) in tags" :key="index" class="tag-chip">
        # {{ tag }}
        <button type="button" class="remove-btn" @click.stop="removeTag(index)" title="移除標籤">✕</button>
      </span>

      <input
        ref="inputRef"
        v-model="inputQuery"
        type="text"
        :placeholder="tags.length === 0 ? placeholder : '新增標籤...'"
        @keydown.enter.prevent="addCurrentInput"
        @keydown.comma.prevent="addCurrentInput"
        @keydown.delete="handleBackspace"
        @focus="isFocused = true"
        @blur="handleBlur"
        class="chip-input"
      />
    </div>

    <!-- 歷史標籤建議選單 (Suggested Tags) -->
    <Transition name="fade">
      <div v-show="isFocused && filteredSuggestions.length > 0" class="suggestions-dropdown glass-panel" @mousedown.prevent>
        <div class="dropdown-header">
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
  }
});

const emit = defineEmits(['update:modelValue']);

const tags = ref([...props.modelValue]);
const inputQuery = ref('');
const isFocused = ref(false);
const inputRef = ref(null);
const containerRef = ref(null);

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
  gap: 0.4rem;
  background: var(--bg-input);
  border: 1px solid transparent;
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  min-height: 42px;
  transition: all 0.2s ease;
  cursor: text;
}

.tag-chips-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px var(--glow-primary);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 16px;
  line-height: 1.2;
}

.tag-chip:hover {
  background: var(--glow-primary);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 0.65rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}
.remove-btn:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.chip-input {
  flex: 1;
  min-width: 120px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.85rem;
  color: var(--text-primary);
  padding: 0.1rem 0.2rem;
}

.chip-input::placeholder {
  color: var(--text-muted) !important;
  opacity: 1 !important;
  -webkit-text-fill-color: var(--text-muted) !important;
}

/* 歷史標籤建議選單 */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  z-index: 100;
  overflow: hidden;
}

.dropdown-header {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.725rem;
  font-weight: 700;
  color: var(--text-muted);
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.6rem;
  max-height: 160px;
  overflow-y: auto;
}

.suggestion-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.775rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.suggestion-item:hover {
  background: var(--glow-primary);
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
