// 顯示身分（帳號／暱稱／角色）與登入權杖都存在 localStorage，而 localStorage
// 不是響應式的：畫面上 computed(() => getCurrentUser()...) 這類判斷只會算一次，
// 登出、權杖過期、身分模擬切換後都不會重算（例如切成訪客後通知鈴鐺還在）。
// 做法：任何會改變身分的地方呼叫 bumpIdentity()，依賴身分的 computed 先讀一次
// identityVersion.value，版本號一變就會自動重新計算。
// 獨立成一個檔案，是因為 userStore.js 與 sheetsAPI.js 都要用，
// 而 userStore.js 本身就 import sheetsAPI.js，放在任一邊都會造成循環引用。

import { ref } from 'vue';

export const identityVersion = ref(0);

export function bumpIdentity() {
  identityVersion.value++;
}
