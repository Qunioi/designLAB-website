<template>
  <ResearchGrid
    pageTitle="競品分析"
    pageSubtitle="分析競品優缺點與介面流程，找出可落地之優化提案切入點"
    addBtnLabel="+ 新增"
    storageKey="COMPETITORS"
    crudType="COMPETITORS"
    searchPlaceholder="搜尋競品名稱、優缺點..."
    badgeField="category"
    titleField="name"
    coverField="logo"
    linkField="url"
    researchContext="競品分析"
    lightboxCoverField="screenshot"
    linkBtnLabel="前往競品網站"
    emptyText="無相符的競品分析。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆競品分析嗎？"
    :filters="filters"
    :searchFields="['name', 'title', 'category', 'url', 'pros', 'cons', 'takeaways', 'tags']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.takeaways"
        icon="lightbulb-2"
        title="值得借鏡與參考點"
        accent="var(--color-primary)"
        :text="item.takeaways"
      />
      <div class="lbs-section-card">
        <div class="pros-cons-card" v-if="parseLines(item.pros).length || parseLines(item.cons).length">
          <LightboxListSection
            v-if="parseLines(item.pros).length"
            icon="check"
            title="優點 (Pros)"
            accent="var(--color-success)"
            marker="none"
            :items="parseLines(item.pros)"
          />
          <LightboxListSection
            v-if="parseLines(item.cons).length"
            icon="close"
            title="缺點 (Cons)"
            accent="var(--color-error)"
            marker="none"
            :items="parseLines(item.cons)"
          />
        </div>
      </div>
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="hashtag-solid"
        title="相關標籤"
        accent="var(--color-primary)"
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
    </template>
  </ResearchGrid>
</template>

<script setup>
import Chip from '../components/base/Chip.vue';
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';
import LightboxTextSection from '../components/lightbox/LightboxTextSection.vue';
import LightboxListSection from '../components/lightbox/LightboxListSection.vue';
import LightboxSection from '../components/lightbox/LightboxSection.vue';
import { parseList, parseLines } from '../utils/formatters';

const props = defineProps({
  highlightedId: { type: String, default: '' }
});
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);
const loadData = () => gridRef.value?.loadData();
defineExpose({ loadData });

const filters = computed(() => [
  { field: 'category', zhLabel: '競品類型', allOption: '所有競品類型', optionsFrom: 'category' },
  { field: 'tags',     zhLabel: '相關標籤', allOption: '所有相關標籤', optionsFrom: 'tags' }
]);
</script>

<style scoped>
/* 優缺點合併成一張卡，兩個 LightboxListSection 的分隔線與留白改由 gap 統一管理 */
.pros-cons-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
}

.pros-cons-card :deep(.lbs-section) {
  padding-bottom: 0;
  border-bottom: 0;
}

.pros-cons-card :deep(.lbs-heading) {
  font-size: var(--fs-meta);
  gap: var(--space-1);
  margin-bottom: var(--space-1);
}

.pros-cons-card :deep(.lbs-icon svg) {
  width: 16px;
  height: 16px;
}

.pros-cons-card :deep(.lbs-list-text) {
  padding-left: 20px;
}

.lbs-section:has(+ .lbs-section-card) {
  padding: 0;
  border-bottom: 0;
}

.lbs-section-card {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
}
</style>

