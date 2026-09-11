<template>
  <!-- 主題選擇：淺色／深色兩組主題卡。
       每張卡掛著該主題的 class，預覽圖直接讀那個主題的 token（頁面底色、側欄、文字、主色、卡片、框線），
       主題調色時預覽會自動跟著變，不用另外維護一份色碼。 -->
  <div class="theme-picker">
    <div v-for="group in THEME_GROUPS" :key="group.label" class="theme-group">
      <h3 class="theme-group-label">{{ group.label }}</h3>
      <div class="theme-cards-row">
        <SelectCard
          v-for="theme in group.themes"
          :key="theme.class"
          class="theme-card"
          :class="theme.class"
          selectable
          :selected="modelValue === theme.class"
          :label="`套用 ${theme.name} 主題`"
          :media-frame="false"
          body-class="theme-card-footer"
          @toggle="$emit('update:modelValue', theme.class)"
        >
          <template #media>
            <div class="theme-preview" aria-hidden="true">
              <div class="preview-sidebar"></div>
              <div class="preview-body">
                <div class="preview-line long"></div>
                <div class="preview-line short"></div>
                <div class="preview-cards-row">
                  <div class="preview-mini-card"></div>
                  <div class="preview-mini-card"></div>
                </div>
              </div>
            </div>
          </template>
          <h4 class="theme-name">{{ theme.name }}</h4>
        </SelectCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import SelectCard from './base/SelectCard.vue';

defineProps({
  modelValue: { type: String, default: '' }
});

defineEmits(['update:modelValue']);

// 8 套主題：class 對應 tokens.css 的主題區塊
const THEME_GROUPS = [
  {
    label: 'Light Themes',
    themes: [
      { class: 'theme-cloud-canvas', name: 'Cloud Canvas' },
      { class: 'theme-material-light', name: 'Material Light' },
      { class: 'theme-office-access', name: 'Office Access' },
      { class: 'theme-nord-light', name: 'Nord Snow' }
    ]
  },
  {
    label: 'Dark Themes',
    themes: [
      { class: 'theme-midnight-indigo', name: 'Palenight Theme' },
      { class: 'theme-github-dark', name: 'Graphite Blue' },
      { class: 'theme-obsidian-neon', name: 'Ember Atelier' },
      { class: 'theme-nord-dark', name: 'Nord Polar Night' }
    ]
  }
];
</script>

<style scoped>
/* 主題卡欄數看這個元件自己的寬度，不看視窗 */
.theme-picker {
  container: theme-picker / inline-size;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.theme-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.theme-group-label {
  margin: 0;
  padding-bottom: var(--space-1);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.theme-cards-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@container theme-picker (max-width: 640px) {
  .theme-cards-row { grid-template-columns: repeat(3, 1fr); }
}

@container theme-picker (max-width: 460px) {
  .theme-cards-row { grid-template-columns: repeat(2, 1fr); }
}

@container theme-picker (max-width: 280px) {
  .theme-cards-row { grid-template-columns: 1fr; }
}

/* 迷你版面預覽：顏色全部來自卡片身上那個主題的 token */
.theme-preview {
  display: flex;
  height: 90px;
  margin: var(--space-2) var(--space-2) 0;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--surface-page);
}

.preview-sidebar {
  width: 26%;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
}

.preview-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
}

.preview-line {
  height: 4px;
  border-radius: var(--radius-full);
}

.preview-line.long {
  width: 75%;
  background: var(--text-secondary);
  opacity: 0.7;
}

.preview-line.short {
  width: 45%;
  background: var(--color-primary);
}

.preview-cards-row {
  display: flex;
  gap: 5px;
  margin-top: auto;
}

.preview-mini-card {
  flex: 1;
  height: 22px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  background: var(--surface-card);
}

.theme-name {
  margin: 0;
  overflow: hidden;
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
