<template>
  <div class="motion-research-container">
    <header class="view-header">
      <div>
        <h1 class="page-title">Motion Research</h1>
        <p class="page-subtitle">蒐集微互動、轉場特效與動態設計案例，提升介面的動態反饋體驗</p>
      </div>
      <button class="add-btn" @click="$emit('trigger-crud', { type: 'MOTION_RESEARCH' })">
        + 新增動態案例
      </button>
    </header>

    <div class="filter-toolbar glass-panel">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋動畫、製作工具、Tag..."
        />
      </div>

      <div class="filter-options">
        <select v-model="selectedTool" class="filter-select">
          <option value="All">所有製作工具</option>
          <option v-for="tool in toolsList" :key="tool" :value="tool">{{ tool }}</option>
        </select>

        <select v-model="selectedType" class="filter-select">
          <option value="All">所有動畫類型</option>
          <option v-for="type in typesList" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="empty-state">
      <p>無相符的動態案例。點選右上角新增一筆！</p>
    </div>

    <div class="cards-grid">
      <div 
        v-for="item in filteredList" 
        :key="item.id" 
        class="motion-card glass-panel"
        :class="{ highlighted: highlightedId === item.id }"
        :id="`item-${item.id}`"
        @mouseenter="playVideo(item.id)"
        @mouseleave="pauseVideo(item.id)"
      >
        <div class="video-media-wrapper">
          <video 
            :ref="el => videoRefs[item.id] = el"
            :src="item.videoUrl"
            class="card-video"
            loop
            muted
            playsinline
            preload="metadata"
            :poster="item.cover"
          ></video>
          
          <div class="play-indicator-overlay" :class="{ playing: playingState[item.id] }">
            <span class="indicator-icon">
              <svg v-if="!playingState[item.id]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            </span>
            <span class="indicator-text">{{ playingState[item.id] ? '預覽中' : '滑鼠移入預覽' }}</span>
          </div>
        </div>

        <div class="card-info">
          <div class="card-meta-row">
            <span class="type-badge">{{ item.motionType }}</span>
            <div class="card-actions">
              <button class="action-icon-btn edit" @click="$emit('trigger-crud', { type: 'MOTION_RESEARCH', item })" title="編輯">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button class="action-icon-btn delete" @click="handleDelete(item.id)" title="刪除">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          <h3 class="card-title">{{ item.title }}</h3>
          
          <div class="card-tools">
            <span v-for="tool in item.tools" :key="tool" class="tool-tag">{{ tool }}</span>
          </div>

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
const selectedTool = ref('All');
const selectedType = ref('All');

const videoRefs = ref({});
const playingState = ref({});

const loadData = () => {
  items.value = getStorageData('MOTION_RESEARCH');
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

const toolsList = computed(() => {
  const list = [];
  items.value.forEach(i => {
    if (i.tools) {
      i.tools.forEach(t => list.push(t));
    }
  });
  return [...new Set(list)];
});

const typesList = computed(() => {
  const list = items.value.map(i => i.motionType).filter(Boolean);
  return [...new Set(list)];
});

const filteredList = computed(() => {
  return items.value.filter(item => {
    const matchesTool = selectedTool.value === 'All' || (item.tools && item.tools.includes(selectedTool.value));
    const matchesType = selectedType.value === 'All' || item.motionType === selectedType.value;
    
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return matchesTool && matchesType;
    
    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesTakeaways = item.takeaways.toLowerCase().includes(q);
    const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(q));
    const matchesTools = item.tools && item.tools.some(tool => tool.toLowerCase().includes(q));
    
    return matchesTool && matchesType && (matchesTitle || matchesTakeaways || matchesTags || matchesTools);
  });
});

const playVideo = (id) => {
  const video = videoRefs.value[id];
  if (video) {
    video.play().then(() => {
      playingState.value[id] = true;
    }).catch(err => {
      console.warn("Autoplay was blocked: ", err);
    });
  }
};

const pauseVideo = (id) => {
  const video = videoRefs.value[id];
  if (video) {
    video.pause();
    playingState.value[id] = false;
  }
};

const handleDelete = (id) => {
  if (confirm('確定要刪除這筆動態研究案嗎？')) {
    items.value = deleteItem('MOTION_RESEARCH', id);
    emit('delete-done');
  }
};
</script>

<style scoped>
.motion-research-container {
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

.filter-options {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.motion-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.motion-card.highlighted {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px var(--glow-primary);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { border-color: rgba(139, 92, 246, 0.3); }
  50% { border-color: rgba(139, 92, 246, 0.8); }
  100% { border-color: rgba(139, 92, 246, 0.3); }
}

.video-media-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  background: black;
}

.card-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-indicator-overlay {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.7rem;
  pointer-events: none;
}

.play-indicator-overlay.playing {
  background: rgba(139, 92, 246, 0.85);
  color: white;
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

.type-badge {
  font-size: 0.7rem;
  font-weight: 600;
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

.card-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.tool-tag {
  font-size: 0.7rem;
  color: var(--text-primary);
  background: var(--bg-hover);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
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

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
