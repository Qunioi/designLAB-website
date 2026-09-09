<template>
  <div class="kv-list">
    <div v-for="(row, index) in rows" :key="index" class="kv-row">
      <input
        v-model="row.label"
        type="text"
        class="kv-input kv-label-input"
        placeholder="欄位名稱"
        @input="emitUpdate"
      />
      <input
        v-model="row.value"
        type="text"
        class="kv-input kv-value-input"
        placeholder="內容（網址開頭會自動變成可點擊連結）"
        @input="emitUpdate"
      />
      <button type="button" class="kv-remove-btn" @click="removeRow(index)" title="移除這一列">
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <button type="button" class="kv-add-btn" @click="addRow">+ 新增欄位</button>
  </div>
</template>

<script setup>
// 使用者可自訂「欄位名稱＋內容」的表格編輯器，對應 LightboxTableSection 的
// rows（[{ label, value }]）。跟 TagInput 一樣是 v-model 陣列，但這裡每一項
// 是可編輯的兩個文字欄，不是單純的標籤字串。
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue']);

const rows = ref((props.modelValue || []).map(r => ({ label: r.label || '', value: r.value || '' })));

watch(() => props.modelValue, (newVal) => {
  rows.value = (newVal || []).map(r => ({ label: r.label || '', value: r.value || '' }));
}, { deep: true });

const emitUpdate = () => {
  emit('update:modelValue', rows.value.map(r => ({ ...r })));
};

const addRow = () => {
  rows.value.push({ label: '', value: '' });
  emitUpdate();
};

const removeRow = (index) => {
  rows.value.splice(index, 1);
  emitUpdate();
};
</script>

<style scoped>
.kv-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.kv-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.kv-input {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-label);
  color: var(--text-primary);
  transition: border-color 0.18s ease;
}

.kv-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.kv-label-input {
  flex: 0 0 30%;
  min-width: 90px;
}

.kv-value-input {
  flex: 1;
  min-width: 0;
}

.kv-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: var(--fs-tiny);
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.kv-remove-btn:hover {
  background: var(--color-error);
  color: #ffffff;
}

.kv-add-btn {
  align-self: flex-start;
  font-size: var(--fs-label);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.kv-add-btn:hover {
  background: var(--bg-hover);
}
</style>
