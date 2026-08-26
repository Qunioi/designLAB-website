<template>
  <div class="proposals-container">
    <PageHeader
      title="Proposals & Prototypes"
      subtitle="將研究發現轉化為具體的產品優化提案，並透過 Prototype 進行概念驗證與進度追蹤"
      add-btn-label="+ 新增優化提案"
      @add-click="$emit('trigger-crud', { type: 'PROPOSALS' })"
    />

    <div class="kanban-board">
      <div v-for="column in columns" :key="column.status" class="kanban-column glass-panel">
        <div class="column-header">
          <span class="column-dot" :class="column.status.toLowerCase()"></span>
          <h3>{{ column.label }}</h3>
          <span class="column-count">{{ getColumnItems(column.status).length }}</span>
        </div>

        <div class="column-cards-list">
          <div 
            v-for="item in getColumnItems(column.status)" 
            :key="item.id" 
            class="proposal-kanban-card"
          >
            <div class="prop-card-actions">
              <span class="prop-date">{{ item.createdAt }}</span>
              <div class="card-actions">
                <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'PROPOSALS', item })" title="編輯"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                <button class="action-icon-btn delete" @click="handleDelete(item)" title="刪除"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
            </div>

            <h4 class="prop-title">{{ item.title }}</h4>

            <p class="prop-impact" v-if="item.impact">{{ item.impact }}</p>

            <div class="related-research-badge" v-if="item.relatedResearch" @click="navigateToResearch(item.relatedResearch)">
              <span>關聯研究: {{ item.relatedResearch }}</span>
            </div>

            <div class="figma-link-wrapper" v-if="item.figmaLink">
              <a :href="item.figmaLink" target="_blank" class="figma-btn">
                <span>Figma Prototype ↗</span>
              </a>
            </div>

            <div class="prop-move-bar">
              <button 
                class="move-btn prev" 
                v-if="column.status !== 'Idea'"
                @click="moveStatus(item, -1)"
              >
                ◀ 往左移
              </button>
              <span class="spacer" v-else></span>
              <button 
                class="move-btn next" 
                v-if="column.status !== 'Approved'"
                @click="moveStatus(item, 1)"
              >
                往右移 ▶
              </button>
            </div>
          </div>
          
          <div v-if="getColumnItems(column.status).length === 0" class="column-empty-state">
            拖曳或新增提案至此
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import { getStorageData, addOrUpdateItem, deleteItem } from '../utils/storage';
import { checkDeletePermission } from '../utils/notifications';
import NotificationBell from '../components/NotificationBell.vue';

const emit = defineEmits(['trigger-crud', 'delete-done', 'navigate-to-view']);

const items = ref([]);

const columns = [
  { status: 'Idea', label: '提案想法' },
  { status: 'Evaluating', label: '評估中' },
  { status: 'Prototype', label: '驗證中' },
  { status: 'Approved', label: '已採納' }
];

const loadData = () => {
  items.value = getStorageData('PROPOSALS');
};

onMounted(() => {
  loadData();
});

const getColumnItems = (status) => {
  return items.value.filter(i => i.status === status);
};

const statusOrder = ['Idea', 'Evaluating', 'Prototype', 'Approved'];
const moveStatus = (item, direction) => {
  const currentIndex = statusOrder.indexOf(item.status);
  const newIndex = currentIndex + direction;
  
  if (newIndex >= 0 && newIndex < statusOrder.length) {
    const updatedItem = { ...item, status: statusOrder[newIndex] };
    addOrUpdateItem('PROPOSALS', updatedItem);
    loadData();
  }
};

const navigateToResearch = (researchName) => {
  let view = 'UIResearch';
  if (researchName.includes('Motion') || researchName.includes('動態')) {
    view = 'MotionResearch';
  } else if (researchName.includes('競品') || researchName.includes('Competitor')) {
    view = 'Competitor';
  }
  
  const cleanName = researchName.split('(')[0].trim();
  let matchedId = '';
  
  if (view === 'UIResearch') {
    const list = getStorageData('UI_RESEARCH');
    const matched = list.find(i => i.title.includes(cleanName));
    if (matched) matchedId = matched.id;
  } else if (view === 'MotionResearch') {
    const list = getStorageData('MOTION_RESEARCH');
    const matched = list.find(i => i.title.includes(cleanName));
    if (matched) matchedId = matched.id;
  } else if (view === 'Competitor') {
    const list = getStorageData('COMPETITORS');
    const matched = list.find(i => i.name.includes(cleanName));
    if (matched) matchedId = matched.id;
  }
  
  emit('navigate-to-view', { view, id: matchedId });
};

const handleDelete = (item) => {
  const perm = checkDeletePermission(item);
  if (!perm.allowed) {
    alert(`⚠️ 權限受限：此提案由原建立者「${perm.creatorName}」發表，非原建立者不得刪除！`);
    return;
  }

  if (confirm(`確定要刪除《${item.title}》這筆提案嗎？`)) {
    items.value = deleteItem('PROPOSALS', item.id);
    emit('delete-done');
  }
};
</script>

<style scoped>
.proposals-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(360px, 1fr));
  gap: 1rem;
  align-items: start;
  overflow-x: auto;
  padding-bottom: 1rem;
  /* Smooth scroll on touch */
  -webkit-overflow-scrolling: touch;
  /* Hide scrollbar aesthetically */
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.kanban-board::-webkit-scrollbar {
  height: 5px;
}
.kanban-board::-webkit-scrollbar-thumb {
  background: var(--border-color-hover);
  border-radius: 4px;
}

.kanban-column {
  background: var(--bg-card);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 60vh;
  min-width: 220px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
  position: relative;
  min-width: 0;
}

.column-header h3 {
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.column-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.column-dot.idea { background-color: var(--text-muted); }
.column-dot.evaluating { background-color: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
.column-dot.prototype { background-color: var(--color-secondary); box-shadow: 0 0 8px var(--color-secondary); }
.column-dot.approved { background-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }

.column-count {
  margin-left: auto;
  font-size: 0.75rem;
  background: var(--bg-hover);
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  color: var(--text-secondary);
}

.column-cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.proposal-kanban-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.proposal-kanban-card:hover {
  background: var(--bg-subtle);
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.prop-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prop-date {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.kanban-card:hover .card-actions {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.action-icon-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-icon-btn.edit:hover {
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.4);
}

.action-icon-btn.delete:hover {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}

.prop-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.4;
}

.prop-impact {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  background: var(--bg-subtle);
  padding: 0.5rem;
  border-radius: 6px;
  border-left: 2px solid rgba(255,255,255,0.1);
}

.related-research-badge {
  font-size: 0.75rem;
  color: var(--color-primary);
  background: var(--glow-primary);
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.related-research-badge:hover {
  background: var(--glow-primary);
  text-decoration: underline;
}

.figma-link-wrapper {
  margin-top: 0.25rem;
}

.figma-btn {
  display: block;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.4rem;
  border-radius: 8px;
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.2);
  color: #f472b6;
  transition: all 0.2s ease;
}

.figma-btn:hover {
  background: #ec4899;
  color: white;
  border-color: #ec4899;
}

.prop-move-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.03);
  padding-top: 0.5rem;
}

.move-btn {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.move-btn:hover {
  color: var(--text-primary);
}

.column-empty-state {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem 1rem;
}

@media (max-width: 1024px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>
