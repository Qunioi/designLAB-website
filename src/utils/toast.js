// 任何地方（元件或純 JS 工具，例如 storage.js）都可以直接呼叫：
//   toast.success('已新增「標題」')
//   toast.error('儲存失敗', { detail: '登入已逾期…' })
// 畫面由 App.vue 裡唯一一個 <ToastHost /> 負責渲染。

import { reactive } from 'vue';

const DEFAULT_DURATION = {
  success: 2600,
  info: 3200,
  // 錯誤訊息通常要看完原因、再決定下一步，停留久一點，也可以手動關閉
  error: 6000
};

export const toastState = reactive({ items: [] });

let seed = 0;

export function dismissToast(id) {
  const index = toastState.items.findIndex(item => item.id === id);
  if (index !== -1) toastState.items.splice(index, 1);
}

function showToast(type, title, { detail = '', duration } = {}) {
  const id = ++seed;
  toastState.items.push({ id, type, title, detail });
  // 同時最多保留 4 則，避免連續操作時整排疊滿畫面
  if (toastState.items.length > 4) toastState.items.shift();
  const ms = duration ?? DEFAULT_DURATION[type];
  if (ms > 0) setTimeout(() => dismissToast(id), ms);
  return id;
}

export const toast = {
  success: (title, options) => showToast('success', title, options),
  error: (title, options) => showToast('error', title, options),
  info: (title, options) => showToast('info', title, options)
};
