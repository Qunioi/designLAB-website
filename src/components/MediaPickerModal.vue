<template>
  <!-- 「從一堆卡片裡挑」的彈窗：管理精選、媒體庫共用。
       標題列（圖示＋標題＋副標）→ 工具列（分頁篩選＋搜尋＋額外按鈕）→ 卡片網格／空狀態 → 底部列。
       分頁與搜尋用 v-model:tab、v-model:search；卡片放 default slot，沒有東西時放 empty slot 並設 empty。 -->
  <BaseModal
    :open="open"
    size="lg"
    fixed-height
    :layer="layer"
    :panel-class="['media-picker', panelClass]"
    :close-label="closeLabel"
    :close-on-esc="closeOnEsc"
    @close="$emit('close')"
  >
    <template #header>
      <span class="media-picker-icon" aria-hidden="true"><Icon :name="icon" :size="20" /></span>
      <span class="media-picker-titles">
        <span class="media-picker-title">{{ title }}<slot name="title-extra" /></span>
        <span v-if="subtitle" class="media-picker-subtitle">{{ subtitle }}</span>
      </span>
    </template>

    <div class="media-picker-toolbar">
      <div class="media-picker-tabs" role="group" :aria-label="tabsLabel">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          class="media-picker-tab"
          :class="{ 'is-active': t.value === tab }"
          :aria-pressed="t.value === tab ? 'true' : 'false'"
          @click="$emit('update:tab', t.value)"
        >{{ t.label }}</button>
      </div>
      <div class="media-picker-actions">
        <slot name="toolbar-start" />
        <SearchInput
          class="media-picker-search"
          size="sm"
          :model-value="search"
          :placeholder="searchPlaceholder"
          @update:model-value="$emit('update:search', $event)"
        />
        <slot name="toolbar-end" />
      </div>
    </div>

    <slot v-if="empty" name="empty" />
    <div v-else class="media-picker-grid" :style="{ '--picker-card-min': cardMinWidth }">
      <slot />
    </div>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './base/BaseModal.vue';
import Icon from './base/Icon.vue';
import SearchInput from './base/SearchInput.vue';

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'folder' },
  closeLabel: { type: String, default: '關閉' },
  closeOnEsc: { type: Boolean, default: true },
  layer: { type: String, default: 'modal' },
  panelClass: { type: String, default: '' },
  // [{ value, label }]
  tabs: { type: Array, default: () => [] },
  tab: { type: String, default: '' },
  tabsLabel: { type: String, default: '篩選' },
  search: { type: String, default: '' },
  searchPlaceholder: { type: String, default: '搜尋…' },
  empty: { type: Boolean, default: false },
  // 卡片最小寬度，網格會依彈窗寬度自動決定一列放幾張
  cardMinWidth: { type: String, default: '150px' }
});

defineEmits(['close', 'update:tab', 'update:search']);
</script>

<style scoped>
.media-picker-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--color-primary);
}

.media-picker-titles {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.media-picker-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.media-picker-subtitle {
  font-size: var(--fs-meta);
  font-weight: var(--fw-regular);
  color: var(--text-muted);
}

.media-picker-toolbar {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--modal-padding);
  border-bottom: 1px solid var(--border-color);
}

.media-picker-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
}

.media-picker-tab {
  padding: var(--space-1) var(--space-3);
  border: 0;
  border-radius: var(--radius-xs);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
}

.media-picker-tab:hover {
  color: var(--text-primary);
}

.media-picker-tab.is-active {
  background: var(--surface-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.media-picker-tab:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

.media-picker-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.media-picker-search {
  width: 220px;
}

/* 固定高度的網格要 max-content，否則卡片會被壓扁、下半部被切掉 */
.media-picker-grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fill, minmax(var(--picker-card-min, 150px), 1fr));
  grid-auto-rows: max-content;
  align-content: start;
  gap: var(--space-4);
  min-height: 0;
  padding: var(--space-5) var(--modal-padding);
  overflow-y: auto;
  overscroll-behavior: contain;
}

@media (max-width: 640px) {
  .media-picker-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .media-picker-actions {
    flex-wrap: wrap;
  }

  .media-picker-search {
    flex: 1;
    width: auto;
    min-width: 160px;
  }

  .media-picker-grid {
    padding: var(--space-4);
  }
}

@media (pointer: coarse) {
  .media-picker-tab {
    min-height: var(--control-height-lg);
  }
}
</style>
