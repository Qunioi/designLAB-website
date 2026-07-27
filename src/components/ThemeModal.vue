<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="theme-modal-backdrop" @click="close">
      <div class="theme-modal-container glass-panel" @click.stop>
        <!-- Header -->
        <div class="theme-modal-header">
          <h2>選擇 Design LAB 設計風格</h2>
          <button class="close-btn" @click="close"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>

        <!-- Body -->
        <div class="theme-modal-body">
          <p class="theme-intro">切換全站風格系統，預覽不同設計語彙在資料庫與看板上的呈現效果：</p>
          
          <div class="theme-grid">
            <div 
              v-for="theme in themes" 
              :key="theme.class"
              class="theme-card"
              :class="[theme.class, { active: currentTheme === theme.class }]"
              @click="selectTheme(theme.class)"
            >
              <!-- Theme Preview Area -->
              <div class="theme-preview-box">
                <div class="color-dots">
                  <span class="color-dot bg"></span>
                  <span class="color-dot primary"></span>
                  <span class="color-dot secondary"></span>
                  <span class="color-dot accent"></span>
                </div>
                <div class="preview-card-shape"></div>
              </div>
              
              <!-- Info -->
              <div class="theme-card-info">
                <div class="theme-name-row">
                  <h4>{{ theme.name }}</h4>
                  <span class="active-badge" v-if="currentTheme === theme.class">使用中</span>
                </div>
                <p class="theme-desc">{{ theme.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  currentTheme: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'select-theme']);

const themes = [
  {
    class: 'theme-dark-premium',
    name: '極致暗黑 (Dark Premium)',
    desc: '預設低認知負擔的暗黑色系，搭配流暢紫色與藍色漸變，讓圖片素材更聚焦。',
  },
  {
    class: 'theme-light-minimal',
    name: '極簡白日 (Light Minimal)',
    desc: '清新乾淨的灰白配色，以深色字體和高對比度的寶藍色凸顯介面重點。',
  },
  {
    class: 'theme-cyberpunk',
    name: '未來霓虹 (Cyberpunk)',
    desc: '極黑背景結合高飽和度的霓虹粉紅、螢光綠與青色，呈現強烈的科技叛逆感。',
  },
  {
    class: 'theme-glass-pro',
    name: '極致毛玻璃 (Aura Glass)',
    desc: '半透明毛玻璃層次，背景襯以緩慢流動旋轉的彩色奧若拉極光光暈，極具質感。',
  }
];

const close = () => {
  emit('close');
};

const selectTheme = (themeClass) => {
  emit('select-theme', themeClass);
};
</script>

<style scoped>
.theme-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.theme-modal-container {
  width: 100%;
  max-width: 640px;
  background: var(--bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.theme-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.theme-modal-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
}

.close-btn {
  font-size: 1.25rem;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
}

.theme-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.theme-intro {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Theme Grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
}

.theme-card {
  border-radius: 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-subtle);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.theme-card:hover {
  border-color: var(--border-color-hover);
  background: var(--bg-subtle);
  transform: translateY(-2px);
}

.theme-card.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 15px var(--glow-primary);
  background: var(--bg-subtle);
}

/* Preview Box inside Card */
.theme-preview-box {
  height: 80px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-dots {
  display: flex;
  gap: 0.35rem;
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.color-dot.bg { background-color: var(--bg-primary); }
.color-dot.primary { background-color: var(--color-primary); }
.color-dot.secondary { background-color: var(--color-secondary); }
.color-dot.accent { background-color: var(--color-accent); }

.preview-card-shape {
  width: 70px;
  height: 44px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

/* Theme Details */
.theme-card-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.theme-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-name-row h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.active-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  background: var(--color-primary);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.theme-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
}
</style>
