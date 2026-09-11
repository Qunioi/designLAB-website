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
        <Icon name="close" :size="8" :stroke-width="3" />
      </button>
    </div>
    <BaseButton variant="ghost" size="sm" class="kv-add-btn" type="button" @click="addRow">+ 新增欄位</BaseButton>
  </div>
</template>

<script setup>
import Icon from './base/Icon.vue';
import BaseButton from './base/BaseButton.vue';
// 對應 LightboxTableSection 的 rows（[{ label, value }]）
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
  font-size: var(--fs-body);
  color: var(--text-primary);
  transition: border-color var(--dur-fast) var(--ease-standard);
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
  font-size: var(--fs-meta);
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.kv-remove-btn:hover {
  background: var(--color-error);
  color: var(--action-on-danger);
}

.kv-add-btn {
  align-self: flex-start;
}

</style>
