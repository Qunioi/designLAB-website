<template>
  <div class="dashboard-container">
    <PageHeader
      title="從一個設計問題開始"
      subtitle="搜尋研究案例、整理設計洞察，或查看目前的優化提案，快速找到下一個可執行的方向。"
      :add-btn-label="isAdmin ? '管理精選' : ''"
      @add-click="featuredManagerOpen = true"
    />

    <div class="bento-grid">
      <section class="dashboard-overview glass-panel">
      <div class="bento-card welcome-card">
        <div class="welcome-content">
          <button class="search-trigger" @click="$emit('open-search')">
            <Icon name="search" :size="16" />
            <span>搜尋研究、提案與工具...</span>
            <kbd class="kbd-badge">⌘ K</kbd>
          </button>
        </div>
      </div>

      </section>

      <SectionBlock title="最新更新" class="dashboard-latest">
        <CardGrid :class="{ 'stagger-in': staggerIntro }">
          <template v-if="showSkeleton">
            <div v-for="n in 4" :key="`skeleton-${n}`" class="card-panel skeleton-card" aria-hidden="true">
              <span class="skeleton-block skeleton-media"></span>
              <div class="skeleton-body">
                <span class="skeleton-block skeleton-line is-badge"></span>
                <span class="skeleton-block skeleton-line is-title"></span>
                <span class="skeleton-block skeleton-line is-short"></span>
              </div>
            </div>
          </template>
            <ContentCard
              v-for="item in recentItems"
              :key="item.id"
              hit="card"
              title-tag="h4"
              :title="item.title || item.name"
              :cover="item.cover || item.screenshot || item.logo"
              :placeholder="(item.title || item.name || '?').charAt(0)"
              @open="handleRecentClick(item)"
            >
              <template #meta>
                <Chip variant="type">{{ item.typeLabel }}</Chip>
              </template>
              <template #meta-end>
                <time v-if="item.updatedAt || item.createdAt" class="card-time-text">{{ formatDate(item.updatedAt || item.createdAt) }}</time>
              </template>
              <p v-if="isTextDescType(item)" class="card-desc one-line">{{ item.useCase || item.desc }}</p>
              <div v-else-if="item.tags?.length" class="card-tags">
                <Chip v-for="tag in normalizedTags(item.tags).slice(0, 2)" :key="tag" variant="tag">{{ tag }}</Chip>
              </div>
            </ContentCard>
        </CardGrid>
      </SectionBlock>

      <SectionBlock v-if="featuredItems.length" title="精選內容" class="dashboard-featured">
        <CardGrid :class="{ 'stagger-in': staggerIntro }">
            <ContentCard
              v-for="item in featuredItems"
              :key="`featured-${item.type}-${item.id}`"
              hit="card"
              title-tag="h4"
              :title="item.title || item.name"
              :cover="item.cover || item.screenshot || item.logo"
              :placeholder="(item.title || item.name || '?').charAt(0)"
              @open="handleRecentClick(item)"
            >
              <template #meta>
                <Chip variant="type">{{ item.typeLabel }}</Chip>
              </template>
              <template #meta-end>
                <time v-if="item.updatedAt || item.createdAt" class="card-time-text">{{ formatDate(item.updatedAt || item.createdAt) }}</time>
              </template>
              <p v-if="isTextDescType(item)" class="card-desc one-line">{{ item.useCase || item.desc }}</p>
              <div v-else-if="item.tags?.length" class="card-tags">
                <Chip v-for="tag in normalizedTags(item.tags).slice(0, 2)" :key="tag" variant="tag">{{ tag }}</Chip>
              </div>
            </ContentCard>
        </CardGrid>
      </SectionBlock>

      <div v-if="false" class="bento-card ai-prompt-card glass-panel">
        <div class="card-header">
          <div class="header-title-group">
            <h3>熱門 AI 工具</h3>
          </div>
          <div class="header-actions">
            <button 
              class="cycle-btn" 
              @click.stop="nextPrompt" 
              title="切換下一個 Prompt"
              v-if="aiPromptsList.length > 1"
            >
              <Icon name="refresh" :size="13" />
              <span>換一個</span>
            </button>
            <button class="card-action-link" type="button" @click.stop="$emit('change-view', 'AICenter')">前往 AI Center →</button>
          </div>
        </div>

        <div class="ai-card-content">
          <div class="ai-usecase-row" v-if="currentPrompt?.useCase">
            <span class="usecase-tag"><span class="dot"></span> {{ currentPrompt?.fullTitle || currentPrompt?.name }}</span>
          </div>

          <PromptCodeBox :prompt="currentPrompt?.prompt" :copied="copied" @copy="copyPrompt" />
        </div>
      </div>
    </div>

  <MediaPickerModal
    :open="featuredManagerOpen"
    title="管理精選內容"
    subtitle="勾選要顯示在 Dashboard「精選內容」的項目，選幾筆就顯示幾筆"
    icon="star"
    close-label="關閉管理精選"
    panel-class="featured-manager"
    :tabs="featuredPickerTabs"
    v-model:tab="featuredFilter"
    tabs-label="依類型篩選"
    v-model:search="featuredSearch"
    search-placeholder="搜尋標題…"
    :empty="filteredManagerItems.length === 0"
    @close="closeFeaturedManager"
  >
    <template #title-extra>
      <span class="header-selected-count">已選 {{ featuredItems.length }} 筆</span>
    </template>
    <template #toolbar-start>
      <button
        type="button"
        class="quick-filter-toggle"
        :class="{ active: featuredShowSelectedOnly }"
        :aria-pressed="featuredShowSelectedOnly ? 'true' : 'false'"
        @click="featuredShowSelectedOnly = !featuredShowSelectedOnly"
      >
        <Icon name="check" :size="13" :stroke-width="2.5" />
        只看已選取
      </button>
    </template>
    <template #empty>
      <EmptyState
        fill
        icon="search"
        title="找不到符合條件的項目"
        description="請調整搜尋關鍵字、切換上方類型篩選，或取消「只看已選取」。"
      />
    </template>

    <SelectCard
            v-for="(item, index) in filteredManagerItems"
            :key="managerItemKey(item, index)"
            class="featured-card"
            :class="{ 'is-saving': isSavingFeatured }"
            selectable
            multiple
            :selected="isCardSelected(item)"
            :label="`${isCardSelected(item) ? '移除精選' : '設為精選'}：${item.title || item.name}`"
            media-class="featured-card-media"
            body-class="featured-card-info"
            @toggle="toggleFeatured(item)"
          >
            <template #media>
              <img v-if="item.cover || item.screenshot || item.logo" :src="item.cover || item.screenshot || item.logo" alt="" loading="lazy" />
              <span v-else class="featured-card-fallback" aria-hidden="true">{{ (item.title || item.name || '?').charAt(0) }}</span>
            </template>
            <strong :title="item.title || item.name">{{ item.title || item.name }}</strong>
            <Chip variant="type">{{ item.typeLabel }}</Chip>
          </SelectCard>

    <template #footer>
      <span class="base-modal-status">已選取 {{ pendingFeaturedCount }} 筆<template v-if="isFeaturedDirty">（尚未儲存）</template></span>
      <BaseButton variant="primary" :loading="isSavingFeatured" v-if="isFeaturedDirty" type="button" @click="saveFeaturedChanges">
        儲存
      </BaseButton>
    </template>
  </MediaPickerModal>
  </div>
</template>

<script setup>
import SelectCard from '../components/base/SelectCard.vue';
import EmptyState from '../components/base/EmptyState.vue';
import Chip from '../components/base/Chip.vue';
import CardGrid from '../components/base/CardGrid.vue';
import ContentCard from '../components/base/ContentCard.vue';
import SectionBlock from '../components/base/SectionBlock.vue';
import { confirmDialog } from '../utils/confirm';
import MediaPickerModal from '../components/MediaPickerModal.vue';
import Icon from '../components/base/Icon.vue';
import BaseButton from '../components/base/BaseButton.vue';
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue';
import { identityVersion } from '../utils/identity';
import PageHeader from '../components/PageHeader.vue';
import PromptCodeBox from '../components/PromptCodeBox.vue';
import { getStorageData, addOrUpdateItem } from '../utils/storage';
import { isAdminUser } from '../utils/userStore';
import { useStaggerIntro } from '../utils/motion';

defineProps({
  highlightedId: { type: [String, Number], default: '' },
  nickname: { type: String, default: '' },
  username: { type: String, default: '' },
  currentTheme: { type: String, default: '' }
});

const emit = defineEmits([
  'change-view',
  'open-search',
  'trigger-crud',
  'delete-done',
  'navigate-detail',
  'navigate-to-view',
  'open-lightbox',
  'close-lightbox',
  'update-nickname',
  'update-user',
  'select-theme'
]);

const refreshTrigger = ref(0);
const featuredManagerOpen = ref(false);
const handleStorageUpdated = () => {
  refreshTrigger.value++;
};

// 管理精選：勾選只改本機暫存，按「儲存」才寫入。
// itemId → 使用者在這次開啟彈窗期間，暫定要改成的 featured 值；
// 只存「跟目前已儲存狀態不同」的項目，空物件＝目前沒有未儲存的變更。
const pendingFeaturedOverrides = ref({});
const isFeaturedDirty = computed(() => Object.keys(pendingFeaturedOverrides.value).length > 0);
const isSavingFeatured = ref(false);
watch(featuredManagerOpen, open => {
  if (!open) {
    pendingFeaturedOverrides.value = {};
    isSavingFeatured.value = false;
  }
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('design-lab-storage-updated', handleStorageUpdated);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('design-lab-storage-updated', handleStorageUpdated);
  }
});


const isAdmin = computed(() => {
  identityVersion.value; // 登出／權杖過期／身分模擬切換時重新判斷
  const _ = refreshTrigger.value;
  return isAdminUser();
});

const normalizeContent = (key, type, typeLabel) => getStorageData(key).map(item => ({ ...item, type, typeLabel }));
const allContentItems = computed(() => {
  const _ = refreshTrigger.value;
  return [
    ...normalizeContent('UI_RESEARCH', 'ui', 'UI 設計研究'),
    ...normalizeContent('MOTION_RESEARCH', 'motion', '動態研究'),
    ...normalizeContent('COMPETITORS', 'competitor', '競品分析'),
    ...normalizeContent('AI_CENTER', 'ai', 'AI 工具'),
    ...normalizeContent('RESOURCES', 'resource', '設計資源')
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
});
const isFeatured = item => item.featured === true || item.featured === 'true' || item.featured === 1 || item.featured === '1';
const featuredItems = computed(() => allContentItems.value.filter(isFeatured));
const isSyncing = inject('isSyncing', ref(false));
const showSkeleton = computed(() => isSyncing.value && allContentItems.value.length === 0);
// 彈窗裡的勾選狀態看暫存值；首頁真正顯示的精選內容只看 isFeatured，儲存前不受影響
const isCardSelected = item => Object.prototype.hasOwnProperty.call(pendingFeaturedOverrides.value, item.id)
  ? pendingFeaturedOverrides.value[item.id]
  : isFeatured(item);
const pendingFeaturedCount = computed(() => allContentItems.value.filter(isCardSelected).length);

const featuredFilter = ref('ui');
const featuredSearch = ref('');
const featuredShowSelectedOnly = ref(false);
const featuredTypeTabs = [
  { type: 'ui', label: 'UI 設計研究' },
  { type: 'motion', label: '動態研究' },
  { type: 'competitor', label: '競品分析' },
  { type: 'ai', label: 'AI 工具中心' },
  { type: 'resource', label: '設計資源' }
];
const featuredPickerTabs = computed(() => featuredTypeTabs.map(tab => ({
  value: tab.type,
  label: `${tab.label} (${featuredCounts.value[tab.type].selected}/${featuredCounts.value[tab.type].total})`
})));
// 每個類型「已選取／總筆數」都要顯示，只印已選取數字容易讓人誤會
// 該類型本來就沒有項目（例如剛好都還沒勾選）。
const featuredCounts = computed(() => {
  const counts = {};
  featuredTypeTabs.forEach(tab => {
    const itemsInType = allContentItems.value.filter(item => item.type === tab.type);
    counts[tab.type] = { selected: itemsInType.filter(isCardSelected).length, total: itemsInType.length };
  });
  return counts;
});
const filteredManagerItems = computed(() => {
  let list = allContentItems.value.filter(item => item.type === featuredFilter.value);
  if (featuredShowSelectedOnly.value) {
    list = list.filter(isCardSelected);
  }
  const q = featuredSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(item => (item.title || item.name || '').toLowerCase().includes(q));
  }
  return list;
});
const managerItemKey = (item, index) => `manage-${item.type}-${item.id || item.sourceUrl || item.url || item.title || item.name || index}`;
const FEATURED_TYPE_KEY_MAP = { ui: 'UI_RESEARCH', motion: 'MOTION_RESEARCH', competitor: 'COMPETITORS', ai: 'AI_CENTER', resource: 'RESOURCES' };

const toggleFeatured = item => {
  if (!isAdmin.value || isSavingFeatured.value) return;
  const id = item.id;
  const next = !isCardSelected(item);
  const overrides = { ...pendingFeaturedOverrides.value };
  if (next === isFeatured(item)) {
    delete overrides[id];
  } else {
    overrides[id] = next;
  }
  pendingFeaturedOverrides.value = overrides;
};

const saveFeaturedChanges = async () => {
  if (isSavingFeatured.value || !isFeaturedDirty.value) return;
  isSavingFeatured.value = true;
  try {
    const changedIds = Object.keys(pendingFeaturedOverrides.value);
    await Promise.all(changedIds.map(id => {
      const item = allContentItems.value.find(i => i.id === id);
      if (!item) return Promise.resolve();
      const { type, typeLabel, ...storedItem } = item;
      const key = FEATURED_TYPE_KEY_MAP[item.type];
      // silent：只是勾選精選，不算「編輯內容」——不動 updatedAt，卡片才不會
      // 因為排序依據（最後更新時間）改變而在列表中跳位置。
      const { synced } = addOrUpdateItem(key, { ...storedItem, featured: pendingFeaturedOverrides.value[id] }, { silent: true });
      return synced;
    }));
  } finally {
    // 成功或失敗都清空暫存：失敗的項目 rollbackWrite_ 已還原，改回看 isFeatured() 都會正確
    pendingFeaturedOverrides.value = {};
    isSavingFeatured.value = false;
  }
};

const closeFeaturedManager = async () => {
  if (isSavingFeatured.value) return;
  if (isFeaturedDirty.value) {
    const discard = await confirmDialog({
      title: '放棄尚未儲存的變更？',
      message: '精選內容的勾選還沒有儲存，關閉後這些變更會消失。',
      confirmText: '放棄變更',
      cancelText: '繼續編輯',
      danger: true
    });
    if (!discard) return;
  }
  featuredManagerOpen.value = false;
};
const normalizedTags = tags => Array.isArray(tags) ? tags : String(tags || '').split(/[,/，#\n\r]+/).map(tag => tag.trim()).filter(Boolean);
// AI 工具中心／設計資源這兩種類型在卡片上不顯示標籤，改顯示一行文字描述
const isTextDescType = item => item.type === 'ai' || item.type === 'resource';
const formatDate = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const proposalStats = computed(() => {
  const _ = refreshTrigger.value;
  const list = getStorageData('PROPOSALS');
  return {
    idea: list.filter(p => p.status === 'Idea').length,
    evaluating: list.filter(p => p.status === 'Evaluating').length,
    prototype: list.filter(p => p.status === 'Prototype').length,
    approved: list.filter(p => p.status === 'Approved').length
  };
});

const recentItems = computed(() => {
  const _ = refreshTrigger.value;
  const ui = getStorageData('UI_RESEARCH').map(i => ({ ...i, type: 'ui', typeLabel: 'UI 設計研究' }));
  const motion = getStorageData('MOTION_RESEARCH').map(i => ({ ...i, type: 'motion', typeLabel: '動態研究' }));
  const competitors = getStorageData('COMPETITORS').map(i => ({ ...i, type: 'competitor', typeLabel: '競品分析' }));
  const ai = getStorageData('AI_CENTER').map(i => ({ ...i, type: 'ai', typeLabel: 'AI 工具' }));
  const resources = getStorageData('RESOURCES').map(i => ({ ...i, type: 'resource', typeLabel: '設計資源' }));

  return [...ui, ...motion, ...competitors, ...ai, ...resources]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 4);
});

const staggerIntro = useStaggerIntro('dashboard', () => !showSkeleton.value && recentItems.value.length > 0);

import { copyToClipboard } from '../utils/clipboard';

const currentPromptIndex = ref(0);
const copied = ref(false);

const aiPromptsList = computed(() => {
  const _ = refreshTrigger.value;
  const list = getStorageData('AI_CENTER');
  return list.map(item => {
    let toolName = item.name;
    let fullTitle = item.name;
    const match = item.name ? item.name.match(/^([^(（]+)[(（]([^)）]+)[)）]$/) : null;
    if (match) {
      toolName = match[1].trim();
      fullTitle = `${match[2].trim()} (${match[1].trim()})`;
    }
    return {
      ...item,
      toolName,
      fullTitle
    };
  });
});

const currentPrompt = computed(() => {
  const list = aiPromptsList.value;
  if (list.length === 0) {
    return {
      name: 'Claude Sonnet',
      toolName: 'Claude Sonnet',
      fullTitle: '設計評審與 UX 文案優化',
      useCase: '對設計稿進行批判性 UX 審查、生成 UI 文案與 Error Message',
      prompt: '你是位資深 UX 設計師，請對以下設計截圖進行批判性審查：從資訊架構、可用性、視覺層次三個面向提出具體改進建議，並提供替代方案。請用繁體中文回答，條列式呈現，每點附上理由。'
    };
  }
  return list[currentPromptIndex.value % list.length];
});

const nextPrompt = () => {
  if (aiPromptsList.value.length > 1) {
    currentPromptIndex.value = (currentPromptIndex.value + 1) % aiPromptsList.value.length;
    copied.value = false;
  }
};

const copyPrompt = async () => {
  if (!currentPrompt.value || !currentPrompt.value.prompt) return;
  const success = await copyToClipboard(currentPrompt.value.prompt);
  if (success) {
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  }
};

const handleRecentClick = (item) => {
  const targetViewMap = {
    ui: 'UIResearch',
    motion: 'MotionResearch',
    competitor: 'Competitor',
    ai: 'AICenter',
    resource: 'Resources'
  };
  const targetView = targetViewMap[item.type];
  if (!targetView) return;
  emit('navigate-detail', { view: targetView, id: item.id });
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-stack);
}

.dashboard-overview {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  overflow: hidden;
  width: 100%;
  max-width: 550px;
}

.dashboard-overview .welcome-card {
  grid-column: auto;
  min-height: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.welcome-card {
  grid-column: span 3;
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  transition: border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard);
}

.welcome-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-hover);
}

.search-trigger {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-3);
  appearance: none;
  background: var(--surface-card);
  padding: var(--space-3) var(--space-5);
  color: var(--text-secondary);
  width: 100%;
  max-width: 100%;
  transition: background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
}

.search-trigger:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.search-trigger:focus-visible {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: none;
}

.search-trigger span {
  text-align: left;
  flex: 1;
}

.kbd-badge {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: var(--fs-badge);
  font-weight: var(--fw-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.dashboard-latest,
.dashboard-featured {
  grid-column: 1 / -1;
}

/* 首頁卡片用 ContentCard／CardGrid，管理精選用 MediaPickerModal＋SelectCard；以下只有這一頁特有的樣式 */

.header-selected-count {
  padding: var(--space-1) var(--space-2);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  background: var(--bg-subtle);
  border-radius: var(--radius-full);
  vertical-align: middle;
}

.quick-filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}

.quick-filter-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.quick-filter-toggle.active {
  background: var(--action-primary);
  border-color: var(--color-primary);
  color: var(--action-on-primary);
}

.featured-card {
  /* 外框、圓角、hover／焦點／選取狀態都用全域 .select-card（components.css） */
  cursor: pointer;
}

.featured-card.is-saving {
  opacity: 0.6;
  pointer-events: none;
}

.featured-card :deep(.featured-card-media) {
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  font-size: var(--fs-glyph);
  font-weight: var(--fw-bold);
}

.featured-card :deep(.featured-card-info) {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-top: 1px solid var(--border-color);
}

.featured-card-info strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.featured-card-info .chip {
  align-self: flex-start;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header h3 {
  font-size: var(--fs-section-title);
  font-weight: var(--fw-bold);
  padding-left: var(--space-1);
}

.card-action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  white-space: nowrap;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
}

.card-action-link:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
}

.card-action-link:active {
  transform: translateY(0);
}

.proposal-card {
  grid-column: span 2;
  cursor: pointer;
}

.proposal-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.prop-stat {
  display: flex;
  flex-direction: column;
  background: var(--bg-subtle);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.prop-stat .num {
  font-size: var(--fs-glyph);
  font-weight: var(--fw-black);
  font-variant-numeric: tabular-nums;
  line-height: var(--lh-none);
}

.num.idea { color: var(--text-muted); }
.num.eval { color: var(--color-warning); }
.num.proto { color: var(--color-secondary); }
.num.approved { color: var(--color-accent); }

.prop-stat .lbl {
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  margin-top: var(--space-1);
  font-weight: var(--fw-medium);
}

.ai-prompt-card {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-heading);
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ai-tool-pill {
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  background: var(--bg-hover);
  color: var(--color-primary);
  border: 1px solid var(--border-color);
}

.cycle-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
}

.cycle-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
}

.ai-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.ai-usecase-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.usecase-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
}

.usecase-tag .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--action-primary);
}

.usecase-text {
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--fs-meta);
  color: var(--text-muted);
  padding-top: var(--space-1);
}

.tool-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-weight: var(--fw-medium);
  font-size: var(--fs-meta);
}

.tool-label .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--action-primary);
}

.quick-action-card {
  grid-column: span 2;
  justify-content: space-around;
}

.action-buttons {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.btn {
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-meta);
  text-align: center;
  transition: background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard);
}

.btn-primary {
  background: var(--bg-subtle);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
.btn-primary:hover {
  background: var(--action-primary);
  color: var(--action-on-primary);
}

.btn-secondary {
  background: var(--bg-subtle);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
}
.btn-secondary:hover {
  background: var(--color-secondary);
  color: var(--action-on-primary);
}

.btn-tertiary {
  background: var(--bg-subtle);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}
.btn-tertiary:hover {
  background: var(--color-accent);
  color: var(--action-on-primary);
}

/* 首頁卡片欄數由 CardGrid 負責（超寬／桌機 4 · 筆電 3 · 平板 2 · 手機 1） */
@media (max-width: 1023px) {
  .dashboard-overview {
    max-width: none;
  }
  .welcome-card {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .welcome-card,
  .proposal-card,
  .ai-prompt-card,
  .quick-action-card {
    grid-column: 1 / -1;
  }
  .search-trigger {
    width: 100%;
    max-width: 100%;
  }

  .dashboard-overview {
    grid-template-columns: minmax(0, 1fr);
  }
  .proposal-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}
</style>
