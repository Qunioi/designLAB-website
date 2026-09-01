<template>
  <div class="file-uploader-box">
    <!-- 當已有媒體（URL 或已上傳檔案）時顯示預覽 -->
    <div v-if="modelValue" class="media-preview-card glass-panel">
      <div class="media-url-editor">
        <label for="media-url-input">目前素材網址</label>
        <input id="media-url-input" type="url" :value="modelValue" @input="handleUrlInput" @blur="handleUrlBlur" placeholder="貼上可公開開啟的 .mp4、.webm 或 .gif 網址" class="solid-url-input" />
      </div>
      <div class="media-preview-content">
        <div class="preview-media-wrapper clickable-preview" @click="openFullscreenModal" title="點擊全螢幕放大預覽檔案">
          <video v-if="isVideo" :src="modelValue" class="preview-media video-player" muted></video>
          <img v-else :src="modelValue" class="preview-media image-view" alt="預覽圖" />
          <div class="zoom-hover-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            <span>點擊放大</span>
          </div>
        </div>
        <div class="preview-actions">
        <div class="btn-group-row">
          <button type="button" class="preview-expand-btn" @click="openFullscreenModal" title="全螢幕檢視細節">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            <span>放大預覽</span>
          </button>
          <button type="button" class="remove-media-btn" @click="clearMedia" title="清除目前網址">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span>清除網址</span>
          </button>
        </div>
      </div>
      </div>
    </div>

    <!-- 未上傳時：明確的實體網址輸入框與拖曳上傳整合區 -->
    <div v-else class="uploader-control-area">
      <div class="url-input-group">
        <div class="input-icon-prefix">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </div>
        <input
          type="text"
          :value="modelValue"
          @input="handleUrlInput"
          @blur="handleUrlBlur"
          :placeholder="placeholder || '請貼上檔案網址'"
          class="solid-url-input"
        />
        <button
          type="button"
          class="solid-upload-btn"
          :class="{ loading: isUploading }"
          @click="triggerFileInput"
          title="從電腦選擇檔案"
        >
          <svg v-if="!isUploading" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span v-if="!isUploading">選擇檔案</span>
          <span v-else>處理中...</span>
        </button>
        <input
          type="file"
          ref="fileInputRef"
          class="hidden-file-input"
          :accept="accept"
          @change="handleFileSelect"
        />
      </div>

      <!-- 拖曳提示區 (Drop Zone) -->
      <div
        class="compact-dropzone"
        :class="{ 'is-dragging': isDragging }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drop-icon"><path d="M4 14.89 8.93 10a2 2 0 0 1 2.83 0l4.24 4.24a2 2 0 0 0 2.83 0L20 13"></path><circle cx="8" cy="7" r="1.5"></circle><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>
        <span>或拖曳本地檔案（圖片或影片）至此區塊快速上傳</span>
      </div>
    </div>

    <!-- 全螢幕放大檢視燈箱 (Fullscreen Overlay) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showFullscreenModal" class="fullscreen-preview-backdrop" @click="closeFullscreenModal">
          <button type="button" class="preview-close-btn" @click="closeFullscreenModal" title="關閉預覽 (ESC)">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="fullscreen-media-container" @click.stop>
            <video v-if="isVideo" :src="modelValue" controls autoplay class="fullscreen-video"></video>
            <img v-else :src="modelValue" class="fullscreen-image" alt="全螢幕預覽" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { uploadFile } from '../utils/upload';
import { ensureProtocol } from '../utils/formatters';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
  default: 'image/*,video/*'
  },
  placeholder: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const fileInputRef = ref(null);
const isUploading  = ref(false);
const isDragging   = ref(false);
const showFullscreenModal = ref(false);

const isVideo = computed(() => {
  if (!props.modelValue) return false;
  return props.modelValue.startsWith('data:video') || 
         /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(props.modelValue);
});

const handleUrlInput = (e) => {
  emit('update:modelValue', e.target.value);
};

const handleUrlBlur = (e) => {
  const val = e.target.value;
  if (val && val.trim()) {
    const formatted = ensureProtocol(val);
    emit('update:modelValue', formatted);
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const processFile = async (file) => {
  if (!file) return;
  isUploading.value = true;
  try {
    const res = await uploadFile(file);
    emit('update:modelValue', res.url);
  } catch (err) {
    console.error('File convert failed', err);
    alert('檔案處理失敗，請重試。');
  } finally {
    isUploading.value = false;
    isDragging.value = false;
  }
};

const handleFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (file) processFile(file);
};

const handleDragOver = () => { isDragging.value = true; };
const handleDragLeave = () => { isDragging.value = false; };
const handleDrop = (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
};

const clearMedia = () => {
  emit('update:modelValue', '');
};

const openFullscreenModal = () => {
  showFullscreenModal.value = true;
};

const closeFullscreenModal = () => {
  showFullscreenModal.value = false;
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && showFullscreenModal.value) {
    closeFullscreenModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.file-uploader-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

/* ── 實體網址輸入框 + 上傳按鈕組合框 ────────────────── */
.uploader-control-area {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 100%;
}

.url-input-group {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.url-input-group:focus-within {
  border-color: var(--color-primary);
}

.input-icon-prefix {
  padding-left: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.solid-url-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.65rem 0.85rem;
  font-size: 0.7875rem;
  color: var(--text-primary);
  outline: none;
  font-family: var(--font-body);
}

.solid-url-input::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

.solid-upload-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-hover);
  border-left: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.65rem 1rem;
  font-size: 0.7625rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  user-select: none;
}

.solid-upload-btn:hover {
  background: var(--color-primary);
  color: #ffffff;
}

.solid-upload-btn.loading {
  opacity: 0.6;
  pointer-events: none;
}

.hidden-file-input {
  display: none;
}

/* ── 輕量拖曳提示區 (Compact Dropzone) ──────────────── */
.compact-dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: var(--bg-input);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.7375rem;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.compact-dropzone:hover,
.compact-dropzone.is-dragging {
  border-color: var(--color-primary);
  background: var(--bg-hover);
  color: var(--color-primary);
}

.drop-icon {
  flex-shrink: 0;
}

/* ── 已有媒體時的預覽卡片 (Preview Card) ────────────── */
.media-preview-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.media-url-editor {
  display: grid;
  gap: 0.35rem;
}

.media-url-editor label {
  color: var(--text-secondary);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.media-url-editor .solid-url-input {
  width: 100%;
  min-height: 40px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.75rem;
  font-size: var(--fs-body);
  color: var(--text-primary);
}

.media-url-editor .solid-url-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent);
  outline: none;
}

.media-preview-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.preview-media-wrapper {
  position: relative;
  width: 100px;
  height: 65px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.zoom-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  color: #ffffff;
  font-size: var(--fs-meta);
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-media-wrapper:hover .zoom-hover-overlay {
  opacity: 1;
}

.preview-media-wrapper:hover .preview-media {
  transform: scale(1.08);
}

.preview-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

@media (max-width: 640px) {
  .media-preview-content {
    align-items: stretch;
    flex-direction: column;
  }

  .preview-media-wrapper {
    width: 100%;
    height: 120px;
  }

  .btn-group-row > button {
    min-height: 40px;
    flex: 1;
  }
}

.preview-url-text {
  font-size: 0.7175rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-group-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--color-primary);
  font-size: 0.7175rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}

.preview-expand-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}

.remove-media-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--color-danger);
  font-size: 0.7175rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.remove-media-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--color-danger);
}

/* ── 全螢幕燈箱彈窗 (Fullscreen Lightbox) ───────────── */
.fullscreen-preview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.preview-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  z-index: 1001;
}

.preview-close-btn:hover {
  background: var(--color-danger);
  border-color: var(--color-danger);
  transform: scale(1.1);
}

.fullscreen-media-container {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.fullscreen-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
}

.fullscreen-video {
  max-width: 90vw;
  max-height: 85vh;
  outline: none;
  border-radius: 12px;
}
</style>
