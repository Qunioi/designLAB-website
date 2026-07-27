<template>
  <div class="resources-container">
    <header class="view-header">
      <div>
        <h1 class="page-title">Resources</h1>
        <p class="page-subtitle">整理設計與工程開發常用網站，建立部門公共資源庫</p>
      </div>
      <button class="add-btn" @click="$emit('trigger-crud', { type: 'RESOURCES' })">
        + 新增資源網站
      </button>
    </header>

    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋資源名稱或簡介..."
        />
      </div>

      <div class="category-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="cat-tab"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-state">
      <p>無相符的資源網站。點選右上角新增一筆！</p>
    </div>

    <div v-else class="resources-grid">
      <div 
        v-for="item in filteredList" 
        :key="item.id" 
        class="resource-card glass-panel"
        :class="{ highlighted: highlightedId === item.id }"
        :id="`item-${item.id}`"
      >
        <div class="res-card-header">
          <span class="category-badge">{{ item.category }}</span>
          <div class="card-actions">
            <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'RESOURCES', item })" title="編輯"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
            <button class="action-icon-btn delete" @click="handleDelete(item.id)" title="刪除"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
        </div>
        
        <h3 class="res-name">{{ item.name }}</h3>
        <p class="res-desc">{{ item.desc || '無網站簡介' }}</p>
        
        <div class="res-card-footer">
          <a :href="item.url" target="_blank" class="visit-btn">
            <span>前往網站 ↗</span>
          </a>
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
const activeCategory = ref('All');

const loadData = () => {
  items.value = getStorageData('RESOURCES');
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

const categories = computed(() => {
  const cats = items.value.map(i => i.category);
  return ['All', ...new Set(cats)];
});

const filteredList = computed(() => {
  return items.value.filter(item => {
    const matchesCat = activeCategory.value === 'All' || item.category === activeCategory.value;
    
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return matchesCat;
    
    const matchesName = item.name.toLowerCase().includes(q);
    const matchesDesc = item.desc && item.desc.toLowerCase().includes(q);
    
    return matchesCat && (matchesName || matchesDesc);
  });
});

const handleDelete = (id) => {
  if (confirm('確定要刪除這筆資源網址嗎？')) {
    items.value = deleteItem('RESOURCES', id);
    emit('delete-done');
  }
};
</script>

<style scoped>
.resources-container {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  width: 260px;
}

.search-box input {
  font-size: 0.85rem;
  width: 100%;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cat-tab {
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.cat-tab:hover {
  color: var(--text-primary);
  background: var(--bg-subtle);
}

.cat-tab.active {
  color: var(--text-primary);
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.resource-card {
  padding: 1.25rem;
  background: var(--glass-bg);
  display: flex;
  flex-direction: column;
  height: 180px;
  justify-content: space-between;
}

.resource-card.highlighted {
  border-color: var(--color-accent);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
}

.res-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-badge {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-accent);
  background: rgba(16, 185, 129, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}

.action-icon-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
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

.res-name {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
}

.res-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 38px;
}

.res-card-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
}

.visit-btn {
  font-size: 0.75rem;
  color: var(--color-accent);
  font-weight: 500;
}

.visit-btn:hover {
  text-decoration: underline;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .resources-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .resources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
