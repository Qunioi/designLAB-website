<template>
  <ResearchGrid
    pageTitle="動態研究"
    pageSubtitle="蒐集微互動、轉場特效與動態研究案例，提升介面的動態反饋體驗"
    addBtnLabel="+ 新增動態案例"
    storageKey="MOTION_RESEARCH"
    crudType="MOTION_RESEARCH"
    searchPlaceholder="搜尋動畫、製作工具、Tag..."
    badgeClass="type-badge"
    badgeField="motionType"
    coverField="cover"
    linkField="link"
    researchContext="動態研究"
    emptyText="無相符的動態案例。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆動態研究嗎？"
    :filters="filters"
    :searchFields="['title', 'takeaways', 'tags', 'tools']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <!-- Extra card content: tools + tags -->
    <template #card-extra="{ item, toggleTag, isTagSelected, toggleSingleFilter, isSingleFilterSelected }">
      <div class="card-tools" v-if="parseList(item.tools).length">
        <span
          v-for="tool in parseList(item.tools)"
          :key="tool"
          class="tool-tag clickable-tool"
          :class="{ active: isSingleFilterSelected && isSingleFilterSelected('tools', tool) }"
          @click.stop="toggleSingleFilter && toggleSingleFilter('tools', tool)"
          :title="`點擊${isSingleFilterSelected && isSingleFilterSelected('tools', tool) ? '取消' : '快速'}篩選製作工具：${tool}`"
        >
          {{ tool }}
        </span>
      </div>
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

    <!-- Lightbox content: tools + takeaways -->
    <template #lightbox-content="{ item, toggleTag, isTagSelected, toggleSingleFilter, isSingleFilterSelected }">
      <div class="card-tools" v-if="parseList(item.tools).length">
        <span
          v-for="tool in parseList(item.tools)"
          :key="tool"
          class="tool-tag clickable-tool"
          :class="{ active: isSingleFilterSelected && isSingleFilterSelected('tools', tool) }"
          @click.stop="toggleSingleFilter && toggleSingleFilter('tools', tool)"
          :title="`點擊${isSingleFilterSelected && isSingleFilterSelected('tools', tool) ? '取消' : '快速'}篩選製作工具：${tool}`"
        >
          {{ tool }}
        </span>
      </div>
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
        <h4 class="section-title">動態特色與心得要點</h4>
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

const filters = computed(() => [
  { field: 'motionType', zhLabel: '動畫類型', allOption: '所有動畫類型', optionsFrom: 'motionType' },
  { field: 'tools',      zhLabel: '製作工具', allOption: '所有製作工具', optionsFrom: 'tools' },
  { field: 'tags',       zhLabel: '主題標籤', allOption: '所有主題標籤', optionsFrom: 'tags' }
]);
</script>

<style scoped>
/* 所有相依樣式已統一由 style.css & ResearchGrid 繼承 */
</style>
