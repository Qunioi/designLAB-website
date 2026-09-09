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
    linkField="sourceUrl"
    researchContext="動態研究"
    emptyText="無相符的動態案例。點選右上角新增一筆！"
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

    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.takeaways"
        icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18h6'></path><path d='M10 22h4'></path><path d='M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14'></path></svg>"
        title="效果解析"
        accent="var(--color-primary)"
        :text="item.takeaways"
      />
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="<svg viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M13 1L13.001 4.06201C16.6192 4.51365 19.4869 7.38163 19.9381 11L23 11V13L19.938 13.001C19.4864 16.6189 16.6189 19.4864 13.001 19.938L13 23H11L11 19.9381C7.38163 19.4869 4.51365 16.6192 4.06201 13.001L1 13V11L4.06189 11C4.51312 7.38129 7.38129 4.51312 11 4.06189L11 1H13ZM12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6ZM12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z'></path></svg>"
        title="適用情境"
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
      <LightboxTableSection
        v-if="implRows(item).length"
        icon="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M12 22C6.47715 22 2 17.5228 2 12 2 6.47715 6.47715 2 12 2 17.5228 2 22 6.47715 22 12 22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12 20 7.58172 16.4183 4 12 4 7.58172 4 4 7.58172 4 12 4 16.4183 7.58172 20 12 20ZM13 10.5V15H14V17H10V15H11V12.5H10V10.5H13ZM13.5 8C13.5 8.82843 12.8284 9.5 12 9.5 11.1716 9.5 10.5 8.82843 10.5 8 10.5 7.17157 11.1716 6.5 12 6.5 12.8284 6.5 13.5 7.17157 13.5 8Z'></path></svg>"
        title="實作資訊"
        accent="var(--color-primary)"
        :rows="implRows(item)"
      />
    </template>
  </ResearchGrid>
</template>

<script setup>
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
  { field: 'motionType', zhLabel: '動畫類型', allOption: '所有動畫類型', optionsFrom: 'motionType' },
  { field: 'tools',      zhLabel: '製作工具', allOption: '所有製作工具', optionsFrom: 'tools' },
  { field: 'tags',       zhLabel: '主題標籤', allOption: '所有主題標籤', optionsFrom: 'tags' }
]);

// 「實作資訊」表格：第一列固定顯示「製作工具」（自動帶入 item.tools，
// 跟清單卡片上可篩選的 tool chip 是同一份資料，這裡純顯示不可點擊）；
// 後面接使用者在 implInfo 裡自訂的列，濾掉沒填內容的，網址開頭的值
// 自動變成可點擊連結。
const implRows = (item) => {
  const rows = [];
  const tools = parseList(item.tools);
  if (tools.length) {
    rows.push({ label: '製作工具', value: tools.join('、') });
  }
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
/* 所有相依樣式已統一由 styles/base.css、styles/components.css & ResearchGrid 繼承 */
</style>
