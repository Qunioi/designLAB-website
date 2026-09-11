<template>
  <ResearchGrid
    pageTitle="動態研究"
    pageSubtitle="蒐集微互動、轉場特效與動態研究案例，提升介面的動態反饋體驗"
    addBtnLabel="+ 新增"
    storageKey="MOTION_RESEARCH"
    crudType="MOTION_RESEARCH"
    searchPlaceholder="搜尋動畫、製作工具、Tag..."
    badgeField="motionType"
    coverField="cover"
    linkField="sourceUrl"
    researchContext="動態研究"
    emptyText="無相符的動態研究。點選右上角新增一筆！"
    deleteConfirmPrefix="確定要刪除《"
    deleteConfirmSuffix="》這筆動態研究嗎？"
    :filters="filters"
    :searchFields="['title', 'motionType', 'tools', 'tags', 'sourceUrl', 'takeaways']"
    :highlightedId="highlightedId"
    @trigger-crud="$emit('trigger-crud', $event)"
    @delete-done="$emit('delete-done')"
    @open-lightbox="$emit('open-lightbox', $event)"
    @close-lightbox="$emit('close-lightbox')"
    ref="gridRef"
  >
    <template #card-extra="{ item, toggleTag, isTagSelected, toggleSingleFilter, isSingleFilterSelected }">
      <div class="card-tools" v-if="parseList(item.tools).length">
        <Chip
          v-for="tool in parseList(item.tools)"
          :key="tool"
          variant="tool"
          :active="Boolean(isSingleFilterSelected && isSingleFilterSelected('tools', tool))"
          @click.stop="toggleSingleFilter && toggleSingleFilter('tools', tool)"
          :title="`點擊${isSingleFilterSelected && isSingleFilterSelected('tools', tool) ? '取消' : '快速'}篩選製作工具：${tool}`"
        >{{ tool }}</Chip>
      </div>
      <div class="card-tags" v-if="parseList(item.tags).length">
        <Chip
          v-for="tag in parseList(item.tags)"
          :key="tag"
          variant="tag"
          :active="Boolean(isTagSelected && isTagSelected(tag))"
          @click.stop="toggleTag && toggleTag(tag)"
          :title="`點擊${isTagSelected && isTagSelected(tag) ? '取消' : '快速'}篩選 #${tag}`"
        >{{ tag }}</Chip>
      </div>
    </template>

    <template #lightbox-content="{ item, toggleTag, isTagSelected, toggleSingleFilter, isSingleFilterSelected }">
      <LightboxTextSection
        v-if="item.takeaways"
        icon="lightbulb-2"
        title="動態重點"
        accent="var(--color-primary)"
        :text="item.takeaways"
      />
      <!-- 點擊切換的是「製作工具」篩選，不是「適用情境」篩選 -->
      <LightboxSection
        v-if="parseList(item.tools).length"
        icon="wrench"
        title="製作工具"
        accent="var(--color-primary)"
      >
        <div class="card-tools">
          <Chip
            v-for="tool in parseList(item.tools)"
            :key="tool"
            variant="tool"
          :active="Boolean(isSingleFilterSelected && isSingleFilterSelected('tools', tool))"
            @click.stop="toggleSingleFilter && toggleSingleFilter('tools', tool)"
            :title="`點擊${isSingleFilterSelected && isSingleFilterSelected('tools', tool) ? '取消' : '快速'}篩選製作工具：${tool}`"
        >{{ tool }}</Chip>
        </div>
      </LightboxSection>
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
      <!-- <LightboxTableSection
        v-if="implRows(item).length"
        icon="info-solid"
        title="實作資訊"
        accent="var(--color-primary)"
        :rows="implRows(item)"
      /> -->
    </template>
  </ResearchGrid>
</template>

<script setup>
import Chip from '../components/base/Chip.vue';
import { ref, computed } from 'vue';
import ResearchGrid from '../components/ResearchGrid.vue';
import LightboxTextSection from '../components/lightbox/LightboxTextSection.vue';
import LightboxSection from '../components/lightbox/LightboxSection.vue';
import LightboxTableSection from '../components/lightbox/LightboxTableSection.vue';
import { parseList } from '../utils/formatters';

const props = defineProps({
  highlightedId: { type: String, default: '' }
});
defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);

const gridRef = ref(null);
const loadData = () => gridRef.value?.loadData();
defineExpose({ loadData });

const filters = computed(() => [
  { field: 'motionType', zhLabel: '動態類型', allOption: '所有動態類型', optionsFrom: 'motionType' },
  { field: 'tools',      zhLabel: '製作工具', allOption: '所有製作工具', optionsFrom: 'tools' },
  { field: 'tags',       zhLabel: '適用情境', allOption: '所有適用情境', optionsFrom: 'tags' }
]);

// 製作工具已獨立成上方的標籤區塊，這裡只放 implInfo 自訂且有內容的列
const implRows = (item) => {
  const rows = [];
  if (Array.isArray(item.implInfo)) {
    item.implInfo
      .filter(row => row && (row.value || '').trim())
      .forEach(row => {
        rows.push({
          label: row.label || '',
          value: row.value,
          href: /^https?:\/\//i.test(row.value.trim()) ? row.value.trim() : undefined
        });
      });
  }
  return rows;
};
</script>

<style scoped>
</style>
