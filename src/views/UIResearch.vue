<template>
  <div class="ui-research-container">
    <header class="view-header">
      <div>
        <h1 class="page-title">UI Research</h1>
        <p class="page-subtitle">建立與整理介面設計案例，做為日常設計靈感與優化依據</p>
      </div>
      <button class="add-btn" @click="$emit('trigger-crud', { type: 'UI_RESEARCH' })">
        + 新增 UI 研究
      </button>
    </header>

    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋標題、Tag 或心得..."
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
      <p>無相符的 UI 研究案例。點選右上角新增一筆！</p>
    </div>
    
    <div v-else class="cards-grid">
      <div 
        v-for="item in filteredList" 
        :key="item.id" 
        class="ui-card glass-panel"
        :class="{ highlighted: highlightedId === item.id }"
        :id="`item-${item.id}`"
      >
        <div class="card-media-wrapper" @click="openLightbox(item.cover, item.title)">
          <img :src="item.cover" class="card-media" :alt="item.title" />
          <div class="hover-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>點擊放大</span>
          </div>
        </div>

        <div class="card-info">
          <div class="card-meta-row">
            <span class="category-badge">{{ item.category }}</span>
            <div class="card-actions">
              <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'UI_RESEARCH', item })" title="編輯">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button class="action-icon-btn delete" @click="handleDelete(item.id)" title="刪除">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
          
          <h3 class="card-title">{{ item.title }}</h3>
          
          <div class="card-tags">
            <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          
          <p class="card-takeaways">{{ item.takeaways }}</p>
          
          <div class="card-footer" v-if="item.source">
            <a :href="item.source" target="_blank" class="source-link">
              <span>來源網址 →</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Transition name="fade">
      <div v-if="lightbox.isOpen" class="lightbox-backdrop" @click="closeLightbox">
        <div class="lightbox-container" @click.stop>
          <img :src="lightbox.imgUrl" class="lightbox-img" alt="" />
          <div class="lightbox-title">{{ lightbox.title }}</div>
          <button class="lightbox-close" @click="closeLightbox"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
      </div>
    </Transition>
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
  items.value = getStorageData('UI_RESEARCH');
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
  const allCats = items.value.map(i => i.category);
  return ['All', ...new Set(allCats)];
});

const filteredList = computed(() => {
  return items.value.filter(item => {
    const matchesCat = activeCategory.value === 'All' || item.category === activeCategory.value;
    
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return matchesCat;
    
    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesTakeaways = item.takeaways.toLowerCase().includes(q);
    const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(q));
    
    return matchesCat && (matchesTitle || matchesTakeaways || matchesTags);
  });
});

const handleDelete = (id) => {
  if (confirm('確定要刪除這筆 UI 研究案嗎？')) {
    items.value = deleteItem('UI_RESEARCH', id);
    emit('delete-done');
  }
};

const lightbox = ref({
  isOpen: false,
  imgUrl: '',
  title: ''
});

const openLightbox = (url, title) => {
  lightbox.value.isOpen = true;
  lightbox.value.imgUrl = url;
  lightbox.value.title = title;
};

const closeLightbox = () => {
  lightbox.value.isOpen = false;
};
</script>

<style scoped>
.ui-research-container {
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
  width: 300px;
}

.search-box input {
  font-size: 0.85rem;
  width: 100%;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
}

.cat-tab {
  padding: 0.4rem 1rem;
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
  background: var(--glow-primary);
  border: 1px solid var(--color-primary);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.ui-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.ui-card.highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--glow-primary);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { border-color: rgba(139, 92, 246, 0.3); }
  50% { border-color: rgba(139, 92, 246, 0.8); }
  100% { border-color: rgba(139, 92, 246, 0.3); }
}

.card-media-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  cursor: pointer;
  overflow: hidden;
}

.card-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-media-wrapper:hover .card-media {
  transform: scale(1.05);
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.85rem;
  gap: 0.5rem;
  transition: opacity 0.3s ease;
}

.card-media-wrapper:hover .hover-overlay {
  opacity: 1;
}

.card-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-secondary);
  background: rgba(59, 130, 246, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
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

.card-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.card-takeaways {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
  flex: 1;
}

.card-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  padding-top: 0.75rem;
}

.source-link {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 500;
}

.source-link:hover {
  text-decoration: underline;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: var(--text-secondary);
}

.lightbox-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.lightbox-container {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-img {
  max-width: 100%;
  max-height: 75vh;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  object-fit: contain;
}

.lightbox-title {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.lightbox-close {
  position: absolute;
  top: -2.5rem;
  right: 0;
  font-size: 2rem;
  color: white;
}

@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
