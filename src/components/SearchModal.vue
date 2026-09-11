<template>
  <!-- Esc 由這個元件自己處理：有輸入內容時先清空，空了才關閉 -->
  <BaseModal
    :open="isOpen"
    size="md"
    align="top"
    labelledby="search-modal-title"
    :close-on-esc="false"
    @close="close"
  >
        <div class="search-header">
          <h2 id="search-modal-title" class="sr-only">全站搜尋</h2>
          <Icon name="search" :size="20" class="search-icon" />
          <input 
            ref="searchInput"
            data-autofocus
            v-model="query" 
            type="text" 
            placeholder="搜尋案例、競品、AI 工具、資源或標籤..."
            @keydown.esc.stop.prevent="handleEscape"
          />
          <button
            v-if="query"
            type="button"
            class="esc-badge esc-clear-btn"
            aria-label="清除搜尋內容"
            @click="clearQuery"
          >
            清除
          </button>
          <span v-else class="esc-badge">ESC</span>
        </div>

        <div class="search-body">
          <div v-if="query.trim() === ''" class="search-placeholder">
            <p class="placeholder-title">輸入關鍵字開始搜尋，例如：</p>
            <div class="suggested-tags">
              <Chip v-for="tag in suggestions" :key="tag" variant="tool" @click="query = tag">{{ tag }}</Chip>
            </div>
            <div class="shortcut-tip">
              <span>提示：在全站任何地方按下 <kbd>⌘ K</kbd> 或 <kbd>Ctrl K</kbd> 即可開啟搜尋。</span>
            </div>
          </div>

          <EmptyState
            v-else-if="filteredResults.length === 0"
            icon="search-x"
            :title="`找不到與「${query}」相關的內容`"
            description="換個關鍵字，或試試標籤名稱。"
          />

          <div v-else class="results-list">
            <div 
              v-for="item in filteredResults" 
              :key="item.id" 
              class="result-item"
              tabindex="0"
              @click="handleSelect(item)"
              @keydown.enter.prevent="handleSelect(item)"
            >
              <div class="result-meta">
                <Chip variant="type">{{ item.typeLabel }}</Chip>
                <span class="result-category" v-if="item.category">{{ item.category }}</span>
              </div>
              <div class="result-title">{{ item.title }}</div>
              <div class="result-snippet" v-if="item.takeaways || item.desc || item.useCase">
                {{ item.takeaways || item.desc || item.useCase }}
              </div>
            </div>
          </div>
        </div>
  </BaseModal>
</template>

<script setup>
import EmptyState from './base/EmptyState.vue';
import Chip from './base/Chip.vue';
import Icon from './base/Icon.vue';
import BaseModal from './base/BaseModal.vue';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { getStorageData } from '../utils/storage';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'navigate', 'open']);

const query = ref('');
const searchInput = ref(null);

const suggestions = ['Bento Grid', 'Dark Mode', 'Figma', 'Prompt', 'Icon', '設計靈感'];

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    query.value = '';
    nextTick(() => {
      if (searchInput.value) {
        searchInput.value.focus();
      }
    });
  }
});

const handleGlobalKeyDown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (props.isOpen) {
      emit('close');
    } else {
      emit('open');
    }
  }
  if (e.key === 'Escape' && props.isOpen) {
    handleEscape();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});

const close = () => {
  emit('close');
};

const handleEscape = () => {
  if (query.value.length > 0) {
    clearQuery();
    return;
  }
  close();
};

const clearQuery = () => {
  query.value = '';
  nextTick(() => searchInput.value?.focus());
};

// localStorage 不是響應式：每次打開或資料變動時靠版本號重讀，否則新項目搜不到
const dataVersion = ref(0);
const refreshData = () => { dataVersion.value++; };
watch(() => props.isOpen, (open) => { if (open) refreshData(); });
onMounted(() => window.addEventListener('design-lab-storage-updated', refreshData));
onUnmounted(() => window.removeEventListener('design-lab-storage-updated', refreshData));

const allData = computed(() => {
  dataVersion.value;
  const ui = getStorageData('UI_RESEARCH').map(i => ({ ...i, type: 'UIResearch', typeLabel: 'UI 設計研究' }));
  const motion = getStorageData('MOTION_RESEARCH').map(i => ({ ...i, type: 'MotionResearch', typeLabel: '動態研究' }));
  const competitors = getStorageData('COMPETITORS').map(i => ({ ...i, type: 'Competitor', typeLabel: '競品分析', title: i.name }));
  const ai = getStorageData('AI_CENTER').map(i => ({ ...i, type: 'AICenter', typeLabel: 'AI 工具中心', title: i.name }));
  const resources = getStorageData('RESOURCES').map(i => ({ ...i, type: 'Resources', typeLabel: '設計網頁', title: i.name }));
  
  return [...ui, ...motion, ...competitors, ...ai, ...resources];
});

const filteredResults = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  
  return allData.value.filter(item => {
    const titleMatch = item.title && item.title.toLowerCase().includes(q);
    // tags 有可能是舊資料留下的字串格式，不是陣列時直接呼叫 .some 會讓整個搜尋出錯
    const tags = Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(/[,/，#\n\r]+/);
    const tagsMatch = tags.some(tag => String(tag).trim().toLowerCase().includes(q));
    const takeawaysMatch = item.takeaways && item.takeaways.toLowerCase().includes(q);
    const descMatch = item.desc && item.desc.toLowerCase().includes(q);
    const useCaseMatch = item.useCase && item.useCase.toLowerCase().includes(q);
    const categoryMatch = item.category && item.category.toLowerCase().includes(q);
    const motionTypeMatch = item.motionType && item.motionType.toLowerCase().includes(q);
    
    return titleMatch || tagsMatch || takeawaysMatch || descMatch || useCaseMatch || categoryMatch || motionTypeMatch;
  });
});


const handleSelect = (item) => {
  emit('navigate', { view: item.type, id: item.id });
  close();
};
</script>

<style scoped>

.search-header {
  display: flex;
  align-items: center;
  padding: var(--modal-header-padding);
  border-bottom: 1px solid var(--border-color);
  gap: var(--space-4);
}

.search-icon {
  color: var(--text-muted);
}

.search-header input {
  flex: 1;
  font-size: var(--fs-section-title);
  font-weight: var(--fw-medium);
  outline: 0;
  background: transparent;
  border: none;
}

.search-header input::placeholder {
  color: var(--text-muted);
}

.esc-badge {
  font-size: var(--fs-badge);
  padding: var(--space-1) var(--space-2);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  color: var(--text-muted);
}

.esc-clear-btn {
  cursor: pointer;
  color: var(--color-primary);
}

.esc-clear-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

.search-body {
  padding: var(--modal-padding);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.search-placeholder {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.placeholder-title {
  font-size: var(--fs-body);
  color: var(--text-secondary);
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.shortcut-tip {
  margin-top: var(--space-8);
  font-size: var(--fs-meta);
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: var(--space-4);
}

.shortcut-tip kbd {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  padding: var(--space-1) var(--space-1);
  border-radius: var(--radius-xs);
  margin: 0 var(--space-1);
}

.results-list {
  overflow-y: auto;
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
  border: 1px solid transparent;
}

.result-item:hover,
.result-item.selected {
  background: var(--bg-hover);
  border-color: var(--border-color);
}

.result-item:focus-visible,
.esc-clear-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.result-category {
  min-width: 0;
  overflow: hidden;
  font-size: var(--fs-meta);
  color: var(--text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-title {
  display: -webkit-box;
  overflow: hidden;
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  line-height: 1.45;
  color: var(--text-primary);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.result-snippet {
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .search-header,
  .search-body { padding: var(--space-4); }
}
</style>
