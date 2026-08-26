<template>
  <div class="ai-center-container">
    <PageHeader
      title="AI Center"
      subtitle="整理 AI 設計工具與 Prompts，優化日常設計工作流"
      add-btn-label="+ 新增AI工具"
      @add-click="$emit('trigger-crud', { type: 'AI_CENTER' })"
    />

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
          </div>
          <div class="card-actions">
            <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'AI_CENTER', item })" title="編輯"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
            <button v-if="canDelete(item)" class="action-icon-btn delete" @click="handleDelete(item)" title="刪除"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
        </div>

        <div class="ai-card-body">
          <div class="ai-section">
            <h4 class="section-title">使用情境 (Use Case)</h4>
            <p class="section-desc">{{ item.useCase }}</p>
          </div>

          <div class="ai-section prompt-section" v-if="item.prompt">
            <div class="prompt-header">
              <h4 class="section-title">= 推薦 Prompt</h4>
              <!-- <button 
                class="copy-btn" 
                :class="{ copied: copyStates[item.id] }"
                @click="copyPrompt(item.prompt, item.id)"
                :title="copyStates[item.id] ? '已複製！' : '點選複製 Prompt'"
              >
                {{ copyStates[item.id] ? '已複製！' : '複製 Prompt' }}
              </button> -->
            </div>
            <div 
              class="prompt-code-box" 
              :class="{ copied: copyStates[item.id] }"
              @click="copyPrompt(item.prompt, item.id)"
              title="點擊可直接複製 Prompt"
            >
              <code>{{ item.prompt }}</code>
              <div class="click-copy-hint">
                {{ copyStates[item.id] ? '已複製到剪貼簿' : '點擊複製 Prompt' }}
              </div>
            </div>
          </div>

          <div class="ai-section" v-if="item.workflow">
            <h4 class="section-title">工作流程 (Workflow)</h4>
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

    <!-- 複製成功 Toast 提示 -->
    <Transition name="toast">
      <div v-if="toastVisible" class="toast-notification">
        <div class="toast-inner">
          {{ toastMessage }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { getStorageData, deleteItem, checkDeletePermission } from '../utils/storage';
import NotificationBell from '../components/NotificationBell.vue';
import { copyToClipboard } from '../utils/clipboard';

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
const toastMessage = ref('');
const toastVisible = ref(false);
let toastTimer = null;

const showToast = (msg) => {
  toastMessage.value = msg;
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastVisible.value = false;
  }, 2500);
};

const canDelete = (item) => {
  return checkDeletePermission(item).allowed;
};

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

const copyPrompt = async (promptText, id) => {
  if (!promptText) return;
  const success = await copyToClipboard(promptText);
  if (success) {
    copyStates.value = { ...copyStates.value, [id]: true };
    showToast('複製成功！Prompt 已複製至剪貼簿');
    setTimeout(() => {
      copyStates.value = { ...copyStates.value, [id]: false };
    }, 2000);
  } else {
    showToast('複製失敗，請手動選取文字複製');
  }
};

const parseWorkflow = (wfStr) => {
  if (!wfStr) return [];
  return wfStr.split('->').map(s => s.trim());
};

const handleDelete = (item) => {
  const perm = checkDeletePermission(item);
  if (!perm.allowed) {
    showToast(`權限受限：此項目由「${perm.creatorName}」發表，非發佈者或管理員無法刪除！`);
    return;
  }
  if (confirm(`確定要刪除「${item.name}」這筆 AI 工具嗎？`)) {
    items.value = deleteItem('AI_CENTER', item.id);
    showToast('已成功刪除 AI 工具');
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
  gap: 0.35rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform: translateY(-2px);
}

.ai-card:hover .card-actions {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
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
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.copy-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.copy-btn.copied {
  background: var(--color-primary) !important;
  color: #ffffff !important;
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 12px var(--glow-primary);
}

.btn-icon {
  flex-shrink: 0;
}

.prompt-code-box {
  position: relative;
  background: var(--bg-input);
  padding: 0.85rem 1rem;
  padding-bottom: 1.8rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  font-family: 'Fira Code', 'Roboto Mono', Monaco, Consolas, monospace;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-primary);
  max-height: 140px;
  overflow-y: auto;
  line-height: 1.5;
  white-space: pre-wrap;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.prompt-code-box:hover {
  border-color: var(--color-primary);
}

.prompt-code-box.copied {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px var(--glow-primary);
}

.click-copy-hint {
  position: absolute;
  bottom: 0.35rem;
  right: 0.5rem;
  font-size: 0.68rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.prompt-code-box:hover .click-copy-hint {
  opacity: 1;
}

.prompt-code-box.copied .click-copy-hint {
  opacity: 1;
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 2px 8px var(--glow-primary);
}

/* Toast 浮動提示視窗 */
.toast-notification {
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-inner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.4rem;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px var(--glow-primary), var(--shadow-md);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
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
