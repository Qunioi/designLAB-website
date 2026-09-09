<template>
  <ResearchGrid
    pageTitle="UI 設計研究"
    pageSubtitle="建立與整理介面設計案例，做為日常設計靈感與優化依據"
    addBtnLabel="+ 新增 UI 研究"
    storageKey="UI_RESEARCH"
    crudType="UI_RESEARCH"
    searchPlaceholder="搜尋標題、Tag 或心得..."
    badgeClass="category-badge"
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

    <!-- Lightbox content: 研究重點（既有 takeaways）＋ 適用情境（既有可點擊篩選的 tags） -->
    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.takeaways"
        icon="<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18h6'></path><path d='M10 22h4'></path><path d='M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14'></path></svg>"
        title="研究重點"
        accent="var(--color-primary)"
        :text="item.takeaways"
      />
      <LightboxListSection
        v-if="parseLines(item.highlights).length"
        icon="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M14.5998 8.00033H21C22.1046 8.00033 23 8.89576 23 10.0003V12.1047C23 12.3659 22.9488 12.6246 22.8494 12.8662L19.755 20.3811C19.6007 20.7558 19.2355 21.0003 18.8303 21.0003H2C1.44772 21.0003 1 20.5526 1 20.0003V10.0003C1 9.44804 1.44772 9.00033 2 9.00033H5.48184C5.80677 9.00033 6.11143 8.84246 6.29881 8.57701L11.7522 0.851355C11.8947 0.649486 12.1633 0.581978 12.3843 0.692483L14.1984 1.59951C15.25 2.12534 15.7931 3.31292 15.5031 4.45235L14.5998 8.00033ZM7 10.5878V19.0003H18.1606L21 12.1047V10.0003H14.5998C13.2951 10.0003 12.3398 8.77128 12.6616 7.50691L13.5649 3.95894C13.6229 3.73105 13.5143 3.49353 13.3039 3.38837L12.6428 3.0578L7.93275 9.73038C7.68285 10.0844 7.36341 10.3746 7 10.5878ZM5 11.0003H3V19.0003H5V11.0003Z'></path></svg>"
        title="值得參考"
        accent="var(--color-primary)"
        marker="check"
        :items="parseLines(item.highlights)"
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

const filters = computed(() => [
  { field: 'category', zhLabel: 'UI 分類',   allOption: '所有 UI 分類',   optionsFrom: 'category' },
  { field: 'tags',     zhLabel: '主題標籤', allOption: '所有主題標籤', optionsFrom: 'tags' }
]);
</script>