<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="search-modal-backdrop" @click="close">
      <div class="search-modal-container glass-panel" role="dialog" aria-modal="true" aria-labelledby="search-modal-title" @click.stop>
        <div class="search-header">
          <h2 id="search-modal-title" class="sr-only">全站搜尋</h2>
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            ref="searchInput"
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
              <span v-for="tag in suggestions" :key="tag" class="tag" @click="query = tag">{{ tag }}</span>
            </div>
            <div class="shortcut-tip">
              <span>提示：在全站任何地方按下 <kbd>⌘ K</kbd> 或 <kbd>Ctrl K</kbd> 即可開啟搜尋。</span>
            </div>
          </div>

          <div v-else-if="filteredResults.length === 0" class="no-results">
            <svg class="no-results-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <p>找不到與「{{ query }}」相關的內容</p>
          </div>

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
                <span class="result-type-badge" :class="getTypeClass(item.type)">
                  {{ item.typeLabel }}
                </span>
                <span class="result-category" v-if="item.category">{{ item.category }}</span>
              </div>
              <div class="result-title">{{ item.title }}</div>
              <div class="result-snippet" v-if="item.takeaways || item.desc || item.useCase">
                {{ item.takeaways || item.desc || item.useCase }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
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
  // 有搜尋內容時，ESC 先清除欄位；欄位已空才關閉彈窗
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

const allData = computed(() => {
  const ui = getStorageData('UI_RESEARCH').map(i => ({ ...i, type: 'UIResearch', typeLabel: 'UI 研究' }));
  const motion = getStorageData('MOTION_RESEARCH').map(i => ({ ...i, type: 'MotionResearch', typeLabel: '動態研究' }));
  const competitors = getStorageData('COMPETITORS').map(i => ({ ...i, type: 'Competitor', typeLabel: '競品分析', title: i.name }));
  const ai = getStorageData('AI_CENTER').map(i => ({ ...i, type: 'AICenter', typeLabel: 'AI 工具', title: i.name }));
  const resources = getStorageData('RESOURCES').map(i => ({ ...i, type: 'Resources', typeLabel: '資源網頁', title: i.name }));
  const proposals = getStorageData('PROPOSALS').map(i => ({ ...i, type: 'Proposals', typeLabel: '優化提案' }));
  
  return [...ui, ...motion, ...competitors, ...ai, ...resources, ...proposals];
});

const filteredResults = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  
  return allData.value.filter(item => {
    const titleMatch = item.title && item.title.toLowerCase().includes(q);
    const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(q));
    const takeawaysMatch = item.takeaways && item.takeaways.toLowerCase().includes(q);
    const descMatch = item.desc && item.desc.toLowerCase().includes(q);
    const useCaseMatch = item.useCase && item.useCase.toLowerCase().includes(q);
    const categoryMatch = item.category && item.category.toLowerCase().includes(q);
    const motionTypeMatch = item.motionType && item.motionType.toLowerCase().includes(q);
    
    return titleMatch || tagsMatch || takeawaysMatch || descMatch || useCaseMatch || categoryMatch || motionTypeMatch;
  });
});

const getTypeClass = (type) => {
  switch (type) {
    case 'UIResearch': return 'badge-ui';
    case 'MotionResearch': return 'badge-motion';
    case 'Competitor': return 'badge-comp';
    case 'AICenter': return 'badge-ai';
    case 'Resources': return 'badge-res';
    case 'Proposals': return 'badge-prop';
    default: return '';
  }
};

const handleSelect = (item) => {
  emit('navigate', { view: item.type, id: item.id });
  close();
};
</script>

<style scoped>
.search-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-backdrop);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh var(--space-6) var(--space-8);
  z-index: var(--z-overlay);
}

.search-modal-container {
  width: 100%;
  max-width: 720px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  border-radius: var(--modal-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: var(--modal-max-height);
}

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
  font-size: var(--fs-h3);
  font-weight: var(--fw-medium);
  outline: 0;
  background: transparent;
  border: none;
}

.search-header input::placeholder {
  color: var(--text-muted);
}

.esc-badge {
  font-size: var(--fs-tiny);
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
}

.search-placeholder {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.placeholder-title {
  font-size: var(--fs-label);
  color: var(--text-secondary);
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.suggested-tags .tag {
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.suggested-tags .tag:hover {
  background: var(--glow-primary);
  border-color: var(--color-primary);
  color: var(--text-primary);
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--space-1) var(--space-1);
  border-radius: var(--radius-xs);
  margin: 0 var(--space-1);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-secondary);
  gap: var(--space-4);
}

.no-results-icon {
  color: var(--text-muted);
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
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
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

.result-category {
  font-size: var(--fs-tiny);
  color: var(--text-muted);
}

.result-title {
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.result-snippet {
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badge colors */
.badge-ui { background: var(--bg-subtle); color: var(--color-primary); border: 1px solid var(--border-color); }
.badge-motion { background: var(--bg-subtle); color: var(--color-secondary); border: 1px solid var(--border-color); }
.badge-comp { background: var(--bg-subtle); color: var(--color-danger); border: 1px solid var(--border-color); }
.badge-ai { background: var(--bg-subtle); color: var(--color-warning); border: 1px solid var(--border-color); }
.badge-res { background: var(--bg-subtle); color: var(--color-accent); border: 1px solid var(--border-color); }
.badge-prop { background: var(--bg-subtle); color: var(--color-secondary); border: 1px solid var(--border-color); }

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .search-modal-container,
.modal-fade-leave-active .search-modal-container {
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal-fade-enter-from .search-modal-container {
  transform: scale(0.95);
}

.modal-fade-leave-to .search-modal-container {
  transform: scale(0.97);
}

@media (max-width: 640px) {
  .search-modal-backdrop { padding: var(--space-3); }
  .search-modal-container { max-height: calc(100dvh - 1.5rem); border-radius: 16px; }
  .search-header,
  .search-body { padding: var(--space-4); }
}
</style>
