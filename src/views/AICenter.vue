<template>
  <ResearchGrid
    pageTitle="AI 工具中心"
    pageSubtitle="整理 AI 設計工具與 Prompts，優化日常設計工作流"
    addBtnLabel="+ 新增"
    storageKey="AI_CENTER"
    crudType="AI_CENTER"
    searchPlaceholder="搜尋 AI 工具、類型、Prompt..."
    badgeField="category"
    titleField="name"
    coverField="cover"
    linkField="url"
    linkBtnLabel="前往工具網站"
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
    <template #card-extra="{ item, toggleTag, isTagSelected }">
      <p v-if="item.useCase" class="card-desc">{{ item.useCase }}</p>
      <div class="card-tags" v-if="parseList(item.tags).length">
        <Chip
          v-for="tag in parseList(item.tags)"
          :key="tag"
          variant="tag"
          :active="Boolean(isTagSelected && isTagSelected(tag))"
          @click.stop="toggleTag && toggleTag(tag)"
          :title="`點擊${isTagSelected && isTagSelected(tag) ? '取消' : '快速'}篩選 #${tag}`"
        >{{ tag }}</Chip>
      </div>
    </template>

    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.useCase"
        icon="book-open-solid"
        title="工具簡介"
        accent="var(--color-secondary)"
        :text="item.useCase"
      />
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="focus-solid"
        title="適合用途"
        accent="var(--color-secondary)"
      >
        <div class="card-tags">
          <Chip
            v-for="tag in parseList(item.tags)"
            :key="tag"
            variant="tag"
          :active="Boolean(isTagSelected && isTagSelected(tag))"
            @click.stop="toggleTag && toggleTag(tag)"
            :title="`點擊${isTagSelected && isTagSelected(tag) ? '取消' : '快速'}篩選 #${tag}`"
        >{{ tag }}</Chip>
        </div>
      </LightboxSection>
      <LightboxCodeSection
        v-if="item.prompt"
        icon="ai-solid"
        title="提示詞"
        accent="var(--color-secondary)"
        :content="item.prompt"
      />
      <LightboxListSection
        v-if="parseWorkflow(item.workflow).length"
        icon="clipboard-solid"
        title="工作流程"
        accent="var(--color-secondary)"
        :items="parseWorkflow(item.workflow)"
      />
    </template>
  </ResearchGrid>
</template>

<script setup>
import Chip from '../components/base/Chip.vue';
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';
import LightboxTextSection from '../components/lightbox/LightboxTextSection.vue';
import LightboxCodeSection from '../components/lightbox/LightboxCodeSection.vue';
import LightboxListSection from '../components/lightbox/LightboxListSection.vue';
import LightboxSection from '../components/lightbox/LightboxSection.vue';
import { parseList } from '../utils/formatters';

defineProps({ highlightedId: { type: String, default: '' } });
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);

defineExpose({ loadData: () => gridRef.value?.loadData() });

const filters = computed(() => [
  { field: 'category', zhLabel: '工具類型', allOption: '所有工具類型', optionsFrom: 'category' },
  { field: 'tags',     zhLabel: '適合用途', allOption: '所有適合用途', optionsFrom: 'tags' }
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

