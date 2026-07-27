<template>
  <div class="settings-view">
    <!-- Header -->
    <header class="settings-header">
      <h1 class="settings-page-title">Personal Settings</h1>
      <p class="settings-page-sub">Manage your profile and customize the visual appearance of Design LAB.</p>
    </header>

    <div class="settings-layout">
      <!-- LEFT COLUMN: Profile -->
      <section class="settings-panel glass-panel profile-panel">
        <div class="panel-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Profile</span>
        </div>

        <!-- Avatar area -->
        <div class="profile-avatar-area">
          <div class="avatar-circle">
            <span class="avatar-letter">{{ nickname.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="avatar-meta">
            <span class="avatar-nickname">{{ nickname }}</span>
            <span class="avatar-handle">{{ username }}</span>
          </div>
        </div>

        <div class="profile-separator"></div>

        <!-- Form -->
        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="field-group">
            <label class="field-label">Account ID</label>
            <p class="field-hint">Assigned by the administrator. Cannot be changed.</p>
            <div class="field-input-wrap locked">
              <input :value="username" type="text" readonly />
              <span class="lock-indicator">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Nickname</label>
            <p class="field-hint">Your display name across Design LAB.</p>
            <input v-model="localNickname" type="text" placeholder="Enter your nickname" class="field-input" required />
          </div>

          <button type="submit" class="save-btn" :disabled="!isNicknameChanged">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Save Changes
          </button>
        </form>
      </section>

      <!-- RIGHT COLUMN: Theme Picker -->
      <section class="settings-panel glass-panel theme-panel">
        <div class="panel-label">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20 4 4 0 0 0 0-8 2 2 0 0 1 0-4 10 10 0 0 0 0-8z"></path></svg>
          <span>Appearance</span>
        </div>

        <!-- Dark Section -->
        <div class="theme-group">
          <h3 class="theme-group-label">Dark Themes</h3>
          <div class="theme-cards-row">
            <div 
              v-for="theme in darkThemes" 
              :key="theme.class"
              class="theme-card"
              :class="{ selected: currentTheme === theme.class }"
              @click="$emit('select-theme', theme.class)"
            >
              <div class="theme-preview" :style="theme.previewStyle">
                <div class="preview-sidebar" :style="{ background: theme.sidebarColor }"></div>
                <div class="preview-body">
                  <div class="preview-line long" :style="{ background: theme.textColor }"></div>
                  <div class="preview-line short" :style="{ background: theme.accentColor }"></div>
                  <div class="preview-cards-row">
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                  </div>
                </div>
              </div>
              <div class="theme-card-footer">
                <div class="theme-name-wrap">
                  <h4>{{ theme.name }}</h4>
                  <span class="selected-indicator" v-if="currentTheme === theme.class">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                </div>
                <p class="theme-card-desc">{{ theme.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Light Section -->
        <div class="theme-group">
          <h3 class="theme-group-label">Light Themes</h3>
          <div class="theme-cards-row">
            <div 
              v-for="theme in lightThemes" 
              :key="theme.class"
              class="theme-card"
              :class="{ selected: currentTheme === theme.class }"
              @click="$emit('select-theme', theme.class)"
            >
              <div class="theme-preview" :style="theme.previewStyle">
                <div class="preview-sidebar" :style="{ background: theme.sidebarColor }"></div>
                <div class="preview-body">
                  <div class="preview-line long" :style="{ background: theme.textColor }"></div>
                  <div class="preview-line short" :style="{ background: theme.accentColor }"></div>
                  <div class="preview-cards-row">
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                    <div class="preview-mini-card" :style="{ background: theme.cardColor, borderColor: theme.borderColor }"></div>
                  </div>
                </div>
              </div>
              <div class="theme-card-footer">
                <div class="theme-name-wrap">
                  <h4>{{ theme.name }}</h4>
                  <span class="selected-indicator" v-if="currentTheme === theme.class">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </span>
                </div>
                <p class="theme-card-desc">{{ theme.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  nickname: { type: String, required: true },
  username: { type: String, required: true },
  currentTheme: { type: String, required: true }
});

const emit = defineEmits(['update-nickname', 'select-theme']);

const localNickname = ref(props.nickname);

watch(() => props.nickname, (v) => { localNickname.value = v; });

const isNicknameChanged = computed(() => {
  return localNickname.value.trim() !== '' && localNickname.value !== props.nickname;
});

const saveProfile = () => {
  if (localNickname.value.trim() !== '') {
    emit('update-nickname', localNickname.value.trim());
  }
};

const darkThemes = [
  {
    class: 'theme-midnight-slate',
    name: 'Midnight Slate',
    desc: 'Refined deep navy with cool indigo accents. Clean geometry, sharp focus.',
    previewStyle: { background: '#0f1117' },
    sidebarColor: '#171b24',
    textColor: 'rgba(241,243,248,0.6)',
    accentColor: '#6366f1',
    cardColor: 'rgba(23,27,36,0.7)',
    borderColor: 'rgba(255,255,255,0.07)'
  },
  {
    class: 'theme-charcoal-ember',
    name: 'Charcoal Ember',
    desc: 'Warm dark palette, amber accents. Editorial, rounded, soft shadows.',
    previewStyle: { background: '#141210' },
    sidebarColor: '#1c1916',
    textColor: 'rgba(245,240,232,0.6)',
    accentColor: '#f59e0b',
    cardColor: 'rgba(28,25,22,0.75)',
    borderColor: 'rgba(255,200,120,0.06)'
  },
  {
    class: 'theme-obsidian-neon',
    name: 'Obsidian Neon',
    desc: 'True-black OLED with electric cyan & magenta. Futuristic scanline overlay.',
    previewStyle: { background: '#030304' },
    sidebarColor: '#0a0a0e',
    textColor: 'rgba(125,249,255,0.5)',
    accentColor: '#ff00c8',
    cardColor: 'rgba(10,10,14,0.85)',
    borderColor: 'rgba(0,255,240,0.08)'
  }
];

const lightThemes = [
  {
    class: 'theme-cloud-canvas',
    name: 'Cloud Canvas',
    desc: 'Airy white with soft blue-grey tones. Paper-like, gentle shadows.',
    previewStyle: { background: '#f8f9fc' },
    sidebarColor: '#eef0f5',
    textColor: 'rgba(15,23,42,0.5)',
    accentColor: '#4f46e5',
    cardColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(15,23,42,0.06)'
  },
  {
    class: 'theme-sand-dune',
    name: 'Sand Dune',
    desc: 'Warm cream/beige, terra-cotta accents. Organic curves, editorial typography.',
    previewStyle: { background: '#f5f0e8' },
    sidebarColor: '#ebe4d8',
    textColor: 'rgba(44,29,14,0.5)',
    accentColor: '#c2410c',
    cardColor: 'rgba(250,247,242,0.9)',
    borderColor: 'rgba(120,80,40,0.08)'
  },
  {
    class: 'theme-frost-mint',
    name: 'Frost Mint',
    desc: 'Cool mint-tinted white with teal accents. Clinical precision, compact.',
    previewStyle: { background: '#f0faf7' },
    sidebarColor: '#dff2ec',
    textColor: 'rgba(12,31,26,0.5)',
    accentColor: '#0d9488',
    cardColor: 'rgba(247,253,250,0.92)',
    borderColor: 'rgba(0,120,100,0.06)'
  }
];
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-header {
  padding-bottom: 0.5rem;
}

.settings-page-title {
  font-size: var(--fs-h1);
  font-weight: var(--fw-black);
  letter-spacing: -0.02em;
}

.settings-page-sub {
  color: var(--text-secondary);
  font-size: var(--fs-body);
  margin-top: 0.35rem;
}

/* Main layout: profile left, themes right */
.settings-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* Panel shared style */
.settings-panel {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.panel-label svg {
  opacity: 0.6;
}

/* ========= PROFILE PANEL ========= */
.profile-avatar-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-letter {
  font-family: var(--font-title);
  font-size: var(--fs-h2);
  font-weight: var(--fw-bold);
  color: #fff;
}

.avatar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.avatar-nickname {
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.avatar-handle {
  font-size: var(--fs-caption);
  color: var(--text-muted);
}

.profile-separator {
  height: 1px;
  background: var(--border-color);
}

/* Form */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field-label {
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field-hint {
  font-size: var(--fs-tiny);
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input-wrap input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  padding-right: 2.5rem;
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  color: var(--text-muted);
  cursor: not-allowed;
}

.lock-indicator {
  position: absolute;
  right: 0.75rem;
  color: var(--text-muted);
  display: flex;
}

.field-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  transition: all 0.2s ease;
}

.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--glow-primary);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: var(--color-primary);
  color: #fff;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: rgba(128, 128, 128, 0.1);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
}


/* ========= THEME PANEL ========= */
.theme-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.theme-group-label {
  font-size: var(--fs-caption);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-color);
}

.theme-cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.875rem;
}

.theme-card {
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: rgba(128, 128, 128, 0.03);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-card:hover {
  border-color: var(--border-color-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.theme-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary), var(--shadow-md);
}

/* Mini Preview */
.theme-preview {
  height: 80px;
  display: flex;
  overflow: hidden;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.preview-sidebar {
  width: 22%;
  min-width: 22%;
}

.preview-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-line {
  height: 3px;
  border-radius: 2px;
}

.preview-line.long {
  width: 70%;
}

.preview-line.short {
  width: 40%;
}

.preview-cards-row {
  display: flex;
  gap: 4px;
  margin-top: auto;
}

.preview-mini-card {
  flex: 1;
  height: 18px;
  border-radius: 3px;
  border: 1px solid;
}

/* Theme footer */
.theme-card-footer {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.theme-name-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-name-wrap h4 {
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
}

.selected-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  flex-shrink: 0;
}

.theme-card-desc {
  font-size: var(--fs-tiny);
  color: var(--text-muted);
  line-height: var(--lh-normal);
}


/* ========= RESPONSIVE ========= */
@media (max-width: 1024px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .theme-cards-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .theme-cards-row {
    grid-template-columns: 1fr;
  }
}
</style>
