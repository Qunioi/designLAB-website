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
      <p>{{ emptyText }}</p>
      <button class="reset-filter-btn" v-if="totalSelectedChipsCount > 0 || searchQuery" @click="resetAllFilters">重置所有搜尋與篩選</button>
    </div>

    <!-- 卡片列表 -->
    <div v-else class="cards-grid">
      <div v-for="item in filteredList" :key="item.id" class="research-card glass-panel" :class="{ highlighted: highlightedId === item.id, 'is-mine': isMyCreatedItem(item) }" :id="`item-${item.id}`">
        <div
          class="card-media-wrapper"
          role="button"
          tabindex="0"
          :aria-label="`查看《${getTitle(item)}》詳情`"
          @click="openLightbox(item)"
          @keydown.enter.prevent="openLightbox(item)"
          @keydown.space.prevent="openLightbox(item)"
        >
          <img :src="getCover(item)" class="card-media" :alt="getTitle(item)" loading="lazy" />
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
            <a :href="getLink(item)" target="_blank" rel="noopener noreferrer" class="media-ext-link" @click.stop :aria-label="`前往《${getTitle(item)}》參考網址`" title="前往參考網址">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
        <div class="card-info">
          <div class="card-meta-row" @click.stop>
            <div class="card-meta-left">
              <span :class="badgeClass" class="clickable-badge" @click="handleBadgeClick(item)" title="點擊切換分類篩選">{{ getBadgeText(item) }}</span>
            </div>
            <div class="card-actions" v-if="!isGuest">
              <button type="button" class="action-icon-btn edit" :aria-label="`編輯《${getTitle(item)}》`" @click="$emit('trigger-crud', { type: crudType, item })" title="編輯">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button v-if="canDeleteCardItem(item)" type="button" class="action-icon-btn delete" :aria-label="`刪除《${getTitle(item)}》`" @click="handleDelete(item)" title="刪除">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
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
        <div class="lightbox-container glass-panel" @click.stop>
          <button class="lightbox-close" @click="closeLightbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="lightbox-scroll-area">
            <div class="lightbox-media-box" v-if="getLightboxVideo(lightbox.item) || getLightboxCover(lightbox.item)">
              <div
                v-if="getLightboxVideo(lightbox.item)"
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
                @click="openFullscreenMedia(getLightboxCover(lightbox.item), false)"
                title="點擊全螢幕放大檢視圖片"
              >
                <img :src="getLightboxCover(lightbox.item)" class="lightbox-img" alt="點擊放大" />
                <div class="media-zoom-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                  <span>點擊全螢幕檢視</span>
                </div>
              </div>
            </div>
            <div class="lightbox-detail-content">
              <div class="lightbox-meta-row">
                <span :class="badgeClass" class="clickable-badge" @click="handleBadgeClick(lightbox.item); closeLightbox();" title="點擊切換分類篩選">{{ getBadgeText(lightbox.item) }}</span>
                <span class="lightbox-date" v-if="lightbox.item.createdAt || lightbox.item.updatedAt">{{ formatDateTime(lightbox.item.createdAt || lightbox.item.updatedAt) }}</span>
              </div>
              <h2 class="lightbox-title">{{ getTitle(lightbox.item) }}</h2>
              <slot
                name="lightbox-content"
                :item="lightbox.item"
                :toggle-tag="toggleTag"
                :is-tag-selected="isTagSelected"
                :selected-tags="selectedTags"
                :toggle-single-filter="toggleSingleFilter"
                :is-single-filter-selected="isSingleFilterSelected"
              />
              <div class="lightbox-footer">
                <div class="lightbox-actions-group" v-if="!isGuest">
                  <button type="button" class="lightbox-icon-btn edit" @click="$emit('trigger-crud', { type: crudType, item: lightbox.item }); closeLightbox();" :aria-label="`編輯`" title="編輯">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <!-- 刪除：管理員或我發佈的才顯示 -->
                  <button v-if="canDeleteCardItem(lightbox.item)" type="button" class="lightbox-icon-btn delete" @click="handleDelete(lightbox.item); closeLightbox();" :aria-label="`刪除`" title="刪除">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4h6v2"></path></svg>
                  </button>
                  <!-- 我發佈的：Lightbox 中以細線 + 帳號名稱呈現 -->
                  <span v-if="isMyCreatedItem(lightbox.item)" class="mine-lightbox-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    我發佈
                  </span>
                </div>
                <a v-if="getLightboxLink(lightbox.item)" :href="getLightboxLink(lightbox.item)" target="_blank" rel="noopener noreferrer" class="source-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  <span>參考示意圖</span>
                </a>
              </div>
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
import FullscreenMediaOverlay from './FullscreenMediaOverlay.vue';
import { getStorageData, deleteItem, isMyCreatedItem, checkDeletePermission } from '../utils/storage';
import { getCurrentUser, isAdminUser } from '../utils/userStore';
import { formatDateTime } from '../utils/formatters';
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
  titleField:   { type: String, default: 'title' },
  coverField:   { type: String, default: 'cover' },
  linkField:    { type: String, default: 'link' },
  lightboxCoverField: { type: String, default: '' },
  lightboxLinkField:  { type: String, default: '' },
  linkBtnLabel: { type: String, default: '參考網址' },
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
  const badgeText = getBadgeText(item);
  if (!badgeText) return;
  const targetField = props.badgeField || 'category';
  toggleFilterOption(targetField, badgeText);
};

const getTitle  = (item) => item?.[props.titleField] || item?.title || item?.name || '';
const getCover  = (item) => item?.[props.coverField]  || item?.cover || item?.logo  || '';
const getLink   = (item) => {
  if (!item) return '';
  return item[props.linkField] || item.link || item.source || item.url || '';
};
const getLightboxCover = (item) => { if (!item) return ''; return item[props.lightboxCoverField || props.coverField] || getCover(item); };
const getLightboxVideo = (item) => { if (!item) return ''; return item.videoUrl || item.video || ''; };
const getLightboxLink  = (item) => { if (!item) return ''; return item[props.lightboxLinkField  || props.linkField]  || getLink(item); };
const getBadgeText = (item) => { if (props.badgeLabel) return props.badgeLabel; if (props.badgeField && item) return item[props.badgeField] || ''; return ''; };

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
    // 自動開啟 Lightbox 彈窗
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
  gap: 1rem;
}

.clickable-badge {
  cursor: pointer;
  transition: all 0.2s ease;
}
.clickable-badge:hover {
  opacity: 0.85;
}

/* ── 多選標籤選取器 ─────────────────────── */
.custom-tag-dropdown {
  position: relative;
  display: inline-block;
  z-index: 120;
}

.tag-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-body);
}
.tag-dropdown-btn:hover,
.tag-dropdown-btn.active {
  border-color: var(--color-primary);
  color: var(--text-primary);
}
.tag-dropdown-btn.active {
  color: var(--color-primary);
}

.tag-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 240px;
  max-height: 280px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  z-index: 500;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tag-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
}
.clear-btn {
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
.clear-btn:hover {
  text-decoration: underline;
}

.tag-options-list {
  overflow-y: auto;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tag-option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.tag-option-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.tag-option-item.selected {
  background: var(--glow-primary);
  color: var(--color-primary);
  font-weight: 600;
}
.tag-option-item input[type="checkbox"] {
  accent-color: var(--color-primary);
  cursor: pointer;
}

/* ── 已選標籤 Chip 膠囊列 ───────────────── */
.selected-tags-chips {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--border-color);
  flex-wrap: wrap;
}

.chips-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.chip-category-prefix {
  font-size: 0.65rem;
  opacity: 0.75;
  margin-right: 0.15rem;
  font-weight: 500;
}
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--color-primary) !important;
  color: #ffffff !important;
  border: 1px solid var(--color-primary) !important;
  box-shadow: 0 3px 12px var(--glow-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.22rem 0.65rem;
  border-radius: 99px;
  line-height: 1.2;
}

.chip-category-prefix {
  opacity: 0.9;
  font-weight: 600;
  color: #ffffff !important;
}

.chip-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  font-size: 0.65rem;
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.15s ease;
}
.chip-remove-btn:hover {
  background: rgba(255, 255, 255, 0.45);
  color: #ffffff !important;
}

.reset-all-tags-btn,
.reset-filter-btn {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.15s ease;
}
.reset-all-tags-btn:hover,
.reset-filter-btn:hover {
  color: var(--color-primary);
}

/* ── Empty State ────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* ── Cards Grid (恢復原始卡片樣式) ─────── */
.cards-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.research-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all 0.25s ease;
}
.research-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
.research-card.highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--glow-primary);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0%, 100% { border-color: var(--border-color); }
  50% { border-color: var(--color-primary); }
}

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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.research-card:hover .mine-avatar-dot {
  transform: scale(1.12);
  box-shadow: 0 4px 16px var(--color-primary);
}

/* ── Lightbox 中「我發佈」指示器 ─── */
.mine-lightbox-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary);
  opacity: 0.85;
  margin-left: 0.5rem;
}

/* ── Card Media (恢復原始媒體區) ────────── */
.card-media-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  background: var(--bg-hover);
  cursor: pointer;
  outline: none;
}
.card-media-wrapper:focus-visible {
  box-shadow: inset 0 0 0 2px var(--color-primary);
}
.card-media {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.card-media-wrapper:hover .card-media {
  transform: scale(1.05);
}


.ext-link-wrapper {
  position: absolute;
  top: 0.65rem; right: 0.65rem;
  width: 32px; height: 32px;
  border-radius: 8px;
  z-index: 5;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.ext-link-wrapper:hover {
  box-shadow: 0 0 0 2px var(--color-primary), 0 0 22px var(--color-primary), 0 0 8px var(--color-primary) !important;
}

.media-ext-link {
  /* 位置已移到 wrapper，本身只負責 icon 顯示 + mix-blend-mode */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; height: 100%;
  border-radius: 8px;
  mix-blend-mode: difference;
  background: #ffffff;
  border: none;
  color: #000000;
  opacity: 0.82;
  transition: opacity 0.2s ease;
}
.media-ext-link svg {
  stroke: #000000;
}
.card-media-wrapper:hover .ext-link-wrapper .media-ext-link { opacity: 1; }

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
  font-size: 0.85rem;
  gap: 0.5rem;
  transition: opacity 0.22s ease;
}
.card-media-wrapper:hover .hover-overlay { opacity: 1; }



/* ── Card Body & Info (恢復原始內邊距與純粹底色) ── */
.card-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.2rem;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-meta-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.card-time-text {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}

.card-actions,
.ext-link-wrapper {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.research-card:hover .card-actions,
.research-card:hover .ext-link-wrapper {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.research-card:focus-within .card-actions {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.action-icon-btn {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}
.action-icon-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary);
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-start;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.detail-btn:hover,
.detail-btn:focus-visible {
  background: var(--glow-primary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ── Lightbox Modal ─────────────────────── */
.lightbox-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
  padding: 2rem;
}
.lightbox-container {
  position: relative;
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.lightbox-close {
  position: absolute;
  top: 1rem; right: 1rem;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}
.lightbox-close:hover { background: rgba(0, 0, 0, 0.8); transform: scale(1.1); }

.lightbox-scroll-area {
  overflow-y: auto;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── 可點擊放大圖片與 Zoom 提示 ──────────── */
.lightbox-media-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-video {
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  outline: none;
  object-fit: contain;
  background: #000000;
}

.clickable-media-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
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
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  opacity: 0;
  transform: translateY(0);
  transition: all 0.22s ease;
  z-index: 10;
  cursor: pointer;
  pointer-events: auto;
}

.clickable-media-box:hover .media-zoom-overlay,
.video-media-container:hover .video-expand-btn {
  opacity: 1;
  /* background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 4px 15px var(--glow-primary); */
}

.video-media-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.fullscreen-media-content {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3005;
}

.fullscreen-video-element {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
  outline: none;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.lightbox-img {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  transition: transform 0.3s ease;
}
.clickable-media-box:hover .lightbox-img {
  transform: scale(1.02);
}

/* ── 全螢幕圖片放大檢視 Overlay ───────────── */
.fullscreen-image-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 1.5rem;
  cursor: zoom-out;
}

.fullscreen-img {
  max-width: 95vw;
  max-height: 95vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8);
  cursor: default;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3010;
  transition: all 0.2s ease;
}
.fullscreen-close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}
.lightbox-detail-content {
  display: flex;
  flex-direction: column;
}
.lightbox-detail-content .card-tags {
  margin-top: 0;
  margin-bottom: 1rem;
}
.lightbox-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lightbox-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.lightbox-title {
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--text-primary);
  margin: 0.5rem 0 0.5rem 0.2rem;
}
.lightbox-footer { 
  margin-top: 1.5rem; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.lightbox-actions-group {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

/* Lightbox 編輯 / 刪除 — 純 icon 圓形按鈕 */
.lightbox-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: all 0.18s ease;
  flex-shrink: 0;
}
.lightbox-icon-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 12px var(--glow-primary);
}
.lightbox-icon-btn.delete:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* 參考示意圖按鈕：主題實色背景 */
.source-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: #fff;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.82rem;
  transition: all 0.2s ease;
  text-decoration: none;
  flex-shrink: 0;
}
.source-btn:hover {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  box-shadow: 0 0 16px var(--glow-primary);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 1440px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1920px) { .cards-grid { grid-template-columns: repeat(5, 1fr); } }
@media (max-width: 1280px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  { 
  .cards-grid { grid-template-columns: 1fr; }
  .card-actions {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
  .media-ext-link {
    opacity: 1;
  }
}
@media (hover: none) {
  .card-actions {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
}
@media (max-width: 640px) {
  .search-box { width: 100%; }
  .filter-toolbar { flex-direction: column; align-items: flex-start; }
  .filter-options { width: 100%; }
  .filter-select { flex: 1; }
  .lightbox-backdrop { padding: 0.75rem; }
  .lightbox-container { max-height: 94vh; border-radius: 16px; }
  .lightbox-scroll-area { padding: 1rem; -webkit-overflow-scrolling: touch; }
}
</style>
