<template>
  <!-- 點遮罩、按 Esc 都不關閉，避免填到一半的內容遺失 -->
  <BaseModal
    :open="isOpen"
    size="md"
    :title="`${isEdit ? '編輯' : '新增'} - ${typeLabel}`"
    close-label="關閉表單"
    :close-on-backdrop="false"
    :close-on-esc="false"
    @close="close"
  >
        <form @submit.prevent="handleSubmit" novalidate class="modal-form">
          <div ref="modalBodyRef" class="base-modal-body">
          <div v-if="type === 'UI_RESEARCH'" class="form-grid">
            <FormField :id="fieldId('title')" label="標題" :required="isRequired('title')" :error="errors.title" field="title" full v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.title" :required="isRequired('title')" type="text" placeholder="請輸入標題" />
            </FormField>
            <FormField :id="fieldId('category')" label="類型" :required="isRequired('category')" :error="errors.category" field="category" v-slot="{ id }">
              <CategoryInput :input-id="id" v-model="form.category" :required="isRequired('category')" :options="historyCategories" placeholder="請選擇或新增類型" />
            </FormField>
            <FormField :id="fieldId('sourceUrl')" label="網址" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.sourceUrl" :required="isRequired('sourceUrl')" type="url" @blur="form.sourceUrl = ensureProtocol(form.sourceUrl)" placeholder="請貼上研究簡報、Demo 或相關完整內容連結" />
            </FormField>
            <FormField :id="fieldId('cover')" label="封面圖" :required="isRequired('cover')" help="JPG / JPEG / PNG / GIF / WEBP" :error="errors.cover" field="cover" full group>
              <template #label-extra><span class="media-guideline-help" tabindex="0">?<span class="media-guideline-tooltip"><b>DesignLAB 素材規範</b>圖片：單檔 ≤ 5MB<br>GIF：單檔 ≤ 10MB<br>MP4 / WebM：單檔 ≤ 50MB<br>所有素材：單檔最大 ≤ 100MB<br>原始設計檔（PSD / AI / AE 等）不放入 DesignLAB<br>DesignLAB 僅存「展示／預覽版本」<br>優先使用 WebP、WebM、MP4 等適合網頁展示的格式</span></span></template>
              <template #default="{ labelId }">
                <ImagePathInput :aria-labelledby="labelId" v-model="form.cover" :required="isRequired('cover')" />
              </template>
            </FormField>
            <FormField :id="fieldId('takeaways')" label="研究重點" :required="isRequired('takeaways')" :error="errors.takeaways" field="takeaways" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.takeaways" :required="isRequired('takeaways')" rows="3" placeholder="請輸入研究重點"></textarea>
            </FormField>
            <FormField :id="fieldId('highlights')" label="值得參考" help="一行一項，會顯示成條列重點" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.highlights" :required="isRequired('highlights')" rows="3" placeholder="請輸入值得參考項目"></textarea>
            </FormField>
            <FormField :id="fieldId('tags')" label="適用情境" help="按 Enter 新增標籤，可點選歷史標籤" full v-slot="{ id }">
              <TagInput :input-id="id" v-model="form.tags" :suggested-tags="historyTags" placeholder="請新增或選擇標籤" />
            </FormField>
          </div>

          <div v-else-if="type === 'MOTION_RESEARCH'" class="form-grid">
            <FormField :id="fieldId('title')" label="標題" :required="isRequired('title')" :error="errors.title" field="title" full v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.title" :required="isRequired('title')" type="text" placeholder="請輸入標題" />
            </FormField>
            <FormField :id="fieldId('motionType')" label="類型" :required="isRequired('motionType')" :error="errors.motionType" field="motionType" v-slot="{ id }">
              <CategoryInput :input-id="id" v-model="form.motionType" :required="isRequired('motionType')" :options="historyCategories" placeholder="請選擇或新增類型" />
            </FormField>
            <FormField :id="fieldId('sourceUrl')" label="網址" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.sourceUrl" :required="isRequired('sourceUrl')" type="url" @blur="form.sourceUrl = ensureProtocol(form.sourceUrl)" placeholder="請貼上研究簡報、Demo 或相關完整內容連結" />
            </FormField>
            <FormField :id="fieldId('cover')" label="封面圖" :required="isRequired('cover')" help="JPG / JPEG / PNG / GIF / WEBP" :error="errors.cover" field="cover" full group>
              <template #label-extra><span class="media-guideline-help" tabindex="0">?<span class="media-guideline-tooltip"><b>DesignLAB 素材規範</b>圖片：單檔 ≤ 5MB<br>GIF：單檔 ≤ 10MB<br>MP4 / WebM：單檔 ≤ 50MB<br>所有素材：單檔最大 ≤ 100MB<br>原始設計檔（PSD / AI / AE 等）不放入 DesignLAB<br>DesignLAB 僅存「展示／預覽版本」<br>優先使用 WebP、WebM、MP4 等適合網頁展示的格式</span></span></template>
              <template #default="{ labelId }">
                <ImagePathInput :aria-labelledby="labelId" v-model="form.cover" :required="isRequired('cover')" />
              </template>
            </FormField>
            <FormField :id="fieldId('videoUrl')" label="影片" :required="isRequired('videoUrl')" help="MP4 / WEBM / MOV" :error="errors.videoUrl" field="videoUrl" full group>
              <template #label-extra><span class="media-guideline-help" tabindex="0">?<span class="media-guideline-tooltip"><b>DesignLAB 素材規範</b>圖片：單檔 ≤ 5MB<br>GIF：單檔 ≤ 10MB<br>MP4 / WebM：單檔 ≤ 50MB<br>所有素材：單檔最大 ≤ 100MB<br>原始設計檔（PSD / AI / AE 等）不放入 DesignLAB<br>DesignLAB 僅存「展示／預覽版本」<br>優先使用 WebP、WebM、MP4 等適合網頁展示的格式</span></span></template>
              <template #default="{ labelId }">
                <FileUploader :aria-labelledby="labelId" v-model="form.videoUrl" :required="isRequired('videoUrl')" accept="video/mp4,video/webm,video/quicktime" placeholder="選擇影片檔案" />
              </template>
            </FormField>
            <FormField :id="fieldId('takeaways')" label="動態重點" :required="isRequired('takeaways')" :error="errors.takeaways" field="takeaways" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.takeaways" :required="isRequired('takeaways')" rows="4" placeholder="請輸入動態重點"></textarea>
            </FormField>
            <FormField :id="fieldId('tools')" label="製作工具" :required="isRequired('tools')" help="按 Enter 新增標籤，可點選歷史製作工具" :error="errors.tools" field="tools" full v-slot="{ id }">
              <TagInput :input-id="id" v-model="form.tools" :suggested-tags="historyTools" placeholder="請新增或選擇製作工具" />
            </FormField>
            <FormField :id="fieldId('tags')" label="適用情境" help="按 Enter 新增標籤，可點選歷史標籤" full v-slot="{ id }">
              <TagInput :input-id="id" v-model="form.tags" :suggested-tags="historyTags" placeholder="請新增或選擇標籤" />
            </FormField>
            <!-- <div class="form-group full-width">
              <label :id="`${fieldId('implInfo')}-label`">實作資訊<span class="field-help-inline">欄位名稱與內容都可自訂、新增或刪除</span></label>
              <KeyValueListInput :aria-labelledby="`${fieldId('implInfo')}-label`" role="group" v-model="form.implInfo" />
            </div> -->
          </div>

          <div v-else-if="type === 'COMPETITORS'" class="form-grid">
            <FormField :id="fieldId('name')" label="標題" :required="isRequired('name')" :error="errors.name" field="name" full v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.name" :required="isRequired('name')" type="text" placeholder="請輸入標題" />
            </FormField>
            <FormField :id="fieldId('category')" label="類型" :required="isRequired('category')" :error="errors.category" field="category" v-slot="{ id }">
              <CategoryInput :input-id="id" v-model="form.category" :required="isRequired('category')" :options="historyCategories" placeholder="請選擇或新增類型" />
            </FormField>
            <FormField :id="fieldId('url')" label="網址" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.url" :required="isRequired('url')" type="url" @blur="form.url = ensureProtocol(form.url)" placeholder="請貼上競品網址" />
            </FormField>
            <FormField :id="fieldId('screenshot')" label="封面圖" :required="isRequired('screenshot')" help="JPG / JPEG / PNG / GIF / WEBP" :error="errors.screenshot" field="screenshot" full group>
              <template #label-extra><span class="media-guideline-help" tabindex="0">?<span class="media-guideline-tooltip"><b>DesignLAB 素材規範</b>圖片：單檔 ≤ 5MB<br>GIF：單檔 ≤ 10MB<br>MP4 / WebM：單檔 ≤ 50MB<br>所有素材：單檔最大 ≤ 100MB<br>原始設計檔（PSD / AI / AE 等）不放入 DesignLAB<br>DesignLAB 僅存「展示／預覽版本」<br>優先使用 WebP、WebM、MP4 等適合網頁展示的格式</span></span></template>
              <template #default="{ labelId }">
                <ImagePathInput :aria-labelledby="labelId" v-model="form.screenshot" :required="isRequired('screenshot')" />
              </template>
            </FormField>
            <FormField :id="fieldId('takeaways')" label="值得參考與借鏡之處" :required="isRequired('takeaways')" :error="errors.takeaways" field="takeaways" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.takeaways" :required="isRequired('takeaways')" rows="3" placeholder="請輸入值得參考與借鏡之處" ></textarea>
            </FormField>
            <FormField :id="fieldId('pros')" label="優點 (Pros)" :required="isRequired('pros')" :error="errors.pros" field="pros" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.pros" :required="isRequired('pros')" rows="2" placeholder="請輸入競品設計優點，可條列..." ></textarea>
            </FormField>
            <FormField :id="fieldId('cons')" label="缺點 (Cons)" :required="isRequired('cons')" :error="errors.cons" field="cons" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.cons" :required="isRequired('cons')" rows="2" placeholder="請輸入競品設計缺點，可條列..." ></textarea>
            </FormField>
            <FormField :id="fieldId('tags')" label="相關標籤" help="按 Enter 新增標籤，可點選歷史標籤" full v-slot="{ id }">
              <TagInput :input-id="id" v-model="form.tags" :suggested-tags="historyTags" placeholder="請新增或選擇標籤" />
            </FormField>
          </div>

          <div v-else-if="type === 'AI_CENTER'" class="form-grid">
            <FormField :id="fieldId('name')" label="標題" :required="isRequired('name')" :error="errors.name" field="name" full v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.name" :required="isRequired('name')" type="text" placeholder="請輸入標題" />
            </FormField>
            <FormField :id="fieldId('category')" label="類型" :required="isRequired('category')" :error="errors.category" field="category" v-slot="{ id }">
              <CategoryInput :input-id="id" v-model="form.category" :required="isRequired('category')" :options="historyCategories" placeholder="請選擇或新增類型" />
            </FormField>
            <FormField :id="fieldId('url')" label="網址" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.url" :required="isRequired('url')" type="url" @blur="form.url = ensureProtocol(form.url)" placeholder="請貼上工具網址" />
            </FormField>
            <FormField :id="fieldId('cover')" label="封面圖" :required="isRequired('cover')" help="JPG / JPEG / PNG / GIF / WEBP" :error="errors.cover" field="cover" full group>
              <template #label-extra><span class="media-guideline-help" tabindex="0">?<span class="media-guideline-tooltip"><b>DesignLAB 素材規範</b>圖片：單檔 ≤ 5MB<br>GIF：單檔 ≤ 10MB<br>MP4 / WebM：單檔 ≤ 50MB<br>所有素材：單檔最大 ≤ 100MB<br>原始設計檔（PSD / AI / AE 等）不放入 DesignLAB<br>DesignLAB 僅存「展示／預覽版本」<br>優先使用 WebP、WebM、MP4 等適合網頁展示的格式</span></span></template>
              <template #default="{ labelId }">
                <ImagePathInput :aria-labelledby="labelId" v-model="form.cover" :required="isRequired('cover')" />
              </template>
            </FormField>
            <FormField :id="fieldId('useCase')" label="工具簡介" :required="isRequired('useCase')" :error="errors.useCase" field="useCase" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.useCase" :required="isRequired('useCase')" rows="4" placeholder="請輸入工具簡介"></textarea>
            </FormField>
            <FormField :id="fieldId('prompt')" label="提示詞" :required="isRequired('prompt')" :error="errors.prompt" field="prompt" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.prompt" :required="isRequired('prompt')" rows="3" placeholder="請輸入經測試效果良好的提示詞"></textarea>
            </FormField>
            <FormField :id="fieldId('tags')" label="適合用途" help="按 Enter 新增標籤，可點選歷史標籤" full v-slot="{ id }">
              <TagInput :input-id="id" v-model="form.tags" :suggested-tags="historyTags" placeholder="請新增或選擇標籤" />
            </FormField>
            <FormField :id="fieldId('workflow')" label="工作流程" :required="isRequired('workflow')" help="請用 -> 分隔步驟" :error="errors.workflow" field="workflow" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.workflow" :required="isRequired('workflow')" rows="2" placeholder="請輸入分隔步驟"></textarea>
            </FormField>
          </div>

          <div v-else-if="type === 'RESOURCES'" class="form-grid">
            <FormField :id="fieldId('name')" label="標題" :required="isRequired('name')" :error="errors.name" field="name" full v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.name" :required="isRequired('name')" type="text" placeholder="例如：Awwwards" />
            </FormField>
            <FormField :id="fieldId('category')" label="類型" :required="isRequired('category')" :error="errors.category" field="category" v-slot="{ id }">
              <CategoryInput :input-id="id" v-model="form.category" :required="isRequired('category')" :options="historyCategories" placeholder="例如：設計靈感, Icon, Font, UI元件" />
            </FormField>
            <FormField :id="fieldId('url')" label="網址" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.url" :required="isRequired('url')" type="text" @blur="form.url = ensureProtocol(form.url)" placeholder="例如：https://awwwards.com" />
            </FormField>
            <FormField :id="fieldId('screenshot')" label="封面圖" :required="isRequired('screenshot')" help="JPG / JPEG / PNG / GIF / WEBP" :error="errors.screenshot" field="screenshot" full group>
              <template #label-extra><span class="media-guideline-help" tabindex="0">?<span class="media-guideline-tooltip"><b>DesignLAB 素材規範</b>圖片：單檔 ≤ 5MB<br>GIF：單檔 ≤ 10MB<br>MP4 / WebM：單檔 ≤ 50MB<br>所有素材：單檔最大 ≤ 100MB<br>原始設計檔（PSD / AI / AE 等）不放入 DesignLAB<br>DesignLAB 僅存「展示／預覽版本」<br>優先使用 WebP、WebM、MP4 等適合網頁展示的格式</span></span></template>
              <template #default="{ labelId }">
                <ImagePathInput :aria-labelledby="labelId" v-model="form.screenshot" :required="isRequired('screenshot')" />
              </template>
            </FormField>
            <FormField :id="fieldId('tags')" label="適合尋找" help="按 Enter 新增標籤，可點選歷史標籤" full v-slot="{ id }">
              <TagInput :input-id="id" v-model="form.tags" :suggested-tags="historyTags" placeholder="請新增或選擇標籤" />
            </FormField>
            <FormField :id="fieldId('desc')" label="資源介紹" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.desc" :required="isRequired('desc')" rows="3" placeholder="請輸入資源介紹"></textarea>
            </FormField>
            <FormField :id="fieldId('usage')" label="推薦用途" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.usage" :required="isRequired('usage')" rows="2" placeholder="請輸入推薦用途"></textarea>
            </FormField>
          </div>

          <div v-else-if="type === 'PROPOSALS'" class="form-grid">
            <FormField :id="fieldId('title')" label="優化提案名稱" :required="isRequired('title')" :error="errors.title" field="title" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.title" :required="isRequired('title')" type="text" placeholder="例如：內部首頁 Bento Grid 改版提案" />
            </FormField>
            <FormField :id="fieldId('status')" label="提案狀態" v-slot="{ id }">
              <Select :id="id" v-model="form.status" :options="PROPOSAL_STATUS_OPTIONS" menu-title="選擇提案狀態" placeholder="請選擇提案狀態" />
            </FormField>
            <FormField :id="fieldId('relatedResearch')" label="關聯的研究案" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.relatedResearch" :required="isRequired('relatedResearch')" type="text" placeholder="例如：Linear Bento Grid (UI Research)" />
            </FormField>
            <FormField :id="fieldId('figmaLink')" label="Figma Prototype 連結" v-slot="{ id, invalid, describedby }">
              <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.figmaLink" :required="isRequired('figmaLink')" type="text" @blur="form.figmaLink = ensureProtocol(form.figmaLink)" placeholder="請輸入 Figma 連結" />
            </FormField>
            <FormField :id="fieldId('impact')" label="預期效益與評估說明" full v-slot="{ id, invalid, describedby }">
              <textarea :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" v-model="form.impact" :required="isRequired('impact')" rows="4" placeholder="評估將帶來哪些體驗提升或數據成長？"></textarea>
            </FormField>
          </div>

          </div>
          <div class="base-modal-footer">
            <p v-if="errorCount" class="form-error-summary base-modal-status" role="alert">還有 {{ errorCount }} 個必填欄位未完成</p>
            <BaseButton variant="secondary" type="button" @click="close">取消</BaseButton>
            <BaseButton variant="primary" :loading="saving" type="submit">
              儲存資料
            </BaseButton>
          </div>
        </form>
  </BaseModal>
</template>

<script setup>
import Select from './base/Select.vue';
import BaseModal from './base/BaseModal.vue';
import FormField from './base/FormField.vue';
import Icon from './base/Icon.vue';
import BaseButton from './base/BaseButton.vue';
import { scrollBehavior } from '../utils/motion';
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import TagInput from './TagInput.vue';
import CategoryInput from './CategoryInput.vue';
import FileUploader from './FileUploader.vue';
import ImagePathInput from './ImagePathInput.vue';
import KeyValueListInput from './KeyValueListInput.vue';
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
  },
  // 由父層在 @save 後設為 true，直到雲端同步結束（見 App.vue）
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const isEdit = computed(() => !!props.item);

const typeLabel = computed(() => {
  switch (props.type) {
    case 'UI_RESEARCH': return 'UI 設計研究';
    case 'MOTION_RESEARCH': return '動態研究';
    case 'COMPETITORS': return '競品分析';
    case 'AI_CENTER': return 'AI 工具中心';
    case 'RESOURCES': return '設計資源';
    default: return '';
  }
});

const form = ref({});

const PROPOSAL_STATUS_OPTIONS = [
  { value: 'Idea', label: '提案想法 (Idea)' },
  { value: 'Evaluating', label: '評估中' },
  { value: 'Prototype', label: '驗證中' },
  { value: 'Approved', label: '已採納' }
];

// 必填規則唯一來源：表單上的「*」與送出檢查都讀這份。
// 有影片欄位的類型（動態研究）影片也必填；優化提案只有標題必填。
const REQUIRED_FIELDS = {
  UI_RESEARCH: ['title', 'category', 'cover'],
  MOTION_RESEARCH: ['title', 'motionType', 'cover', 'videoUrl'],
  COMPETITORS: ['name', 'category', 'screenshot'],
  AI_CENTER: ['name', 'category', 'cover'],
  RESOURCES: ['name', 'category', 'screenshot'],
  PROPOSALS: ['title']
};
const REQUIRED_MESSAGE = '此欄位為必填';

const fieldId = (field) => `crud-${props.type}-${field}`;
const isRequired = (field) => (REQUIRED_FIELDS[props.type] || []).includes(field);
const isEmptyValue = (value) => (Array.isArray(value) ? value.length === 0 : !String(value ?? '').trim());

const errors = ref({});
const errorCount = computed(() => Object.keys(errors.value).length);
const modalBodyRef = ref(null);

const collectErrors = () => {
  const result = {};
  (REQUIRED_FIELDS[props.type] || []).forEach(field => {
    if (isEmptyValue(form.value[field])) result[field] = REQUIRED_MESSAGE;
  });
  return result;
};

// 只即時清除已標紅的欄位；還沒按過儲存前不主動驗證
watch(form, () => {
  const flagged = Object.keys(errors.value);
  if (!flagged.length) return;
  const current = collectErrors();
  errors.value = Object.fromEntries(flagged.filter(field => current[field]).map(field => [field, current[field]]));
}, { deep: true });

watch(() => [props.isOpen, props.type, props.item], () => {
  errors.value = {};
});

const focusFirstError = async () => {
  await nextTick();
  const group = modalBodyRef.value?.querySelector('.form-group.has-error');
  if (!group) return;
  group.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
  const focusable = group.querySelector('input:not([type="file"]):not([type="hidden"]), textarea, select');
  focusable?.focus({ preventScroll: true });
};

// localStorage 不是響應式，這個彈窗也一直掛著不會重建：下面三個歷史建議
// 靠這個版本號在每次開啟或資料變動（design-lab-storage-updated）時重算。
const historyVersion = ref(0);
const refreshHistory = () => { historyVersion.value++; };
watch(() => props.isOpen, (open) => { if (open) refreshHistory(); });
onMounted(() => window.addEventListener('design-lab-storage-updated', refreshHistory));
onUnmounted(() => window.removeEventListener('design-lab-storage-updated', refreshHistory));

// 只建議目前這個類型用過的標籤，不混入其他頁面的標籤
const historyTags = computed(() => {
  historyVersion.value;
  const allKeyData = getStorageData(props.type);
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

// 只收集目前表單模組曾使用過的類型，避免不同模組的類型混在一起。
const historyCategories = computed(() => {
  historyVersion.value;
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

const historyTools = computed(() => {
  historyVersion.value;
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

// 每次回傳新陣列，避免多筆資料共用同一參照。
// 「製作工具」由 form.tools 自動成為表格第一列，不放在這裡。
function defaultImplInfo() {
  return [
    { label: '前端技術', value: '' },
    { label: 'Demo 連結', value: '' },
    { label: '檔案大小', value: '' }
  ];
}

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

      if (props.type === 'MOTION_RESEARCH') {
        // 舊資料可能有手動填的「製作工具」列，現在改由 form.tools 產生，濾掉避免重複
        if (Array.isArray(itemCopy.implInfo)) {
          itemCopy.implInfo = itemCopy.implInfo.filter(row => (row.label || '').trim() !== '製作工具');
        }
        // 舊資料沒有這欄時給預設欄位名稱；已有自訂內容的不覆蓋
        if (!(Array.isArray(itemCopy.implInfo) && itemCopy.implInfo.length)) {
          itemCopy.implInfo = defaultImplInfo();
        }
      }

      form.value = itemCopy;
    } else {
      form.value = {
        title: '',
        category: '',
        tags: [],
        tools: [],
        toolsInput: '',
        cover: '',
        source: '',
        sourceUrl: '',
        takeaways: '',
        highlights: '',
        implInfo: props.type === 'MOTION_RESEARCH' ? defaultImplInfo() : [],
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
        usage: '',
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
  errors.value = collectErrors();
  if (errorCount.value) {
    focusFirstError();
    return;
  }

  const formattedItem = { ...form.value };
  
  if (formattedItem.sourceUrl) formattedItem.sourceUrl = ensureProtocol(formattedItem.sourceUrl);
  if (formattedItem.url) formattedItem.url = ensureProtocol(formattedItem.url);
  if (formattedItem.link) formattedItem.link = ensureProtocol(formattedItem.link);
  if (formattedItem.website) formattedItem.website = ensureProtocol(formattedItem.website);
  if (formattedItem.figmaLink) formattedItem.figmaLink = ensureProtocol(formattedItem.figmaLink);
  if (formattedItem.videoUrl) formattedItem.videoUrl = ensureProtocol(formattedItem.videoUrl);
  if (formattedItem.cover) formattedItem.cover = ensureProtocol(formattedItem.cover);

  if (formattedItem.tags && typeof formattedItem.tags === 'string') {
    formattedItem.tags = formattedItem.tags.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
  }
  
  if (Array.isArray(formattedItem.tools)) {
    formattedItem.toolsInput = formattedItem.tools.join(', ');
  } else if (typeof formattedItem.tools === 'string') {
    formattedItem.tools = formattedItem.tools.split(/[,/，#\n\r]+/).map(s => s.trim()).filter(Boolean);
    formattedItem.toolsInput = formattedItem.tools.join(', ');
  }

  if (Array.isArray(formattedItem.implInfo)) {
    formattedItem.implInfo = formattedItem.implInfo.filter(row => (row.label || '').trim() || (row.value || '').trim());
  }


  // 不在這裡關閉：父層等雲端同步成功才關（見 saving prop）
  emit('save', {
    type: props.type,
    item: formattedItem
  });
};
</script>

<style scoped>

.modal-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.form-error-summary {
  margin: 0 auto 0 0;
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--color-danger);
}

.media-guideline-help {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: var(--space-1);
  border-radius: 50%;
  background: var(--action-primary);
  color: var(--action-on-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-black);
  cursor: help;
  vertical-align: middle;
}

.media-guideline-help:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.media-guideline-tooltip {
  position: absolute;
  left: -10px;
  top: 10px;
  z-index: var(--z-dropdown);
  width: min(360px, 72vw);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-primary);
  box-shadow: var(--shadow-surface);
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px);
  transition: opacity var(--dur-fast) var(--ease-standard), visibility var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard);
  pointer-events: none;
}
.media-guideline-tooltip b {
  display: block;
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border-color);
}

.media-guideline-help:hover .media-guideline-tooltip,
.media-guideline-help:focus-visible .media-guideline-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

input, select, textarea {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--fs-body);
  color: var(--text-primary);
  transition: border-color var(--dur-fast) var(--ease-standard);
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

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
