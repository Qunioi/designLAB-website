//   if (!(await confirmDialog({ title: '刪除這筆資料？', message: '刪除後無法復原。', confirmText: '刪除', danger: true }))) return;
// 回傳 Promise<boolean>：按確認是 true；按取消、點遮罩、按 Esc 都是 false。
// 畫面由 App.vue 裡唯一一個 <ConfirmDialog /> 負責渲染。

import { reactive } from 'vue';

export const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: '確定',
  cancelText: '取消',
  danger: false
});

let pendingResolve = null;

export function confirmDialog({ title = '確定要繼續嗎？', message = '', confirmText = '確定', cancelText = '取消', danger = false } = {}) {
  // 前一個還沒回覆就又叫出新的：前一個視為取消
  if (pendingResolve) pendingResolve(false);
  Object.assign(confirmState, { open: true, title, message, confirmText, cancelText, danger });
  return new Promise((resolve) => { pendingResolve = resolve; });
}

export function settleConfirm(result) {
  confirmState.open = false;
  const resolve = pendingResolve;
  pendingResolve = null;
  if (resolve) resolve(result);
}
