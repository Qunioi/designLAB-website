<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div class="modal-container glass-panel" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? '編輯' : '新增' }} - {{ typeLabel }}</h2>
          <button type="button" class="close-btn" aria-label="關閉表單" @click="close"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <!-- UI Research Form -->
          <div v-if="type === 'UI_RESEARCH'" class="form-grid">
            <div class="form-group full-width">
              <label>標題 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="請輸入標題" required />
            </div>
            <div class="form-group">
              <label>分類</label>
              <CategoryInput v-model="form.category" :options="historyCategories" placeholder="例如：Layout, User Flow, Visual Style" />
            </div>
            <div class="form-group">
              <label>來源網址</label>
              <input v-model="form.source" type="text" @blur="form.source = ensureProtocol(form.source)" placeholder="例如：https://linear.app" />
            </div>
            <div class="form-group full-width">
              <label>標籤 (按 Enter 新增標籤，可點選歷史標籤)</label>
              <TagInput v-model="form.tags" :suggested-tags="historyTags" placeholder="輸入標籤如：Bento Grid, SaaS..." />
            </div>
            <div class="form-group full-width">
              <label>圖片上傳</label>
              <ImagePathInput v-model="form.cover" />
            </div>
            <div class="form-group full-width">
              <label>研究心得 / 可借鏡重點</label>
              <textarea v-model="form.takeaways" rows="3" placeholder="請輸入詳細的研究心得或設計分析..."></textarea>
            </div>
          </div>

          <!-- Motion Research Form -->
          <div v-else-if="type === 'MOTION_RESEARCH'" class="form-grid">
            <div class="form-group full-width">
              <label>標題 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="例如：Dynamic Island 彈性轉場動畫" required />
            </div>
            <div class="form-group">
              <label>動畫類型 (可輸入或從建議選取)</label>
              <CategoryInput v-model="form.motionType" :options="historyCategories" placeholder="例如：Micro-interaction, Drag & Drop" />
            </div>
            <div class="form-group">
              <label>來源網址</label>
              <input v-model="form.source" type="text" @blur="form.source = ensureProtocol(form.source)" placeholder="請貼上來源網址" />
            </div>
            <div class="form-group full-width">
              <label>影片檔案 (.mp4 / .webm) <span class="required">*</span></label>
              <FileUploader v-model="form.videoUrl" accept="video/*" placeholder="請貼上影片網或點擊選擇檔案上傳" />
            </div>
            <div class="form-group full-width">
              <label>圖片上傳（可選）</label>
              <ImagePathInput v-model="form.cover" />
            </div>
            <div class="form-group full-width">
              <label>製作工具 (按 Enter 新增標籤，可點選歷史製作工具)</label>
              <TagInput v-model="form.tools" :suggested-tags="historyTools" placeholder="輸入製作工具如：SwiftUI, Vue, GSAP..." />
            </div>
            <div class="form-group full-width">
              <label>標籤 (按 Enter 新增標籤，可點選歷史標籤)</label>
              <TagInput v-model="form.tags" :suggested-tags="historyTags" placeholder="輸入標籤如：Spring Animation, iOS..." />
            </div>
            <div class="form-group full-width">
              <label>動畫特色與借鏡重點</label>
              <textarea v-model="form.takeaways" rows="4" placeholder="請描述此動畫的物理特性與可借鏡處..."></textarea>
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
              <input v-model="form.url" type="text" @blur="form.url = ensureProtocol(form.url)" placeholder="例如：https://figma.com" />
            </div>
            <div class="form-group full-width">
              <label>圖片上傳</label>
              <ImagePathInput v-model="form.screenshot" />
            </div>
            <div class="form-group full-width">
              <label>優點 (Pros)</label>
              <textarea v-model="form.pros" rows="2" placeholder="請輸入競品設計優點，可條列..." ></textarea>
            </div>
            <div class="form-group full-width">
              <label>缺點 (Cons)</label>
              <textarea v-model="form.cons" rows="2" placeholder="請輸入競品設計缺點，可條列..." ></textarea>
            </div>
            <div class="form-group full-width">
              <label>值得參考與借鏡之處</label>
              <textarea v-model="form.takeaways" rows="3" placeholder="我們如何參考此競品的優點、避免其缺點？" ></textarea>
            </div>
          </div>

          <!-- AI Center Form -->
          <div v-else-if="type === 'AI_CENTER'" class="form-grid">
            <div class="form-group full-width">
              <label>AI 工具名稱 <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="例如：Midjourney v6" required />
            </div>
            <div class="form-group full-width">
              <label>使用情境</label>
              <textarea v-model="form.useCase" rows="2" placeholder="例如：概念插畫生成、配色風格探索..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>提示詞</label>
              <textarea v-model="form.prompt" rows="3" placeholder="請輸入經測試效果良好的 Prompt..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>工作流程(請用 -> 分隔步驟)</label>
              <textarea v-model="form.workflow" rows="2" placeholder="例如：ChatGPT 優化 Prompt -> Midjourney 生成 -> Figma 局部微調"></textarea>
            </div>
          </div>

          <!-- Resources Form -->
          <div v-else-if="type === 'RESOURCES'" class="form-grid">
            <div class="form-group">
              <label>資源分類 <span class="required">*</span></label>
              <CategoryInput v-model="form.category" :options="historyCategories" placeholder="例如：設計靈感, Icon, Font, UI元件" />
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
  }
});

const emit = defineEmits(['close', 'save']);

const isEdit = computed(() => !!props.item);

const typeLabel = computed(() => {
  switch (props.type) {
    case 'UI_RESEARCH': return 'UI 研究案例';
    case 'MOTION_RESEARCH': return '動態設計案例';
    case 'COMPETITORS': return '競品分析';
    case 'AI_CENTER': return 'AI 工具工作流';
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

// 自動收集歷史曾添加過的所有分類
const historyCategories = computed(() => {
  const allStores = [
    ...getStorageData('UI_RESEARCH'),
    ...getStorageData('MOTION_RESEARCH'),
    ...getStorageData('COMPETITORS'),
    ...getStorageData('RESOURCES'),
    ...getStorageData('AI_CENTER')
  ];
  const set = new Set();
  // 先加入系統常用內建優質分類
  ['Layout', 'User Flow', 'Visual Style', 'AI', 'Micro-interaction', 'Loading State', 'Drag & Drop', '3D / Dynamic'].forEach(c => set.add(c));
  
  allStores.forEach(item => {
    const val = item.category || item.motionType;
    if (val) set.add(String(val).trim());
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
  const formattedItem = { ...form.value };
  
  // 自動補齊所有網址欄位的 https:// 協定
  if (formattedItem.source) formattedItem.source = ensureProtocol(formattedItem.source);
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
  max-width: 600px;
  background: var(--bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.087rem;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
  border-color: var(--border-color-hover);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
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
  font-size: 0.7375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: var(--color-danger);
}

input, select, textarea {
  background: var(--bg-input);
  border: 1px solid transparent;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.7875rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

input::placeholder,
textarea::placeholder,
select::placeholder,
input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  color: var(--text-muted) !important;
  opacity: 1 !important;
  -webkit-text-fill-color: var(--text-muted) !important;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px var(--glow-primary);
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
  gap: 0.75rem;
  border-top: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.7875rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: var(--bg-subtle);
  border-color: var(--border-color-hover);
}

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
  .modal-backdrop {
    padding: 0.75rem;
  }
  .modal-container {
    max-height: 94vh;
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
