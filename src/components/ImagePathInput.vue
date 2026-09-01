<template>
  <div class="image-path-input">
    <div class="image-path-row">
      <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
      <input
        :value="modelValue"
        type="url"
        :placeholder="placeholder"
        :required="required"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="handleBlur"
      />
      <a href="https://duk.tw/" target="_blank" rel="noopener noreferrer" class="upload-link">
        前往 duk.tw 上傳圖片 ↗
      </a>
    </div>
    <span class="image-path-hint">請先上傳圖片，再將取得的 .png 或 .jpg 路徑貼到這裡。</span>
  </div>
</template>

<script setup>
import { ensureProtocol } from '../utils/formatters';

defineProps({
  modelValue: { type: String, default: '' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '貼上圖片路徑，例如：https://duk.tw/tpUaQ1.png' }
});

const emit = defineEmits(['update:modelValue']);

const handleBlur = (event) => {
  if (event.target.value.trim()) {
    emit('update:modelValue', ensureProtocol(event.target.value));
  }
};
</script>

<style scoped>
.image-path-input {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.image-path-row {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color 0.18s ease;
}

.image-path-row:focus-within {
  border-color: var(--color-primary);
}

.link-icon {
  flex: 0 0 auto;
  margin-left: 0.85rem;
  color: var(--text-muted);
}

.image-path-row input {
  min-width: 0;
  flex: 1;
  background: transparent;
  border: 0;
  padding: 0.55rem 0.85rem;
  color: var(--text-primary);
  outline: none;
}

.upload-link {
  flex: 0 0 auto;
  padding: 0.65rem 0.85rem;
  border-left: 1px solid var(--border-color);
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.upload-link:hover {
  text-decoration: underline;
}

.image-path-hint {
  color: var(--text-muted);
  font-size: 0.6875rem;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .image-path-row {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .image-path-row input {
    min-width: calc(100% - 2.5rem);
  }

  .upload-link {
    width: 100%;
    border-top: 1px solid var(--border-color);
    border-left: 0;
    text-align: center;
  }
}
</style>
