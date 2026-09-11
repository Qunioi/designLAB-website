<template>
  <div class="research-container">
    <PageHeader
      :title="pageTitle"
      :subtitle="pageSubtitle"
      :add-btn-label="addBtnLabel"
      @add-click="$emit('trigger-crud', { type: crudType })"
    />

    <FilterToolbar
      v-model:searchQuery="searchQuery"
      :searchPlaceholder="searchPlaceholder"
      :filters="filters"
      :multiFilterValues="multiFilterValues"
      :dynamicOptions="dynamicOptions"
      :creatorOptions="creatorOptions"
      :selectedCreators="selectedCreators"
      v-model:sortOption="sortOption"
      :totalSelectedChipsCount="totalSelectedChipsCount"
      @clear-filter-field="clearFilterField"
      @toggle-option="({ field, opt }) => toggleFilterOption(field, opt)"
      @remove-option="({ field, opt }) => removeFilterOption(field, opt)"
      @toggle-creator="toggleCreator"
      @clear-creators="clearCreators"
      @reset-all="resetAllFilters"
    />

    <!-- 列表為空提示（只做淡入；離場不做動畫，避免它還佔著位置時把新進場的卡片往下推） -->
    <CardGrid v-if="showSkeleton" :max="5" class="cards-grid" role="status" aria-label="資料載入中">
      <template v-for="n in 8" :key="`skeleton-${n}`">
      <div class="card-panel skeleton-card" aria-hidden="true">
          <span class="skeleton-block skeleton-media"></span>
          <div class="skeleton-body">
            <span class="skeleton-block skeleton-line is-badge"></span>
            <span class="skeleton-block skeleton-line is-title"></span>
            <span class="skeleton-block skeleton-line is-short"></span>
          </div>
        </div>
      </template>
    </CardGrid>

    <Transition name="empty-fade">
    <EmptyState
      v-if="filteredList.length === 0 && !showSkeleton"
      size="lg"
      icon="search"
      :title="totalSelectedChipsCount > 0 || searchQuery ? '找不到符合目前搜尋與篩選條件的內容' : emptyText"
    >
      <template #actions>
        <BaseButton variant="secondary" v-if="totalSelectedChipsCount > 0 || searchQuery" @click="resetAllFilters">重置所有搜尋與篩選</BaseButton>
        <BaseButton variant="primary" v-else-if="!isGuest" type="button" @click="$emit('trigger-crud', { type: crudType })">
          {{ addBtnLabel }}
        </BaseButton>
      </template>
    </EmptyState>
    </Transition>

    <!-- 卡片列表：篩選／搜尋時卡片淡出淡入、其餘卡片平滑補位。
         Grid 容器一律保持掛載（不用 v-else），篩到 0 筆時離場動畫才播得完。 -->
    <CardGrid :max="5" transition="card-list" class="cards-grid" :class="{ 'stagger-in': staggerIntro }" @before-leave="lockLeavingCard">
      <ItemCard
        v-for="item in filteredList"
        :key="item.id"
        :id="`item-${item.id}`"
        :class="{ highlighted: highlightedId === item.id, 'is-mine': isMyCreatedItem(item) }"
        :title="getTitle(item)"
        :cover="getCover(item)"
        :link="getLink(item)"
        :badge="getBadgeText(item)"
        :desc="descField ? (item[descField] || '') : ''"
        :tools="toolsField ? parseList(item[toolsField]) : []"
        :tags="parseList(item.tags)"
        :mine="isMyCreatedItem(item)"
        filterable
        :badge-clickable="!badgeLabel"
        :is-tag-active="isTagSelected"
        :is-tool-active="tool => isSingleFilterSelected(toolsField, tool)"
        :hit-label="`查看《${getTitle(item)}》詳情`"
        @open="openLightbox(item)"
        @badge-click="handleBadgeClick(item)"
        @toggle-tag="toggleTag"
        @toggle-tool="tool => toggleSingleFilter(toolsField, tool)"
      >
        <template #meta-end>
          <div class="card-actions card-actions-reveal" v-if="!isGuest">
            <IconButton v-if="canEditCardItem(item)" icon="edit" size="sm" variant="edit" :label="`編輯《${getTitle(item)}》`" @click="$emit('trigger-crud', { type: crudType, item })" />
            <IconButton v-if="canDeleteCardItem(item)" icon="trash-2" size="sm" variant="delete" :label="`刪除《${getTitle(item)}》`" @click="handleDelete(item)" />
          </div>
        </template>
      </ItemCard>
    </CardGrid>

    <!-- 燈箱：點遮罩可關閉；Esc 由本元件處理（全螢幕預覽開著時先關預覽） -->
    <BaseModal
      :open="lightbox.isOpen"
      size="xl"
      layer="lightbox"
      panel-class="lightbox-container"
      :labelledby="`lightbox-title-${lightbox.item?.id}`"
      :close-on-esc="false"
      @close="closeLightbox"
    >
          <CloseButton class="lightbox-close" label="關閉詳細資料" @click="closeLightbox" />
          <div class="lightbox-scroll-area">
            <div :class="['lightbox-meta-row', lightboxMetaClass]">
              <Chip variant="type" :clickable="!lightboxBadgeLabel && !badgeLabel" @click="handleLightboxBadgeClick(lightbox.item)" :title="(lightboxBadgeLabel || badgeLabel) ? '' : '點擊切換類型篩選'">{{ getLightboxBadgeText(lightbox.item) }}</Chip>
              <span class="lightbox-date" v-if="lightbox.item.createdAt || lightbox.item.updatedAt">{{ formatDateOnly(lightbox.item.createdAt || lightbox.item.updatedAt) }}</span>
            </div>

            <div class="lightbox-body-grid">
              <div class="lightbox-media-col">
                <h2 :id="`lightbox-title-${lightbox.item?.id}`" class="lightbox-title">{{ getTitle(lightbox.item) }}</h2>
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
                      <Icon name="maximize" :size="14" />
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
                      <Icon name="maximize" :size="14" />
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

            <div class="lightbox-footer">
              <div class="lightbox-actions-group" v-if="isGuest">
                <span v-if="isMyCreatedItem(lightbox.item) || getPublisherNickname(lightbox.item)" class="mine-lightbox-indicator" :class="{ 'is-others': !isMyCreatedItem(lightbox.item) }">
                  <Icon name="user-solid" :size="11" />
                  {{ isMyCreatedItem(lightbox.item) ? '我發佈' : getPublisherNickname(lightbox.item) }} 發佈
                </span>
              </div>
              <div class="lightbox-actions-group" v-if="!isGuest">
                <IconButton v-if="canEditCardItem(lightbox.item)" icon="edit" variant="edit" label="編輯" @click="$emit('trigger-crud', { type: crudType, item: lightbox.item }); closeLightbox();" />
                <IconButton v-if="canDeleteCardItem(lightbox.item)" icon="trash-2" variant="delete" label="刪除" @click="handleDelete(lightbox.item); closeLightbox();" />
                <span v-if="isMyCreatedItem(lightbox.item) || getPublisherNickname(lightbox.item)" class="mine-lightbox-indicator" :class="{ 'is-others': !isMyCreatedItem(lightbox.item) }">
                  <Icon name="user-solid" :size="11" />
                  {{ isMyCreatedItem(lightbox.item) ? '我' : getPublisherNickname(lightbox.item) }} 發佈
                </span>
              </div>
              <BaseButton v-if="getLightboxLink(lightbox.item)" :href="getLightboxLink(lightbox.item)" target="_blank" rel="noopener noreferrer" class="source-btn">
                <template #icon><Icon name="external-link" :size="14" /></template>
                {{ linkBtnLabel }}
              </BaseButton>
            </div>
          </div>
    </BaseModal>

    <FullscreenMediaOverlay
      :media="fullscreenMedia"
      @close="closeFullscreenMedia"
    />
  </div>
</template>

<script setup>
import EmptyState from './base/EmptyState.vue';
import Chip from './base/Chip.vue';
import CardGrid from './base/CardGrid.vue';
import ItemCard from './ItemCard.vue';
import { confirmDialog } from '../utils/confirm';
import { toast } from '../utils/toast';
import Icon from './base/Icon.vue';
import BaseButton from './base/BaseButton.vue';
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch, inject } from 'vue';
import { identityVersion } from '../utils/identity';
import PageHeader from './PageHeader.vue';
import FilterToolbar from './FilterToolbar.vue';
import IconButton from './base/IconButton.vue';
import CloseButton from './base/CloseButton.vue';
import BaseModal from './base/BaseModal.vue';
import FullscreenMediaOverlay from './FullscreenMediaOverlay.vue';
import { getStorageData, deleteItem, isMyCreatedItem, checkDeletePermission } from '../utils/storage';
import { getCurrentUser } from '../utils/userStore';
import { formatDateOnly, parseList } from '../utils/formatters';
import { useStaggerIntro, scrollBehavior } from '../utils/motion';

const props = defineProps({
  pageTitle:    { type: String, required: true },
  pageSubtitle: { type: String, default: '' },
  addBtnLabel:  { type: String, default: '+ 新增' },
  storageKey:   { type: String, required: true },
  crudType:     { type: String, required: true },
  searchPlaceholder: { type: String, default: '搜尋...' },
  filters:      { type: Array, default: () => [] },
  searchFields: { type: Array, default: () => ['title'] },
  badgeField:   { type: String, default: '' },
  badgeLabel:   { type: String, default: '' },
  // 燈箱 badge 要跟卡片不同時才填（例如固定顯示「AI 工具中心」）；不填沿用 badgeLabel／badgeField
  lightboxBadgeLabel: { type: String, default: '' },
  titleField:   { type: String, default: 'title' },
  coverField:   { type: String, default: 'cover' },
  linkField:    { type: String, default: 'link' },
  // 卡片上的文字描述、製作工具欄位（沒有就不顯示）
  descField:    { type: String, default: '' },
  toolsField:   { type: String, default: '' },
  lightboxCoverField: { type: String, default: '' },
  lightboxLinkField:  { type: String, default: '' },
  lightboxMetaClass: { type: String, default: '' },
  linkBtnLabel: { type: String, default: '查看完整內容' },
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
const multiFilterValues = reactive({});
const selectedTags     = computed(() => multiFilterValues.tags || []);
const selectedCreators = ref([]);
const sortOption       = ref('newest');
const lightbox         = ref({ isOpen: false, item: null });
const fullscreenMedia = ref({ url: '', isVideo: false });

const isGuest = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  const u = getCurrentUser();
  const uname = (u.username || '').toLowerCase();
  return !uname || uname === '@guest' || uname === '@account' || u.nickname === '訪客';
});

/** 管理員可刪除任何項目，一般使用者只能刪除自己發佈的 */
const canDeleteCardItem = (item) => {
  if (!item) return false;
  return checkDeletePermission(item).allowed;
};

/** 登入使用者都可以編輯任何項目，不限本人建立 */
const canEditCardItem = (item) => {
  if (!item) return false;
  return !isGuest.value;
};

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

// 被篩掉的卡片離場時要先脫離 Grid 排版（CSS 設成 position:absolute），
// 剩下的卡片才能平滑位移補位；脫離前先把它當下的位置與尺寸鎖住，
// 否則一變成絕對定位就會失去 Grid 欄寬，在淡出前瞬間縮成一條。
const lockLeavingCard = (el) => {
  el.style.left = `${el.offsetLeft}px`;
  el.style.top = `${el.offsetTop}px`;
  el.style.width = `${el.offsetWidth}px`;
  el.style.height = `${el.offsetHeight}px`;
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
    case 'category': return '類型';
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

const toggleTag = (tag) => toggleFilterOption('tags', tag);
const isTagSelected = (tag) => isOptionSelected('tags', tag);
const toggleSingleFilter = (field, val) => toggleFilterOption(field, val);
const isSingleFilterSelected = (field, val) => isOptionSelected(field, val);

const handleBadgeClick = (item) => {
  // badgeLabel 是固定文字，不是這筆資料的欄位值，不能拿來篩選
  if (props.badgeLabel) return;
  const badgeText = getBadgeText(item);
  if (!badgeText) return;
  const targetField = props.badgeField || 'category';
  toggleFilterOption(targetField, badgeText);
};
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
    // 類型是單一語意值；例如「UI/UX Skills」不可被斜線拆成兩個類型。
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
    for (const f of props.filters) {
      const selectedArr = multiFilterValues[f.field];
      if (selectedArr && selectedArr.length > 0) {
        const optField = f.optionsFrom || f.field;
        const itemVals = getItemValues(item, f.field, optField);
        
        const hasMatch = selectedArr.some(sel => itemVals.includes(sel));
        if (!hasMatch) return false;
      }
    }

    if (selectedCreators.value.length > 0) {
      const creator = item.createdBy || item.creatorName || item.updatedBy || '';
      const matchedCreator = selectedCreators.value.some(sc => creator.includes(sc));
      if (!matchedCreator) return false;
    }

    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return true;
    return props.searchFields.some(fieldName => {
      const val = item[fieldName];
      if (!val) return false;
      if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(q));
      return String(val).toLowerCase().includes(q);
    });
  });

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
      if (el) el.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    });
  }
};

const loadData = () => {
  items.value = getStorageData(props.storageKey);
  checkAndAutoOpenModal();
};
defineExpose({ loadData });

watch(() => props.highlightedId, () => {
  checkAndAutoOpenModal();
});

const handleStorageUpdated = () => {
  loadData();
};

const isSyncing = inject('isSyncing', ref(false));
const showSkeleton = computed(() => isSyncing.value && items.value.length === 0);
const staggerIntro = useStaggerIntro(props.crudType, () => !showSkeleton.value && filteredList.value.length > 0);

onMounted(() => {
  loadData();
  window.addEventListener('keydown', handleKeyDown);
  if (typeof window !== 'undefined') {
    window.addEventListener('design-lab-storage-updated', handleStorageUpdated);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (typeof window !== 'undefined') {
    window.removeEventListener('design-lab-storage-updated', handleStorageUpdated);
  }
});

const handleDelete = async (item) => {
  const perm = checkDeletePermission(item);
  if (!perm.allowed) {
    toast.error('沒有刪除權限', { detail: `這筆由「${perm.creatorName}」建立，只有建立者或管理員可以刪除。` });
    return;
  }
  const title = getTitle(item);
  const ok = await confirmDialog({
    title: `${props.deleteConfirmPrefix}${title}${props.deleteConfirmSuffix}`,
    message: '刪除後無法復原。',
    confirmText: '刪除',
    danger: true
  });
  if (!ok) return;
  items.value = deleteItem(props.storageKey, item.id);
  emit('delete-done');
};
</script>

<style scoped>
.research-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-stack);
}


/* ── 篩選／搜尋時卡片的進出場與補位動畫 ──
   進場：從略小、略低的位置淡入；離場：反向淡出，並脫離排版（位置由
   lockLeavingCard 鎖住），讓剩下的卡片用 .card-list-move 平滑移到新位置。 */
.card-list-enter-active,
.card-list-leave-active {
  transition: opacity var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
}
.card-list-leave-active {
  transition-duration: var(--dur-fast); /* 離場比進場快 */
}
.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
.card-list-leave-active {
  position: absolute;
  pointer-events: none;
}
.cards-grid > .card-list-move {
  transition: transform var(--dur-slow) var(--ease-move);
}

.empty-fade-enter-active {
  transition: opacity var(--dur-base) var(--ease-standard) 0.12s, transform var(--dur-base) var(--ease-standard) 0.12s;
}
.empty-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .card-list-enter-active,
  .card-list-leave-active,
  .cards-grid > .card-list-move,
  .empty-fade-enter-active {
    transition: none;
  }
}

.mine-lightbox-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  opacity: 0.85;
  margin-left: var(--space-2);
}

.mine-lightbox-indicator.is-others {
  color: var(--text-secondary);
}

/* .card-media-* 本體在 components.css，這裡只有燈箱專用的 placeholder */
.lightbox-media-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--surface-card), var(--surface-raised));
  color: var(--text-secondary);
  font-size: var(--fs-glyph);
  font-weight: var(--fw-bold);
  text-align: center;
}

/* CloseButton 的外觀在元件內，這裡只負責釘在右上角 */
.lightbox-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: var(--z-raised);
}

.lightbox-scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-5) var(--space-6) var(--space-6);
  display: flex;
  flex-direction: column;
}

/* 統一 16:9，避免封面尺寸不一造成版面跳動 */
.lightbox-media-box {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-subtle);
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
  border-radius: var(--radius-md);
  outline: none;
  object-fit: contain;
}

.clickable-media-box {
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border-radius: var(--radius-md);
  overflow: hidden;
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
  background: var(--media-shade-strong);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border: 1px solid var(--on-media-border);
  color: var(--on-media);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  opacity: 0;
  transform: translateY(0);
  transition: opacity var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
  z-index: var(--z-raised);
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

.lightbox-img {
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  transition: transform var(--dur-slow) var(--ease-standard);
}

.lightbox-media-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
}
.clickable-media-box:hover .lightbox-img {
  transform: scale(1.02);
}

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
  margin: 0 0 var(--space-1);
  font-size: var(--fs-meta);
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
  font-size: var(--fs-lightbox-title);
  font-weight: var(--fw-black);
  margin: var(--space-3) 0 var(--space-4);
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

.source-btn {
  flex-shrink: 0;
}

.fade-enter-active, .fade-leave-active { transition: opacity var(--dur-base) var(--ease-standard); }
.fade-leave-active {
  transition-duration: var(--dur-fast); /* 離場比進場快 */
}
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 列表欄數由 CardGrid 負責（超寬 5 · 桌機 4 · 筆電 3 · 平板 2 · 手機 1） */
@media (max-width: 1023px) {
  .lightbox-body-grid { grid-template-columns: 1fr; gap: var(--space-5); }
}
@media (max-width: 640px) {
  .filter-select { flex: 1; }
  .lightbox-scroll-area { padding: var(--space-4); -webkit-overflow-scrolling: touch; }
  /* 手機單欄時標題會延伸到最右側，跟日期列一樣預留關閉鈕的位置，避免文字被按鈕蓋住 */
  .lightbox-title { padding-right: 2.75rem; }
  .lightbox-media-box { max-height: 38vh; }
  .lightbox-footer { align-items: stretch; flex-direction: column; }
  .lightbox-actions-group { width: 100%; flex-wrap: wrap; }
  .source-btn { width: 100%; }
}
</style>
