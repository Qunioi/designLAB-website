<template>
  <ResearchGrid
    pageTitle="UI 設計研究"
    pageSubtitle="建立與整理介面設計案例，做為日常設計靈感與優化依據"
    addBtnLabel="+ 新增"
    storageKey="UI_RESEARCH"
    crudType="UI_RESEARCH"
    searchPlaceholder="搜尋標題、Tag 或心得..."
    badgeField="category"
    coverField="cover"
    linkField="sourceUrl"
    researchContext="UI 設計研究"
    emptyText="無相符的 UI 設計研究。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆 UI 設計研究嗎？"
    :filters="filters"
    :searchFields="['title', 'category', 'tags', 'sourceUrl', 'takeaways', 'highlights']"
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
        title="研究重點"
        accent="var(--color-primary)"
        :text="item.takeaways"
      />
      <LightboxListSection
        v-if="parseLines(item.highlights).length"
        icon="thumb-up-solid"
        title="值得參考"
        accent="var(--color-primary)"
        marker="check"
        :items="parseLines(item.highlights)"
      />
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="focus-solid"
        title="適用情境"
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
  { field: 'category', zhLabel: 'UI 類型',   allOption: '所有 UI 類型',   optionsFrom: 'category' },
  { field: 'tags',     zhLabel: '適用情境', allOption: '所有適用情境', optionsFrom: 'tags' }
]);
</script>