<template>
  <div class="filter-toolbar-wrapper">
    <!-- 上方搜尋框與篩選下拉按鈕工具列 -->
    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          :placeholder="searchPlaceholder"
        />
      </div>

      <div v-if="showAdvanced" class="filter-options">
        <!-- 分類/標籤多選選單 -->
        <div
          v-for="f in filters"
          :key="f.field"
          class="custom-tag-dropdown"
        >
          <button
            type="button"
            class="filter-dropdown-btn"
            :class="{ active: activeDropdown === f.field || getSelectedCount(f.field) > 0 }"
            :aria-expanded="activeDropdown === f.field ? 'true' : 'false'"
            :aria-label="`篩選${getFilterZhTitle(f)}`"
            @click.stop="$emit('toggle-dropdown', f.field)"
          >
            <svg v-if="f.field === 'tags'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <span>{{ getFilterButtonLabel(f) }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <Transition name="fade">
            <div class="tag-dropdown-menu glass-panel" v-if="activeDropdown === f.field" @click.stop>
              <div class="tag-dropdown-header">
                <span>選擇 {{ f.zhLabel || getFilterZhTitle(f) }} (可多選)</span>
                <button class="clear-btn" v-if="getSelectedCount(f.field) > 0" @click="$emit('clear-filter-field', f.field)">清除全部</button>
              </div>
              <div class="tag-options-list">
                <label
                  v-for="opt in dynamicOptions[f.field]"
                  :key="opt"
                  class="tag-option-item"
                  :class="{ selected: isOptionSelected(f.field, opt) }"
                >
                  <input
                    type="checkbox"
                    :checked="isOptionSelected(f.field, opt)"
                    @change="$emit('toggle-option', { field: f.field, opt })"
                  />
                  <span>{{ f.field === 'tags' ? '# ' + opt : opt }}</span>
                </label>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 高級篩選與排序整合選單 (採用圖一控制器/調音器 Sliders Icon) -->
        <div class="custom-tag-dropdown">
          <button
            type="button"
            class="filter-dropdown-btn adv-filter-btn"
            :class="{ active: activeDropdown === 'adv_filter' || isAdvActive }"
            :aria-expanded="activeDropdown === 'adv_filter' ? 'true' : 'false'"
            aria-label="更多篩選與排序"
            @click.stop="$emit('toggle-dropdown', 'adv_filter')"
          >
            <!-- 控制器 Sliders SVG Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            <span>更多</span>
            <span v-if="activeAdvBadgeCount > 0" class="adv-active-count">{{ activeAdvBadgeCount }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <Transition name="fade">
            <div class="tag-dropdown-menu glass-panel adv-filter-panel" v-if="activeDropdown === 'adv_filter'" @click.stop>
              <!-- 1. 排序選擇區塊 -->
              <div class="adv-panel-section">
                <div class="adv-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  <span>日期與名稱排序</span>
                </div>
                <div class="sort-grid-options">
                  <button
                    v-for="opt in sortOptions"
                    :key="opt.value"
                    type="button"
                    class="sort-chip-btn"
                    :class="{ selected: sortOption === opt.value }"
                    @click="$emit('update:sortOption', opt.value)"
                  >
                    <span>{{ opt.label }}</span>
                  </button>
                </div>
              </div>

              <div class="adv-panel-divider"></div>

              <!-- 2. 建立者選擇區塊 -->
              <div class="adv-panel-section" v-if="creatorOptions && creatorOptions.length">
                <div class="adv-section-title between">
                  <div class="title-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>依建立者篩選</span>
                  </div>
                  <button class="clear-btn" v-if="selectedCreators && selectedCreators.length > 0" @click="$emit('clear-creators')">清除建立者</button>
                </div>
                <div class="tag-options-list creator-list">
                  <label
                    v-for="c in creatorOptions"
                    :key="c"
                    class="tag-option-item"
                    :class="{ selected: selectedCreators && selectedCreators.includes(c) }"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedCreators && selectedCreators.includes(c)"
                      @change="$emit('toggle-creator', c)"
                    />
                    <span>{{ c }}</span>
                  </label>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 已選條件 Chip 膠囊條 -->
    <div class="selected-tags-chips" v-if="totalSelectedChipsCount > 0">
      <span class="chips-label">已選條件：</span>
      <div class="chip-list">
        <template v-for="f in filters" :key="f.field">
          <span v-for="opt in multiFilterValues[f.field]" :key="opt" class="tag-chip">
            <small class="chip-category-prefix">{{ getFilterEnglishTitle(f) }}:</small>
            {{ f.field === 'tags' ? '#' + opt : opt }}
            <button class="chip-remove-btn" @click="$emit('remove-option', { field: f.field, opt })" title="移除條件">✕</button>
          </span>
        </template>
      </div>
      <button class="reset-all-tags-btn" @click="$emit('reset-all')">清除全部篩選</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  searchQuery: { type: String, default: '' },
  searchPlaceholder: { type: String, default: '搜尋...' },
  filters: { type: Array, default: () => [] },
  activeDropdown: { type: String, default: '' },
  multiFilterValues: { type: Object, default: () => ({}) },
  dynamicOptions: { type: Object, default: () => ({}) },
  creatorOptions: { type: Array, default: () => [] },
  selectedCreators: { type: Array, default: () => [] },
  sortOption: { type: String, default: 'newest' },
  totalSelectedChipsCount: { type: Number, default: 0 },
  showAdvanced: { type: Boolean, default: true }
});

defineEmits([
  'update:searchQuery',
  'toggle-dropdown',
  'clear-filter-field',
  'toggle-option',
  'remove-option',
  'toggle-creator',
  'clear-creators',
  'update:sortOption',
  'reset-all'
]);

const sortOptions = [
  { value: 'newest', label: '最新建立' },
  { value: 'oldest', label: '最早建立' },
  { value: 'updated', label: '最近更新' },
  { value: 'title', label: '標題 A-Z' }
];

const isAdvActive = computed(() => {
  return (props.selectedCreators && props.selectedCreators.length > 0) || props.sortOption !== 'newest';
});

const activeAdvBadgeCount = computed(() => {
  let count = props.selectedCreators?.length || 0;
  if (props.sortOption !== 'newest') count += 1;
  return count;
});

const getSelectedCount = (field) => {
  return props.multiFilterValues[field]?.length || 0;
};

const isOptionSelected = (field, opt) => {
  return props.multiFilterValues[field]?.includes(opt) || false;
};

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
</script>

<style scoped>
.filter-toolbar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.filter-toolbar {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

/* 搜尋框：固定合適寬度，不無限擴張擠壓篩選按鈕 */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  height: 36px;
  padding: 0.35rem 0.75rem;
  border-radius: 10px;
  width: 260px;
  flex: 0 1 260px;
  min-width: 140px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-box:focus-within {
  border-color: var(--color-primary);
}

.search-box input {
  font-size: var(--fs-label);
  width: 100%;
  min-height: 0;
  background: transparent;
  color: var(--text-primary);
  border: none;
  outline: none;
}

.search-box svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

/* 篩選按鈕區塊 */
.filter-options {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex: 1 1 auto;
  min-width: 0;
}

.custom-tag-dropdown {
  position: relative;
  flex-shrink: 0;
}

.filter-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.65rem;
  border-radius: 9px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  font-family: var(--font-body);
  height: 36px;
  white-space: nowrap;
  box-sizing: border-box;
}

.filter-dropdown-btn svg {
  width: 10px;
  height: 10px;
}

.filter-dropdown-btn:hover,
.filter-dropdown-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--bg-hover);
}

.filter-dropdown-btn .arrow {
  transition: transform 0.2s ease;
}

.filter-dropdown-btn.active .arrow {
  transform: rotate(180deg);
}

/* 下拉選單：安全定位，不跑出螢幕 */
.tag-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 240px;
  max-width: min(280px, 90vw);
  max-height: 320px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.75rem;
  z-index: 500;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-sizing: border-box;
}

.tag-dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7175rem;
  color: var(--text-muted);
  font-weight: 600;
  padding-bottom: 0.4rem;
  white-space: nowrap;
  border-bottom: 1px solid var(--border-color);
}

.clear-btn {
  color: var(--color-primary);
  font-size: var(--fs-meta);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.clear-btn:hover {
  text-decoration: underline;
}

.tag-options-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  max-height: 240px;
}

.tag-option-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 32px;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7625rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s ease;
}

.tag-option-item:hover {
  background: var(--bg-hover);
}

.tag-option-item.selected {
  color: var(--color-primary);
  font-weight: 600;
}

.tag-option-item input[type="checkbox"] {
  accent-color: var(--color-primary);
  cursor: pointer;
  min-height: 0;
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
}

.adv-filter-panel {
  width: 280px;
  max-width: min(300px, 90vw);
  padding: 0.85rem;
}

.adv-panel-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.adv-section-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7175rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.adv-section-title.between {
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sort-grid-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
}

.sort-chip-btn {
  padding: 0.45rem 0.6rem;
  font-size: 0.7175rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
  text-align: center;
}

.sort-chip-btn:hover {
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.sort-chip-btn.selected {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.adv-panel-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.75rem 0;
  opacity: 0.6;
}

.adv-active-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  background: var(--color-primary);
  color: #ffffff;
  font-size: var(--fs-meta);
  font-weight: 700;
  border-radius: 99px;
}

.selected-tags-chips {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.75rem;
  background: var(--bg-subtle);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
}

.chips-label {
  font-size: 0.7875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.chip-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--color-primary);
  color: #ffffff;
  border: 1px solid var(--color-primary);
  box-shadow: var(--shadow-sm);
  font-size: 0.7375rem;
  font-weight: 600;
  padding: 0.22rem 0.65rem;
  border-radius: 99px;
  line-height: 1.2;
}

.chip-category-prefix {
  opacity: 0.9;
  font-weight: 600;
  color: #ffffff;
}

.chip-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  font-size: 0.5875rem;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
  border: none;
}

.chip-remove-btn:hover {
  background: rgba(255, 255, 255, 0.45);
  color: #ffffff;
}

.reset-all-tags-btn {
  font-size: 0.7375rem;
  color: var(--text-secondary);
  cursor: pointer;
  margin-left: auto;
  background: none;
  border: none;
}

.reset-all-tags-btn:hover {
  color: var(--color-danger);
  text-decoration: underline;
}

/* 響應式斷點：平板與中螢幕 (<= 960px) */
@media (max-width: 960px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.6rem;
    padding: 0.75rem;
  }
  .search-box {
    width: 100%;
    flex: none;
    max-width: 100%;
  }
  .filter-options {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
    gap: 0.4rem;
  }
  .filter-dropdown-btn {
    font-size: 0.7375rem;
    padding: 0.35rem 0.55rem;
  }
  .search-box,
  .filter-dropdown-btn {
    min-height: 44px;
    height: 44px;
  }
  .tag-dropdown-menu {
    left: 0;
    right: auto;
    width: min(260px, calc(100vw - 2.5rem));
  }
  .custom-tag-dropdown:last-child .tag-dropdown-menu {
    left: auto;
    right: 0;
  }
}

/* 手機極窄螢幕 (<= 480px) */
@media (max-width: 480px) {
  .filter-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
  .custom-tag-dropdown {
    width: 100%;
  }
  .filter-dropdown-btn {
    width: 100%;
    justify-content: space-between;
  }
  .tag-dropdown-menu {
    width: min(280px, calc(100vw - 1.5rem));
  }
}
</style>
