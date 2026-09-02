<template>
  <div class="file-uploader-box">
    <!-- 隱藏原生 File Input -->
    <input
      ref="fileInputRef"
      class="hidden-file-input"
      type="file"
      :accept="accept"
      :required="required && !modelValue"
      @change="handleFileSelect"
    />

    <!-- 狀態 1：正在上傳中 -->
    <div v-if="isUploading" class="uploader-uploading-card">
      <div class="uploading-header">
        <div class="uploading-icon-spinner">
          <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </div>
        <div class="uploading-info">
          <div class="uploading-filename">{{ selectedFile?.name || '檔案上傳中...' }}</div>
          <div class="uploading-meta">正在上傳至 Cloudflare R2 · {{ uploadProgress }}%</div>
        </div>
      </div>
      <div class="upload-progress-bar">
        <div class="upload-progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
    </div>

    <!-- 狀態 2：已有檔案（已上傳或已有 modelValue） -->
    <div v-else-if="modelValue || selectedFile" class="media-preview-card">
      <!-- 縮圖區（點擊放大） -->
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>圖片無法載入</span>
        </div>

        <!-- Hover 放大提示遮罩 -->
        <div class="thumbnail-hover-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>

        <!-- 影片標記 -->
        <span v-if="isVideo" class="video-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          影片
        </span>
      </div>

      <!-- 檔案詳情與操作群 -->
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

        <!-- 操作按鈕列 -->
        <div class="action-btn-row">
          <button
            type="button"
            class="action-btn btn-secondary"
            @click="triggerFileInput"
            title="從本機選擇新檔案重新上傳"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            重新上傳
          </button>

          <button
            type="button"
            class="action-btn btn-secondary"
            @click="openFileManager"
            title="從媒體庫中選擇已上傳檔案"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            媒體庫
          </button>


          <button
            type="button"
            class="action-btn btn-danger"
            @click="clearMedia"
            title="移除此檔案"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            移除
          </button>
        </div>
      </div>
    </div>

    <!-- 狀態 3：未選取任何檔案（現代整潔 Dropzone） -->
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
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

        <button
          type="button"
          class="open-library-btn"
          @click.stop="openFileManager"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          從 Cloudflare R2 媒體庫選取
        </button>
      </div>
    </div>

    <!-- 彈窗：檔案總管 (R2 媒體庫) -->
    <Teleport to="body">
      <div
        v-if="showFileManager"
        class="file-manager-backdrop"
        :class="activeThemeClass"
        @click="showFileManager = false"
      >
        <section
          class="file-manager-modal glass-panel"
          role="dialog"
          aria-modal="true"
          aria-label="R2 檔案總管"
          @click.stop
        >
          <!-- 頂部標題與關閉按鈕 -->
          <header class="file-manager-header">
            <div class="header-title-box">
              <div class="header-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h3>媒體庫檔案總管</h3>
                <p>選擇先前已儲存在 Cloudflare R2 的圖片或影片素材</p>
              </div>
            </div>
            <button
              type="button"
              class="file-manager-close"
              aria-label="關閉"
              @click="showFileManager = false"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>

          <!-- 篩選與搜尋工具列 -->
          <div class="file-manager-toolbar">
            <div class="toolbar-left">
              <div class="filter-pill-group">
                <button
                  type="button"
                  :class="{ active: managerFilter === 'all' }"
                  @click="managerFilter = 'all'"
                >
                  全部 ({{ managedFiles.length }})
                </button>
                <button
                  type="button"
                  :class="{ active: managerFilter === 'images' }"
                  @click="managerFilter = 'images'"
                >
                  圖片 ({{ imageFilesCount }})
                </button>
                <button
                  type="button"
                  :class="{ active: managerFilter === 'videos' }"
                  @click="managerFilter = 'videos'"
                >
                  影片 ({{ videoFilesCount }})
                </button>
              </div>
            </div>

            <div class="toolbar-right">
              <div class="search-input-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  v-model="managerSearch"
                  type="search"
                  placeholder="搜尋檔案名稱…"
                />
              </div>

              <!-- 在媒體庫直接提供上傳按鈕 -->
              <button
                type="button"
                class="manager-upload-btn"
                @click="triggerFileInput"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                上傳新檔案
              </button>
            </div>
          </div>

          <!-- 內容區：Loading / 錯誤 / 空狀態 / 檔案列表 -->
          <div v-if="isLoadingFiles" class="file-manager-state-box">
            <svg class="animate-spin text-primary" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p>連線讀取 R2 素材清單中…</p>
          </div>

          <div v-else-if="fileManagerError" class="file-manager-state-box text-danger">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{{ fileManagerError }}</p>
          </div>

          <div v-else-if="managedFiles.length === 0" class="file-manager-empty-box">
            <div class="empty-icon-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <h4>目前尚無已儲存的素材</h4>
            <p>您可以點擊上方或下方的上傳按鈕，將第一張圖片或影片加入媒體庫。</p>
            <button type="button" class="empty-cta-btn" @click="triggerFileInput">
              立即上傳檔案
            </button>
          </div>

          <div v-else-if="visibleManagedFiles.length === 0" class="file-manager-empty-box">
            <div class="empty-icon-circle">
              <!-- 搜尋關鍵字找不到 -->
              <svg v-if="managerSearch.trim()" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="8" x2="14" y2="14"></line>
                <line x1="14" y1="8" x2="8" y2="14"></line>
              </svg>
              <!-- 影片分類為空 -->
              <svg v-else-if="managerFilter === 'videos'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <!-- 圖片分類為空 -->
              <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>

            <h4 v-if="managerSearch.trim()">找不到符合「{{ managerSearch.trim() }}」的檔案</h4>
            <h4 v-else-if="managerFilter === 'videos'">目前媒體庫中尚未有任何影片素材</h4>
            <h4 v-else-if="managerFilter === 'images'">目前媒體庫中尚未有任何圖片素材</h4>
            <h4 v-else>目前尚無符合條件的檔案</h4>

            <p v-if="managerSearch.trim()">請檢查輸入的關鍵字是否有誤，或點擊下方按鈕清除搜尋。</p>
            <p v-else-if="managerFilter === 'videos'">您可以點擊右上方「上傳新檔案」將 MP4、WEBM 影片加入媒體庫。</p>
            <p v-else-if="managerFilter === 'images'">您可以點擊右上方「上傳新檔案」將圖片素材加入媒體庫。</p>

            <div class="empty-action-group">
              <button
                v-if="managerSearch.trim()"
                type="button"
                class="btn-text-link"
                @click="managerSearch = ''"
              >
                清除搜尋關鍵字
              </button>
              <button
                v-if="managerFilter !== 'all'"
                type="button"
                class="btn-text-link"
                @click="managerFilter = 'all'; managerSearch = ''"
              >
                查看全部媒體檔案 ({{ managedFiles.length }})
              </button>
              <button
                v-if="!managerSearch.trim()"
                type="button"
                class="empty-cta-btn"
                @click="triggerFileInput"
              >
                立即上傳新檔案
              </button>
            </div>
          </div>

          <!-- 檔案卡片清單網格 -->
          <div v-else class="file-manager-grid">
            <article
              v-for="file in visibleManagedFiles"
              :key="file.key"
              class="managed-file-card"
              :class="{ 'is-incompatible': !canUseFile(file) }"
            >
              <div class="card-media-wrap">
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
                  <button
                    type="button"
                    class="use-btn"
                    :disabled="!canUseFile(file)"
                    @click="selectManagedFile(file)"
                  >
                    {{ canUseFile(file) ? '選取此檔案' : '格式不相符' }}
                  </button>
                </div>

                <span v-if="/\.(mp4|webm|mov)$/i.test(file.name)" class="card-media-badge">影片</span>
              </div>

              <div class="card-info-wrap">
                <div class="card-title-col">
                  <strong :title="cleanFileNameString(file.name)">{{ cleanFileNameString(file.name) }}</strong>
                  <small>{{ file.key.startsWith('images/') ? '圖片' : '影片' }}</small>
                </div>
                <button
                  type="button"
                  class="delete-icon-btn"
                  title="從 R2 刪除檔案"
                  @click="removeManagedFile(file)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <!-- 彈窗：全螢幕放大預覽 -->
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { deleteUploadedFile, formatFileSize, listUploadedFiles, uploadFile, validateMediaFile } from '../utils/upload';
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

// 將 UUID 或 Timestamp 前綴自動過濾，呈現最乾淨的使用者檔名
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

const triggerFileInput = () => {
  imageLoadError.value = false;
  fileInputRef.value?.click();
};

const processFile = async (file) => {
  if (!file) return;
  try {
    const fileInfo = validateMediaFile(file);
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
    alert(error.message || '檔案上傳失敗，請重試。');
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
  if (!confirm(`確定要從 Cloudflare R2 永久刪除「${cleanFileNameString(file.name)}」嗎？`)) return;
  try {
    await deleteUploadedFile(file.publicUrl);
    managedFiles.value = managedFiles.value.filter((item) => item.key !== file.key);
    if (props.modelValue === file.publicUrl) {
      clearMedia();
    }
  } catch (error) {
    alert(error.message || '刪除失敗');
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
  font-family: var(--font-sans, inherit);
}

.hidden-file-input {
  display: none;
}

/* ============================================================
   未上傳狀態：現代整合型 Dropzone
   ============================================================ */
.uploader-dropzone-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.85rem;
  background: var(--bg-input, rgba(15, 23, 42, 0.03));
  border: 1.5px dashed var(--border-color, rgba(15, 23, 42, 0.12));
  border-radius: var(--radius-lg, 12px);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center;
}

.uploader-dropzone-box:hover,
.uploader-dropzone-box.is-dragging {
  border-color: var(--color-primary, #6366f1);
  background: var(--bg-hover, rgba(99, 102, 241, 0.05));
  transform: translateY(-1px);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  max-width: 380px;
}

.dropzone-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  /* background: var(--bg-card, #ffffff); */
  color: var(--color-primary, #6366f1);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
  transition: transform 0.2s ease;
}

.uploader-dropzone-box:hover .dropzone-icon-circle {
  transform: scale(1.08);
}

.dropzone-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dropzone-primary-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary, #0f172a);
  margin: 0;
}

.click-highlight {
  /* color: var(--color-primary, #6366f1); */
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dropzone-sub-text {
  font-size: 0.72rem;
  color: var(--text-secondary, #475569);
  opacity: 0.95;
  margin: 0;
}

.dropzone-divider-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin: 0.1rem 0;
}

.uploader-dropzone-box .dropzone-divider-row {
  display: none;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border-color, rgba(15, 23, 42, 0.08));
}

.divider-text {
  font-size: 0.7rem;
  color: var(--text-muted, #64748b);
  text-transform: uppercase;
}

.open-library-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.1));
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04));
  transition: all 0.15s ease;
}

/* .open-library-btn:hover {
  color: var(--color-primary, #6366f1);
  border-color: var(--color-primary, #6366f1);
  background: var(--bg-hover, #f8fafc);
} */

/* ============================================================
   上傳中進度卡片
   ============================================================ */
.uploader-uploading-card {
  padding: 1rem 1.2rem;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
  border-radius: var(--radius-md, 10px);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.uploading-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.uploading-icon-spinner {
  width: 28px;
  height: 28px;
  color: var(--color-primary, #6366f1);
}

.uploading-info {
  flex: 1;
  min-width: 0;
}

.uploading-filename {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uploading-meta {
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
}

.upload-progress-bar {
  height: 6px;
  background: var(--bg-input, rgba(15, 23, 42, 0.06));
  border-radius: 999px;
  overflow: hidden;
}

.upload-progress-fill {
  height: 100%;
  background: var(--color-primary, #6366f1);
  border-radius: 999px;
  transition: width 0.15s ease;
}

/* ============================================================
   已上傳狀態：精緻卡片
   ============================================================ */
.media-preview-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 0.85rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm, 6px);
  box-shadow: none !important;
  transition: border-color 0.15s ease;
}

.media-preview-card:hover {
  border-color: var(--border-color-hover);
}

.preview-thumbnail-container {
  position: relative;
  width: 84px;
  height: 58px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
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
  gap: 0.2rem;
  color: #94a3b8;
  font-size: 0.65rem;
  background: #1e293b;
}

.thumbnail-hover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.2s ease;
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
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 0.62rem;
  padding: 1px 5px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.preview-main-info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
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
  margin: 0 0 0.25rem 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 500;
}

.badge-type,
.badge-size {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}

.badge-status {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  font-weight: 600;
  gap: 4px;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
}

.action-btn-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-xs, 4px);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.btn-secondary {
  background: var(--bg-card);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
}

.btn-danger {
  background: transparent;
  color: var(--color-danger, #ef4444);
  border-color: transparent;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* ============================================================
   檔案總管彈窗 (Theme-Aware & Modern Glass)
   ============================================================ */
.file-manager-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: var(--modal-backdrop, rgba(3, 7, 18, 0.65));
  backdrop-filter: blur(8px);
}

.file-manager-modal {
  width: min(860px, 94vw);
  height: min(560px, 86vh);
  min-height: min(480px, 86vh);
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.1));
  border-radius: var(--radius-xl, 16px);
  /* box-shadow: var(--shadow-lg, 0 20px 40px rgba(0,0,0,0.15)); */
  overflow: hidden;
}

.file-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.4rem;
  border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
  background: var(--bg-card, #ffffff);
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md, 8px);
  background: var(--bg-input, rgba(15, 23, 42, 0.04));
  color: var(--color-primary, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title-box h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.header-title-box p {
  margin: 0.15rem 0 0 0;
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
}

.file-manager-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--radius-sm, 6px);
  background: var(--bg-input, rgba(15, 23, 42, 0.05));
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.file-manager-close:hover {
  background: var(--bg-hover, rgba(15, 23, 42, 0.1));
  color: var(--text-primary, #0f172a);
}

/* 工具列 */
.file-manager-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.4rem;
  border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.06));
  background: var(--bg-card, #ffffff);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.filter-pill-group {
  display: inline-flex;
  padding: 2px;
  background: var(--bg-input, rgba(15, 23, 42, 0.04));
  border-radius: var(--radius-sm, 6px);
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.06));
}

.filter-pill-group button {
  border: 0;
  background: transparent;
  color: var(--text-secondary, #64748b);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill-group button.active {
  background: var(--bg-card, #ffffff);
  color: var(--color-primary, #6366f1);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.06));
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper svg {
  position: absolute;
  left: 0.65rem;
  color: var(--text-muted, #94a3b8);
  pointer-events: none;
}

.search-input-wrapper input {
  padding: 0.45rem 0.65rem 0.45rem 2rem;
  font-size: 0.75rem;
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.1));
  border-radius: var(--radius-sm, 6px);
  background: var(--bg-input, rgba(15, 23, 42, 0.03));
  color: var(--text-primary, #0f172a);
  outline: none;
  width: 180px;
  transition: all 0.15s ease;
}

.search-input-wrapper input:focus {
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 0 0 2px var(--glow-primary, rgba(99, 102, 241, 0.15));
}

.manager-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  border: 0;
  border-radius: var(--radius-sm, 6px);
  background: var(--color-primary, #6366f1);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.manager-upload-btn:hover {
  opacity: 0.9;
}

/* 狀態視窗 */
.file-manager-state-box,
.file-manager-empty-box {
  flex: 1;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  gap: 0.6rem;
  color: var(--text-muted, #64748b);
  font-size: 0.8rem;
}

.file-manager-empty-box h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-input, rgba(15, 23, 42, 0.04));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #94a3b8);
  margin-bottom: 0.5rem;
}

.empty-cta-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1.2rem;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--color-primary, #6366f1);
  color: #ffffff;
  border: 0;
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
}

.btn-text-link {
  background: transparent;
  border: 0;
  color: var(--color-primary, #6366f1);
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
}

.empty-action-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

/* 媒體網格 */
.file-manager-grid {
  flex: 1;
  min-height: 320px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  align-content: start;
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  overflow-y: auto;
}

.managed-file-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
  border-radius: var(--radius-md, 10px);
  background: var(--bg-card, #ffffff);
  overflow: hidden;
  /* box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.04)); */
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.managed-file-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 6px 14px rgba(0,0,0,0.08));
  border-color: var(--color-primary, #6366f1);
}

.card-media-wrap {
  position: relative;
  width: 100%;
  height: 110px;
  background: #0d1117;
  overflow: hidden;
}

.card-media-wrap img,
.card-media-wrap video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-hover-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.managed-file-card:hover .card-hover-actions {
  opacity: 1;
}

.use-btn {
  padding: 0.4rem 0.85rem;
  background: var(--color-primary, #6366f1);
  color: #ffffff;
  border: 0;
  border-radius: var(--radius-sm, 6px);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.use-btn:disabled {
  background: #64748b;
  cursor: not-allowed;
  opacity: 0.75;
}

.card-media-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  font-size: 0.6rem;
  padding: 1px 5px;
  border-radius: 4px;
}

.card-info-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  gap: 0.4rem;
  border-top: 1px solid var(--border-color, rgba(15, 23, 42, 0.05));
}

.card-title-col {
  min-width: 0;
  flex: 1;
}

.card-title-col strong {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-title-col small {
  display: block;
  font-size: 0.65rem;
  color: var(--text-muted, #64748b);
}

.delete-icon-btn {
  border: 0;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.delete-icon-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger, #ef4444);
}

/* ============================================================
   全螢幕放大預覽
   ============================================================ */
.fullscreen-preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.92);
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
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.preview-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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
  border-radius: var(--radius-md, 10px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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
  .file-manager-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper input {
    width: 100%;
  }
}
</style>
