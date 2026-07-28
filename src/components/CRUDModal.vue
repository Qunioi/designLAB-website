<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div class="modal-container glass-panel" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? '編輯資料' : '新增資料' }} - {{ typeLabel }}</h2>
          <button class="close-btn" @click="close"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <!-- UI Research Form -->
          <div v-if="type === 'UI_RESEARCH'" class="form-grid">
            <div class="form-group">
              <label>標題 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="例如：Linear 官方網站的 Bento Grid 排版" required />
            </div>
            <div class="form-group">
              <label>分類</label>
              <input v-model="form.category" type="text" placeholder="例如：Layout, Checkout, Navigation" />
            </div>
            <div class="form-group">
              <label>標籤 (以英文逗號分隔)</label>
              <input v-model="form.tagsInput" type="text" placeholder="例如：Bento Grid, Dark Mode, SaaS" />
            </div>
            <div class="form-group">
              <label>封面圖片網址</label>
              <input v-model="form.cover" type="url" placeholder="請輸入圖片 URL" />
            </div>
            <div class="form-group">
              <label>來源網址</label>
              <input v-model="form.source" type="url" placeholder="例如：https://linear.app" />
            </div>
            <div class="form-group full-width">
              <label>研究心得 / 可借鏡重點</label>
              <textarea v-model="form.takeaways" rows="4" placeholder="請輸入詳細的研究心得或設計分析..."></textarea>
            </div>
          </div>

          <!-- Motion Research Form -->
          <div v-else-if="type === 'MOTION_RESEARCH'" class="form-grid">
            <div class="form-group">
              <label>標題 <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="例如：Dynamic Island 彈性轉場動畫" required />
            </div>
            <div class="form-group">
              <label>影片網址 (.mp4 / .webm) <span class="required">*</span></label>
              <input v-model="form.videoUrl" type="url" placeholder="請輸入影片檔案 URL" required />
            </div>
            <div class="form-group">
              <label>靜態封面圖片網址</label>
              <input v-model="form.cover" type="url" placeholder="請輸入封面圖片 URL" />
            </div>
            <div class="form-group">
              <label>動畫類型</label>
              <input v-model="form.motionType" type="text" placeholder="例如：Micro-interaction, Page Transition" />
            </div>
            <div class="form-group">
              <label>製作工具 (以英文逗號分隔)</label>
              <input v-model="form.toolsInput" type="text" placeholder="例如：AE, Lottie, Rive, Principle" />
            </div>
            <div class="form-group">
              <label>標籤 (以英文逗號分隔)</label>
              <input v-model="form.tagsInput" type="text" placeholder="例如：Spring, Liquid, iOS" />
            </div>
            <div class="form-group">
              <label>來源網址</label>
              <input v-model="form.source" type="url" placeholder="請輸入來源網址" />
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
              <label>官方網址</label>
              <input v-model="form.url" type="url" placeholder="例如：https://figma.com" />
            </div>
            <div class="form-group">
              <label>介面截圖網址</label>
              <input v-model="form.screenshot" type="url" placeholder="請輸入截圖 URL" />
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
            <div class="form-group">
              <label>AI 工具名稱 <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="例如：Midjourney v6" required />
            </div>
            <div class="form-group">
              <label>工具網站連結</label>
              <input v-model="form.link" type="url" placeholder="例如：https://midjourney.com" />
            </div>
            <div class="form-group full-width">
              <label>主要使用情境</label>
              <textarea v-model="form.useCase" rows="2" placeholder="例如：概念插畫生成、配色風格探索..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>推薦 Prompt 範本</label>
              <textarea v-model="form.prompt" rows="3" placeholder="請輸入經測試效果良好的 Prompt..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>工作流程 (Workflow) - 請用 -> 分隔步驟</label>
              <textarea v-model="form.workflow" rows="2" placeholder="例如：ChatGPT 優化 Prompt -> Midjourney 生成 -> Figma 局部微調"></textarea>
            </div>
          </div>

          <!-- Resources Form -->
          <div v-else-if="type === 'RESOURCES'" class="form-grid">
            <div class="form-group">
              <label>資源分類 <span class="required">*</span></label>
              <input v-model="form.category" type="text" placeholder="例如：設計靈感, Icon, Font, UI元件" required />
            </div>
            <div class="form-group">
              <label>網站名稱 <span class="required">*</span></label>
              <input v-model="form.name" type="text" placeholder="例如：Awwwards" required />
            </div>
            <div class="form-group full-width">
              <label>網站 URL <span class="required">*</span></label>
              <input v-model="form.url" type="url" placeholder="例如：https://awwwards.com" required />
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
              <input v-model="form.figmaLink" type="url" placeholder="請輸入 Figma 連結" />
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

watch(() => [props.isOpen, props.item, props.type], () => {
  if (props.isOpen) {
    if (props.item) {
      const itemCopy = { ...props.item };
      
      if (itemCopy.tags) {
        itemCopy.tagsInput = itemCopy.tags.join(', ');
      }
      if (itemCopy.tools) {
        itemCopy.toolsInput = itemCopy.tools.join(', ');
      }
      
      form.value = itemCopy;
    } else {
      form.value = {
        title: '',
        category: '',
        tagsInput: '',
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
  
  if (formattedItem.tagsInput !== undefined) {
    formattedItem.tags = formattedItem.tagsInput
      ? formattedItem.tagsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    delete formattedItem.tagsInput;
  }
  
  if (formattedItem.toolsInput !== undefined) {
    formattedItem.tools = formattedItem.toolsInput
      ? formattedItem.toolsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    delete formattedItem.toolsInput;
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

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
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.required {
  color: var(--color-danger);
}

input, select, textarea {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px var(--glow-primary);
}

textarea {
  resize: vertical;
}

.status-select {
  background: var(--bg-secondary);
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
  border-radius: 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-save {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px var(--glow-primary);
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
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full-width {
    grid-column: span 1;
  }
}
</style>
