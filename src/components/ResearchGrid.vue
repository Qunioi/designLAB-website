<template>
  <div class="research-container" @click="closeTagDropdown">
    <PageHeader
      :title="pageTitle"
      :subtitle="pageSubtitle"
      :add-btn-label="addBtnLabel"
      @add-click="$emit('trigger-crud', { type: crudType })"
    />

    <!-- 抽離之高階 FilterToolbar 子元件 -->
    <FilterToolbar
      v-model:searchQuery="searchQuery"
      :searchPlaceholder="searchPlaceholder"
      :filters="filters"
      :activeDropdown="activeDropdown"
      :multiFilterValues="multiFilterValues"
      :dynamicOptions="dynamicOptions"
      :creatorOptions="creatorOptions"
      :selectedCreators="selectedCreators"
      v-model:sortOption="sortOption"
      :totalSelectedChipsCount="totalSelectedChipsCount"
      @toggle-dropdown="toggleDropdown"
      @clear-filter-field="clearFilterField"
      @toggle-option="({ field, opt }) => toggleFilterOption(field, opt)"
      @remove-option="({ field, opt }) => removeFilterOption(field, opt)"
      @toggle-creator="toggleCreator"
      @clear-creators="clearCreators"
      @reset-all="resetAllFilters"
    />

    <!-- 列表為空提示 -->
    <div v-if="filteredList.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <p>{{ totalSelectedChipsCount > 0 || searchQuery ? '找不到符合目前搜尋與篩選條件的內容。' : emptyText }}</p>
      <button class="reset-filter-btn" v-if="totalSelectedChipsCount > 0 || searchQuery" @click="resetAllFilters">重置所有搜尋與篩選</button>
      <button
        v-else-if="!isGuest"
        type="button"
        class="empty-primary-btn"
        @click="$emit('trigger-crud', { type: crudType })"
      >
        {{ addBtnLabel }}
      </button>
    </div>

    <!-- 卡片列表 -->
    <div v-else class="cards-grid">
      <div v-for="item in filteredList" :key="item.id" class="card-panel" :class="{ highlighted: highlightedId === item.id, 'is-mine': isMyCreatedItem(item) }" :id="`item-${item.id}`">
        <div
          class="card-media-wrapper"
          role="button"
          tabindex="0"
          :aria-label="`查看《${getTitle(item)}》詳情`"
          @click="openLightbox(item)"
          @keydown.enter.prevent="openLightbox(item)"
          @keydown.space.prevent="openLightbox(item)"
        >
          <img v-if="getCover(item)" :src="getCover(item)" class="card-media" :alt="getTitle(item)" loading="lazy" />
          <div v-else class="card-media-placeholder" aria-hidden="true">
            <span>{{ getTitle(item) }}</span>
          </div>
          <div class="hover-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>點擊看詳情</span>
          </div>
          <!-- 我發佈的：精緻 Avatar Dot 置於圖片左上角 -->
          <div v-if="isMyCreatedItem(item)" class="mine-avatar-dot" title="我發佈的">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <!-- 外連笭頭：wrapper 承接主題光暈，內層 <a> 保持清晰 -->
          <div v-if="getLink(item)" class="ext-link-wrapper">
            <a :href="getLink(item)" target="_blank" rel="noopener noreferrer" class="media-ext-link" @click.stop :aria-label="`前往《${getTitle(item)}》`" title="前往">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
        <div class="card-info">
          <div class="card-meta-row" @click.stop>
            <div class="card-meta-left">
              <span :class="[badgeClass, { 'clickable-badge': !badgeLabel }]" @click="handleBadgeClick(item)" :title="badgeLabel ? '' : '點擊切換分類篩選'">{{ getBadgeText(item) }}</span>
            </div>
            <div class="card-actions card-actions-reveal" v-if="!isGuest">
              <ActionIconButton v-if="canEditCardItem(item)" variant="edit" :aria-label="`編輯《${getTitle(item)}》`" @click="$emit('trigger-crud', { type: crudType, item })" title="編輯">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </ActionIconButton>
              <ActionIconButton v-if="canDeleteCardItem(item)" variant="delete" :aria-label="`刪除《${getTitle(item)}》`" @click="handleDelete(item)" title="刪除">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </ActionIconButton>
            </div>
          </div>
          <h3 class="card-title">{{ getTitle(item) }}</h3>
          <slot
            name="card-extra"
            :item="item"
            :toggle-tag="toggleTag"
            :is-tag-selected="isTagSelected"
            :selected-tags="selectedTags"
            :toggle-single-filter="toggleSingleFilter"
            :is-single-filter-selected="isSingleFilterSelected"
          />
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Transition name="fade">
      <div v-if="lightbox.isOpen" class="lightbox-backdrop" @click="closeLightbox">
        <div
          class="lightbox-container glass-panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`lightbox-title-${lightbox.item?.id}`"
          @click.stop
        >
          <button class="lightbox-close" type="button" @click="closeLightbox" aria-label="關閉詳細資料" title="關閉">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="lightbox-scroll-area">
            <!-- 頂部橫跨全寬：分類 badge（左）＋ 日期（右，關閉鈕另外絕對定位疊在更右邊） -->
            <div :class="['lightbox-meta-row', lightboxMetaClass]">
              <span :class="[badgeClass, { 'clickable-badge': !lightboxBadgeLabel && !badgeLabel }]" @click="handleLightboxBadgeClick(lightbox.item)" :title="(lightboxBadgeLabel || badgeLabel) ? '' : '點擊切換分類篩選'">{{ getLightboxBadgeText(lightbox.item) }}</span>
              <span class="lightbox-date" v-if="lightbox.item.createdAt || lightbox.item.updatedAt">{{ formatDateOnly(lightbox.item.createdAt || lightbox.item.updatedAt) }}</span>
            </div>

            <!-- 主體兩欄：左欄標題＋媒體，右欄各類型自訂內容（可獨立捲動） -->
            <div class="lightbox-body-grid">
              <div class="lightbox-media-col">
                <h2 :id="`lightbox-title-${lightbox.item?.id}`" class="lightbox-title">{{ getTitle(lightbox.item) }}</h2>
                <!-- 各類型可選填的額外資訊（例如 AI 工具中心的「工具分類」），
                     不填就完全不佔位置，其餘 4 種類型不受影響 -->
                <slot
                  name="lightbox-left-extra"
                  :item="lightbox.item"
                  :toggle-single-filter="toggleSingleFilter"
                  :is-single-filter-selected="isSingleFilterSelected"
                  :toggle-tag="toggleTag"
                  :is-tag-selected="isTagSelected"
                  :close-lightbox="closeLightbox"
                />
                <div class="lightbox-media-box" :class="{ 'image-lightbox-media': !isVideoSource(getLightboxVideo(lightbox.item)) }" v-if="!hideLightboxMedia && (isVideoSource(getLightboxVideo(lightbox.item)) || getLightboxImage(lightbox.item))">
                  <div
                    v-if="isVideoSource(getLightboxVideo(lightbox.item))"
                    class="clickable-media-box video-media-container"
                  >
                    <video
                      :src="getLightboxVideo(lightbox.item)"
                      controls
                      autoplay
                      class="lightbox-video"
                    ></video>
                    <button
                      type="button"
                      class="media-zoom-overlay video-expand-btn"
                      @click.stop="openFullscreenMedia(getLightboxVideo(lightbox.item), true)"
                      title="全螢幕放大播放影片"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                      <span>點擊全螢幕檢視</span>
                    </button>
                  </div>
                  <div
                    v-else
                    class="clickable-media-box"
                    role="button"
                    tabindex="0"
                    :aria-label="`放大檢視《${getTitle(lightbox.item)}》圖片`"
                    @click="openFullscreenMedia(getLightboxImage(lightbox.item), false)"
                    @keydown.enter.prevent="openFullscreenMedia(getLightboxImage(lightbox.item), false)"
                    @keydown.space.prevent="openFullscreenMedia(getLightboxImage(lightbox.item), false)"
                    title="點擊全螢幕放大檢視圖片"
                  >
                    <img v-if="getLightboxImage(lightbox.item)" :src="getLightboxImage(lightbox.item)" class="lightbox-img" alt="點擊放大" />
                    <div v-else class="lightbox-media-placeholder" aria-hidden="true">{{ getTitle(lightbox.item) }}</div>
                    <div class="media-zoom-overlay">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                      <span>點擊全螢幕檢視</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="lightbox-content-col">
                <div class="lightbox-slot-content">
                  <slot
                    name="lightbox-content"
                    :item="lightbox.item"
                    :toggle-tag="toggleTag"
                    :is-tag-selected="isTagSelected"
                    :selected-tags="selectedTags"
                    :toggle-single-filter="toggleSingleFilter"
                    :is-single-filter-selected="isSingleFilterSelected"
                    :open-fullscreen-media="openFullscreenMedia"
                  />
                </div>
              </div>
            </div>

            <!-- 底部橫跨全寬：編輯/刪除/發布者（左）＋ 前往連結 CTA（右） -->
            <div class="lightbox-footer">
              <div class="lightbox-actions-group" v-if="isGuest">
                <!-- 發佈者標示：自己發佈顯示「我發佈」，其他人發佈的顯示對方暱稱 -->
                <span v-if="isMyCreatedItem(lightbox.item) || getPublisherNickname(lightbox.item)" class="mine-lightbox-indicator" :class="{ 'is-others': !isMyCreatedItem(lightbox.item) }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                  {{ isMyCreatedItem(lightbox.item) ? '我發佈' : getPublisherNickname(lightbox.item) }} 發佈
                </span>
              </div>
              <div class="lightbox-actions-group" v-if="!isGuest">
                <button v-if="canEditCardItem(lightbox.item)" type="button" class="lightbox-icon-btn edit" @click="$emit('trigger-crud', { type: crudType, item: lightbox.item }); closeLightbox();" :aria-label="`編輯`" title="編輯">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <!-- 刪除：管理員或我發佈的才顯示 -->
                <button v-if="canDeleteCardItem(lightbox.item)" type="button" class="lightbox-icon-btn delete" @click="handleDelete(lightbox.item); closeLightbox();" :aria-label="`刪除`" title="刪除">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                </button>
                <!-- 發佈者標示：自己發佈顯示「我發佈」，其他人發佈的顯示對方暱稱 -->
                <span v-if="isMyCreatedItem(lightbox.item) || getPublisherNickname(lightbox.item)" class="mine-lightbox-indicator" :class="{ 'is-others': !isMyCreatedItem(lightbox.item) }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                  {{ isMyCreatedItem(lightbox.item) ? '我' : getPublisherNickname(lightbox.item) }} 發佈
                </span>
              </div>
              <a v-if="getLightboxLink(lightbox.item)" :href="getLightboxLink(lightbox.item)" target="_blank" rel="noopener noreferrer" class="source-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>{{ linkBtnLabel }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 抽離之全螢幕媒體放大燈箱子元件 -->
    <FullscreenMediaOverlay
      :media="fullscreenMedia"
      @close="closeFullscreenMedia"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import PageHeader from './PageHeader.vue';
import FilterToolbar from './FilterToolbar.vue';
import ActionIconButton from './ActionIconButton.vue';
import FullscreenMediaOverlay from './FullscreenMediaOverlay.vue';
import { getStorageData, deleteItem, isMyCreatedItem, checkDeletePermission } from '../utils/storage';
import { getCurrentUser, isAdminUser } from '../utils/userStore';
import { formatDateOnly } from '../utils/formatters';
import NotificationBell from '../components/NotificationBell.vue';

const props = defineProps({
  pageTitle:    { type: String, required: true },
  pageSubtitle: { type: String, default: '' },
  addBtnLabel:  { type: String, default: '+ 新增' },
  storageKey:   { type: String, required: true },
  crudType:     { type: String, required: true },
  searchPlaceholder: { type: String, default: '搜尋...' },
  filters:      { type: Array, default: () => [] },
  searchFields: { type: Array, default: () => ['title'] },
  badgeClass:   { type: String, default: 'category-badge' },
  badgeField:   { type: String, default: '' },
  badgeLabel:   { type: String, default: '' },
  // 燈箱頂部的 badge 若要跟卡片列表不同（例如卡片顯示每筆各自的分類，
  // 但燈箱固定顯示這個類型的名稱，如「AI 工具中心」），填這個欄位即可；
  // 不填就跟卡片一樣，沿用 badgeLabel／badgeField 的邏輯。
  lightboxBadgeLabel: { type: String, default: '' },
  titleField:   { type: String, default: 'title' },
  coverField:   { type: String, default: 'cover' },
  linkField:    { type: String, default: 'link' },
  lightboxCoverField: { type: String, default: '' },
  lightboxLinkField:  { type: String, default: '' },
  lightboxMetaClass: { type: String, default: '' },
  linkBtnLabel: { type: String, default: '前往' },
  researchContext: { type: String, default: '研究案例' },
  hideLightboxMedia: { type: Boolean, default: false },
  emptyText:    { type: String, default: '無相符資料。點選右上角新增一筆！' },
  deleteConfirmPrefix: { type: String, default: '確定要刪除《' },
  deleteConfirmSuffix: { type: String, default: '》嗎？' },
  highlightedId: { type: String, default: '' },
});

const emit = defineEmits(['trigger-crud', 'delete-done', 'open-lightbox', 'close-lightbox']);
const items            = ref([]);
const searchQuery      = ref('');
const activeDropdown   = ref('');
const multiFilterValues = reactive({});
const selectedTags     = computed(() => multiFilterValues.tags || []);
const selectedCreators = ref([]);
const sortOption       = ref('newest');
const lightbox         = ref({ isOpen: false, item: null });
const fullscreenMedia = ref({ url: '', isVideo: false });

const isGuest = computed(() => {
  const u = getCurrentUser();
  const uname = (u.username || '').toLowerCase();
  return !uname || uname === '@guest' || uname === '@account' || u.nickname === '訪客';
});

/** 判斷目前登入者是否具備刪除該項目的權限 (管理員可刪除任何項目，一般使用者僅可刪除自己發佈的項目) */
const canDeleteCardItem = (item) => {
  if (!item) return false;
  return checkDeletePermission(item).allowed;
};

/** 編輯：只要是登入使用者（非訪客）即可編輯任何項目，不限本人建立 */
const canEditCardItem = (item) => {
  if (!item) return false;
  return !isGuest.value;
};

/** 取得該項目發佈者的暱稱（非本人建立時，於 Lightbox 顯示「誰發佈的」用） */
const getPublisherNickname = (item) => {
  if (!item) return '';
  if (item.creatorName) return item.creatorName;
  const createdBy = item.createdBy || item.updatedBy || '';
  return createdBy.split(' (')[0].trim();
};

const creatorOptions = computed(() => {
  const set = new Set();
  items.value.forEach(item => {
    const creator = item.createdBy || item.creatorName || item.updatedBy;
    if (creator) set.add(String(creator).trim());
  });
  return [...set].sort();
});

const toggleCreator = (creator) => {
  const clean = String(creator).trim();
  const idx = selectedCreators.value.indexOf(clean);
  if (idx > -1) {
    selectedCreators.value.splice(idx, 1);
  } else {
    selectedCreators.value.push(clean);
  }
};

const clearCreators = () => {
  selectedCreators.value = [];
};

const openFullscreenMedia = (url, isVideo = false) => {
  if (url) fullscreenMedia.value = { url, isVideo };
};

const closeFullscreenMedia = () => {
  fullscreenMedia.value = { url: '', isVideo: false };
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    if (fullscreenMedia.value.url) {
      closeFullscreenMedia();
    } else if (lightbox.value.isOpen) {
      closeLightbox();
    }
  }
};

watch(() => props.filters, (filters) => {
  filters.forEach(f => {
    if (!multiFilterValues[f.field]) {
      multiFilterValues[f.field] = [];
    }
  });
}, { immediate: true });

const getFilterZhTitle = (f) => {
  if (f.zhLabel) return f.zhLabel;
  switch (f.field) {
    case 'motionType': return '動畫類型';
    case 'tools': return '製作工具';
    case 'category': return '分類';
    case 'tags': return '主題標籤';
    default: return f.field;
  }
};

const getFilterEnglishTitle = (f) => {
  switch (f.field) {
    case 'motionType': return 'Motion';
    case 'tools': return 'Tools';
    case 'category': return 'Category';
    case 'tags': return 'Tags';
    default: return f.field;
  }
};

const getFilterButtonLabel = (f) => {
  const count = getSelectedCount(f.field);
  const zhTitle = getFilterZhTitle(f);
  if (count > 0) {
    return `${zhTitle} (${count})`;
  }
  return f.allOption || `所有${zhTitle}`;
};

const toggleDropdown = (field) => {
  if (activeDropdown.value === field) {
    activeDropdown.value = '';
  } else {
    activeDropdown.value = field;
  }
};

const closeTagDropdown = () => {
  activeDropdown.value = '';
};

const getSelectedCount = (field) => {
  return multiFilterValues[field]?.length || 0;
};

const isOptionSelected = (field, option) => {
  if (!field || !option) return false;
  return multiFilterValues[field]?.includes(String(option).trim()) || false;
};

const toggleFilterOption = (field, option) => {
  if (!field || !option) return;
  const clean = String(option).trim();
  if (!multiFilterValues[field]) multiFilterValues[field] = [];
  const idx = multiFilterValues[field].indexOf(clean);
  if (idx > -1) {
    multiFilterValues[field].splice(idx, 1);
  } else {
    multiFilterValues[field].push(clean);
  }
};

const removeFilterOption = (field, option) => {
  if (!field || !option) return;
  const clean = String(option).trim();
  if (multiFilterValues[field]) {
    multiFilterValues[field] = multiFilterValues[field].filter(o => o !== clean);
  }
};

const clearFilterField = (field) => {
  if (multiFilterValues[field]) {
    multiFilterValues[field] = [];
  }
};

const totalSelectedChipsCount = computed(() => {
  let total = 0;
  props.filters.forEach(f => {
    total += multiFilterValues[f.field]?.length || 0;
  });
  total += selectedCreators.value.length;
  return total;
});

const resetAllFilters = () => {
  searchQuery.value = '';
  props.filters.forEach(f => {
    multiFilterValues[f.field] = [];
  });
  selectedCreators.value = [];
  sortOption.value = 'newest';
};

// 為了維持對 view 的相容與點擊 quick filter
const toggleTag = (tag) => toggleFilterOption('tags', tag);
const isTagSelected = (tag) => isOptionSelected('tags', tag);
const toggleSingleFilter = (field, val) => toggleFilterOption(field, val);
const isSingleFilterSelected = (field, val) => isOptionSelected(field, val);

const handleBadgeClick = (item) => {
  // badgeLabel 是固定文字（例如「AI 工具中心」），不是這筆資料自己的欄位值，
  // 點下去沒有意義可以篩選，直接略過。
  if (props.badgeLabel) return;
  const badgeText = getBadgeText(item);
  if (!badgeText) return;
  const targetField = props.badgeField || 'category';
  toggleFilterOption(targetField, badgeText);
};
/** 燈箱裡的分類 badge 點擊：固定文字（lightboxBadgeLabel／badgeLabel）時不可篩選 */
const handleLightboxBadgeClick = (item) => {
  if (props.lightboxBadgeLabel || props.badgeLabel) return;
  handleBadgeClick(item);
  closeLightbox();
};

const getTitle  = (item) => item?.[props.titleField] || item?.title || item?.name || '';
const getCover  = (item) => item?.[props.coverField]  || item?.cover || item?.logo  || '';
const getLink   = (item) => {
  if (!item) return '';
  return item[props.linkField] || item.link || item.source || item.url || '';
};
const getLightboxCover = (item) => { if (!item) return ''; return item[props.lightboxCoverField || props.coverField] || getCover(item); };
const getLightboxVideo = (item) => { if (!item) return ''; return item.videoUrl || item.video || ''; };
const isVideoSource = (url) => Boolean(url && (String(url).startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(String(url))));
const getLightboxImage = (item) => {
  if (!item) return '';
  const cover = getLightboxCover(item);
  const mediaUrl = getLightboxVideo(item);
  return cover || (!isVideoSource(mediaUrl) ? mediaUrl : '');
};
const getLightboxLink  = (item) => { if (!item) return ''; return item[props.lightboxLinkField  || props.linkField]  || getLink(item); };
const getBadgeText = (item) => { if (props.badgeLabel) return props.badgeLabel; if (props.badgeField && item) return item[props.badgeField] || ''; return ''; };
const getLightboxBadgeText = (item) => props.lightboxBadgeLabel || getBadgeText(item);

const getItemValues = (item, field, optField) => {
  if (!item) return [];
  let val = item[optField || field];
  if ((!val || (Array.isArray(val) && val.length === 0)) && (field === 'tools' || optField === 'tools')) {
    val = item.toolsInput;
  }
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    // 分類是單一語意值；例如「UI/UX Skills」不可被斜線拆成兩個分類。
    if (field === 'category' || optField === 'category') {
      return val.trim() ? [val.trim()] : [];
    }
    return val.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  return [String(val).trim()];
};

const dynamicOptions = computed(() => {
  const result = {};
  props.filters.forEach(f => {
    const optField = f.optionsFrom || f.field;
    const set = new Set();
    items.value.forEach(item => {
      const vals = getItemValues(item, f.field, optField);
      vals.forEach(v => set.add(v));
    });
    result[f.field] = [...set].sort();
  });
  return result;
});

const filteredList = computed(() => {
  let list = items.value.filter(item => {
    // 1. 分類與標籤多選過濾
    for (const f of props.filters) {
      const selectedArr = multiFilterValues[f.field];
      if (selectedArr && selectedArr.length > 0) {
        const optField = f.optionsFrom || f.field;
        const itemVals = getItemValues(item, f.field, optField);
        
        const hasMatch = selectedArr.some(sel => itemVals.includes(sel));
        if (!hasMatch) return false;
      }
    }

    // 2. 建立者過濾
    if (selectedCreators.value.length > 0) {
      const creator = item.createdBy || item.creatorName || item.updatedBy || '';
      const matchedCreator = selectedCreators.value.some(sc => creator.includes(sc));
      if (!matchedCreator) return false;
    }

    // 3. 關鍵字搜尋
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return true;
    return props.searchFields.some(fieldName => {
      const val = item[fieldName];
      if (!val) return false;
      if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(q));
      return String(val).toLowerCase().includes(q);
    });
  });

  // 4. 多維度動態排序
  return list.sort((a, b) => {
    if (sortOption.value === 'oldest') {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    }
    if (sortOption.value === 'updated') {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    }
    if (sortOption.value === 'title') {
      const titleA = getTitle(a).toLowerCase();
      const titleB = getTitle(b).toLowerCase();
      return titleA.localeCompare(titleB, 'zh-Hant');
    }
    // 預設 'newest': 由新到舊
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
});

const openLightbox = (item, emitEvent = true) => {
  lightbox.value = { isOpen: true, item };
  if (emitEvent && item?.id) {
    emit('open-lightbox', item.id);
  }
};

const closeLightbox = () => {
  lightbox.value.isOpen = false;
  lightbox.value.item = null;
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  emit('close-lightbox');
};

const checkAndAutoOpenModal = () => {
  if (!props.highlightedId || !items.value.length) return;
  const targetId = String(props.highlightedId).toLowerCase();
  const found = items.value.find(i => {
    if (!i.id) return false;
    const itemStr = String(i.id).toLowerCase();
    return itemStr === targetId || itemStr.endsWith(`-${targetId}`) || itemStr.endsWith(targetId);
  });

  if (found) {
    openLightbox(found, false);
    nextTick(() => {
      const el = document.getElementById(`item-${found.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
};

const loadData = () => {
  items.value = getStorageData(props.storageKey);
  checkAndAutoOpenModal();
};
defineExpose({ loadData });

const handleDocumentClick = (e) => {
  if (activeDropdown.value) {
    const isInsideDropdown = e.target.closest('.custom-tag-dropdown');
    if (!isInsideDropdown) {
      activeDropdown.value = '';
    }
  }
};

watch(() => props.highlightedId, () => {
  checkAndAutoOpenModal();
});

const handleStorageUpdated = () => {
  loadData();
};

onMounted(() => {
  loadData();
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('click', handleDocumentClick);
  if (typeof window !== 'undefined') {
    window.addEventListener('design-lab-storage-updated', handleStorageUpdated);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('click', handleDocumentClick);
  if (typeof window !== 'undefined') {
    window.removeEventListener('design-lab-storage-updated', handleStorageUpdated);
  }
});

const handleDelete = (item) => {
  const perm = checkDeletePermission(item);
  if (!perm.allowed) { alert(`⚠️ 權限受限：此案例由原建立者「${perm.creatorName}」發表，非原建立者不得刪除！`); return; }
  const title = getTitle(item);
  if (confirm(`${props.deleteConfirmPrefix}${title}${props.deleteConfirmSuffix}`)) {
    items.value = deleteItem(props.storageKey, item.id);
    emit('delete-done');
  }
};
</script>

<style scoped>
/* ── Layout Container ───────────────────── */
.research-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.clickable-badge {
  cursor: pointer;
  transition: color 0.2s ease, opacity 0.2s ease;
}
.clickable-badge:hover {
  opacity: 0.85;
}

/* ── 多選標籤選取器：實際的 UI 已經抽成 FilterToolbar.vue 元件，
   這裡以前的舊版 CSS（下拉選單、已選標籤 Chip 列）沒有任何模板在用，
   全部移除；.custom-tag-dropdown 這個 class 字串在下面的
   closeTagDropdown() 還會用到（抓的是 FilterToolbar 渲染出來的
   真實 DOM，不是靠這裡的 CSS），只是不需要在這裡定義樣式。 ── */

.reset-filter-btn {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.15s ease;
}
.reset-filter-btn:hover {
  color: var(--color-primary);
}

/* ── Empty State ────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: 4rem var(--space-8);
  color: var(--text-muted);
  font-size: var(--fs-body);
}

.empty-primary-btn {
  min-height: 40px;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #ffffff;
  font-size: var(--fs-label);
  font-weight: var(--fw-bold);
  transition: background 0.2s ease, transform 0.2s ease;
}

.empty-primary-btn:hover {
  background: var(--color-secondary);
  transform: translateY(-1px);
}

/* ── Cards Grid (現代空氣感網格) ─────── */
.cards-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: var(--space-4);
}

/* .card-panel、.card-media-wrapper 等卡片外殼共用 class 已經搬到
   src/styles/components.css（全域），Dashboard.vue 的卡片也是靠那邊
   才套得到樣式——Vue 的 scoped style 只在原本那個元件裡有效，寫在這裡
   的話別的頁面用同樣的 class name 是吃不到樣式的。 */

/* ── 我發佈的 Avatar Dot（圖片左上角） ─ */
.mine-avatar-dot {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  z-index: 6;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.18);
  box-shadow: var(--shadow-sm);
  transition: transform 0.18s ease;
}
.card-panel:hover .mine-avatar-dot {
  transform: scale(1.08);
}

/* ── Lightbox 中發佈者指示器：自己發佈用主色強調，他人發佈則以次要文字色顯示暱稱 ─── */
.mine-lightbox-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  opacity: 0.85;
  margin-left: var(--space-2);
}

.mine-lightbox-indicator.is-others {
  color: var(--text-secondary);
}

/* ── Card Media：.card-media-wrapper／.card-media／.card-media-placeholder
   本體已搬到全域 components.css，這裡只留燈箱專用的 placeholder 樣式 ── */
.lightbox-media-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--bg-card), var(--bg-elevated));
  color: var(--text-secondary);
  font-size: var(--fs-h2);
  font-weight: var(--fw-bold);
  text-align: center;
}

.ext-link-wrapper {
  position: absolute;
  top: 0.65rem; right: 0.65rem;
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  z-index: 5;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.ext-link-wrapper:hover {
  box-shadow: var(--shadow-md);
  transform: scale(1.05);
}

.media-ext-link {
  /* 圖片上的低干擾浮層，避免操作按鈕搶走封面焦點 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; height: 100%;
  border-radius: inherit;
  background: rgba(15, 23, 42, 0.58);
  color: #ffffff;
  opacity: 0.88;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
}
.media-ext-link svg {
  stroke: currentColor;
  width: 14px;
  height: 14px;
}
.media-ext-link:hover,
.media-ext-link:focus-visible {
  opacity: 1;
  background: var(--color-primary);
  border-color: rgba(255, 255, 255, 0.9);
  color: var(--color-on-primary);
  transform: translateY(-1px);
}
.media-ext-link:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--color-primary) 55%, transparent);
  outline-offset: 3px;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: var(--fs-label);
  gap: var(--space-2);
  transition: opacity 0.22s ease;
}
.card-media-wrapper:hover .hover-overlay { opacity: 1; }

/* ── Lightbox Modal ─────────────────────── */
.lightbox-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  z-index: var(--z-lightbox);
  padding: var(--space-6);
}
.lightbox-container {
  position: relative;
  width: 100%;
  max-width: 1040px;
  max-height: 88vh;
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
  border-radius: var(--modal-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.lightbox-close {
  position: absolute;
  top: 0.75rem; right: 0.75rem;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.lightbox-close:hover,
.lightbox-close:focus-visible { background: rgba(0, 0, 0, 0.8); transform: scale(1.04); }
.lightbox-close:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
}

.lightbox-scroll-area {
  overflow-y: auto;
  padding: var(--space-5) var(--space-6) var(--space-6);
  display: flex;
  flex-direction: column;
}

/* ── 可點擊放大圖片與 Zoom 提示 ──────────────────────
   統一用 16:9 比例，避免每筆資料的封面圖尺寸不一造成版面跳動 ── */
.lightbox-media-box {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-lightbox-media {
  aspect-ratio: 16 / 9;
  height: auto;
  background: var(--bg-input);
}

.image-lightbox-media .clickable-media-box {
  aspect-ratio: 16 / 9;
  height: 100%;
  min-height: 0;
  background: var(--bg-input);
}

.lightbox-video {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border-radius: 12px;
  outline: none;
  object-fit: contain;
  background: #000000;
}

.clickable-media-box {
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border-radius: 12px;
  overflow: hidden;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
}
.clickable-media-box:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: -3px;
}

.media-zoom-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  padding: var(--space-2) var(--space-3);
  border-radius: 8px;
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  opacity: 0;
  transform: translateY(0);
  transition: opacity 0.22s ease, transform 0.22s ease;
  z-index: 10;
  cursor: pointer;
  pointer-events: auto;
}

.media-zoom-overlay:focus-visible,
.clickable-media-box:focus-visible .media-zoom-overlay {
  opacity: 1;
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
}

.clickable-media-box:hover .media-zoom-overlay,
.video-media-container:hover .video-expand-btn {
  opacity: 1;
}

.video-media-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.lightbox-img {
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.lightbox-media-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
}
.clickable-media-box:hover .lightbox-img {
  transform: scale(1.02);
}

/* ── 全螢幕放大檢視：實際 UI 已經抽成 FullscreenMediaOverlay.vue 元件，
   這裡以前的舊版 .fullscreen-* CSS 沒有任何模板在用，移除 ── */
/* ── 主體兩欄排版：左欄標題＋媒體／右欄各類型自訂內容 ── */
.lightbox-body-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.15fr);
  gap: var(--space-6);
  align-items: start;
}
.lightbox-media-col {
  display: flex;
  flex-direction: column;
}
.lightbox-content-col {
  min-width: 0;
}
.lightbox-slot-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.lightbox-slot-content :deep(.card-tags),
.lightbox-slot-content :deep(.card-tools) {
  margin-top: 0;
}
.lightbox-slot-content :deep(.lightbox-section) {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--bg-subtle) 78%, transparent);
  border: 0;
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-sm);
}
.lightbox-slot-content :deep(.section-title) {
  /* line-height 跟 h1~h6 共用規則一樣，不重複寫 */
  margin: 0 0 var(--space-1);
  font-size: var(--fs-label);
}
.lightbox-slot-content :deep(.section-desc) {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--fs-meta);
  line-height: var(--lh-relaxed);
  white-space: pre-line;
}
.lightbox-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding-right: 2.75rem; /* 保留給右上角絕對定位的關閉鈕，避免日期被蓋住 */
}
.lightbox-date {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  white-space: nowrap;
}
.lightbox-title {
  /* 這是 h2，line-height／color 跟 h1~h6 共用規則一樣，不重複寫 */
  font-size: var(--fs-h1);
  font-weight: var(--fw-black);
  margin: var(--space-3) 0;
}
.lightbox-footer {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.lightbox-actions-group {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Lightbox 編輯 / 刪除 — 純 icon 圓形按鈕 */
.lightbox-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  flex-shrink: 0;
}
.lightbox-icon-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-sm);
}
.lightbox-icon-btn.delete:hover {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}

.source-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: #fff;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-meta);
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  text-decoration: none;
  flex-shrink: 0;
}
.source-btn span {
  text-box: trim-both cap alphabetic;
}
.source-btn:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 1440px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1920px) { .cards-grid { grid-template-columns: repeat(5, 1fr); } }
@media (max-width: 1280px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 860px) {
  /* 燈箱兩欄排版在窄螢幕（含平板直向）收合成單欄：媒體在上、內容在下 */
  .lightbox-body-grid { grid-template-columns: 1fr; gap: var(--space-5); }
}
@media (max-width: 768px)  {
  .cards-grid { grid-template-columns: 1fr; }
  .media-ext-link {
    opacity: 1;
  }
}
@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .filter-select { flex: 1; }
  .lightbox-backdrop { padding: var(--space-3); }
  .lightbox-container { max-height: calc(100dvh - 1.5rem); border-radius: 16px; }
  .lightbox-scroll-area { padding: var(--space-4); -webkit-overflow-scrolling: touch; }
  .lightbox-media-box { max-height: 38vh; }
  .lightbox-footer { align-items: stretch; flex-direction: column; }
  .lightbox-actions-group { width: 100%; flex-wrap: wrap; }
  .source-btn { width: 100%; justify-content: center; }
}
</style>
