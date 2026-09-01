<template>
  <ResearchGrid
    pageTitle="設計資源"
    pageSubtitle="整理設計與工程開發常用網站，建立部門公共資源庫"
    addBtnLabel="+ 新增資源網站"
    storageKey="RESOURCES"
    crudType="RESOURCES"
    searchPlaceholder="搜尋資源名稱或簡介..."
    badgeClass="category-badge"
    badgeField="category"
    titleField="name"
    coverField="screenshot"
    linkField="url"
    linkBtnLabel="前往資源網站 ↗"
    emptyText="無相符的資源網站。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆資源嗎？"
    :filters="filters"
    :searchFields="['name', 'desc', 'category']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <!-- Extra card content: description -->
    <template #card-extra="{ item }">
      <p class="resource-desc-text" v-if="item.desc">{{ item.desc }}</p>
    </template>

    <!-- Lightbox content: description -->
    <template #lightbox-content="{ item }">
      <div class="lightbox-section" v-if="item.desc">
        <h4 class="section-title">資源簡介與特色</h4>
        <p class="section-desc">{{ item.desc }}</p>
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
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);
const loadData = () => gridRef.value?.loadData();
defineExpose({ loadData });

const filters = computed(() => [
  { field: 'category', zhLabel: '資源分類', allOption: '所有資源分類', optionsFrom: 'category' }
]);
</script>

<style scoped>
.resource-desc-text {
  font-size: 0.7875rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-top: 0.4rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-badge {
  font-size: 0.5875rem;
  font-weight: 600;
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .resources-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
