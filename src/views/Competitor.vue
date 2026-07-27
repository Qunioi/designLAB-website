<template>
  <div class="competitor-container">
    <header class="view-header">
      <div>
        <h1 class="page-title">Competitor Research</h1>
        <p class="page-subtitle">分析競品優缺點與介面流程，找出可落地之優化提案切入點</p>
      </div>
      <button class="add-btn" @click="$emit('trigger-crud', { type: 'COMPETITORS' })">
        + 新增競品分析
      </button>
    </header>

    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋競品名稱或內容..."
        />
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-state">
      <p>無相符的競品分析。點選右上角新增一筆！</p>
    </div>

    <div v-else class="competitor-list">
      <div 
        v-for="item in filteredList" 
        :key="item.id" 
        class="competitor-card glass-panel"
        :class="{ highlighted: highlightedId === item.id }"
        :id="`item-${item.id}`"
      >
        <div class="comp-card-header">
          <div class="comp-title-group">
            <h2 class="comp-name">{{ item.name }}</h2>
            <a :href="item.url" target="_blank" class="comp-url" v-if="item.url">
              訪問官網 ↗
            </a>
          </div>
          <div class="comp-meta-actions">
            <span class="update-date">更新於: {{ item.updatedAt || '未記錄' }}</span>
            <div class="card-actions">
              <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'COMPETITORS', item })" title="編輯"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
              <button class="action-icon-btn delete" @click="handleDelete(item.id)" title="刪除"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
          </div>
        </div>

        <div class="comp-card-body">
          <div class="comp-screenshot-wrapper" v-if="item.screenshot">
            <img :src="item.screenshot" class="comp-screenshot" :alt="item.name" />
          </div>

          <div class="comp-analysis-grid">
            <div class="analysis-box pros-box">
              <h4 class="analysis-title">
                <span class="status-dot green"></span> 優點 (Pros)
              </h4>
              <p class="analysis-content">{{ item.pros }}</p>
            </div>

            <div class="analysis-box cons-box">
              <h4 class="analysis-title">
                <span class="status-dot red"></span> 缺點 (Cons)
              </h4>
              <p class="analysis-content">{{ item.cons }}</p>
            </div>

            <div class="analysis-box inspiration-box">
              <h4 class="analysis-title">
                <span class="status-dot purple"></span> 值得借鏡與參考點
              </h4>
              <p class="analysis-content">{{ item.takeaways }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { getStorageData, deleteItem } from '../utils/storage';

const props = defineProps({
  highlightedId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['trigger-crud', 'delete-done']);

const items = ref([]);
const searchQuery = ref('');

const loadData = () => {
  items.value = getStorageData('COMPETITORS');
};

onMounted(() => {
  loadData();
  if (props.highlightedId) {
    nextTick(() => {
      const el = document.getElementById(`item-${props.highlightedId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
});

const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter(item => {
    return item.name.toLowerCase().includes(q) ||
           (item.pros && item.pros.toLowerCase().includes(q)) ||
           (item.cons && item.cons.toLowerCase().includes(q)) ||
           (item.takeaways && item.takeaways.toLowerCase().includes(q));
  });
});

const handleDelete = (id) => {
  if (confirm('確定要刪除這筆競品分析嗎？')) {
    items.value = deleteItem('COMPETITORS', id);
    emit('delete-done');
  }
};
</script>

<style scoped>
.competitor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.add-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.filter-toolbar {
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  width: 300px;
}

.search-box input {
  font-size: 0.85rem;
  width: 100%;
}

.competitor-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.competitor-card {
  padding: 1.5rem;
  background: var(--glass-bg);
}

.competitor-card.highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--glow-primary);
}

.comp-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.comp-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.comp-name {
  font-size: 1.4rem;
  font-weight: 700;
}

.comp-url {
  font-size: 0.8rem;
  color: var(--color-secondary);
}

.comp-url:hover {
  text-decoration: underline;
}

.comp-meta-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.update-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.action-icon-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  background: var(--bg-hover);
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

.comp-card-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
}

.comp-screenshot-wrapper {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  height: 200px;
}

.comp-screenshot {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comp-analysis-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analysis-box {
  padding: 1rem;
  border-radius: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
}

.analysis-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.green { background-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
.status-dot.red { background-color: var(--color-danger); box-shadow: 0 0 8px var(--color-danger); }
.status-dot.purple { background-color: var(--color-primary); box-shadow: 0 0 8px var(--color-primary); }

.analysis-content {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-line;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .comp-card-body {
    grid-template-columns: 1fr;
  }
}
</style>
