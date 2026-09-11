<template>
  <div class="filter-toolbar-wrapper">
    <div class="filter-toolbar glass-panel">
      <SearchInput
        class="search-box"
        :model-value="searchQuery"
        :placeholder="searchPlaceholder"
        @update:model-value="$emit('update:searchQuery', $event)"
      />

      <div v-if="showAdvanced" class="filter-options">
        <Dropdown
          v-for="f in filters"
          :key="f.field"
          class="custom-tag-dropdown"
          align="end"
        >
          <template #trigger="{ open, toggle, triggerProps }">
            <button
              type="button"
              class="filter-dropdown-btn"
              :class="{ active: open || getSelectedCount(f.field) > 0 }"
              v-bind="triggerProps"
              :aria-label="`篩選${getFilterZhTitle(f)}`"
              @click="toggle"
            >
              <Icon name="tag" :size="14" v-if="f.field === 'tags'" />
              <Icon name="filter" :size="14" v-else />
              <span>{{ getFilterButtonLabel(f) }}</span>
              <Icon name="chevron-down" :size="12" class="arrow" />
            </button>
          </template>

            <div class="tag-dropdown-menu">
              <div class="dropdown-heading">
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
        </Dropdown>

        <Dropdown class="custom-tag-dropdown" align="end">
          <template #trigger="{ open, toggle, triggerProps }">
            <button
              type="button"
              class="filter-dropdown-btn adv-filter-btn"
              :class="{ active: open || isAdvActive }"
              v-bind="triggerProps"
              aria-label="更多篩選與排序"
              @click="toggle"
            >
              <Icon name="sliders" :size="15" />
              <span>更多</span>
              <span v-if="activeAdvBadgeCount > 0" class="adv-active-count">{{ activeAdvBadgeCount }}</span>
              <Icon name="chevron-down" :size="12" class="arrow" />
            </button>
          </template>

            <div class="tag-dropdown-menu adv-filter-panel">
              <div class="adv-panel-section">
                <div class="adv-section-title">
                  <Icon name="arrow-down" :size="13" />
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

              <div class="adv-panel-section" v-if="creatorOptions && creatorOptions.length">
                <div class="adv-section-title between">
                  <div class="title-left">
                    <Icon name="user" :size="13" />
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
        </Dropdown>
      </div>
    </div>

    <div class="selected-tags-chips" v-if="totalSelectedChipsCount > 0">
      <span class="chips-label">已選條件：</span>
      <div class="chip-list">
        <template v-for="f in filters" :key="f.field">
          <div v-for="opt in multiFilterValues[f.field]" :key="opt" class="filter-chip">
            <small class="chip-category-prefix">{{ getFilterEnglishTitle(f) }}:</small>
            <span>{{ f.field === 'tags' ? '#' + opt : opt }}</span>
            <button class="chip-remove-btn" @click="$emit('remove-option', { field: f.field, opt })" title="移除條件">
              <Icon name="close" :size="8" :stroke-width="3" />
            </button>
          </div>
        </template>
      </div>
      <BaseButton variant="ghost" size="sm" class="reset-all-tags-btn" @click="$emit('reset-all')">清除全部篩選</BaseButton>
    </div>
  </div>
</template>

<script setup>
import SearchInput from './base/SearchInput.vue';
import Icon from './base/Icon.vue';
import BaseButton from './base/BaseButton.vue';
import Dropdown from './base/Dropdown.vue';
import { computed } from 'vue';

const props = defineProps({
  searchQuery: { type: String, default: '' },
  searchPlaceholder: { type: String, default: '搜尋...' },
  filters: { type: Array, default: () => [] },
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
</script>

<style scoped>
.filter-toolbar-wrapper {
  /* container 會讓這層變成新的疊層，所以層級要設在這裡，下拉選單才蓋得過卡片網格 */
  container: filter-bar / inline-size;
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.filter-toolbar {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-3);
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  gap: var(--space-3);
  width: 100%;
  box-sizing: border-box;
}

.search-box {
  /* 外觀由 SearchInput 負責，這裡只管在篩選列裡佔多寬 */
  width: 260px;
  flex: 0 1 260px;
  min-width: 140px;
}

.filter-options {
  display: flex;
  gap: var(--space-2);
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
  gap: var(--space-1);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--dur-base) var(--ease-standard), background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard);
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
  transition: transform var(--dur-base) var(--ease-standard);
}

.filter-dropdown-btn.active .arrow {
  transform: rotate(180deg);
}

/* 下拉內容：外框（背景、框線、陰影、位置）由 Dropdown 負責，這裡只管尺寸與內距 */
.tag-dropdown-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 240px;
  max-width: min(280px, 90vw);
  max-height: 320px;
  padding: var(--space-3);
}

.tag-dropdown-menu .dropdown-heading {
  padding: 0 0 var(--space-2);
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
  gap: var(--space-1);
  max-height: 240px;
}

.tag-option-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 32px;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--fs-meta);
  color: var(--text-primary);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-standard);
}

.tag-option-item:hover {
  background: var(--bg-hover);
}

.tag-option-item.selected {
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
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
  padding: var(--space-3);
}

.adv-panel-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.adv-section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.adv-section-title.between {
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.sort-grid-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-1);
}

.sort-chip-btn {
  padding: var(--space-2) var(--space-2);
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  color: var(--text-secondary);
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
  text-align: center;
}

.sort-chip-btn:hover {
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.sort-chip-btn.selected {
  background: var(--action-primary);
  color: var(--action-on-primary);
  border-color: var(--color-primary);
  font-weight: var(--fw-bold);
  box-shadow: var(--shadow-sm);
}

.adv-panel-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-3) 0;
  opacity: 0.6;
}

.adv-active-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  background: var(--action-primary);
  color: var(--action-on-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  border-radius: var(--radius-full);
}

.selected-tags-chips {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-subtle);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
}

.chips-label {
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--text-muted);
}

.chip-list {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--action-primary);
  color: var(--action-on-primary);
  border: 1px solid var(--color-primary);
  box-shadow: var(--shadow-sm);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  line-height: var(--lh-tight);
  
}
.filter-chip span {
  text-box: trim-both cap alphabetic;
}

.chip-category-prefix {
  opacity: 0.9;
  font-weight: var(--fw-semibold);
  color: var(--action-on-primary);
}

.chip-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  font-size: var(--fs-meta);
  color: var(--action-on-primary);
  background: color-mix(in srgb, var(--action-on-primary) 25%, transparent);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
  border: none;
}

.chip-remove-btn:hover {
  background: color-mix(in srgb, var(--action-on-primary) 45%, transparent);
  color: var(--action-on-primary);
}

.reset-all-tags-btn {
  margin-left: auto;
}

/* 容器寬度 ≤920px 時直排（平板一定會落在這裡；1024–1250 的筆電內容區也不夠放一排） */
@container filter-bar (max-width: 920px) {
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
    padding: var(--space-3);
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
    gap: var(--space-2);
  }
  .filter-dropdown-btn {
    font-size: var(--fs-meta);
    padding: var(--space-1) var(--space-2);
  }
  /* 直排時選單改成靠左展開，最後一個（更多）靠右，才不會超出畫面 */
  .custom-tag-dropdown :deep(.dropdown-panel) {
    left: 0;
    right: auto;
  }
  .custom-tag-dropdown:last-child :deep(.dropdown-panel) {
    left: auto;
    right: 0;
  }
  .tag-dropdown-menu {
    width: min(260px, calc(100vw - 2.5rem));
  }
}

@media (pointer: coarse) {
  .filter-dropdown-btn {
    min-height: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .filter-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
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
