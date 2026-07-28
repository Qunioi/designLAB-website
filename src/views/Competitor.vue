<template>
  <div class="competitor-container">
    <header class="view-header">
      <div>
        <h1 class="page-title">Competitor Research</h1>
        <p class="page-subtitle">分析競品優缺點與介面流程，找出可落地之優化提案切入點</p>
      </div>
      <div class="header-actions">
        <NotificationBell />
        <button class="add-btn" @click="$emit('trigger-crud', { type: 'COMPETITORS' })">
          + 新增競品分析
        </button>
      </div>
    </header>

    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋競品名稱、優缺點..."
        />
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-state">
      <p>無相符的競品分析。點選右上角新增一筆！</p>
    </div>

    <div v-else class="cards-grid">
      <div 
        v-for="item in filteredList" 
        :key="item.id" 
        class="competitor-card glass-panel"
        :class="{ highlighted: highlightedId === item.id }"
        :id="`item-${item.id}`"
      >
        <!-- 點擊圖片展開彈窗詳情 -->
        <div class="card-media-wrapper" @click="openLightbox(item)">
          <img :src="item.logo || fallbackImg" class="card-media" :alt="item.name" />
          <div class="hover-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>點擊看詳情</span>
          </div>
          <!-- Hover 圖片右上角外連按鈕 -->
          <a 
            v-if="item.url || item.link" 
            :href="item.url || item.link" 
            target="_blank" 
            class="media-ext-link" 
            @click.stop
            title="前往參考網址"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>

        <div class="card-info" @click="openLightbox(item)">
          <div class="card-meta-row" @click.stop>
            <span class="comp-badge">競品分析</span>
            <div class="card-actions">
              <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'COMPETITORS', item })" title="編輯">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button class="action-icon-btn delete" @click="handleDelete(item)" title="刪除">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <h3 class="card-title">{{ item.name }}</h3>
        </div>
      </div>
    </div>

    <!-- Lightbox Detail Modal -->
    <Transition name="fade">
      <div v-if="lightbox.isOpen" class="lightbox-backdrop" @click="closeLightbox">
        <div class="lightbox-container glass-panel" @click.stop>
          <button class="lightbox-close" @click="closeLightbox">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div class="lightbox-scroll-area">
            <div class="lightbox-media-box" v-if="lightbox.item.screenshot">
              <img :src="lightbox.item.screenshot" class="lightbox-img" alt="" />
            </div>

            <div class="lightbox-detail-content">
              <div class="lightbox-meta-row">
                <span class="comp-badge">競品分析</span>
                <span class="lightbox-date" v-if="lightbox.item.updatedAt">更新於: {{ lightbox.item.updatedAt }}</span>
              </div>

              <h2 class="lightbox-title">{{ lightbox.item.name }}</h2>

              <!-- 優點區塊 -->
              <div class="lightbox-section pros-section" v-if="lightbox.item.pros">
                <h4 class="section-title pros-title">
                  <span class="status-dot green"></span> 優點 (Pros)
                </h4>
                <p class="section-desc">{{ lightbox.item.pros }}</p>
              </div>

              <!-- 缺點區塊 -->
              <div class="lightbox-section cons-section" v-if="lightbox.item.cons">
                <h4 class="section-title cons-title">
                  <span class="status-dot red"></span> 缺點 (Cons)
                </h4>
                <p class="section-desc">{{ lightbox.item.cons }}</p>
              </div>

              <!-- 心得區塊 -->
              <div class="lightbox-section takeaways-section" v-if="lightbox.item.takeaways">
                <h4 class="section-title takeaways-title">
                  <span class="status-dot purple"></span> 值得借鏡與參考點
                </h4>
                <p class="section-desc">{{ lightbox.item.takeaways }}</p>
              </div>

              <div class="lightbox-footer" v-if="lightbox.item.url">
                <a :href="lightbox.item.url" target="_blank" class="source-btn">
                  <span>訪問官網 ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { getStorageData, deleteItem } from '../utils/storage';
import { checkDeletePermission } from '../utils/notifications';
import NotificationBell from '../components/NotificationBell.vue';

const props = defineProps({
  highlightedId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['trigger-crud', 'delete-done']);

const items = ref([]);
const searchQuery = ref('');
const fallbackImg = 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop';

const lightbox = ref({
  isOpen: false,
  item: null
});

const openLightbox = (item) => {
  lightbox.value = {
    isOpen: true,
    item: item
  };
};

const closeLightbox = () => {
  lightbox.value.isOpen = false;
  lightbox.value.item = null;
};

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
    const matchesName = item.name && item.name.toLowerCase().includes(q);
    const matchesPros = item.pros && item.pros.toLowerCase().includes(q);
    const matchesCons = item.cons && item.cons.toLowerCase().includes(q);
    const matchesTakeaways = item.takeaways && item.takeaways.toLowerCase().includes(q);
    
    return matchesName || matchesPros || matchesCons || matchesTakeaways;
  });
});

const handleDelete = (item) => {
  const perm = checkDeletePermission(item);
  if (!perm.allowed) {
    alert(`⚠️ 權限受限：此競品案由原建立者「${perm.creatorName}」發表，非原建立者不得刪除！`);
    return;
  }

  if (confirm(`確定要刪除《${item.name}》這筆競品分析嗎？`)) {
    items.value = deleteItem('COMPETITORS', item.id);
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
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
  color: #ffffff !important;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px var(--glow-primary);
  transition: all 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--glow-primary);
}


.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.competitor-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  border-radius: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all 0.25s ease;
  cursor: pointer;
}

.competitor-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.competitor-card.highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--glow-primary);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { border-color: var(--border-color); }
  50% { border-color: var(--color-primary); }
  100% { border-color: var(--border-color); }
}


.card-media-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  background: var(--bg-hover);
  cursor: pointer;
}

.card-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
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
  transition: opacity 0.2s ease;
}

.card-media-wrapper:hover .hover-overlay {
  opacity: 1;
}

.media-ext-link {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.2s ease;
  z-index: 5;
}

.card-media-wrapper:hover .media-ext-link {
  opacity: 1;
  transform: scale(1);
}

.media-ext-link:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #ffffff;
  transform: scale(1.1) !important;
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

.comp-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--glow-primary);
  border: 1px solid var(--border-color);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}



.card-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-2px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.competitor-card:hover .card-actions {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
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
  background: var(--bg-subtle);
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
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  line-height: 1.35;
  color: var(--text-primary);
}

/* Lightbox Detail Modal */
.lightbox-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.lightbox-container {
  position: relative;
  width: 100%;
  max-width: 760px;
  max-height: 85vh;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.lightbox-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.lightbox-scroll-area {
  overflow-y: auto;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.lightbox-media-box {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: black;
  max-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-img {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
}

.lightbox-detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.lightbox-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lightbox-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.lightbox-title {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--text-primary);
}

.lightbox-section {
  background: var(--bg-subtle);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 0.88rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.pros-title { color: #10b981; }
.cons-title { color: #ef4444; }
.takeaways-title { color: var(--color-primary); }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-dot.green { background: #10b981; }
.status-dot.red { background: #ef4444; }
.status-dot.purple { background: var(--color-primary); }

.section-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-line;
}

.lightbox-footer {
  margin-top: 0.5rem;
}

.source-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--glow-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.source-btn:hover {
  background: var(--color-primary);
  color: white;
}

@media (min-width: 1440px) {
  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
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
