<template>
  <div class="ai-center-container">
    <PageHeader
      title="AI 工具中心"
      subtitle="整理 AI 設計工具與 Prompts，優化日常設計工作流"
      add-btn-label="+ 新增AI工具"
      @add-click="$emit('trigger-crud', { type: 'AI_CENTER' })"
    />

    <FilterToolbar
      v-model:searchQuery="searchQuery"
      search-placeholder="搜尋 AI 工具、情境、Prompt..."
      :show-advanced="false"
    />

    <div v-if="filteredList.length === 0" class="empty-state">
      <p>{{ searchQuery ? '找不到符合搜尋條件的 AI 工具。' : '目前還沒有 AI 工具。' }}</p>
      <button v-if="searchQuery" type="button" class="empty-secondary-btn" @click="searchQuery = ''">
        清除搜尋
      </button>
      <button v-else-if="!isGuest" type="button" class="empty-primary-btn" @click="$emit('trigger-crud', { type: 'AI_CENTER' })">
        + 新增 AI 工具
      </button>
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
        </div>

        <div class="ai-card-body">
          <div class="ai-section">
            <h4 class="section-title">
              <span>
                <div class="dot"></div>使用情境
              </span>
              <div class="card-actions card-actions-reveal" v-if="!isGuest">
                <ActionIconButton variant="edit" :aria-label="`編輯《${item.name}》`" title="編輯" @click="$emit('trigger-crud', { type: 'AI_CENTER', item })"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></ActionIconButton>
                <ActionIconButton v-if="canDelete(item)" variant="delete" :aria-label="`刪除《${item.name}》`" title="刪除" @click="handleDelete(item)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></ActionIconButton>
              </div>
            </h4>
            <p class="section-desc">{{ item.useCase }}</p>
          </div>

          <div class="ai-section prompt-section" v-if="item.prompt">
            <div class="prompt-header">
              <h4 class="section-title"><span><div class="dot"></div>提示詞</span></h4>
              <!-- <button 
                class="copy-btn" 
                :class="{ copied: copyStates[item.id] }"
                @click="copyPrompt(item.prompt, item.id)"
                :title="copyStates[item.id] ? '已複製！' : '點選複製 Prompt'"
              >
                {{ copyStates[item.id] ? '已複製！' : '複製 Prompt' }}
              </button> -->
            </div>
            <PromptCodeBox :prompt="item.prompt" :copied="copyStates[item.id]" @copy="copyPrompt(item.prompt, item.id)" />
          </div>

          <div class="ai-section" v-if="item.workflow">
            <h4 class="section-title"><span><div class="dot"></div>工作流程</span></h4>
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
import FilterToolbar from '../components/FilterToolbar.vue';
import ActionIconButton from '../components/ActionIconButton.vue';
import PromptCodeBox from '../components/PromptCodeBox.vue';
import { getStorageData, deleteItem, checkDeletePermission } from '../utils/storage';
import { getCurrentUser } from '../utils/userStore';
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

const isGuest = computed(() => {
  const user = getCurrentUser();
  const username = (user.username || '').toLowerCase();
  return !username || username === '@guest' || username === '@account' || user.nickname === '訪客';
});

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
  if (Array.isArray(wfStr)) {
    return wfStr.map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof wfStr === 'string') {
    if (wfStr.includes('->')) {
      return wfStr.split('->').map(s => s.trim()).filter(Boolean);
    }
    if (wfStr.includes('\n')) {
      return wfStr.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean);
    }
    return [wfStr.trim()].filter(Boolean);
  }
  return [];
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
  /* gap: 1.25rem; */
  background: var(--bg-card);
}

.ai-card.highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--glow-primary);
}

.ai-card-header {
  position: relative;
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
  font-size: 1.188rem;
  font-weight: 700;
}

.ai-link {
  font-size: 0.6875rem;
  color: var(--color-secondary);
}

.ai-link:hover {
  text-decoration: underline;
}

.ai-section {
  display: flex;
  flex-direction: column;
}

.ai-section:first-child .section-title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 26px;
}

.ai-card .card-actions-reveal {
  position: absolute;
  right: 0;
  top: 0;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-icon {
  flex-shrink: 0;
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
  font-size: 0.8375rem;
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
  font-size: 0.6875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-text {
  font-size: 0.7375rem;
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.8875rem;
}

.empty-primary-btn {
  min-height: 40px;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 0.7875rem;
  font-weight: 700;
}

.empty-secondary-btn {
  min-height: 40px;
  padding: 0.55rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 0.7875rem;
  font-weight: 600;
}



@media (hover: none), (max-width: 768px) {
  .ai-grid {
    grid-template-columns: 1fr;
  }
}
</style>
