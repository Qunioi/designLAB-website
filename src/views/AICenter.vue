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
        <span
          v-for="tag in parseList(item.tags)"
          :key="tag"
          class="tag clickable-tag"
          :class="{ active: isTagSelected && isTagSelected(tag) }"
          @click.stop="toggleTag && toggleTag(tag)"
          :title="`點擊${isTagSelected && isTagSelected(tag) ? '取消' : '快速'}篩選 #${tag}`"
        >
          # {{ tag }}
        </span>
      </div>
    </template>

    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.useCase"
        icon="<svg viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M13 21V23H11V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H9C10.1947 3 11.2671 3.52375 12 4.35418C12.7329 3.52375 13.8053 3 15 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H13ZM20 19V5H15C13.8954 5 13 5.89543 13 7V19H20ZM11 19V7C11 5.89543 10.1046 5 9 5H4V19H11Z'></path></svg>"
        title="工具簡介"
        accent="var(--color-secondary)"
        :text="item.useCase"
      />
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="<svg viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M13 1L13.001 4.06201C16.6192 4.51365 19.4869 7.38163 19.9381 11L23 11V13L19.938 13.001C19.4864 16.6189 16.6189 19.4864 13.001 19.938L13 23H11L11 19.9381C7.38163 19.4869 4.51365 16.6192 4.06201 13.001L1 13V11L4.06189 11C4.51312 7.38129 7.38129 4.51312 11 4.06189L11 1H13ZM12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6ZM12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z'></path></svg>"
        title="適合用途"
        accent="var(--color-secondary)"
      >
        <div class="card-tags">
          <span
            v-for="tag in parseList(item.tags)"
            :key="tag"
            class="tag clickable-tag"
            :class="{ active: isTagSelected && isTagSelected(tag) }"
            @click.stop="toggleTag && toggleTag(tag)"
            :title="`點擊${isTagSelected && isTagSelected(tag) ? '取消' : '快速'}篩選 #${tag}`"
          >
            # {{ tag }}
          </span>
        </div>
      </LightboxSection>
      <LightboxCodeSection
        v-if="item.prompt"
        icon="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM10 3H14V5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17H14C17.3137 17 20 14.3137 20 11H22C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3Z'></path></svg>"
        title="提示詞"
        accent="var(--color-secondary)"
        :content="item.prompt"
      />
      <LightboxListSection
        v-if="parseWorkflow(item.workflow).length"
        icon="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M17 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H7V0H9V2H15V0H17V2ZM17 4V6H15V4H9V6H7V4H5V20H19V4H17ZM7 8H17V10H7V8ZM7 12H17V14H7V12Z'></path></svg>"
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
import LightboxSection from '../components/lightbox/LightboxSection.vue';
import { parseList } from '../utils/formatters';

defineProps({ highlightedId: { type: String, default: '' } });
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);

defineExpose({ loadData: () => gridRef.value?.loadData() });

const filters = computed(() => [
  { field: 'category', zhLabel: '工具分類', allOption: '所有工具分類', optionsFrom: 'category' },
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

