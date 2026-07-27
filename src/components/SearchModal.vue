<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="search-modal-backdrop" @click="close">
      <div class="search-modal-container glass-panel" @click.stop>
        <div class="search-header">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            ref="searchInput"
            v-model="query" 
            type="text" 
            placeholder="搜尋案例、競品、AI 工具、資源或標籤..."
            @keydown.esc="close"
          />
          <span class="esc-badge">ESC</span>
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
              @click="handleSelect(item)"
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

const emit = defineEmits(['close', 'navigate']);

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
      // 開啟事件交給父組件處理
    }
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
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 1000;
}

.search-modal-container {
  width: 100%;
  max-width: 680px;
  background: var(--bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.search-icon {
  color: var(--text-muted);
}

.search-header input {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 500;
}

.search-header input::placeholder {
  color: var(--text-muted);
}

.esc-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-muted);
}

.search-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.search-placeholder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.placeholder-title {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggested-tags .tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggested-tags .tag:hover {
  background: var(--glow-primary);
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.shortcut-tip {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.shortcut-tip kbd {
  background: var(--bg-hover);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  margin: 0 0.1rem;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-secondary);
  gap: 1rem;
}

.no-results-icon {
  color: var(--text-muted);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-item {
  padding: 1rem;
  border-radius: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  background: var(--bg-hover);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.result-type-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.result-category {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.result-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.result-snippet {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badge colors */
.badge-ui { background: var(--glow-primary); color: #c084fc; border: 1px solid var(--color-primary); }
.badge-motion { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.badge-comp { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.badge-ai { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge-res { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-prop { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3); }

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
