<template>
  <!-- 表單欄位：欄位名稱（左側主色小圓點）＋必填星號＋行內說明＋錯誤訊息。
       欄位本身用 slot 放，slot 會拿到 id／labelId／invalid／describedby：
         <FormField id="crud-title" label="標題" required :error="errors.title" v-slot="{ id, invalid, describedby }">
           <input :id="id" :aria-invalid="invalid || undefined" :aria-describedby="describedby" />
         </FormField>
       沒有單一輸入框的欄位（上傳、多列輸入）加 group，用 labelId 當 aria-labelledby。 -->
  <div class="form-group" :class="{ 'full-width': full, 'has-error': !!error }" :data-field="field || undefined">
    <label :id="labelId" :for="group ? undefined : id" class="form-field-label">
      {{ label }}<span v-if="required" class="required" aria-hidden="true"> *</span>
      <span v-if="help" class="field-help-inline">{{ help }}</span>
      <slot name="label-extra" />
    </label>
    <p v-if="description" :id="descriptionId" class="field-description">{{ description }}</p>
    <slot :id="id" :label-id="labelId" :invalid="!!error" :describedby="describedby" />
    <p v-if="error" :id="errorId" class="field-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  help: { type: String, default: '' },
  // 欄位名稱下方的一行說明（比 help 長、需要單獨一行時用）
  description: { type: String, default: '' },
  error: { type: String, default: '' },
  // 兩欄表單裡佔滿整列
  full: { type: Boolean, default: false },
  // 給「驗證失敗時捲到第一個錯誤欄位」用的識別
  field: { type: String, default: '' },
  // 沒有單一輸入框（上傳、多列輸入）：label 不寫 for，改讓欄位用 aria-labelledby 指回來
  group: { type: Boolean, default: false }
});

const labelId = computed(() => `${props.id}-label`);
const errorId = computed(() => `${props.id}-error`);
const descriptionId = computed(() => `${props.id}-description`);
// 報讀順序：說明 → 錯誤訊息
const describedby = computed(() => [props.description && descriptionId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined);
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-field-label {
  position: relative;
  padding-left: 1rem;
  color: var(--text-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-bold);
  line-height: var(--lh-normal);
}

.form-field-label::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--action-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--action-primary) 12%, transparent);
}

.required {
  color: var(--color-danger);
}

.field-help-inline {
  margin-left: 0.5em;
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  color: var(--text-muted);
}

.field-description {
  margin: calc(var(--space-1) * -1) 0 0;
  padding-left: 1rem;
  font-size: var(--fs-meta);
  line-height: var(--lh-normal);
  color: var(--text-muted);
}

/* 驗證錯誤：欄位框線標紅＋欄位下方說明，所有類型的輸入元件都用同一套樣式 */
.field-error {
  margin: 0;
  font-size: var(--fs-meta);
  line-height: 1.4;
  color: var(--color-danger);
}

.form-group.has-error :deep(input:not([type="file"])),
.form-group.has-error :deep(textarea),
.form-group.has-error :deep(select),
.form-group.has-error :deep(.tag-chips-wrapper),
.form-group.has-error :deep(.uploader-dropzone-box),
.form-group.has-error :deep(.media-preview-card) {
  border-color: var(--color-danger);
}
</style>
