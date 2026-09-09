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
    lightboxBadgeLabel="AI 工具中心"
    titleField="name"
    coverField="cover"
    linkField="url"
    linkBtnLabel="開啟工具網站 ↗"
    researchContext="AI 工具中心"
    lightboxMetaClass="ai-lightbox-meta-row"
    emptyText="目前還沒有 AI 工具。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆 AI 工具嗎？"
    :filters="filters"
    :searchFields="['name', 'category', 'useCase', 'prompt', 'workflow', 'url', 'tags']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <template #card-extra="{ item }">
      <p v-if="item.useCase" class="card-desc">{{ item.useCase }}</p>
    </template>

    <!-- 左側新增：工具分類（跟頂部固定的「AI 工具中心」badge 是兩回事，
         這裡顯示的是這個工具自己的分類，可點擊快速篩選）＋相關 Tags -->
    <template #lightbox-left-extra="{ item, toggleSingleFilter, isSingleFilterSelected, toggleTag, isTagSelected, closeLightbox }">
      <div class="tool-tags">
        <button
          v-if="item.category"
          type="button"
          class="tool-tag clickable-tool ai-tool-category-chip"
          @click.stop="toggleSingleFilter && toggleSingleFilter('category', item.category); closeLightbox && closeLightbox()"
          :title="`點擊${isSingleFilterSelected && isSingleFilterSelected('category', item.category) ? '取消' : '快速'}篩選工具分類：${item.category}`"
        >
          {{ item.category }}
        </button>
        <div v-if="parseList(item.tags).length" class="ai-related-tags">
          <h4 class="ai-related-tags-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
            相關 Tags
          </h4>
          <div class="card-tags">
            <span
              v-for="tag in parseList(item.tags)"
              :key="tag"
              class="tag clickable-tag"
              @click.stop="toggleTag && toggleTag(tag); closeLightbox && closeLightbox()"
              :title="`點擊${isTagSelected && isTagSelected(tag) ? '取消' : '快速'}篩選 #${tag}`"
            ># {{ tag }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #lightbox-content="{ item }">
      <LightboxTextSection
        v-if="item.useCase"
        icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><path d='M12 16v-4'></path><path d='M12 8h.01'></path></svg>"
        title="工具簡介"
        accent="var(--color-secondary)"
        :text="item.useCase"
      />
      <LightboxCodeSection
        v-if="item.prompt"
        icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'></path></svg>"
        title="提示詞"
        accent="var(--color-secondary)"
        :content="item.prompt"
      />
      <LightboxListSection
        v-if="parseWorkflow(item.workflow).length"
        icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='8' y='2' width='8' height='4' rx='1' ry='1'></rect><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'></path><path d='M12 11h4'></path><path d='M12 16h4'></path><path d='M8 11h.01'></path><path d='M8 16h.01'></path></svg>"
        title="工作流程"
        accent="var(--color-secondary)"
        :items="parseWorkflow(item.workflow)"
      />
    </template>
  </ResearchGrid>
</template>

<script setup>
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';
import LightboxTextSection from '../components/lightbox/LightboxTextSection.vue';
import LightboxCodeSection from '../components/lightbox/LightboxCodeSection.vue';
import LightboxListSection from '../components/lightbox/LightboxListSection.vue';
import { parseList } from '../utils/formatters';

defineProps({ highlightedId: { type: String, default: '' } });
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);

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
</script>

<style scoped>

/* 左側「相關 Tags」：icon + 標題 + 標籤列，標籤沿用全站的 .tag 樣式 */
.ai-related-tags {
  margin-bottom: var(--space-4);
}

.ai-related-tags-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-2);
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  color: var(--color-secondary);
}

.ai-related-tags .card-tags {
  margin-top: 0;
}
</style>
