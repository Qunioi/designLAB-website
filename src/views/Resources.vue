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
    :searchFields="['name', 'desc', 'category', 'url']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <!-- Extra card content: description -->
    <template #card-extra="{ item }">
      <p class="card-desc" v-if="item.desc">{{ item.desc }}</p>
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
.category-badge {
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
}

</style>
