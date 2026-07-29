<template>
  <ResearchGrid
    pageTitle="UI Research"
    pageSubtitle="建立與整理介面設計案例，做為日常設計靈感與優化依據"
    addBtnLabel="+ 新增 UI 研究"
    storageKey="UI_RESEARCH"
    crudType="UI_RESEARCH"
    searchPlaceholder="搜尋標題、Tag 或心得..."
    badgeClass="category-badge"
    badgeField="category"
    coverField="cover"
    linkField="link"
    emptyText="無相符的 UI 研究案例。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆 UI 研究案嗎？"
    :filters="filters"
    :searchFields="['title', 'takeaways', 'tags']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
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

    <!-- Lightbox content: takeaways + source -->
    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
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
      <div class="lightbox-section" v-if="item.takeaways">
        <h4 class="section-title">設計特色與心得要點</h4>
        <p class="section-desc">{{ item.takeaways }}</p>
      </div>
    </template>
  </ResearchGrid>
</template>

<script setup>
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';

const props = defineProps({
  highlightedId: { type: String, default: '' }
});
defineEmits(['trigger-crud', 'delete-done']);

const gridRef = ref(null);
const loadData = () => gridRef.value?.loadData();
defineExpose({ loadData });

/** 彈性解析字串或陣列為乾淨獨立標籤項目 */
const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    return val.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const filters = computed(() => [
  { field: 'category', allOption: '所有 UI 分類', optionsFrom: 'category' },
  { field: 'tags',     allOption: '所有主題標籤', optionsFrom: 'tags' }
]);
</script>

<style scoped>
/* 所有相依樣式已統一由 style.css & ResearchGrid 繼承 */
</style>
