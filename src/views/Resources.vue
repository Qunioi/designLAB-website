<template>
  <ResearchGrid
    pageTitle="設計資源"
    pageSubtitle="整理設計與工程開發常用網站，建立部門公共資源庫"
    addBtnLabel="+ 新增"
    storageKey="RESOURCES"
    crudType="RESOURCES"
    searchPlaceholder="搜尋資源名稱或簡介..."
    badgeField="category"
    titleField="name"
    coverField="screenshot"
    descField="desc"
    linkField="url"
    linkBtnLabel="前往設計資源"
    emptyText="無相符的設計資源。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆資源嗎？"
    :filters="filters"
    :searchFields="['name', 'desc', 'usage', 'category', 'url', 'tags']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.desc"
        icon="book-open-solid"
        title="資源介紹"
        accent="var(--color-primary)"
        :text="item.desc"
      />
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="focus-solid"
        title="適合尋找"
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
      <LightboxTextSection
        v-if="item.usage"
        icon="thumb-up-solid"
        title="推薦用途"
        accent="var(--color-primary)"
        :text="item.usage"
      />
    </template>
  </ResearchGrid>
</template>

<script setup>
import Chip from '../components/base/Chip.vue';
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';
import LightboxTextSection from '../components/lightbox/LightboxTextSection.vue';
import LightboxSection from '../components/lightbox/LightboxSection.vue';
import { parseList } from '../utils/formatters';

const props = defineProps({
  highlightedId: { type: String, default: '' }
});
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);
const loadData = () => gridRef.value?.loadData();
defineExpose({ loadData });

const filters = computed(() => [
  { field: 'category', zhLabel: '資源類型', allOption: '所有資源類型', optionsFrom: 'category' },
  { field: 'tags',     zhLabel: '標籤', allOption: '所有標籤', optionsFrom: 'tags' }
]);
</script>

<style scoped>


</style>
