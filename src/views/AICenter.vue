<template>
  <div class="ai-center-container">
    <header class="view-header">
      <div>
        <h1 class="page-title">AI Center</h1>
        <p class="page-subtitle">整理 AI 設計工具與 Prompts，優化日常設計工作流</p>
      </div>
      <div class="header-actions">
        <NotificationBell />
        <button class="add-btn" @click="$emit('trigger-crud', { type: 'AI_CENTER' })">
          + 新增 AI 工具
        </button>
      </div>
    </header>

    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋 AI 工具、情境、Prompt..."
        />
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-state">
      <p>無相符的 AI 工具。點選右上角新增一筆！</p>
    </div>

    <div v-else class="ai-grid">
      <div 
        v-for="item in filteredList" 
        :key="item.id" 
        class="ai-card glass-panel"
        :class="{ highlighted: highlightedId === item.id }"
        :id="`item-${item.id}`"
      >
        <div class="ai-card-header">
          <div class="ai-title-group">
            <h2 class="ai-name">{{ item.name }}</h2>
            <a :href="item.link" target="_blank" class="ai-link" v-if="item.link">訪問網站 ↗</a>
          </div>
          <div class="card-actions">
            <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'AI_CENTER', item })" title="編輯"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
            <button class="action-icon-btn delete" @click="handleDelete(item.id)" title="刪除"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
        </div>

        <div class="ai-card-body">
          <div class="ai-section">
            <h4 class="section-title">💡 使用情境 (Use Case)</h4>
            <p class="section-desc">{{ item.useCase }}</p>
          </div>

          <div class="ai-section prompt-section" v-if="item.prompt">
            <div class="prompt-header">
              <h4 class="section-title">⌨ 推薦 Prompt</h4>
              <button class="copy-btn" @click="copyPrompt(item.prompt, item.id)">
                {{ copyStates[item.id] ? '已複製！' : '複製 Prompt' }}
              </button>
            </div>
            <div class="prompt-code-box">
              <code>{{ item.prompt }}</code>
            </div>
          </div>

          <div class="ai-section" v-if="item.workflow">
            <h4 class="section-title">⚙ 工作流程 (Workflow)</h4>
            <div class="workflow-steps">
              <div v-for="(step, idx) in parseWorkflow(item.workflow)" :key="idx" class="workflow-step-item">
                <span class="step-num">{{ idx + 1 }}</span>
                <span class="step-text">{{ step }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { getStorageData, deleteItem } from '../utils/storage';
import NotificationBell from '../components/NotificationBell.vue';

const props = defineProps({
  highlightedId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['trigger-crud', 'delete-done']);

const items = ref([]);
const searchQuery = ref('');
const copyStates = ref({});

const loadData = () => {
  items.value = getStorageData('AI_CENTER');
};

onMounted(() => {
  loadData();
  if (props.highlightedId) {
    nextTick(() => {
      const el = document.getElementById(`item-${props.highlightedId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
});

const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter(item => {
    return item.name.toLowerCase().includes(q) ||
           (item.useCase && item.useCase.toLowerCase().includes(q)) ||
           (item.prompt && item.prompt.toLowerCase().includes(q)) ||
           (item.workflow && item.workflow.toLowerCase().includes(q));
  });
});

const copyPrompt = (promptText, id) => {
  navigator.clipboard.writeText(promptText);
  copyStates.value[id] = true;
  setTimeout(() => {
    copyStates.value[id] = false;
  }, 2000);
};

const parseWorkflow = (wfStr) => {
  if (!wfStr) return [];
  return wfStr.split('->').map(s => s.trim());
};

const handleDelete = (id) => {
  if (confirm('確定要刪除這筆 AI 工具嗎？')) {
    items.value = deleteItem('AI_CENTER', id);
    emit('delete-done');
  }
};
</script>

<style scoped>
.ai-center-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.ai-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--glass-bg);
}

.ai-card.highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--glow-primary);
}

.ai-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.ai-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ai-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.ai-link {
  font-size: 0.75rem;
  color: var(--color-secondary);
}

.ai-link:hover {
  text-decoration: underline;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.action-icon-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-icon-btn.edit:hover {
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.4);
}

.action-icon-btn.delete:hover {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}

.section-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-btn {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.prompt-code-box {
  background: var(--bg-input);
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  font-family: 'Fira Code', 'Roboto Mono', Monaco, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-primary);
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.5;
  white-space: pre-wrap;
}


.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.workflow-step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-subtle);
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--glow-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .ai-grid {
    grid-template-columns: 1fr;
  }
}
</style>
