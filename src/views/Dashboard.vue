<template>
  <div class="dashboard-container">
    <PageHeader
      title="Design LAB"
      subtitle="內部設計知識平台與概念驗證提案系統"
    />

    <div class="bento-grid">
      <!-- 1. Unified overview: orientation + knowledge inventory -->
      <section class="dashboard-overview glass-panel">
      <div class="bento-card welcome-card">
        <div class="welcome-content">
          <h2>從一個設計問題開始</h2>
          <p>搜尋研究案例、整理設計洞察，或查看目前的優化提案，快速找到下一個可執行的方向。</p>
          <button class="search-trigger" @click="$emit('open-search')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>搜尋研究、提案與工具...</span>
            <kbd class="kbd-badge">⌘ K</kbd>
          </button>
        </div>
      </div>

      <div class="bento-card stats-card">
        <div class="stats-heading">
          <h3>內容總覽</h3>
          <span>共 {{ stats.total }} 筆</span>
        </div>
        <div class="stats-grid">
          <div class="stat-item" @click="$emit('change-view', 'UIResearch')">
            <span class="stat-val">{{ stats.ui }}</span>
            <span class="stat-lbl">UI 研究</span>
          </div>
          <div class="stat-item" @click="$emit('change-view', 'MotionResearch')">
            <span class="stat-val">{{ stats.motion }}</span>
            <span class="stat-lbl">動態案例</span>
          </div>
          <div class="stat-item" @click="$emit('change-view', 'Competitor')">
            <span class="stat-val">{{ stats.comp }}</span>
            <span class="stat-lbl">競業分析</span>
          </div>
          <div class="stat-item" @click="$emit('change-view', 'AICenter')">
            <span class="stat-val">{{ stats.ai }}</span>
            <span class="stat-lbl">AI 工具</span>
          </div>
        </div>
      </div>
      </section>

      <!-- 3. Latest research cards -->
      <section class="dashboard-latest">
        <div class="card-header">
          <h3>最新更新</h3>
          <!-- <button class="card-action-link" type="button" @click="$emit('open-search')">搜尋全部 →</button> -->
        </div>
        <div class="dashboard-latest-grid">
          <article 
            v-for="item in recentItems" 
            :key="item.id" 
            class="dashboard-research-card"
            tabindex="0"
            @click="handleRecentClick(item)"
            @keydown.enter.prevent="handleRecentClick(item)"
            @keydown.space.prevent="handleRecentClick(item)"
          >
            <div class="dashboard-card-media">
              <img v-if="item.cover || item.screenshot || item.logo" :src="item.cover || item.screenshot || item.logo" :alt="item.title || item.name" loading="lazy" />
              <span v-else aria-hidden="true">{{ (item.title || item.name || '?').charAt(0) }}</span>
            </div>
            <div class="dashboard-card-info">
              <div class="dashboard-card-meta">
                <span class="type-badge" :class="item.type">{{ item.typeLabel }}</span>
              </div>
              <h4>{{ item.title || item.name }}</h4>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import PromptCodeBox from '../components/PromptCodeBox.vue';
import { getStorageData } from '../utils/storage';
import NotificationBell from '../components/NotificationBell.vue';

const emit = defineEmits(['change-view', 'open-search', 'trigger-crud', 'navigate-detail']);

const refreshTrigger = ref(0);
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
    total: getStorageData('UI_RESEARCH').length
      + getStorageData('MOTION_RESEARCH').length
      + getStorageData('COMPETITORS').length
      + getStorageData('AI_CENTER').length
  };
});

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
    .slice(0, 8);
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
  gap: 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bento-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  border-radius: var(--radius-xl);
}

.dashboard-overview {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 400px);
  align-items: stretch;
  overflow: hidden;
  background: var(--sidebar-bg);
}

.dashboard-overview .welcome-card,
.dashboard-overview .stats-card {
  grid-column: auto;
  min-height: 200px;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.dashboard-overview .welcome-card {
  justify-content: center;
}

.dashboard-overview .stats-card {
  justify-content: center;
  border-left: 1px solid var(--border-color);
}

.dashboard-overview .stats-card h3 {
  margin: 0;
}

.dashboard-overview .stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
  flex: 0 1 auto;
}

.stats-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stats-heading span {
  color: var(--text-muted);
  font-size: var(--fs-tiny);
  white-space: nowrap;
}

.welcome-card {
  grid-column: span 3;
  /* padding: 2.25rem; */
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  /* box-shadow: var(--shadow-sm); */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.welcome-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
}

.welcome-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.welcome-content p {
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: 1.65;
  max-width: 85%;
  margin-bottom: 1.5rem;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  width: 320px;
  max-width: 100%;
  justify-content: space-between;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  /* box-shadow: var(--shadow-sm); */
}

.search-trigger:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.kbd-badge {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: var(--fs-tiny);
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

.stats-card h3 {
  font-size: var(--fs-h3);
  font-weight: 700;
  margin-bottom: 1rem;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 1;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
  min-width: 0;
}

.dashboard-overview .stat-item {
  min-height: 72px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.65rem 0.75rem;
}

.dashboard-overview .stat-lbl {
  text-align: left;
}

.stat-item:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.stat-val {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.stat-lbl {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
  white-space: nowrap;
  text-align: right;
  font-weight: 500;
}

.recent-card {
  grid-column: span 2;
  grid-row: span 2;
}

.dashboard-latest {
  grid-column: 1 / -1;
  min-width: 0;
}

.dashboard-latest-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.dashboard-research-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border-color) 62%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--bg-card) 84%, transparent);
  /* box-shadow: var(--shadow-sm); */
  cursor: pointer;
  outline: none;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-research-card:hover,
.dashboard-research-card:focus-visible {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.dashboard-research-card:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.dashboard-card-media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--bg-card), var(--bg-elevated));
  color: var(--text-secondary);
  font-family: var(--font-title);
  font-size: var(--fs-h2);
  font-weight: 700;
}

.dashboard-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.dashboard-research-card:hover .dashboard-card-media img {
  transform: scale(1.04);
}

.dashboard-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.85rem;
}

.dashboard-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
}

.dashboard-card-meta .date {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-card-info h4 {
  min-width: 0;
  color: var(--text-primary);
  font-family: var(--font-title);
  font-size: var(--fs-body);
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.card-header h3 {
  font-size: var(--fs-h3);
  font-weight: 700;
}

.card-action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font: inherit;
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  padding: 0.25rem 0.6rem;
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

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.recent-item-row {
  display: flex;
  gap: 0.85rem;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  align-items: center;
}

.recent-item-row:hover {
  background: var(--bg-hover);
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-sm);
  transform: translateX(2px);
}

.recent-img {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.recent-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.recent-row-title {
  font-size: var(--fs-body);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-row-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.date {
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.proposal-card {
  grid-column: span 2;
  cursor: pointer;
}

.proposal-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.prop-stat {
  display: flex;
  flex-direction: column;
  background: var(--bg-subtle);
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.prop-stat .num {
  font-size: 1.35rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.num.idea { color: var(--text-muted); }
.num.eval { color: var(--color-warning); }
.num.proto { color: var(--color-secondary); }
.num.approved { color: var(--color-accent); }

.prop-stat .lbl {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
  margin-top: 0.2rem;
  font-weight: 500;
}

.ai-prompt-card {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* gap: 0.75rem; */
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ai-tool-pill {
  font-size: var(--fs-tiny);
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: var(--bg-hover);
  color: var(--color-primary);
  border: 1px solid var(--border-color);
}

.cycle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--fs-tiny);
  font-weight: 500;
  padding: 0.25rem 0.55rem;
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
  gap: 0.5rem;
}

.ai-usecase-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.usecase-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--fs-meta);
  font-weight: 600;
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
  padding-top: 0.2rem;
}

.tool-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  font-weight: 500;
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
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.7875rem;
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

@media (max-width: 1280px) and (min-width: 1025px) {
  /* At medium desktop widths, rebalance: welcome gets 2 cols, stats gets 2 cols */
  .welcome-card {
    grid-column: span 2;
  }
  .stats-card {
    grid-column: span 2;
  }
  .welcome-content p {
    max-width: 100%;
  }
  .search-trigger {
    width: 100%;
    /* max-width: 280px; */
  }
}

@media (max-width: 1040px) {
  .dashboard-overview {
        grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  }
  .dashboard-overview .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dashboard-latest-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
  .recent-card {
    grid-column: span 2;
  }
  .dashboard-latest-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .dashboard-overview {
    grid-template-columns: minmax(0, 1fr) minmax(190px, 240px);
  }
}

@media (max-width: 768px) {
  .welcome-card,
  .stats-card,
  .recent-card,
  .proposal-card,
  .ai-prompt-card,
  .quick-action-card {
    grid-column: 1 / -1;
  }
  .search-trigger {
    width: 100%;
    max-width: 100%;
  }

  .bento-card {
    padding: var(--space-5);
  }
  .dashboard-latest-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .dashboard-overview {
    grid-template-columns: minmax(0, 1fr);
  }
  .dashboard-overview .stats-card {
    min-height: 0;
    border-top: 1px solid var(--border-color);
    border-left: 0;
  }
}

@media (max-width: 640px) {
  .proposal-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style>
