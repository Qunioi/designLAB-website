<template>
  <!-- 全站唯一的確認對話框，用 utils/confirm.js 的 confirmDialog() 叫出來。
       焦點預設落在「取消」：危險操作不會因為連按 Enter 就直接執行。 -->
  <BaseModal
    :open="confirmState.open"
    size="sm"
    layer="confirm"
    :title="confirmState.title"
    @close="settleConfirm(false)"
  >
    <div class="base-modal-body">
      <p class="confirm-message">{{ confirmState.message }}</p>
    </div>
    <template #footer>
      <BaseButton variant="secondary" data-autofocus @click="settleConfirm(false)">{{ confirmState.cancelText }}</BaseButton>
      <BaseButton :variant="confirmState.danger ? 'danger' : 'primary'" @click="settleConfirm(true)">{{ confirmState.confirmText }}</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './base/BaseModal.vue';
import BaseButton from './base/BaseButton.vue';
import { confirmState, settleConfirm } from '../utils/confirm';
</script>

<style scoped>
.confirm-message {
  margin: 0;
  font-size: var(--fs-body);
  line-height: var(--lh-normal);
  color: var(--text-secondary);
  white-space: pre-line;
}
</style>
