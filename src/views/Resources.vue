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
    linkBtnLabel="前往資源網站"
    emptyText="無相符的資源網站。點選右上角新增一筆！"
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
    <!-- Extra card content: description + tags -->
    <template #card-extra="{ item, toggleTag, isTagSelected }">
      <p class="card-desc" v-if="item.desc">{{ item.desc }}</p>
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

    <!-- Lightbox content: 資源介紹（既有 desc）＋ 適合尋找（既有可點擊篩選的 tags）＋ 推薦用途（新增 usage） -->
    <template #lightbox-content="{ item, toggleTag, isTagSelected }">
      <LightboxTextSection
        v-if="item.desc"
        icon="<svg viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M13 21V23H11V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H9C10.1947 3 11.2671 3.52375 12 4.35418C12.7329 3.52375 13.8053 3 15 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H13ZM20 19V5H15C13.8954 5 13 5.89543 13 7V19H20ZM11 19V7C11 5.89543 10.1046 5 9 5H4V19H11Z'></path></svg>"
        title="資源介紹"
        accent="var(--color-primary)"
        :text="item.desc"
      />
      <LightboxSection
        v-if="parseList(item.tags).length"
        icon="<svg viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M13 1L13.001 4.06201C16.6192 4.51365 19.4869 7.38163 19.9381 11L23 11V13L19.938 13.001C19.4864 16.6189 16.6189 19.4864 13.001 19.938L13 23H11L11 19.9381C7.38163 19.4869 4.51365 16.6192 4.06201 13.001L1 13V11L4.06189 11C4.51312 7.38129 7.38129 4.51312 11 4.06189L11 1H13ZM12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6ZM12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z'></path></svg>"
        title="適合尋找"
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
      <LightboxTextSection
        v-if="item.usage"
        icon="<svg viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M14.5998 8.00033H21C22.1046 8.00033 23 8.89576 23 10.0003V12.1047C23 12.3659 22.9488 12.6246 22.8494 12.8662L19.755 20.3811C19.6007 20.7558 19.2355 21.0003 18.8303 21.0003H2C1.44772 21.0003 1 20.5526 1 20.0003V10.0003C1 9.44804 1.44772 9.00033 2 9.00033H5.48184C5.80677 9.00033 6.11143 8.84246 6.29881 8.57701L11.7522 0.851355C11.8947 0.649486 12.1633 0.581978 12.3843 0.692483L14.1984 1.59951C15.25 2.12534 15.7931 3.31292 15.5031 4.45235L14.5998 8.00033ZM7 10.5878V19.0003H18.1606L21 12.1047V10.0003H14.5998C13.2951 10.0003 12.3398 8.77128 12.6616 7.50691L13.5649 3.95894C13.6229 3.73105 13.5143 3.49353 13.3039 3.38837L12.6428 3.0578L7.93275 9.73038C7.68285 10.0844 7.36341 10.3746 7 10.5878ZM5 11.0003H3V19.0003H5V11.0003Z'></path></svg>"
        title="推薦用途"
        accent="var(--color-primary)"
        :text="item.usage"
      />
    </template>
  </ResearchGrid>
</template>

<script setup>
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
  { field: 'category', zhLabel: '資源分類', allOption: '所有資源分類', optionsFrom: 'category' },
  { field: 'tags',     zhLabel: '主題標籤', allOption: '所有主題標籤', optionsFrom: 'tags' }
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
