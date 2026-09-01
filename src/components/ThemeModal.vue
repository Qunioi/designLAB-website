<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="theme-modal-backdrop" @click="close">
      <div class="theme-modal-container glass-panel" role="dialog" aria-modal="true" aria-labelledby="theme-modal-title" @click.stop>
        <!-- Header -->
        <div class="theme-modal-header">
          <h2 id="theme-modal-title">選擇 Design LAB 視覺風格</h2>
          <button class="close-btn" @click="close" aria-label="關閉"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
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
    class: 'theme-midnight-indigo',
    name: 'Palenight Theme',
  },
  {
    class: 'theme-github-dark',
    name: '石墨藍 (Graphite Blue)',
  },
  {
    class: 'theme-nord-dark',
    name: '極地暗夜 (Nord Polar Night)',
  },
  {
    class: 'theme-obsidian-neon',
    name: '暖焰工坊 (Ember Atelier)',
  },
  {
    class: 'theme-cloud-canvas',
    name: '雲端畫布 (Cloud Canvas)',
  },
  {
    class: 'theme-material-light',
    name: '材質晴光 (Material Light)',
  },
  {
    class: 'theme-office-access',
    name: 'Office 酒紅 (Office Access)',
  },
  {
    class: 'theme-nord-light',
    name: '極地雪原 (Nord Snow)',
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
  inset: 0;
  background: var(--modal-backdrop);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-overlay);
  padding: 1.5rem;
}

.theme-modal-container {
  width: 100%;
  max-width: 760px;
  max-height: var(--modal-max-height);
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  border-radius: var(--modal-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.theme-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--modal-header-padding);
  border-bottom: 1px solid var(--border-color);
}

.theme-modal-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
}

.close-btn {
  width: var(--modal-control-size);
  height: var(--modal-control-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.188rem;
  color: var(--text-muted);
  transition: color 0.18s ease;
}

.close-btn:hover {
  color: var(--text-primary);
}

.close-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.theme-modal-body {
  padding: var(--modal-padding);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  overflow-y: auto;
}

.theme-intro {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Theme Grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
  margin-top: 0.25rem;
}

.theme-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.18s ease, transform 0.15s ease, background-color 0.18s ease;
  display: flex;
  flex-direction: column;
}

.theme-card:hover {
  border-color: var(--border-color-hover);
  background: var(--bg-card-hover);
  transform: translateY(-1px);
}

.theme-card.active {
  border-color: var(--color-primary);
  background: var(--bg-card-hover);
}

/* Preview Box inside Card */
.theme-preview-box {
  height: 64px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 0.65rem;
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
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.color-dot.bg { background-color: var(--bg-primary); }
.color-dot.primary { background-color: var(--color-primary); }
.color-dot.secondary { background-color: var(--color-secondary); }
.color-dot.accent { background-color: var(--color-accent); }

.preview-card-shape {
  width: 58px;
  height: 36px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: var(--shadow-sm);
}

/* Theme Details */
.theme-card-info {
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.theme-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-name-row h4 {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.active-badge {
  font-size: var(--fs-tiny);
  font-weight: 700;
  color: #ffffff;
  background: var(--color-primary);
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

@media (max-width: 640px) {
  .theme-modal-backdrop { padding: 0.75rem; }
  .theme-modal-container { max-height: calc(100dvh - 1.5rem); border-radius: 16px; }
  .theme-modal-header,
  .theme-modal-body { padding-left: 1rem; padding-right: 1rem; }
  .theme-grid {
    grid-template-columns: 1fr;
  }
}
</style>
