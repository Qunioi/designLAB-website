<template>
  <div class="research-container" @click="closeTagDropdown">
    <header class="view-header">
      <div>
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
      <div class="header-actions">
        <NotificationBell />
        <button class="add-btn" @click="$emit('trigger-crud', { type: crudType })">
          {{ addBtnLabel }}
        </button>
      </div>
    </header>

    <!-- 篩選列 -->
    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input v-model="searchQuery" type="text" :placeholder="searchPlaceholder" />
      </div>

      <div class="filter-options">
        <!-- 單選分類下拉選單 (排除 'tags' 欄位，由多選標籤專門處理) -->
        <select
          v-for="f in singleSelectFilters"
          :key="f.field"
          v-model="filterValues[f.field]"
          class="filter-select"
        >
          <option value="All">{{ f.allOption }}</option>
          <option v-for="opt in dynamicOptions[f.field]" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <!-- 自訂多選標籤下拉選單 -->
        <div class="custom-tag-dropdown" v-if="allAvailableTags.length" @click.stop>
          <button class="tag-dropdown-btn" :class="{ active: selectedTags.length > 0 }" @click="tagDropdownOpen = !tagDropdownOpen">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span>{{ selectedTags.length ? `標籤篩選 (${selectedTags.length})` : '所有主題標籤' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <Transition name="fade">
            <div class="tag-dropdown-menu glass-panel" v-if="tagDropdownOpen">
              <div class="tag-dropdown-header">
                <span>選擇標籤 (可多選)</span>
                <button class="clear-btn" v-if="selectedTags.length" @click="clearSelectedTags">清除全部</button>
              </div>
              <div class="tag-options-list">
                <label
                  v-for="tag in allAvailableTags"
                  :key="tag"
                  class="tag-option-item"
                  :class="{ selected: isTagSelected(tag) }"
                >
                  <input
                    type="checkbox"
                    :checked="isTagSelected(tag)"
                    @change="toggleTag(tag)"
                  />
                  <span># {{ tag }}</span>
                </label>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 已選標籤 Chip 膠囊條 (快速預覽與單獨刪除) -->
      <div class="selected-tags-chips" v-if="selectedTags.length">
        <span class="chips-label">已選標籤：</span>
        <div class="chip-list">
          <span v-for="tag in selectedTags" :key="tag" class="tag-chip">
            # {{ tag }}
            <button class="chip-remove-btn" @click="removeTag(tag)" title="移除標籤">✕</button>
          </span>
        </div>
        <button class="reset-all-tags-btn" @click="clearSelectedTags">清除篩選</button>
      </div>
    </div>

    <!-- 列表為空提示 -->
    <div v-if="filteredList.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <p>{{ emptyText }}</p>
      <button class="reset-filter-btn" v-if="selectedTags.length || searchQuery" @click="resetAllFilters">重置所有搜尋與篩選</button>
    </div>

    <!-- 卡片列表 -->
    <div v-else class="cards-grid">
      <div v-for="item in filteredList" :key="item.id" class="research-card glass-panel" :class="{ highlighted: highlightedId === item.id }" :id="`item-${item.id}`">
        <div class="card-media-wrapper" @click="openLightbox(item)">
          <img :src="getCover(item)" class="card-media" :alt="getTitle(item)" loading="lazy" />
          <div class="hover-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>點擊看詳情</span>
          </div>
          <a v-if="getLink(item)" :href="getLink(item)" target="_blank" class="media-ext-link" @click.stop title="前往參考網址">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
        <div class="card-info" @click="openLightbox(item)">
          <div class="card-meta-row" @click.stop>
            <span :class="badgeClass" class="clickable-badge" @click="handleBadgeClick(item)" title="點擊切換分類篩選">{{ getBadgeText(item) }}</span>
            <div class="card-actions">
              <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: crudType, item })" title="編輯">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button class="action-icon-btn delete" @click="handleDelete(item)" title="刪除">
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
            <div class="lightbox-media-box" v-if="getLightboxCover(lightbox.item)">
              <img :src="getLightboxCover(lightbox.item)" class="lightbox-img" alt="" />
            </div>
            <div class="lightbox-detail-content">
              <div class="lightbox-meta-row">
                <span :class="badgeClass" class="clickable-badge" @click="handleBadgeClick(lightbox.item); closeLightbox();" title="點擊切換分類篩選">{{ getBadgeText(lightbox.item) }}</span>
                <span class="lightbox-date" v-if="lightbox.item.createdAt || lightbox.item.updatedAt">{{ lightbox.item.createdAt || lightbox.item.updatedAt }}</span>
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
              <div class="lightbox-footer" v-if="getLightboxLink(lightbox.item)">
                <a :href="getLightboxLink(lightbox.item)" target="_blank" class="source-btn"><span>{{ linkBtnLabel }}</span></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick, watch } from 'vue';
import { getStorageData, deleteItem } from '../utils/storage';
import { checkDeletePermission } from '../utils/notifications';
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
  linkBtnLabel: { type: String, default: '參考網址 ↗' },
  emptyText:    { type: String, default: '無相符資料。點選右上角新增一筆！' },
  deleteConfirmPrefix: { type: String, default: '確定要刪除《' },
  deleteConfirmSuffix: { type: String, default: '》嗎？' },
  highlightedId: { type: String, default: '' },
});

const emit = defineEmits(['trigger-crud', 'delete-done']);
const items            = ref([]);
const searchQuery      = ref('');
const filterValues     = reactive({});
const selectedTags     = ref([]);
const tagDropdownOpen  = ref(false);
const lightbox         = ref({ isOpen: false, item: null });

watch(() => props.filters, (filters) => {
  filters.forEach(f => { if (!(f.field in filterValues)) filterValues[f.field] = 'All'; });
}, { immediate: true });

// 排除 'tags' 欄位（'tags' 由 selectedTags 專門多選處理）
const singleSelectFilters = computed(() => {
  return props.filters.filter(f => f.field !== 'tags');
});

// 自動收集全庫現有標籤（支援陣列與逗號拆分字串）
const allAvailableTags = computed(() => {
  const set = new Set();
  items.value.forEach(item => {
    let raw = item.tags;
    if (!raw) return;
    if (typeof raw === 'string') {
      raw = raw.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(raw)) {
      raw.forEach(t => t && set.add(String(t).trim()));
    }
  });
  return [...set].sort();
});

const isTagSelected = (tag) => {
  if (!tag) return false;
  return selectedTags.value.includes(String(tag).trim());
};

const toggleTag = (tag) => {
  if (!tag) return;
  const clean = String(tag).trim();
  const idx = selectedTags.value.indexOf(clean);
  if (idx > -1) {
    selectedTags.value.splice(idx, 1);
  } else {
    selectedTags.value.push(clean);
  }
};

const removeTag = (tag) => {
  const clean = String(tag).trim();
  selectedTags.value = selectedTags.value.filter(t => t !== clean);
};

const clearSelectedTags = () => {
  selectedTags.value = [];
};

const closeTagDropdown = () => {
  tagDropdownOpen.value = false;
};

const resetAllFilters = () => {
  searchQuery.value = '';
  selectedTags.value = [];
  Object.keys(filterValues).forEach(k => filterValues[k] = 'All');
};

const toggleSingleFilter = (field, val) => {
  if (!field || !val) return;
  const clean = String(val).trim();
  if (filterValues[field] === clean) {
    filterValues[field] = 'All';
  } else {
    filterValues[field] = clean;
  }
};

const isSingleFilterSelected = (field, val) => {
  if (!field || !val) return false;
  return filterValues[field] === String(val).trim();
};

const handleBadgeClick = (item) => {
  const badgeText = getBadgeText(item);
  if (!badgeText) return;
  const targetField = props.badgeField || 'category';
  toggleSingleFilter(targetField, badgeText);
};

const getTitle  = (item) => item?.[props.titleField] || item?.title || item?.name || '';
const getCover  = (item) => item?.[props.coverField]  || item?.cover || item?.logo  || '';
const getLink   = (item) => {
  if (!item) return '';
  return item[props.linkField] || item.link || item.source || item.url || '';
};
const getLightboxCover = (item) => { if (!item) return ''; return item[props.lightboxCoverField || props.coverField] || getCover(item); };
const getLightboxLink  = (item) => { if (!item) return ''; return item[props.lightboxLinkField  || props.linkField]  || getLink(item); };
const getBadgeText = (item) => { if (props.badgeLabel) return props.badgeLabel; if (props.badgeField && item) return item[props.badgeField] || ''; return ''; };

const dynamicOptions = computed(() => {
  const result = {};
  props.filters.forEach(f => {
    if (f.field === 'tags') return;
    const optField = f.optionsFrom || f.field;
    const set = new Set();
    items.value.forEach(item => {
      const val = item[optField];
      if (Array.isArray(val)) val.forEach(v => v && set.add(v));
      else if (val) set.add(val);
    });
    result[f.field] = [...set].sort();
  });
  return result;
});

const filteredList = computed(() => {
  return items.value.filter(item => {
    // 1. 單選分類過濾
    for (const f of singleSelectFilters.value) {
      const selected = filterValues[f.field];
      if (selected && selected !== 'All') {
        const optField = f.optionsFrom || f.field;
        const val = item[optField];
        if (Array.isArray(val)) { if (!val.includes(selected)) return false; }
        else { if (val !== selected) return false; }
      }
    }

    // 2. 多選標籤過濾 (OR / 只要命中其中任一標籤)
    if (selectedTags.value.length > 0) {
      let itemTags = [];
      if (Array.isArray(item.tags)) {
        itemTags = item.tags.map(t => String(t).trim());
      } else if (typeof item.tags === 'string') {
        itemTags = item.tags.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
      }
      const matched = selectedTags.value.some(t => itemTags.includes(t));
      if (!matched) return false;
    }

    // 3. 搜尋關鍵字
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return true;
    return props.searchFields.some(fieldName => {
      const val = item[fieldName];
      if (!val) return false;
      if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(q));
      return String(val).toLowerCase().includes(q);
    });
  });
});

const openLightbox  = (item) => { lightbox.value = { isOpen: true, item }; };
const closeLightbox = () => { lightbox.value.isOpen = false; lightbox.value.item = null; };

const loadData = () => { items.value = getStorageData(props.storageKey); };
defineExpose({ loadData });

onMounted(() => {
  loadData();
  if (props.highlightedId) {
    nextTick(() => {
      const el = document.getElementById(`item-${props.highlightedId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
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
  gap: 1.5rem;
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 100;
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

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--glow-primary);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.18rem 0.55rem;
  border-radius: 99px;
  line-height: 1.2;
}

.chip-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 0.65rem;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.chip-remove-btn:hover {
  background: var(--color-primary);
  color: #fff;
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
  cursor: pointer;
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

/* ── Card Media (恢復原始媒體區) ────────── */
.card-media-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  background: var(--bg-hover);
  cursor: pointer;
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

.media-ext-link {
  position: absolute;
  top: 0.65rem; right: 0.65rem;
  width: 32px; height: 32px;
  border-radius: 8px;
  background: var(--bg-input);
  backdrop-filter: blur(6px);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  opacity: 0.85;
  transform: scale(1);
  transition: all 0.2s ease;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}
.card-media-wrapper:hover .media-ext-link { opacity: 1; transform: scale(1.05); }
.media-ext-link:hover {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  transform: scale(1.12) !important;
  box-shadow: 0 4px 12px var(--glow-primary);
}

/* ── Card Body & Info (恢復原始內邊距與純粹底色) ── */
.card-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.research-card:hover .card-actions {
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
.action-icon-btn:hover { background: var(--bg-subtle); }
.action-icon-btn.edit:hover { color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); }
.action-icon-btn.delete:hover { color: #ef4444; border-color: rgba(239, 68, 68, 0.4); }

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.35;
  color: var(--text-primary);
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
.lightbox-media-box {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  max-height: 400px;
  display: flex; align-items: center; justify-content: center;
}
.lightbox-img {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
}
.lightbox-detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
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
}
.lightbox-footer { margin-top: 0.5rem; }
.source-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--glow-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  text-decoration: none;
}
.source-btn:hover { background: var(--color-primary); color: #fff; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (min-width: 1440px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 1280px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px)  { .cards-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) {
  .search-box { width: 100%; }
  .filter-toolbar { flex-direction: column; align-items: flex-start; }
  .filter-options { width: 100%; }
  .filter-select { flex: 1; }
}
</style>
