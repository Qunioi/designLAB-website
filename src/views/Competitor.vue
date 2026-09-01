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
    linkBtnLabel="訪問官網 ↗"
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

    <!-- Lightbox content: tags + pros / cons / takeaways -->
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
      <div class="lightbox-section pros-section" v-if="item.pros">
        <h4 class="section-title pros-title">
          <span class="status-dot green"></span> 優點 (Pros)
        </h4>
        <p class="section-desc">{{ item.pros }}</p>
      </div>
      <div class="lightbox-section cons-section" v-if="item.cons">
        <h4 class="section-title cons-title">
          <span class="status-dot red"></span> 缺點 (Cons)
        </h4>
        <p class="section-desc">{{ item.cons }}</p>
      </div>
      <div class="lightbox-section takeaways-section" v-if="item.takeaways">
        <h4 class="section-title takeaways-title">
          <span class="status-dot purple"></span> 值得借鏡與參考點
        </h4>
        <p class="section-desc">{{ item.takeaways }}</p>
      </div>
    </template>
  </ResearchGrid>
</template>

<script setup>
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';
import { parseList } from '../utils/formatters';

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
/* 獨特指示燈狀態與顏色標題 */
.pros-title    { color: var(--color-success); }
.cons-title    { color: var(--color-error); }
.takeaways-title { color: var(--color-primary); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-dot.green  { background: var(--color-success); }
.status-dot.red    { background: var(--color-error); }
.status-dot.purple { background: var(--color-primary); }
</style>
