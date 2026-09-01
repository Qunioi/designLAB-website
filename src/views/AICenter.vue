<template>
  <ResearchGrid
    pageTitle="AI 工具中心"
    pageSubtitle="整理 AI 設計工具與 Prompts，優化日常設計工作流"
    addBtnLabel="+ 新增 AI 工具"
    storageKey="AI_CENTER"
    crudType="AI_CENTER"
    searchPlaceholder="搜尋 AI 工具、分類、Prompt..."
    badgeClass="category-badge"
    badgeField="category"
    titleField="name"
    coverField="cover"
    linkField="url"
    linkBtnLabel="開啟工具網站 ↗"
    researchContext="AI 工具中心"
    hideLightboxMedia
    emptyText="目前還沒有 AI 工具。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆 AI 工具嗎？"
    :filters="filters"
    :searchFields="['name', 'category', 'useCase', 'prompt', 'workflow', 'url', 'link']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <template #card-extra="{ item }">
      <p v-if="item.useCase" class="ai-card-summary">{{ item.useCase }}</p>
      <div v-if="parseList(item.tags).length" class="card-tags">
        <span v-for="tag in parseList(item.tags)" :key="tag" class="tag"># {{ tag }}</span>
      </div>
    </template>

    <template #lightbox-content="{ item }">
      <div v-if="item.cover || item.useCase" class="ai-usecase-row">
        <div v-if="item.cover" class="ai-usecase-image">
          <img :src="item.cover" :alt="item.name" />
        </div>
        <div v-if="item.useCase" class="lightbox-section ai-usecase">
          <h4 class="section-title">使用情境</h4>
          <p class="section-desc">{{ item.useCase }}</p>
        </div>
      </div>
      <div v-if="item.prompt" class="lightbox-section ai-prompt-section">
        <h4 class="section-title">提示詞 Prompt</h4>
        <PromptCodeBox :prompt="item.prompt" :copied="copyStates[item.id]" @copy="copyPrompt(item.prompt, item.id)" />
      </div>
      <div v-if="parseWorkflow(item.workflow).length" class="lightbox-section ai-workflow-section">
        <h4 class="section-title">工作流程</h4>
        <div class="workflow-steps">
          <div v-for="(step, index) in parseWorkflow(item.workflow)" :key="`${step}-${index}`" class="workflow-step-item">
            <span class="step-num">{{ index + 1 }}</span>
            <span class="step-text">{{ step }}</span>
          </div>
        </div>
      </div>
    </template>
  </ResearchGrid>
</template>

<script setup>
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';
import PromptCodeBox from '../components/PromptCodeBox.vue';
import { parseList } from '../utils/formatters';
import { copyToClipboard } from '../utils/clipboard';

defineProps({ highlightedId: { type: String, default: '' } });
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);
const copyStates = ref({});

defineExpose({ loadData: () => gridRef.value?.loadData() });

const filters = computed(() => [
  { field: 'category', zhLabel: '工具分類', allOption: '所有工具分類', optionsFrom: 'category' }
]);

const parseWorkflow = (workflow) => {
  if (!workflow) return [];
  const source = Array.isArray(workflow)
    ? workflow
    : String(workflow).includes('->')
      ? String(workflow).split('->')
      : String(workflow).split(/[\r\n]+/);
  return source.map(step => String(step).replace(/^(\(?\d+[\.、\)\s]+|\d+\s+)/, '').trim()).filter(Boolean);
};

const copyPrompt = async (prompt, id) => {
  if (!await copyToClipboard(prompt)) return;
  copyStates.value = { ...copyStates.value, [id]: true };
  setTimeout(() => { copyStates.value = { ...copyStates.value, [id]: false }; }, 1800);
};
</script>

<style scoped>
.ai-card-summary {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: 1.55;
  white-space: pre-line;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ai-usecase-row {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
}

.ai-usecase-image {
  width: 42%;
  height: 300px;
  min-width: 0;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
}

.ai-usecase-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ai-usecase {
  flex: 1;
  min-width: 0;
  border-left: 0 !important;
}

.workflow-steps {
  display: grid;
  gap: 0.5rem;
}

.workflow-step-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.step-num {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--bg-hover);
  color: var(--color-primary);
  font-size: var(--fs-meta);
  font-weight: 700;
}

.step-text {
  /* color: var(--text-secondary); */
  font-size: var(--fs-meta);
  line-height: 1.55;
}

@media (max-width: 640px) {
  .ai-usecase-row { flex-direction: column; }
  .ai-usecase-image { width: 100%; height: 220px; max-height: 220px; }
}
</style>
