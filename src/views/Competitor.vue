<template>
  <ResearchGrid
    pageTitle="競品分析"
    pageSubtitle="分析競品優缺點與介面流程，找出可落地之優化提案切入點"
    addBtnLabel="+ 新增競品分析"
    storageKey="COMPETITORS"
    crudType="COMPETITORS"
    searchPlaceholder="搜尋競品名稱、優缺點..."
    badgeClass="comp-badge"
    badgeField="category"
    titleField="name"
    coverField="logo"
    linkField="url"
    researchContext="競品分析"
    lightboxCoverField="screenshot"
    linkBtnLabel="前往"
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
    <!-- Extra card content: tags -->
    <template #card-extra="{ item, toggleTag, isTagSelected }">
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

    <!-- Lightbox content: 值得借鏡（既有 takeaways）＋ 優缺點（既有 pros/cons，同卡呈現，放在值得借鏡這段下面）＋ 相關標籤（既有可點擊篩選的 tags） -->
    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.takeaways"
        icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18h6'></path><path d='M10 22h4'></path><path d='M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14'></path></svg>"
        title="值得借鏡與參考點"
        accent="var(--color-primary)"
        :text="item.takeaways"
      />
      <div class="lbs-section-card">
        <div class="pros-cons-card" v-if="parseLines(item.pros).length || parseLines(item.cons).length">
          <LightboxListSection
            v-if="parseLines(item.pros).length"
            icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'></polyline></svg>"
            title="優點 (Pros)"
            accent="var(--color-success)"
            marker="none"
            :items="parseLines(item.pros)"
          />
          <LightboxListSection
            v-if="parseLines(item.cons).length"
            icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>"
            title="缺點 (Cons)"
            accent="var(--color-error)"
            marker="none"
            :items="parseLines(item.cons)"
          />
        </div>
      </div>
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M7.78428 14L8.2047 10H4V8H8.41491L8.94043 3H10.9514L10.4259 8H14.4149L14.9404 3H16.9514L16.4259 8H20V10H16.2157L15.7953 14H20V16H15.5851L15.0596 21H13.0486L13.5741 16H9.58509L9.05957 21H7.04855L7.57407 16H4V14H7.78428ZM9.7953 14H13.7843L14.2047 10H10.2157L9.7953 14Z'></path></svg>"
        title="相關標籤"
        accent="var(--color-primary)"
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
    </template>
  </ResearchGrid>
</template>

<script setup>
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

/** 彈性解析字串或陣列為乾淨獨立標籤項目 */
// parseList imported from formatters.js

const filters = computed(() => [
  { field: 'category', zhLabel: '競品類別', allOption: '所有競品類別', optionsFrom: 'category' },
  { field: 'tags',     zhLabel: '主題標籤', allOption: '所有主題標籤', optionsFrom: 'tags' }
]);
</script>

<style scoped>
/* 優缺點合併成一張卡：退縮 1rem + 底色，跟上下的純文字區塊區隔開；
   卡片內部兩個 LightboxListSection 各自的分隔線／留白改用 gap 統一管理，避免重複。 */
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

/* 卡片內是子標題（優點/缺點），字級跟 icon 都比外層的主標題小一號 */
.pros-cons-card :deep(.lbs-heading) {
  font-size: var(--fs-label);
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

