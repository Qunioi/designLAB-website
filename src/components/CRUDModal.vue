<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div :class="['modal-container', 'glass-panel', currentTheme]" role="dialog" aria-modal="true" aria-labelledby="crud-modal-title" @click.stop>
        <div class="modal-header">
          <h2 id="crud-modal-title">{{ isEdit ? '編輯' : '新增' }} - {{ typeLabel }}</h2>
          <button type="button" class="close-btn" aria-label="關閉表單" @click="close"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="modal-form">
          <div class="modal-body">
          <!-- UI Research Form -->
          <div v-if="type === 'UI_RESEARCH'" class="form-grid">
            <div class="form-group full-width">
              <label>標題 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="請輸入標題" required />
            </div>
            <div class="form-group">
              <label>分類 <span class="required">*</span></label>
              <CategoryInput v-model="form.category" :options="historyCategories" placeholder="例如：Layout, User Flow, Visual Style" required />
            </div>
            <div class="form-group">
              <label>來源網址</label>
              <input v-model="form.sourceUrl" type="url" required @blur="form.sourceUrl = ensureProtocol(form.sourceUrl)" placeholder="例如：https://linear.app" />
            </div>
            <div class="form-group full-width">
              <label>標籤 (按 Enter 新增標籤，可點選歷史標籤)</label>
              <TagInput v-model="form.tags" :suggested-tags="historyTags" placeholder="輸入標籤如：Bento Grid, SaaS..." />
            </div>
            <div class="form-group full-width">
              <label>圖片上傳</label>
              <ImagePathInput v-model="form.cover" required />
            </div>
            <div class="form-group full-width">
              <label>研究心得 / 可借鏡重點</label>
              <textarea v-model="form.takeaways" rows="3" required placeholder="請輸入詳細的研究心得或設計分析..."></textarea>
            </div>
          </div>

          <!-- Motion Research Form -->
          <div v-else-if="type === 'MOTION_RESEARCH'" class="form-grid">
            <div class="form-group full-width">
              <label>標題 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="例如：Dynamic Island 彈性轉場動畫" required />
            </div>
            <div class="form-group">
              <label>動畫類型 (可輸入或從建議選取) <span class="required">*</span></label>
              <CategoryInput v-model="form.motionType" :options="historyCategories" placeholder="例如：Micro-interaction, Drag & Drop" required />
            </div>
            <div class="form-group">
              <label>來源網址 <span class="required">*</span></label>
              <input v-model="form.sourceUrl" type="url" required @blur="form.sourceUrl = ensureProtocol(form.sourceUrl)" placeholder="請貼上來源網址" />
            </div>
            <div class="form-group full-width">
              <label>影片檔案（MP4 / WEBM / MOV）<span class="required">*</span></label>
              <FileUploader v-model="form.videoUrl" accept="video/mp4,video/webm,video/quicktime" placeholder="選擇影片檔案" />
            </div>
            <div class="form-group full-width">
              <label>圖片上傳（JPG / JPEG / PNG / GIF / WEBP）<span class="required">*</span></label>
              <ImagePathInput v-model="form.cover" />
            </div>
            <div class="form-group full-width">
              <label>製作工具 (按 Enter 新增標籤，可點選歷史製作工具) <span class="required">*</span></label>
              <TagInput v-model="form.tools" :suggested-tags="historyTools" placeholder="輸入製作工具如：SwiftUI, Vue, GSAP..." />
            </div>
            <div class="form-group full-width">
              <label>標籤 (按 Enter 新增標籤，可點選歷史標籤)</label>
              <TagInput v-model="form.tags" :suggested-tags="historyTags" placeholder="輸入標籤如：Spring Animation, iOS..." />
            </div>
            <div class="form-group full-width">
              <label>動畫特色與借鏡重點</label>
              <textarea v-model="form.takeaways" rows="4" required placeholder="請描述此動畫的物理特性與可借鏡處..."></textarea>
            </div>
          </div>

          <!-- Competitor Research Form -->
          <div v-else-if="type === 'COMPETITORS'" class="form-grid">
            <div class="form-group">
              <label>競品名稱 <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="例如：Figma" required />
            </div>
            <div class="form-group">
              <label>競品分類 <span class="required">*</span></label>
              <select v-model="form.category" class="status-select">
                <option value="Web">Web 應用</option>
                <option value="行動裝置">行動裝置</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>標籤 (按 Enter 新增標籤，可點選下方歷史建議標籤)</label>
              <TagInput v-model="form.tags" :suggested-tags="historyTags" placeholder="輸入標籤如：Mobile UX, Fintech..." />
            </div>
            <div class="form-group full-width">
              <label>官方網址</label>
              <input v-model="form.url" type="url" required @blur="form.url = ensureProtocol(form.url)" placeholder="例如：https://figma.com" />
            </div>
            <div class="form-group full-width">
              <label>圖片上傳</label>
              <ImagePathInput v-model="form.screenshot" required />
            </div>
            <div class="form-group full-width">
              <label>優點 (Pros)</label>
              <textarea v-model="form.pros" rows="2" required placeholder="請輸入競品設計優點，可條列..." ></textarea>
            </div>
            <div class="form-group full-width">
              <label>缺點 (Cons)</label>
              <textarea v-model="form.cons" rows="2" required placeholder="請輸入競品設計缺點，可條列..." ></textarea>
            </div>
            <div class="form-group full-width">
              <label>值得參考與借鏡之處</label>
              <textarea v-model="form.takeaways" rows="3" required placeholder="我們如何參考此競品的優點、避免其缺點？" ></textarea>
            </div>
          </div>

          <!-- AI Center Form -->
          <div v-else-if="type === 'AI_CENTER'" class="form-grid">
            <div class="form-group full-width">
              <label>AI 工具名稱 <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="例如：Midjourney v6" required />
            </div>
            <div class="form-group">
              <label>工具分類 <span class="required">*</span></label>
              <CategoryInput v-model="form.category" :options="historyCategories" placeholder="例如：圖像生成、研究分析" required />
            </div>
            <div class="form-group">
              <label>AI 工具網址 <span class="required">*</span></label>
              <input v-model="form.url" type="url" @blur="form.url = ensureProtocol(form.url)" placeholder="例如：https://chatgpt.com" required />
            </div>
            <div class="form-group full-width">
              <label>工具封面 <span class="required">*</span></label>
              <ImagePathInput v-model="form.cover" required />
            </div>
            <div class="form-group full-width">
              <label>工具簡介 <span class="required">*</span></label>
              <textarea v-model="form.useCase" rows="4" placeholder="例如：概念插畫生成、配色風格探索..." required></textarea>
            </div>
            <div class="form-group full-width">
              <label>提示詞 <span class="required">*</span></label>
              <textarea v-model="form.prompt" rows="3" placeholder="請輸入經測試效果良好的 Prompt..." required></textarea>
            </div>
            <div class="form-group full-width">
              <label>工作流程 <span class="required">*</span><span class="field-help-inline">請用 → 分隔步驟</span></label>
              <textarea v-model="form.workflow" rows="2" placeholder="例如：ChatGPT 優化 Prompt -> Midjourney 生成 -> Figma 局部微調" required></textarea>
            </div>
          </div>

          <!-- Resources Form -->
          <div v-else-if="type === 'RESOURCES'" class="form-grid">
            <div class="form-group">
              <label>資源分類 <span class="required">*</span></label>
              <CategoryInput v-model="form.category" :options="historyCategories" placeholder="例如：設計靈感, Icon, Font, UI元件" required />
            </div>
            <div class="form-group">
              <label>網站名稱 <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="例如：Awwwards" required />
            </div>
            <div class="form-group full-width">
              <label>網站 URL <span class="required">*</span></label>
              <input v-model="form.url" type="text" @blur="form.url = ensureProtocol(form.url)" placeholder="例如：https://awwwards.com" required />
            </div>
            <div class="form-group full-width">
              <label>圖片上傳</label>
              <ImagePathInput v-model="form.screenshot" />
            </div>
            <div class="form-group full-width">
              <label>網站簡短說明</label>
              <textarea v-model="form.desc" rows="3" placeholder="簡述網站特色與用途..."></textarea>
            </div>
          </div>

          <!-- Proposals Form -->
          <div v-else-if="type === 'PROPOSALS'" class="form-grid">
            <div class="form-group">
              <label>優化提案名稱 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="例如：內部首頁 Bento Grid 改版提案" required />
            </div>
            <div class="form-group">
              <label>提案狀態</label>
              <select v-model="form.status" class="status-select">
                <option value="Idea">提案想法 (Idea)</option>
                <option value="Evaluating">評估中</option>
                <option value="Prototype">驗證中</option>
                <option value="Approved">已採納</option>
              </select>
            </div>
            <div class="form-group">
              <label>關聯的研究案</label>
              <input v-model="form.relatedResearch" type="text" placeholder="例如：Linear Bento Grid (UI Research)" />
            </div>
            <div class="form-group">
              <label>Figma Prototype 連結</label>
              <input v-model="form.figmaLink" type="text" @blur="form.figmaLink = ensureProtocol(form.figmaLink)" placeholder="請輸入 Figma 連結" />
            </div>
            <div class="form-group full-width">
              <label>預期效益與評估說明</label>
              <textarea v-model="form.impact" rows="4" placeholder="評估將帶來哪些體驗提升或數據成長？"></textarea>
            </div>
          </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="close">取消</button>
            <button type="submit" class="btn-save">儲存資料</button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import TagInput from './TagInput.vue';
import CategoryInput from './CategoryInput.vue';
import FileUploader from './FileUploader.vue';
import ImagePathInput from './ImagePathInput.vue';
import { getStorageData } from '../utils/storage';
import { ensureProtocol } from '../utils/formatters';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  item: {
    type: Object,
    default: null
  },
  currentTheme: {
    type: String,
    default: 'theme-cloud-canvas'
  }
});

const emit = defineEmits(['close', 'save']);

const isEdit = computed(() => !!props.item);

const typeLabel = computed(() => {
  switch (props.type) {
    case 'UI_RESEARCH': return 'UI 設計研究';
    case 'MOTION_RESEARCH': return '動態研究';
    case 'COMPETITORS': return '競品分析';
    case 'AI_CENTER': return 'AI 工具';
    case 'RESOURCES': return '資源網頁';
    case 'PROPOSALS': return '優化提案';
    default: return '';
  }
});

const form = ref({});

// 自動收集歷史曾添加過的所有標籤
const historyTags = computed(() => {
  const allKeyData = [
    ...getStorageData('UI_RESEARCH'),
    ...getStorageData('MOTION_RESEARCH'),
    ...getStorageData('COMPETITORS')
  ];
  const set = new Set();
  allKeyData.forEach(item => {
    let raw = item.tags;
    if (!raw) return;
    if (typeof raw === 'string') {
      raw = raw.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(raw)) {
      raw.forEach(t => t && set.add(String(t).trim()));
    }
  });
  return [...set].sort();
});

// 只收集目前表單模組曾使用過的分類，避免不同模組的分類混在一起。
const historyCategories = computed(() => {
  const sourceByType = {
    UI_RESEARCH: ['UI_RESEARCH', 'category'],
    MOTION_RESEARCH: ['MOTION_RESEARCH', 'motionType'],
    COMPETITORS: ['COMPETITORS', 'category'],
    AI_CENTER: ['AI_CENTER', 'category'],
    RESOURCES: ['RESOURCES', 'category']
  };
  const [storageKey, field] = sourceByType[props.type] || [];
  if (!storageKey) return [];

  const set = new Set();
  getStorageData(storageKey).forEach(item => {
    const value = item[field];
    if (value) set.add(String(value).trim());
  });
  return [...set].sort();
});

// 自動收集歷史曾添加過的所有製作工具
const historyTools = computed(() => {
  const list = getStorageData('MOTION_RESEARCH');
  const set = new Set();
  ['SwiftUI', 'Vue', 'CSS Animation', 'GSAP', 'Lottie', 'AE', 'Principle', 'Three.js', 'Rive', 'Framer Motion'].forEach(t => set.add(t));
  list.forEach(item => {
    let raw = item.tools || item.toolsInput;
    if (!raw) return;
    if (typeof raw === 'string') {
      raw = raw.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(raw)) {
      raw.forEach(t => t && set.add(String(t).trim()));
    }
  });
  return [...set].sort();
});

watch(() => [props.isOpen, props.item, props.type], () => {
  if (props.isOpen) {
    if (props.item) {
      const itemCopy = { ...props.item };

      // 舊版 AI 工具使用 link 欄位；編輯時統一帶入目前的網址欄位。
      if (props.type === 'AI_CENTER' && !itemCopy.url && itemCopy.link) {
        itemCopy.url = itemCopy.link;
      }
      
      let tagsArr = [];
      if (Array.isArray(itemCopy.tags)) {
        tagsArr = [...itemCopy.tags];
      } else if (typeof itemCopy.tags === 'string') {
        tagsArr = itemCopy.tags.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
      }
      itemCopy.tags = tagsArr;

      let toolsArr = [];
      if (Array.isArray(itemCopy.tools)) {
        toolsArr = [...itemCopy.tools];
      } else if (typeof itemCopy.toolsInput === 'string') {
        toolsArr = itemCopy.toolsInput.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
      }
      itemCopy.tools = toolsArr;
      
      form.value = itemCopy;
    } else {
      form.value = {
        title: '',
        category: props.type === 'COMPETITORS' ? 'Web' : '',
        tags: [],
        tools: [],
        toolsInput: '',
        cover: '',
        source: '',
        sourceUrl: '',
        takeaways: '',
        videoUrl: '',
        motionType: '',
        name: '',
        url: '',
        screenshot: '',
        pros: '',
        cons: '',
        link: '',
        useCase: '',
        prompt: '',
        workflow: '',
        desc: '',
        status: 'Idea',
        relatedResearch: '',
        figmaLink: '',
        impact: ''
      };
    }
  }
}, { immediate: true });

const close = () => {
  emit('close');
};

const handleSubmit = () => {
  const requiredByType = {
    UI_RESEARCH: [
      ['title', '標題'], ['category', '分類'], ['sourceUrl', '來源網址'],
      ['cover', '圖片'], ['takeaways', '研究心得／可借鏡重點']
    ],
    MOTION_RESEARCH: [
      ['title', '標題'], ['motionType', '動畫類型'], ['sourceUrl', '來源網址'],
      ['tools', '製作工具'], ['takeaways', '動畫特色／研究心得']
    ],
    COMPETITORS: [
      ['name', '競品名稱'], ['category', '競品分類'], ['url', '競品網址'],
      ['screenshot', 'Screenshot'], ['pros', '優點'], ['cons', '缺點'], ['takeaways', '值得參考之處']
    ],
    AI_CENTER: [
      ['name', 'AI 工具名稱'], ['category', '工具分類'], ['url', 'AI 工具網址'],
      ['cover', '工具封面'], ['useCase', '工具簡介'], ['prompt', '提示詞'], ['workflow', '工作流程']
    ],
    RESOURCES: [
      ['name', '網站名稱'], ['category', '資源分類'], ['url', '網站 URL']
    ]
  };

  const missingField = (requiredByType[props.type] || []).find(([field]) => {
    const value = form.value[field];
    return Array.isArray(value) ? value.length === 0 : !String(value || '').trim();
  });

  if (missingField) {
    alert(`請填寫「${missingField[1]}」後再儲存。`);
    return;
  }

  if (props.type === 'MOTION_RESEARCH' && !form.value.videoUrl && !form.value.cover) {
    alert('請提供影片網址或封面圖至少一項。');
    return;
  }

  const formattedItem = { ...form.value };
  
  // 自動補齊所有網址欄位的 https:// 協定
  if (formattedItem.sourceUrl) formattedItem.sourceUrl = ensureProtocol(formattedItem.sourceUrl);
  if (formattedItem.url) formattedItem.url = ensureProtocol(formattedItem.url);
  if (formattedItem.link) formattedItem.link = ensureProtocol(formattedItem.link);
  if (formattedItem.website) formattedItem.website = ensureProtocol(formattedItem.website);
  if (formattedItem.figmaLink) formattedItem.figmaLink = ensureProtocol(formattedItem.figmaLink);
  if (formattedItem.videoUrl) formattedItem.videoUrl = ensureProtocol(formattedItem.videoUrl);
  if (formattedItem.cover) formattedItem.cover = ensureProtocol(formattedItem.cover);

  // 確保 tags 為陣列格式
  if (formattedItem.tags && typeof formattedItem.tags === 'string') {
    formattedItem.tags = formattedItem.tags.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  
  // 確保 tools 為陣列格式與同步 toolsInput
  if (Array.isArray(formattedItem.tools)) {
    formattedItem.toolsInput = formattedItem.tools.join(', ');
  } else if (typeof formattedItem.tools === 'string') {
    formattedItem.tools = formattedItem.tools.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
    formattedItem.toolsInput = formattedItem.tools.join(', ');
  }
  
  if (!formattedItem.cover && (props.type === 'UI_RESEARCH' || props.type === 'MOTION_RESEARCH')) {
    formattedItem.cover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";
  }
  
  if (props.type === 'COMPETITORS' && !formattedItem.screenshot) {
    formattedItem.screenshot = "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop";
  }

  emit('save', {
    type: props.type,
    item: formattedItem
  });
  
  close();
};
</script>

<style scoped>
.modal-container {
  width: 100%;
  max-width: 720px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  box-shadow: none;
  border-radius: var(--modal-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: var(--modal-max-height);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--modal-header-padding);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
}

.close-btn {
  width: var(--modal-control-size);
  height: var(--modal-control-size);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
}

.close-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.modal-body {
  padding: var(--modal-padding);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group.full-width {
  grid-column: span 2;
}

label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: var(--color-danger);
}

input, select, textarea {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--text-primary);
  transition: border-color 0.18s ease;
}

input::placeholder,
textarea::placeholder,
select::placeholder,
input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  color: var(--text-muted);
  opacity: 1;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-primary);
  outline: none;
}

textarea {
  resize: vertical;
}

.status-select {
  color: var(--text-primary);
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  border-top: 1px solid var(--border-color);
  padding: 0.875rem var(--modal-padding);
  background: var(--bg-elevated);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
  box-shadow: none;
}

.btn-cancel {
  padding: 0.55rem 1.15rem;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.btn-cancel:hover {
  background: var(--bg-hover);
  border-color: var(--border-color-hover);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container {
  transform: scale(0.95);
}

.modal-fade-leave-to .modal-container {
  transform: scale(0.97);
}

@media (max-width: 640px) {
  .modal-backdrop {
    padding: 0.75rem;
  }
  .modal-container {
    max-height: calc(100dvh - 1.5rem);
    border-radius: 16px;
  }
  .modal-body {
    padding: 1rem;
    -webkit-overflow-scrolling: touch;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>
