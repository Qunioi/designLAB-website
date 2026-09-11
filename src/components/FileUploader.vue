<template>
  <div class="file-uploader-box">
    <input
      ref="fileInputRef"
      class="hidden-file-input"
      type="file"
      :accept="accept"
      :required="required && !modelValue"
      @change="handleFileSelect"
    />

    <div v-if="isUploading" class="uploader-uploading-card">
      <div class="uploading-header">
        <div class="uploading-icon-spinner">
          <Spinner :size="28" />
        </div>
        <div class="uploading-info">
          <div class="uploading-filename">{{ selectedFile?.name || '檔案上傳中...' }}</div>
          <div class="uploading-meta">正在上傳至 Cloudflare R2 · {{ uploadProgress }}%</div>
        </div>
      </div>
      <div class="upload-progress-bar">
        <div class="upload-progress-fill" :style="{ transform: `scaleX(${uploadProgress / 100})` }"></div>
      </div>
    </div>

    <div v-else-if="modelValue || selectedFile" class="media-preview-card">
      <div class="preview-thumbnail-container" @click="openFullscreenModal" title="點擊放大預覽">
        <video
          v-if="isVideo"
          :src="previewSource"
          class="preview-media"
          muted
          preload="metadata"
        ></video>
        <img
          v-else-if="!imageLoadError"
          :src="previewSource"
          class="preview-media"
          alt="圖片預覽"
          @error="imageLoadError = true"
        />
        <div v-else class="preview-fallback-box">
          <Icon name="image" :size="24" :stroke-width="1.8" />
          <span>圖片無法載入</span>
        </div>

        <div class="thumbnail-hover-overlay">
          <Icon name="zoom-in" :size="20" />
        </div>

        <span v-if="isVideo" class="video-badge">
          <Icon name="play" :size="12" />
          影片
        </span>
      </div>

      <div class="preview-main-info">
        <div class="file-header-row">
          <div class="file-title-wrap">
            <h4 class="clean-file-name" :title="rawFileName">{{ displayFileName }}</h4>
            <div class="file-badges">
              <span class="badge badge-type">{{ isVideo ? 'MP4 / 影片' : '圖片素材' }}</span>
              <span v-if="selectedFile?.size" class="badge badge-size">{{ selectedFile.size }}</span>
              <span class="badge badge-status">
                <span class="status-dot"></span> 已就緒
              </span>
            </div>
          </div>
        </div>

        <div class="action-btn-row">
          <BaseButton variant="secondary" size="sm" type="button" @click="triggerFileInput" title="從本機選擇新檔案重新上傳">
            <template #icon><Icon name="refresh" :size="14" /></template>
            重新上傳
          </BaseButton>

          <BaseButton variant="secondary" size="sm" type="button" @click="openFileManager" title="從媒體庫中選擇已上傳檔案">
            <template #icon><Icon name="folder" :size="14" /></template>
            媒體庫
          </BaseButton>


          <BaseButton variant="danger" size="sm" type="button" @click="clearMedia" title="移除此檔案">
            <template #icon><Icon name="trash" :size="14" /></template>
            移除
          </BaseButton>
        </div>
      </div>
    </div>

    <div
      v-else
      class="uploader-dropzone-box"
      :class="{ 'is-dragging': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <div class="dropzone-content">
        <div class="dropzone-icon-circle">
          <Icon name="upload" :size="28" :stroke-width="1.8" />
        </div>

        <div class="dropzone-text-group">
          <p class="dropzone-primary-text">
            <span class="click-highlight">點擊此處上傳</span> 或將檔案拖曳至此
          </p>
          <p class="dropzone-sub-text">
            {{ formatHintText }}
          </p>
        </div>

        <div class="dropzone-divider-row">
          <span class="divider-line"></span>
          <span class="divider-text">或</span>
          <span class="divider-line"></span>
        </div>

        <BaseButton variant="primary" size="sm" type="button" @click.stop="openFileManager">
          從媒體庫選取
        </BaseButton>
      </div>
    </div>

    <Teleport to="body">
      <!-- 從表單彈窗再開的彈窗（stacked）；Esc 由本元件處理（全螢幕預覽開著時先關預覽） -->
      <MediaPickerModal
        :open="showFileManager"
        title="媒體庫檔案總管"
        subtitle="選擇先前已儲存在 Cloudflare R2 的圖片或影片素材"
        icon="folder"
        close-label="關閉媒體庫"
        layer="stacked"
        panel-class="file-manager-modal"
        :close-on-esc="false"
        :tabs="managerTabs"
        v-model:tab="managerFilter"
        tabs-label="依檔案類型篩選"
        v-model:search="managerSearch"
        search-placeholder="搜尋檔案名稱…"
        card-min-width="170px"
        :empty="isLoadingFiles || Boolean(fileManagerError) || visibleManagedFiles.length === 0"
        @close="showFileManager = false"
      >
        <template #toolbar-end>
          <BaseButton variant="primary" size="sm" type="button" @click="triggerFileInput">
            <template #icon><Icon name="plus" :size="14" /></template>
            上傳新檔案
          </BaseButton>
        </template>

        <template #empty>
          <EmptyState v-if="isLoadingFiles" fill title="連線讀取 R2 素材清單中…">
            <template #icon><Spinner :size="26" /></template>
          </EmptyState>

          <EmptyState v-else-if="fileManagerError" fill tone="danger" icon="alert-circle" :title="fileManagerError" />

          <EmptyState
            v-else-if="managedFiles.length === 0"
            fill
            icon="image"
            title="目前尚無已儲存的素材"
            description="您可以點擊右上方的「上傳新檔案」，將第一張圖片或影片加入媒體庫。"
          >
            <template #actions>
              <BaseButton variant="primary" type="button" @click="triggerFileInput">立即上傳檔案</BaseButton>
            </template>
          </EmptyState>

          <EmptyState
            v-else-if="visibleManagedFiles.length === 0"
            fill
            :icon="managerSearch.trim() ? 'search-x' : (managerFilter === 'videos' ? 'video' : 'image')"
            :title="managerSearch.trim() ? `找不到符合「${managerSearch.trim()}」的檔案` : (managerFilter === 'videos' ? '目前媒體庫中尚未有任何影片素材' : (managerFilter === 'images' ? '目前媒體庫中尚未有任何圖片素材' : '目前尚無符合條件的檔案'))"
            :description="managerSearch.trim() ? '請檢查輸入的關鍵字是否有誤，或清除搜尋。' : (managerFilter === 'videos' ? '您可以點擊右上方「上傳新檔案」將 MP4、WEBM 影片加入媒體庫。' : (managerFilter === 'images' ? '您可以點擊右上方「上傳新檔案」將圖片素材加入媒體庫。' : ''))"
          >
            <template #actions>
              <BaseButton v-if="managerSearch.trim()" variant="secondary" size="sm" @click="managerSearch = ''">清除搜尋關鍵字</BaseButton>
              <BaseButton v-if="managerFilter !== 'all'" variant="secondary" size="sm" @click="managerFilter = 'all'; managerSearch = ''">查看全部媒體檔案 ({{ managedFiles.length }})</BaseButton>
              <BaseButton v-if="!managerSearch.trim()" variant="primary" size="sm" type="button" @click="triggerFileInput">立即上傳新檔案</BaseButton>
            </template>
          </EmptyState>
        </template>

            <SelectCard
              v-for="file in visibleManagedFiles"
              :key="file.key"
              class="managed-file-card"
              :class="{ 'is-incompatible': !canUseFile(file) }"
              media-class="card-media-wrap"
              body-class="card-info-wrap"
            >
              <template #media>
                <video
                  v-if="/\.(mp4|webm|mov)$/i.test(file.name)"
                  :src="file.publicUrl"
                  muted
                  preload="metadata"
                ></video>
                <img
                  v-else
                  :src="file.publicUrl"
                  :alt="file.name"
                  loading="lazy"
                />

                <div class="card-hover-actions">
                  <BaseButton variant="primary" size="sm" type="button" :disabled="!canUseFile(file)" @click="selectManagedFile(file)">
                    {{ canUseFile(file) ? '選取此檔案' : '格式不相符' }}
                  </BaseButton>
                </div>

                <span v-if="/\.(mp4|webm|mov)$/i.test(file.name)" class="card-media-badge">影片</span>
              </template>
                <div class="card-title-col">
                  <strong :title="cleanFileNameString(file.name)">{{ cleanFileNameString(file.name) }}</strong>
                  <small>{{ file.key.startsWith('images/') ? '圖片' : '影片' }}</small>
                </div>
                <IconButton icon="trash-2" size="sm" variant="delete" label="從 R2 刪除檔案" @click="removeManagedFile(file)" />
            </SelectCard>
      </MediaPickerModal>

      <div
        v-if="showFullscreenModal"
        class="fullscreen-preview-backdrop"
        :class="activeThemeClass"
        @click="closeFullscreenModal"
      >
        <button
          type="button"
          class="preview-close-btn"
          aria-label="關閉預覽"
          @click="closeFullscreenModal"
        >
          <Icon name="close" :size="24" />
        </button>
        <div class="fullscreen-media-container" @click.stop>
          <video
            v-if="isVideo"
            :src="previewSource"
            controls
            autoplay
            class="fullscreen-video"
          ></video>
          <img
            v-else
            :src="previewSource"
            class="fullscreen-image"
            alt="全螢幕預覽"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import SelectCard from './base/SelectCard.vue';
import EmptyState from './base/EmptyState.vue';
import { confirmDialog } from '../utils/confirm';
import MediaPickerModal from './MediaPickerModal.vue';
import IconButton from './base/IconButton.vue';
import Icon from './base/Icon.vue';
import BaseButton from './base/BaseButton.vue';
import Spinner from './base/Spinner.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { deleteUploadedFile, formatFileSize, listUploadedFiles, uploadFile, validateMediaFile } from '../utils/upload';
import { toast } from '../utils/toast';
import { getUserTheme } from '../utils/userStore';

const props = defineProps({
  modelValue: { type: String, default: '' },
  accept: { type: String, default: 'image/*,video/*' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const fileInputRef = ref(null);
const selectedFile = ref(null);
const previewUrl = ref('');
const isUploading = ref(false);
const uploadProgress = ref(0);
const isDragging = ref(false);
const showFullscreenModal = ref(false);
const showFileManager = ref(false);
const managedFiles = ref([]);
const isLoadingFiles = ref(false);
const fileManagerError = ref('');
const managerFilter = ref('all');
const managerSearch = ref('');
const imageLoadError = ref(false);

// 動態取得當前使用者主題，確保 Teleport 彈窗繼承同一套色彩
const activeThemeClass = computed(() => {
  try {
    return getUserTheme() || 'theme-cloud-canvas';
  } catch {
    return 'theme-cloud-canvas';
  }
});

const previewSource = computed(() => previewUrl.value || props.modelValue);

// 去掉 UUID／時間戳前綴，只顯示原始檔名
const cleanFileNameString = (str) => {
  if (!str) return '';
  const decoded = decodeURIComponent(str).split('/').pop().split('?')[0];
  return decoded
    .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, '')
    .replace(/^[0-9a-fA-F-]{20,40}-/, '')
    .replace(/^\d{10,}-/, '');
};

const rawFileName = computed(() => {
  if (selectedFile.value?.name) return selectedFile.value.name;
  if (!props.modelValue) return '';
  return decodeURIComponent(props.modelValue.split('/').pop().split('?')[0]);
});

const displayFileName = computed(() => {
  const name = selectedFile.value?.name || rawFileName.value;
  return cleanFileNameString(name);
});

const isVideo = computed(() => {
  return Boolean(
    selectedFile.value?.type === 'video' ||
    /\.(mp4|webm|mov)(\?.*)?$/i.test(previewSource.value)
  );
});

const formatHintText = computed(() => {
  const acceptsImage = props.accept.includes('image');
  const acceptsVideo = props.accept.includes('video');
  if (acceptsImage && acceptsVideo) return '圖片最大 10MB · 影片請控制在50mb以下（硬限制100MB）';
  if (acceptsVideo) return '影片請控制在50mb以下';
  return '支援 JPG、PNG、WEBP 格式 · 檔案最大 5 MB；GIF 最大 10 MB';
});

const imageFilesCount = computed(() => {
  return managedFiles.value.filter((f) => !/\.(mp4|webm|mov)$/i.test(f.name)).length;
});

const videoFilesCount = computed(() => {
  return managedFiles.value.filter((f) => /\.(mp4|webm|mov)$/i.test(f.name)).length;
});

const managerTabs = computed(() => [
  { value: 'all', label: `全部 (${managedFiles.value.length})` },
  { value: 'images', label: `圖片 (${imageFilesCount.value})` },
  { value: 'videos', label: `影片 (${videoFilesCount.value})` }
]);

const triggerFileInput = () => {
  imageLoadError.value = false;
  fileInputRef.value?.click();
};

const processFile = async (file) => {
  if (!file) return;
  try {
    const fileInfo = validateMediaFile(file);
    if (!canUseFile(file)) {
      const expected = props.accept.includes('video') && !props.accept.includes('image')
        ? '影片檔案（MP4 / WEBM / MOV）'
        : '圖片檔案';
      throw new Error(`檔案格式不符：此欄位僅接受${expected}。`);
    }
    selectedFile.value = {
      name: file.name,
      size: formatFileSize(file.size),
      type: fileInfo.isVideo ? 'video' : 'image'
    };
    imageLoadError.value = false;
    previewUrl.value = URL.createObjectURL(file);
    isUploading.value = true;
    uploadProgress.value = 0;

    const result = await uploadFile(file, (progress) => {
      uploadProgress.value = progress;
    });

    emit('update:modelValue', result.url);
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
    selectedFile.value = { ...selectedFile.value, size: result.size };
    if (showFileManager.value) {
      showFileManager.value = false;
    }
  } catch (error) {
    toast.error('檔案上傳失敗', { detail: error.message || '請稍後再試一次。' });
    selectedFile.value = null;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  } finally {
    isUploading.value = false;
    isDragging.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

const handleFileSelect = (event) => processFile(event.target.files?.[0]);
const handleDrop = (event) => processFile(event.dataTransfer?.files?.[0]);

const clearMedia = async () => {
  const currentUrl = props.modelValue;
  emit('update:modelValue', '');
  selectedFile.value = null;
  imageLoadError.value = false;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';

  if (currentUrl && /\/((images|videos)\/)[^/]+$/i.test(currentUrl)) {
    try {
      await deleteUploadedFile(currentUrl);
    } catch (error) {
      console.warn('[R2] delete failed:', error);
    }
  }
};

const openFileManager = async () => {
  showFileManager.value = true;
  isLoadingFiles.value = true;
  fileManagerError.value = '';
  managerFilter.value = 'all';
  managerSearch.value = '';
  try {
    const files = await listUploadedFiles();
    managedFiles.value = files;
  } catch (error) {
    fileManagerError.value = error.message || '無法讀取媒體庫清單';
  } finally {
    isLoadingFiles.value = false;
  }
};

const visibleManagedFiles = computed(() => {
  return managedFiles.value.filter((file) => {
    const isVideoFile = /\.(mp4|webm|mov)$/i.test(file.name);
    const matchesType =
      managerFilter.value === 'all' ||
      (managerFilter.value === 'videos' ? isVideoFile : !isVideoFile);
    return matchesType && file.name.toLowerCase().includes(managerSearch.value.trim().toLowerCase());
  });
});

const canUseFile = (file) => {
  if (props.accept.includes('video') && props.accept.includes('image')) return true;
  if (props.accept.includes('video')) return /\.(mp4|webm|mov)$/i.test(file.name);
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
};

const selectManagedFile = (file) => {
  imageLoadError.value = false;
  emit('update:modelValue', file.publicUrl);
  selectedFile.value = {
    name: file.name,
    size: '已儲存素材',
    type: /\.(mp4|webm|mov)$/i.test(file.name) ? 'video' : 'image'
  };
  showFileManager.value = false;
};

const removeManagedFile = async (file) => {
  const ok = await confirmDialog({
    title: '永久刪除這個檔案？',
    message: `「${cleanFileNameString(file.name)}」會從 Cloudflare R2 媒體庫刪除，已經在使用這個檔案的項目會顯示不出來。`,
    confirmText: '永久刪除',
    danger: true
  });
  if (!ok) return;
  try {
    await deleteUploadedFile(file.publicUrl);
    managedFiles.value = managedFiles.value.filter((item) => item.key !== file.key);
    if (props.modelValue === file.publicUrl) {
      clearMedia();
    }
  } catch (error) {
    toast.error('素材刪除失敗', { detail: error.message || '請稍後再試一次。' });
  }
};


const openFullscreenModal = () => {
  if (previewSource.value) showFullscreenModal.value = true;
};

const closeFullscreenModal = () => {
  showFullscreenModal.value = false;
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    closeFullscreenModal();
    showFileManager.value = false;
  }
};

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
</script>

<style scoped>
.file-uploader-box {
  width: 100%;
  font-family: var(--font-body);
}

.hidden-file-input {
  display: none;
}

.uploader-dropzone-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-5) var(--space-3);
  background: var(--bg-input);
  border: 1.5px dashed var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
  text-align: center;
}

.uploader-dropzone-box:hover,
.uploader-dropzone-box.is-dragging {
  border-color: var(--color-primary);
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  max-width: 380px;
}

.dropzone-icon-circle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: var(--control-height-sm);
  border-radius: 50%;
  color: var(--color-primary);
  transition: transform var(--dur-base) var(--ease-standard);
}

.uploader-dropzone-box:hover .dropzone-icon-circle {
  transform: scale(1.08);
}

.dropzone-text-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.dropzone-primary-text {
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
  margin: 0;
}

.click-highlight {
  font-weight: var(--fw-semibold);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dropzone-sub-text {
  font-size: var(--fs-meta);
  color: var(--text-secondary);
  opacity: 0.95;
  margin: 0;
}

.dropzone-divider-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  margin: var(--space-1) 0;
}

.uploader-dropzone-box .dropzone-divider-row {
  display: none;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  font-size: var(--fs-meta);
  color: var(--text-muted);
  text-transform: uppercase;
}

.uploader-uploading-card {
  padding: var(--space-4) var(--space-5);
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.uploading-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.uploading-icon-spinner {
  width: 28px;
  height: 28px;
  color: var(--color-primary);
}

.uploading-info {
  flex: 1;
  min-width: 0;
}

.uploading-filename {
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uploading-meta {
  font-size: var(--fs-meta);
  color: var(--text-muted);
}

.upload-progress-bar {
  height: 6px;
  background: var(--bg-input);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.upload-progress-fill {
  width: 100%;
  height: 100%;
  background: var(--action-primary);
  transform-origin: left center; /* 圓角由外層 .upload-progress-bar 的 overflow 裁切 */
  transition: transform var(--dur-fast) var(--ease-standard);
}

.media-preview-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  box-shadow: none !important;
  transition: border-color var(--dur-fast) var(--ease-standard);
}

.media-preview-card:hover {
  border-color: var(--border-color-hover);
}

.preview-thumbnail-container {
  position: relative;
  width: 84px;
  height: 58px;
  flex-shrink: 0;
  border-radius: var(--radius-xs);
  overflow: hidden;
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dur-base) var(--ease-standard);
}

.preview-thumbnail-container:hover .preview-media {
  transform: scale(1.05);
}

.preview-fallback-box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  color: var(--on-media-muted);
  font-size: var(--fs-meta);
  background: var(--media-surface);
}

.thumbnail-hover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--media-shade);
  color: var(--on-media);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-standard);
}

.preview-thumbnail-container:hover .thumbnail-hover-overlay {
  opacity: 1;
}

.video-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--media-shade-strong);
  color: var(--on-media);
  font-size: var(--fs-meta);
  padding: 1px 5px;
  border-radius: var(--radius-xs);
  backdrop-filter: blur(4px);
}

.preview-main-info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-2);
}

.file-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
}

.file-title-wrap {
  min-width: 0;
  flex: 1;
}

.clean-file-name {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--fs-body);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
}

.badge {
  display: inline-flex;
  align-items: center;
  font-size: var(--fs-meta);
  padding: 2px 7px;
  border-radius: var(--radius-xs);
  font-weight: var(--fw-medium);
}

.badge-type,
.badge-size {
  background: var(--surface-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}

.badge-status {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
  font-weight: var(--fw-semibold);
  gap: 4px;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-success);
}

.action-btn-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* .managed-file-card 的外框、圓角、封面 4:3、hover／焦點狀態都用全域 .select-card（components.css） */

.managed-file-card :deep(.card-media-wrap) {
  background: var(--media-surface);
}

.card-hover-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--media-shade);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-standard);
}

.managed-file-card:hover .card-hover-actions {
  opacity: 1;
}

.card-media-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: var(--media-shade-strong);
  color: var(--on-media);
  font-size: var(--fs-meta);
  padding: 1px 5px;
  border-radius: var(--radius-xs);
}

.managed-file-card :deep(.card-info-wrap) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  border-top: 1px solid var(--border-color);
}

.card-title-col {
  min-width: 0;
  flex: 1;
}

.card-title-col strong {
  display: block;
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-title-col small {
  display: block;
  font-size: var(--fs-meta);
  color: var(--text-muted);
}

.fullscreen-preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-fullscreen);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--scrim-media);
  backdrop-filter: blur(10px);
}

.preview-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--on-media-soft);
  color: var(--on-media);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-standard);
}

.preview-close-btn:hover {
  background: var(--on-media-border);
}

.fullscreen-media-container {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-image,
.fullscreen-video {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 640px) {
  .media-preview-card {
    flex-direction: column;
    align-items: stretch;
  }
  .preview-thumbnail-container {
    width: 100%;
    height: 140px;
  }

}
</style>
