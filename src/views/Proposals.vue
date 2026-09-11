<template>
  <div class="proposals-container">
    <PageHeader
      title="產品優化提案"
      subtitle="將研究發現轉化為具體的產品優化提案，並透過 Prototype 進行概念驗證與進度追蹤"
      add-btn-label="+ 新增"
      @add-click="$emit('trigger-crud', { type: 'PROPOSALS' })"
    />

    <div class="kanban-board">
      <div
        v-for="column in columns"
        :key="column.status"
        class="kanban-column glass-panel"
        :class="{ 'is-drag-over': dragOverStatus === column.status }"
        @dragover.prevent="handleDragOver(column.status)"
        @drop.prevent="handleDrop(column.status)"
      >
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
            :draggable="canEditItem(item) ? 'true' : 'false'"
            @dragstart="handleDragStart(item, $event)"
            @dragend="handleDragEnd"
          >
            <div class="prop-card-actions">
              <time class="prop-date" :datetime="item.createdAt">{{ formatDateOnly(item.createdAt) }}</time>
              <div class="card-actions card-actions-reveal">
                <IconButton v-if="canEditItem(item)" icon="edit" size="sm" variant="edit" :label="`編輯《${item.title}》`" @click="$emit('trigger-crud', { type: 'PROPOSALS', item })" />
                <IconButton v-if="canDeleteItem(item)" icon="trash-2" size="sm" variant="delete" :label="`刪除《${item.title}》`" @click="handleDelete(item)" />
              </div>
            </div>

            <h4 class="prop-title">{{ item.title }}</h4>

            <p class="prop-impact" v-if="item.impact">{{ item.impact }}</p>

            <div class="related-research-badge" v-if="item.relatedResearch" @click="navigateToResearch(item.relatedResearch)">
              <span>關聯研究: {{ item.relatedResearch }}</span>
            </div>

            <div class="figma-link-wrapper" v-if="item.figmaLink">
              <a :href="item.figmaLink" target="_blank" class="figma-btn">
                <span>Figma Prototype</span>
              </a>
            </div>

            <div v-if="canEditItem(item)" class="prop-move-bar">
              <label class="status-change-label" :for="`proposal-status-${item.id}`">提案狀態</label>
              <Select :id="`proposal-status-${item.id}`" class="proposal-status-select" :model-value="item.status" :options="statusOptions" :aria-label="`變更《${item.title}》的提案狀態`" @change="value => changeStatus(item, value)" />
            </div>
          </div>
          
          <EmptyState
            v-if="getColumnItems(column.status).length === 0"
            size="sm"
            bordered
            :title="isGuestUser() ? '目前沒有提案' : '拖曳或新增提案至此'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import EmptyState from '../components/base/EmptyState.vue';
import Select from '../components/base/Select.vue';
import { confirmDialog } from '../utils/confirm';
import { toast } from '../utils/toast';
import { ref, onMounted, onUnmounted } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import IconButton from '../components/base/IconButton.vue';
import { getStorageData, addOrUpdateItem, deleteItem } from '../utils/storage';
import { formatDateOnly } from '../utils/formatters';
import { checkDeletePermission, isGuestUser } from '../utils/notifications';

const emit = defineEmits(['trigger-crud', 'delete-done', 'navigate-to-view']);

const items = ref([]);
const draggedItemId = ref('');
const dragOverStatus = ref('');

const columns = [
  { status: 'Idea', label: '提案想法' },
  { status: 'Evaluating', label: '評估中' },
  { status: 'Prototype', label: '驗證中' },
  { status: 'Approved', label: '已採納' }
];

const loadData = () => {
  items.value = getStorageData('PROPOSALS');
};

// 直接用網址進到這頁時本機還沒有資料，雲端同步與增刪改後都要重讀
onMounted(() => {
  loadData();
  window.addEventListener('design-lab-storage-updated', loadData);
});
onUnmounted(() => {
  window.removeEventListener('design-lab-storage-updated', loadData);
});
defineExpose({ loadData });

const getColumnItems = (status) => {
  return items.value.filter(i => i.status === status);
};

const statusOptions = [
  { value: 'Idea', label: '提案想法' },
  { value: 'Evaluating', label: '評估中' },
  { value: 'Prototype', label: '驗證中' },
  { value: 'Approved', label: '已採納' }
];

const changeStatus = (item, status) => {
  if (!status || status === item.status) return;
  addOrUpdateItem('PROPOSALS', { ...item, status });
  loadData();
};

const handleDragStart = (item, event) => {
  draggedItemId.value = String(item.id);
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', String(item.id));
};

const handleDragOver = (status) => {
  dragOverStatus.value = status;
};

const handleDrop = (status) => {
  const item = items.value.find(candidate => String(candidate.id) === draggedItemId.value);
  if (item && canEditItem(item)) changeStatus(item, status);
  handleDragEnd();
};

const handleDragEnd = () => {
  draggedItemId.value = '';
  dragOverStatus.value = '';
};

const navigateToResearch = (researchName) => {
  if (!researchName || typeof researchName !== 'string') return;
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

// 編輯：只要是登入使用者（非訪客）即可編輯任何提案，不限本人建立
const canEditItem = (item) => {
  if (!item) return false;
  return !isGuestUser();
};

// 刪除：維持較嚴格的規則，管理員可刪除任何提案，一般使用者僅可刪除自己發佈的提案
const canDeleteItem = (item) => {
  if (!item) return false;
  return checkDeletePermission(item).allowed;
};

const handleDelete = async (item) => {
  const perm = checkDeletePermission(item);
  if (!perm.allowed) {
    toast.error('沒有刪除權限', { detail: `這筆提案由「${perm.creatorName}」建立，只有建立者或管理員可以刪除。` });
    return;
  }
  const ok = await confirmDialog({
    title: `確定要刪除《${item.title}》這筆提案嗎？`,
    message: '刪除後無法復原。',
    confirmText: '刪除',
    danger: true
  });
  if (!ok) return;
  items.value = deleteItem('PROPOSALS', item.id);
  emit('delete-done');
};
</script>

<style scoped>
.proposals-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-stack);
  min-width: 0;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(240px, 1fr));
  gap: var(--grid-gap);
  align-items: start;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: var(--space-4);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.kanban-board::-webkit-scrollbar {
  height: 8px;
}
.kanban-board::-webkit-scrollbar-thumb {
  background: var(--border-color-hover);
  border-radius: var(--radius-xs);
}
.kanban-board::-webkit-scrollbar-track {
  background: var(--bg-subtle);
  border-radius: var(--radius-xs);
}

.kanban-column {
  background: var(--surface-card);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 60vh;
  min-width: 220px;
  transition: border-color var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard);
}

.kanban-column.is-drag-over {
  border-color: var(--color-primary);
  background: var(--surface-card-hover);
}

.column-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-3);
  position: relative;
  min-width: 0;
}

.column-header h3 {
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
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
.column-dot.evaluating { background-color: var(--color-warning); }
.column-dot.prototype { background-color: var(--color-info); }
.column-dot.approved { background-color: var(--color-success); }

.column-count {
  margin-left: auto;
  font-size: var(--fs-meta);
  background: var(--bg-hover);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  font-weight: var(--fw-semibold);
}

.column-cards-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.proposal-kanban-card {
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--card-padding);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: transform var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard);
  cursor: grab;
}

.proposal-kanban-card:active {
  cursor: grabbing;
  transform: translateY(0);
}

.proposal-kanban-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.prop-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prop-date {
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.prop-title {
  font-size: var(--fs-card-title);
  font-weight: var(--fw-bold);
  letter-spacing: -0.015em;
}

.prop-impact {
  font-size: var(--fs-body);
  color: var(--text-secondary);
  line-height: var(--lh-normal);
  background: var(--bg-subtle);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--border-color);
}

.related-research-badge {
  font-size: var(--fs-meta);
  color: var(--color-primary);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
}

.related-research-badge:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
  text-decoration: underline;
}

.figma-link-wrapper {
  margin-top: var(--space-1);
}

.figma-btn {
  display: block;
  text-align: center;
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--color-primary);
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}

.figma-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

.prop-move-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-2);
  border-top: 1px solid var(--color-divider);
  padding-top: var(--space-2);
}

.status-change-label {
  color: var(--text-secondary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
}

.proposal-status-select {
  flex: 1;
  max-width: 180px;
}

/* 平板以下放不下 4 欄：改成橫向滑動，露出下一欄的一部分提示還能往右滑 */
@media (max-width: 1023px) {
  .kanban-board {
    grid-template-columns: repeat(4, minmax(280px, 1fr));
    scroll-snap-type: x mandatory;
  }
  .kanban-column {
    scroll-snap-align: start;
  }
}

@media (max-width: 640px) {
  .kanban-board {
    grid-template-columns: repeat(4, 82%);
  }
  .kanban-column {
    min-height: auto;
  }
}
</style>
