<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <div>
        <h1 class="page-title">Design <span class="text-gradient">LAB</span></h1>
        <p class="page-subtitle">內部設計知識平台與概念驗證提案系統</p>
      </div>
      <NotificationBell />
    </header>

    <div class="bento-grid">
      <!-- 1. Welcome Card -->
      <div class="bento-card welcome-card glass-panel glow-purple">
        <div class="welcome-content">
          <h2>探索設計靈感與優化可能性</h2>
          <p>Design LAB 整合了 UI 研究、動態設計、競品分析與 AI 工具。當發現有參考價值的優化方向時，即可建立 Prototype 並向產品團隊提案！</p>
          <button class="search-trigger" @click="$emit('open-search')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>搜尋靈感...</span>
            <kbd class="kbd-badge">⌘ K</kbd>
          </button>
        </div>
      </div>

      <!-- 2. Stats Card -->
      <div class="bento-card stats-card glass-panel">
        <h3>庫存知識庫</h3>
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

      <!-- 3. Recent Updates -->
      <div class="bento-card recent-card glass-panel">
        <div class="card-header">
          <h3>最新研究案例</h3>
          <span class="header-action" @click="$emit('change-view', 'UIResearch')">查看全部 →</span>
        </div>
        <div class="recent-list">
          <div 
            v-for="item in recentItems" 
            :key="item.id" 
            class="recent-item-row"
            @click="handleRecentClick(item)"
          >
            <img :src="item.cover" class="recent-img" alt="" />
            <div class="recent-text">
              <div class="recent-row-title">{{ item.title }}</div>
              <div class="recent-row-meta">
                <span class="type-badge" :class="item.type">{{ item.typeLabel }}</span>
                <span class="date">{{ item.createdAt || '剛剛' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Proposal Stats -->
      <div class="bento-card proposal-card glass-panel glow-blue" @click="$emit('change-view', 'Proposals')">
        <div class="card-header">
          <h3>優化提案進度</h3>
          <span class="status-indicator">互動看板 →</span>
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

      <!-- 5. AI Quick Prompt -->
      <div class="bento-card ai-prompt-card glass-panel">
        <div class="card-header">
          <h3>熱門 AI Prompt</h3>
          <button class="copy-btn" @click="copyPrompt">
            {{ copied ? '已複製！' : '一鍵複製' }}
          </button>
        </div>
        <div class="prompt-box">
          <code>{{ randomPrompt.prompt }}</code>
        </div>
        <div class="prompt-meta">
          <span>工具：{{ randomPrompt.name }}</span>
          <span class="view-ai-link" @click="$emit('change-view', 'AICenter')">前往 AI Center →</span>
        </div>
      </div>

      <!-- 6. Quick Action -->
      <div class="bento-card quick-action-card glass-panel">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getStorageData } from '../utils/storage';
import NotificationBell from '../components/NotificationBell.vue';

const emit = defineEmits(['change-view', 'open-search', 'trigger-crud', 'navigate-detail']);

const stats = computed(() => {
  return {
    ui: getStorageData('UI_RESEARCH').length,
    motion: getStorageData('MOTION_RESEARCH').length,
    comp: getStorageData('COMPETITORS').length,
    ai: getStorageData('AI_CENTER').length
  };
});

const proposalStats = computed(() => {
  const list = getStorageData('PROPOSALS');
  return {
    idea: list.filter(p => p.status === 'Idea').length,
    evaluating: list.filter(p => p.status === 'Evaluating').length,
    prototype: list.filter(p => p.status === 'Prototype').length,
    approved: list.filter(p => p.status === 'Approved').length
  };
});

const recentItems = computed(() => {
  const ui = getStorageData('UI_RESEARCH').map(i => ({ ...i, type: 'ui', typeLabel: 'UI 研究' }));
  const motion = getStorageData('MOTION_RESEARCH').map(i => ({ ...i, type: 'motion', typeLabel: '動態設計' }));
  
  return [...ui, ...motion].slice(0, 3);
});

const randomPrompt = computed(() => {
  const list = getStorageData('AI_CENTER');
  if (list.length === 0) return { name: 'N/A', prompt: 'No Prompts available' };
  return list[0];
});

const copied = ref(false);
const copyPrompt = () => {
  navigator.clipboard.writeText(randomPrompt.value.prompt);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};

const handleRecentClick = (item) => {
  const targetView = item.type === 'ui' ? 'UIResearch' : 'MotionResearch';
  emit('navigate-detail', { view: targetView, id: item.id });
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -1px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.bento-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
}

.welcome-card {
  grid-column: span 3;
  background: var(--bg-card);
  border: 1px solid var(--border-color-hover);
  box-shadow: var(--shadow-sm);
}

.welcome-content h2 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

.welcome-content p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  max-width: 80%;
  margin-bottom: 1.25rem;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  color: var(--text-secondary);
  width: 280px;
  justify-content: space-between;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.search-trigger:hover {
  background: var(--bg-card);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 4px 15px var(--glow-primary);
}

.kbd-badge {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
}

.stats-card h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 0;
}

.stat-item:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.stat-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  flex-shrink: 0;
}

.stat-lbl {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
  white-space: nowrap;
  text-align: right;
}

.recent-card {
  grid-column: span 2;
  grid-row: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.card-header h3 {
  font-size: 1.1rem;
}

.header-action {
  font-size: 0.8rem;
  color: var(--color-primary);
  cursor: pointer;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.recent-item-row {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
}

.recent-item-row:hover {
  background: var(--bg-hover);
  border-color: var(--border-color-hover);
}

.recent-img {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--bg-hover);
}

.recent-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.recent-row-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.recent-row-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.type-badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.type-badge.ui {
  background: var(--glow-primary);
  color: var(--color-primary);
}

.type-badge.motion {
  background: var(--glow-secondary);
  color: var(--color-secondary);
}

.date {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.proposal-card {
  grid-column: span 2;
  cursor: pointer;
}

.status-indicator {
  font-size: 0.75rem;
  color: var(--color-secondary);
  background: var(--glow-secondary);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
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
}

.prop-stat .num {
  font-size: 1.6rem;
  font-weight: 800;
}

.num.idea { color: var(--text-muted); }
.num.eval { color: #f59e0b; }
.num.proto { color: var(--color-secondary); }
.num.approved { color: var(--color-accent); }

.prop-stat .lbl {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.ai-prompt-card {
  grid-column: span 2;
}

.copy-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--color-primary);
  color: white;
}

.prompt-box {
  background: var(--bg-input);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--color-primary);
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.prompt-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.view-ai-link {
  color: var(--color-primary);
  cursor: pointer;
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
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--glow-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
.btn-primary:hover {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: var(--glow-secondary);
  border: 1px solid var(--color-secondary);
  color: var(--color-secondary);
}
.btn-secondary:hover {
  background: var(--color-secondary);
  color: white;
}

.btn-tertiary {
  background: var(--glow-secondary);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
}
.btn-tertiary:hover {
  background: var(--color-accent);
  color: white;
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
    max-width: 280px;
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
}
</style>
