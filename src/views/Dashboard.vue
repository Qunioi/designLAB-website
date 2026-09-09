<template>
  <div class="dashboard-container">
    <PageHeader
      title="從一個設計問題開始"
      subtitle="搜尋研究案例、整理設計洞察，或查看目前的優化提案，快速找到下一個可執行的方向。"
      :add-btn-label="isAdmin ? '管理精選' : ''"
      @add-click="featuredManagerOpen = true"
    />

    <div class="bento-grid">
      <!-- 1. Unified overview: orientation + knowledge inventory -->
      <section class="dashboard-overview glass-panel">
      <div class="bento-card welcome-card">
        <div class="welcome-content">
          <button class="search-trigger" @click="$emit('open-search')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>搜尋研究、提案與工具...</span>
            <kbd class="kbd-badge">⌘ K</kbd>
          </button>
        </div>
      </div>

      <div class="bento-card stats-card">
        <div class="stats-grid">
          <button type="button" class="stat-item" @click="$emit('change-view', 'UIResearch')">
            <span class="stat-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.05V18h6v-1.25c0-.85.4-1.55 1-2.05A7 7 0 0 0 12 2Z"></path></svg>
            </span>
            <span class="stat-text">
              <span class="stat-val">{{ stats.ui }}</span>
              <span class="stat-lbl">UI 研究</span>
            </span>
          </button>
          <button type="button" class="stat-item" @click="$emit('change-view', 'MotionResearch')">
            <span class="stat-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            </span>
            <span class="stat-text">
              <span class="stat-val">{{ stats.motion }}</span>
              <span class="stat-lbl">動態案例</span>
            </span>
          </button>
          <button type="button" class="stat-item" @click="$emit('change-view', 'Competitor')">
            <span class="stat-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="14"></line><line x1="12" y1="20" x2="12" y2="8"></line><line x1="18" y1="20" x2="18" y2="4"></line></svg>
            </span>
            <span class="stat-text">
              <span class="stat-val">{{ stats.comp }}</span>
              <span class="stat-lbl">競業分析</span>
            </span>
          </button>
          <button type="button" class="stat-item" @click="$emit('change-view', 'AICenter')">
            <span class="stat-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"></path></svg>
            </span>
            <span class="stat-text">
              <span class="stat-val">{{ stats.ai }}</span>
              <span class="stat-lbl">AI 工具</span>
            </span>
          </button>
          <button type="button" class="stat-item" @click="$emit('change-view', 'Resources')">
            <span class="stat-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
            </span>
            <span class="stat-text">
              <span class="stat-val">{{ stats.resources }}</span>
              <span class="stat-lbl">設計資源</span>
            </span>
          </button>
        </div>
      </div>
      </section>

      <!-- 3. Latest research cards -->
      <section class="dashboard-latest">
        <div class="card-header">
          <h3>最新更新</h3>
          <button class="card-action-link" type="button" @click="$emit('open-search')">查看全部 →</button>
        </div>
        <div class="dashboard-latest-grid">
          <article
            v-for="item in recentItems"
            :key="item.id"
            class="card-panel"
            tabindex="0"
            @click="handleRecentClick(item)"
            @keydown.enter.prevent="handleRecentClick(item)"
            @keydown.space.prevent="handleRecentClick(item)"
          >
            <div class="card-media-wrapper">
              <img v-if="item.cover || item.screenshot || item.logo" class="card-media" :src="item.cover || item.screenshot || item.logo" :alt="item.title || item.name" loading="lazy" />
              <div v-else class="card-media-placeholder" aria-hidden="true">{{ (item.title || item.name || '?').charAt(0) }}</div>
            </div>
            <div class="card-info">
              <div class="card-meta-row">
                <span class="type-badge" :class="item.type">{{ item.typeLabel }}</span>
                <time v-if="item.updatedAt || item.createdAt" class="card-time-text">{{ formatDate(item.updatedAt || item.createdAt) }}</time>
              </div>
              <h4 class="card-title">{{ item.title || item.name }}</h4>
              <p v-if="isTextDescType(item)" class="card-desc one-line">{{ item.useCase || item.desc }}</p>
              <div v-else-if="item.tags?.length" class="card-tags">
                <span v-for="tag in normalizedTags(item.tags).slice(0, 2)" :key="tag" class="tag"># {{ tag }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- 3. Curated content: controlled by administrators -->
      <section v-if="featuredItems.length" class="dashboard-featured">
        <div class="card-header">
          <h3>精選內容</h3>
          <button class="card-action-link" type="button" @click="$emit('open-search')">查看全部 →</button>
        </div>

        <div class="featured-grid">
          <article
            v-for="item in featuredItems"
            :key="`featured-${item.type}-${item.id}`"
            class="card-panel"
            tabindex="0"
            @click="handleRecentClick(item)"
            @keydown.enter.prevent="handleRecentClick(item)"
            @keydown.space.prevent="handleRecentClick(item)"
          >
            <div class="card-media-wrapper">
              <img v-if="item.cover || item.screenshot || item.logo" class="card-media" :src="item.cover || item.screenshot || item.logo" :alt="item.title || item.name" loading="lazy" />
              <div v-else class="card-media-placeholder" aria-hidden="true">{{ (item.title || item.name || '?').charAt(0) }}</div>
            </div>
            <div class="card-info">
              <div class="card-meta-row">
                <span class="type-badge" :class="item.type">{{ item.typeLabel }}</span>
                <time v-if="item.updatedAt || item.createdAt" class="card-time-text">{{ formatDate(item.updatedAt || item.createdAt) }}</time>
              </div>
              <h4 class="card-title">{{ item.title || item.name }}</h4>
              <p v-if="isTextDescType(item)" class="card-desc one-line">{{ item.useCase || item.desc }}</p>
              <div v-else-if="item.tags?.length" class="card-tags">
                <span v-for="tag in normalizedTags(item.tags).slice(0, 2)" :key="tag" class="tag"># {{ tag }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Removed from Dashboard: proposal progress is managed in Proposals. -->
      <!--
      <div class="bento-card proposal-card glass-panel" @click="$emit('change-view', 'Proposals')">
        <div class="card-header">
          <h3>優化提案進度</h3>
          <button class="card-action-link" type="button" @click.stop="$emit('change-view', 'Proposals')">互動看板 →</button>
        </div>
        <div class="proposal-summary">
          <div class="prop-stat">
            <span class="num idea">{{ proposalStats.idea }}</span>
            <span class="lbl">提案想法</span>
          </div>
          <div class="prop-stat">
            <span class="num eval">{{ proposalStats.evaluating }}</span>
            <span class="lbl">評估中</span>
          </div>
          <div class="prop-stat">
            <span class="num proto">{{ proposalStats.prototype }}</span>
            <span class="lbl">驗證中</span>
          </div>
          <div class="prop-stat">
            <span class="num approved">{{ proposalStats.approved }}</span>
            <span class="lbl">已採納</span>
          </div>
        </div>
      </div>
      -->

      <!-- 5. AI Quick Prompt -->
      <div v-if="false" class="bento-card ai-prompt-card glass-panel">
        <div class="card-header">
          <div class="header-title-group">
            <h3>熱門 AI 工具</h3>
            <!-- <span v-if="currentPrompt?.toolName" class="ai-tool-pill">{{ currentPrompt.toolName }}</span> -->
          </div>
          <div class="header-actions">
            <button 
              class="cycle-btn" 
              @click.stop="nextPrompt" 
              title="切換下一個 Prompt"
              v-if="aiPromptsList.length > 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>換一個</span>
            </button>
            <button class="card-action-link" type="button" @click.stop="$emit('change-view', 'AICenter')">前往 AI Center →</button>
            <!-- <button class="copy-btn" :class="{ copied }" @click="copyPrompt">
              <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>{{ copied ? '已複製！' : '一鍵複製' }}</span>
            </button> -->
          </div>
        </div>

        <div class="ai-card-content">
          <div class="ai-usecase-row" v-if="currentPrompt?.useCase">
            <span class="usecase-tag"><span class="dot"></span> {{ currentPrompt?.fullTitle || currentPrompt?.name }}</span>
            <!-- <span class="usecase-text">{{ currentPrompt.useCase }}</span> -->
          </div>

          <PromptCodeBox :prompt="currentPrompt?.prompt" :copied="copied" @copy="copyPrompt" />
        </div>

        <!-- <div class="prompt-meta">
          <span class="tool-label">
            <span class="dot"></span>
            {{ currentPrompt?.fullTitle || currentPrompt?.name }}
          </span>
        </div> -->
      </div>

      <!-- 6. Quick Action -->
      <!-- <div class="bento-card quick-action-card glass-panel">
        <h3>快速建立研究</h3>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="$emit('trigger-crud', 'UIResearch')">
            + UI 案例
          </button>
          <button class="btn btn-secondary" @click="$emit('trigger-crud', 'MotionResearch')">
            + 動態設計
          </button>
          <button class="btn btn-tertiary" @click="$emit('trigger-crud', 'Competitor')">
            + 競品分析
          </button>
        </div>
      </div> -->
    </div>

  <Teleport to="body">
    <div v-if="featuredManagerOpen" class="featured-modal-backdrop" :class="currentTheme" @click.self="featuredManagerOpen = false">
      <section class="featured-manager glass-panel" role="dialog" aria-modal="true" aria-labelledby="featured-manager-title">
        <!-- 頂部標題與關閉按鈕 -->
        <header class="featured-manager-header">
          <div class="header-title-box">
            <div class="header-icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z"></path></svg>
            </div>
            <div>
              <h3 id="featured-manager-title">管理精選內容 <span class="header-selected-count">已選 {{ featuredItems.length }} 筆</span></h3>
              <p>勾選要顯示在 Dashboard「精選內容」的項目，選幾筆就顯示幾筆</p>
            </div>
          </div>
          <button type="button" class="featured-manager-close" aria-label="關閉管理精選" @click="featuredManagerOpen = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <!-- 分類篩選與搜尋工具列 -->
        <div class="featured-manager-toolbar">
          <div class="filter-pill-group">
            <button
              v-for="tab in featuredTypeTabs"
              :key="tab.type"
              type="button"
              :class="{ active: featuredFilter === tab.type }"
              @click="featuredFilter = tab.type"
            >{{ tab.label }} ({{ featuredCounts[tab.type].selected }}/{{ featuredCounts[tab.type].total }})</button>
          </div>
          <div class="featured-manager-toolbar-actions">
            <button
              type="button"
              class="quick-filter-toggle"
              :class="{ active: featuredShowSelectedOnly }"
              @click="featuredShowSelectedOnly = !featuredShowSelectedOnly"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              只看已選取
            </button>
            <div class="search-input-wrapper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input v-model="featuredSearch" type="search" placeholder="搜尋標題…" />
            </div>
          </div>
        </div>

        <!-- 內容區：卡片網格 / 空狀態 -->
        <div v-if="filteredManagerItems.length === 0" class="featured-manager-empty-box">
          <div class="empty-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h4>找不到符合條件的項目</h4>
          <p>請調整搜尋關鍵字、切換上方分類篩選，或取消「只看已選取」。</p>
        </div>
        <div v-else class="featured-manager-grid">
          <article
            v-for="(item, index) in filteredManagerItems"
            :key="managerItemKey(item, index)"
            class="featured-card"
            :class="{ selected: isFeatured(item), 'is-saving': savingFeaturedId === item.id }"
            tabindex="0"
            role="checkbox"
            :aria-checked="isFeatured(item)"
            :aria-label="`${isFeatured(item) ? '移除精選' : '設為精選'}：${item.title || item.name}`"
            @click="toggleFeatured(item)"
            @keydown.enter.prevent="toggleFeatured(item)"
            @keydown.space.prevent="toggleFeatured(item)"
          >
            <div class="featured-card-media">
              <img v-if="item.cover || item.screenshot || item.logo" :src="item.cover || item.screenshot || item.logo" :alt="''" loading="lazy" />
              <span v-else class="featured-card-fallback" aria-hidden="true">{{ (item.title || item.name || '?').charAt(0) }}</span>
              <span class="featured-card-check">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </span>
            </div>
            <div class="featured-card-info">
              <strong :title="item.title || item.name">{{ item.title || item.name }}</strong>
              <span class="type-badge">{{ item.typeLabel }}</span>
            </div>
          </article>
        </div>

        <div class="featured-manager-footer"><span>已選取 {{ featuredItems.length }} 筆</span><button type="button" class="btn-cancel" @click="featuredManagerOpen = false">完成</button></div>
      </section>
    </div>
  </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import PromptCodeBox from '../components/PromptCodeBox.vue';
import { getStorageData, addOrUpdateItem } from '../utils/storage';
import { isAdminUser } from '../utils/userStore';
import NotificationBell from '../components/NotificationBell.vue';

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
const savingFeaturedId = ref('');
const handleStorageUpdated = () => {
  refreshTrigger.value++;
};

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

const stats = computed(() => {
  // 依賴 refreshTrigger 達到實時即時刷新
  const _ = refreshTrigger.value;
  return {
    ui: getStorageData('UI_RESEARCH').length,
    motion: getStorageData('MOTION_RESEARCH').length,
    comp: getStorageData('COMPETITORS').length,
    ai: getStorageData('AI_CENTER').length,
    resources: getStorageData('RESOURCES').length,
    total: getStorageData('UI_RESEARCH').length
      + getStorageData('MOTION_RESEARCH').length
      + getStorageData('COMPETITORS').length
      + getStorageData('AI_CENTER').length
      + getStorageData('RESOURCES').length
  };
});

const isAdmin = computed(() => {
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

// ── 管理精選內容彈窗：分類篩選 + 搜尋 ──
const featuredFilter = ref('ui');
const featuredSearch = ref('');
const featuredShowSelectedOnly = ref(false);
const featuredTypeTabs = [
  { type: 'ui', label: 'UI 研究' },
  { type: 'motion', label: '動態案例' },
  { type: 'competitor', label: '競品分析' },
  { type: 'ai', label: 'AI 工具' },
  { type: 'resource', label: '設計資源' }
];
// 每個分類「已選取／總筆數」都要顯示，只印已選取數字容易讓人誤會
// 該分類本來就沒有項目（例如剛好都還沒勾選）。
const featuredCounts = computed(() => {
  const counts = {};
  featuredTypeTabs.forEach(tab => {
    const itemsInType = allContentItems.value.filter(item => item.type === tab.type);
    counts[tab.type] = { selected: itemsInType.filter(isFeatured).length, total: itemsInType.length };
  });
  return counts;
});
const filteredManagerItems = computed(() => {
  let list = allContentItems.value.filter(item => item.type === featuredFilter.value);
  if (featuredShowSelectedOnly.value) {
    list = list.filter(isFeatured);
  }
  const q = featuredSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(item => (item.title || item.name || '').toLowerCase().includes(q));
  }
  return list;
});
const managerItemKey = (item, index) => `manage-${item.type}-${item.id || item.sourceUrl || item.url || item.title || item.name || index}`;
const toggleFeatured = item => {
  if (!isAdmin.value || savingFeaturedId.value) return;
  savingFeaturedId.value = item.id;
  const { type, typeLabel, ...storedItem } = item;
  addOrUpdateItem({ ui: 'UI_RESEARCH', motion: 'MOTION_RESEARCH', competitor: 'COMPETITORS', ai: 'AI_CENTER', resource: 'RESOURCES' }[item.type], { ...storedItem, featured: !isFeatured(item) });
  window.setTimeout(() => { savingFeaturedId.value = ''; }, 300);
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
  gap: var(--space-4);
}

.dashboard-overview {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  overflow: hidden;
}

.dashboard-overview .welcome-card,
.dashboard-overview .stats-card {
  grid-column: auto;
  min-height: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.dashboard-overview .stats-card {
  container: dashboard-stats / inline-size;
}

.dashboard-overview .stats-card h3 {
  margin: 0;
}

.dashboard-overview .stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  /* border: 1px solid var(--border-color); */
  /* border-radius: var(--radius-sm); */
  background: var(--bg-card);
}

.stat-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  min-height: 74px;
  padding: clamp(0.7rem, 1.4cqi, 0.9rem) clamp(0.75rem, 1.8cqi, 1.1rem);
  border: 0;
  border-radius: 0;
  background: var(--bg-card);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.stat-item::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--color-primary);
  content: '';
  opacity: 0;
  transform: scaleX(0.45);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

@media (hover: hover) and (pointer: fine) {
  .stat-item:hover {
    background: color-mix(in srgb, var(--color-primary) 9%, var(--bg-card));
  }

  .stat-item:hover .stat-icon {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  .stat-item:hover::after {
    opacity: 1;
    transform: scaleX(1);
  }
}

.welcome-card {
  grid-column: span 3;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.welcome-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
}

.welcome-content h2 {
  font-size: var(--fs-h1);
  font-weight: var(--fw-black);
  letter-spacing: -0.025em;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}

.welcome-content p {
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: var(--lh-relaxed);
  max-width: 85%;
  margin-bottom: var(--space-6);
}

.search-trigger {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-3);
  appearance: none;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-3) var(--space-5);
  color: var(--text-secondary);
  width: 100%;
  max-width: 100%;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.search-trigger:hover {
  background: var(--bg-hover);
  /* border-color: var(--color-primary); */
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
  font-size: var(--fs-tiny);
  font-weight: var(--fw-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.stats-card h3 {
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  margin-bottom: var(--space-4);
}



.stat-item:focus-visible {
  z-index: 1;
  outline: 2px solid var(--color-focus);
  outline-offset: -2px;
}

.stat-item:focus-visible::after {
  opacity: 1;
  transform: scaleX(1);
}

.stat-item:active {
  background: color-mix(in srgb, var(--color-primary) 14%, var(--bg-card));
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--sidebar-bg) 30%, transparent);
  color: var(--color-primary);
  transition: background-color 0.18s ease, color 0.18s ease;
}

.stat-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.stat-val {
  font-size: var(--fs-h2);
  font-weight: var(--fw-black);
  color: var(--color-primary);
  line-height: var(--lh-tight);
  font-variant-numeric: tabular-nums;
}

.stat-lbl {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
  text-align: left;
  font-weight: var(--fw-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@container dashboard-stats (max-width: 760px) {
  .dashboard-overview .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@container dashboard-stats (max-width: 500px) {
  .dashboard-overview .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container dashboard-stats (max-width: 320px) {
  .dashboard-overview .stats-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.dashboard-latest {
  grid-column: 1 / -1;
  min-width: 0;
}

.dashboard-latest-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

/* 卡片外殼樣式（底色/邊框/封面圖/標題/標籤…）已經統一改用全域的
   .card-panel／.card-media-wrapper／.card-info 這一套（見
   src/styles/components.css），這裡不再各自重刻一份。 */

.dashboard-featured {
  grid-column: 1 / -1;
  min-width: 0;
}

.featured-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-4); }

/* ============================================================
   管理精選內容彈窗（比照 FileUploader 媒體庫檔案總管的排版語彙：
   標題列 + icon box、篩選/搜尋工具列、卡片網格）
   ============================================================ */
.featured-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: var(--space-5);
  background: color-mix(in srgb, var(--bg-page) 72%, transparent);
  backdrop-filter: blur(8px);
}

.featured-manager {
  display: flex;
  width: min(860px, 94vw);
  height: min(600px, 88vh);
  min-height: min(480px, 88vh);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
}

.featured-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.featured-manager-header .header-title-box {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.featured-manager-header .header-icon-box {
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

.featured-manager-header h3 {
  margin: 0;
  font-size: var(--fs-body-lg);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.header-selected-count {
  margin-left: var(--space-2);
  padding: var(--space-1) var(--space-2);
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  background: var(--bg-subtle);
  border-radius: 999px;
  vertical-align: middle;
}

.featured-manager-header p {
  margin: var(--space-1) 0 0;
  font-size: var(--fs-tiny);
  color: var(--text-muted);
}

.featured-manager-close {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.featured-manager-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.featured-manager-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.featured-manager-toolbar .filter-pill-group {
  display: inline-flex;
  flex-wrap: wrap;
  padding: 2px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.featured-manager-toolbar .filter-pill-group button {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  padding: var(--space-1) var(--space-3);
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.featured-manager-toolbar .filter-pill-group button.active {
  background: var(--bg-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.featured-manager-toolbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.quick-filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.quick-filter-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.quick-filter-toggle.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.featured-manager-toolbar .search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.featured-manager-toolbar .search-input-wrapper svg {
  position: absolute;
  left: 0.65rem;
  color: var(--text-muted);
  pointer-events: none;
}

.featured-manager-toolbar .search-input-wrapper input {
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  font-size: var(--fs-meta);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  color: var(--text-primary);
  outline: none;
  width: 180px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.featured-manager-toolbar .search-input-wrapper input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--glow-primary);
}

.featured-manager-empty-box {
  flex: 1;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem var(--space-6);
  text-align: center;
  gap: var(--space-2);
  color: var(--text-muted);
  font-size: var(--fs-meta);
}

.featured-manager-empty-box h4 {
  margin: 0;
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.featured-manager-empty-box .empty-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-subtle);
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.featured-manager-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  align-content: start;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  overflow-y: auto;
}

.featured-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.featured-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-color-hover);
}

.featured-card:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.featured-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.featured-card.is-saving {
  opacity: 0.6;
  pointer-events: none;
}

.featured-card-media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--bg-card), var(--bg-elevated));
  color: var(--text-secondary);
  font-size: var(--fs-h2);
  font-weight: var(--fw-bold);
}

.featured-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-card-check {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg-page) 55%, transparent);
  border: 1.5px solid rgba(255, 255, 255, 0.75);
  color: transparent;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.featured-card.selected .featured-card-check {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary, #fff);
}

.featured-card-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
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

.featured-card-info .type-badge {
  align-self: flex-start;
}

.featured-manager-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: var(--fs-meta);
}

.featured-manager-footer .btn-cancel {
  padding: var(--space-2) var(--space-4);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  background: var(--color-primary);
  color: var(--color-on-primary, #fff);
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.featured-manager-footer .btn-cancel:hover {
  opacity: 0.9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  width: 100%;
}

.card-header h3 {
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
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
  transition: background-color 0.18s ease, color 0.18s ease;
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
  font-size: var(--fs-h2);
  font-weight: var(--fw-black);
  font-variant-numeric: tabular-nums;
  line-height: var(--lh-none);
}

.num.idea { color: var(--text-muted); }
.num.eval { color: var(--color-warning); }
.num.proto { color: var(--color-secondary); }
.num.approved { color: var(--color-accent); }

.prop-stat .lbl {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
  margin-top: var(--space-1);
  font-weight: var(--fw-medium);
}

.ai-prompt-card {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* gap: var(--space-3); */
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ai-tool-pill {
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  padding: var(--space-1) var(--space-2);
  border-radius: 9999px;
  background: var(--bg-hover);
  color: var(--color-primary);
  border: 1px solid var(--border-color);
}

.cycle-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-tiny);
  font-weight: var(--fw-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
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
  background: var(--color-primary);
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
  background: var(--color-primary);
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
  font-size: var(--fs-label);
  text-align: center;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.btn-primary {
  background: var(--bg-subtle);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
.btn-primary:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.btn-secondary {
  background: var(--bg-subtle);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
}
.btn-secondary:hover {
  background: var(--color-secondary);
  color: #ffffff;
}

.btn-tertiary {
  background: var(--bg-subtle);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}
.btn-tertiary:hover {
  background: var(--color-accent);
  color: #ffffff;
}

@media (max-width: 1040px) {

  .dashboard-latest-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .welcome-card {
    grid-column: span 2;
  }
  .stats-card {
    grid-column: span 2;
  }
  .welcome-content p {
    max-width: 100%;
  }
  .dashboard-latest-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .welcome-card,
  .stats-card,
  .proposal-card,
  .ai-prompt-card,
  .quick-action-card {
    grid-column: 1 / -1;
  }
  .search-trigger {
    width: 100%;
    max-width: 100%;
  }

  .dashboard-latest-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .featured-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .dashboard-overview {
    grid-template-columns: minmax(0, 1fr);
  }
  .dashboard-overview .stats-card {
    min-height: 0;
    border-left: 0;
  }
}

@media (max-width: 640px) {
  .proposal-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}
</style>
