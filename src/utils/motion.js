import { ref, watch } from 'vue';

// 程式觸發的捲動（捲到錯誤欄位、高亮卡片）：使用者開了「減少動態」就直接跳到位置
export function scrollBehavior() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'smooth';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

// 首次載入的卡片交錯淡入：每個頁面在這次開啟網站只播一次，
// 之後切回來、篩選、同步更新都不再播，避免反覆等動畫。
const playedIntros = new Set();

const STAGGER_COUNT = 8;   // 只有前 8 張卡片參與（跟 components.css 的 .stagger-in 一致）
const STAGGER_STEP = 40;   // 每張間隔 40ms
const INTRO_DURATION = 300; // 對應 --dur-slow

/**
 * @param {string} key    頁面識別（例如 'UI_RESEARCH'、'dashboard'）
 * @param {() => boolean} isReady 內容已經畫出來（骨架結束且有卡片）時回傳 true
 * @returns {import('vue').Ref<boolean>} 為 true 時在卡片網格加上 .stagger-in
 */
export function useStaggerIntro(key, isReady) {
  const active = ref(false);
  watch(isReady, (ready) => {
    if (!ready || playedIntros.has(key)) return;
    playedIntros.add(key);
    active.value = true;
    // 播完就拿掉 class，之後篩選重新插入的卡片不會再套到延遲
    setTimeout(() => { active.value = false; }, STAGGER_COUNT * STAGGER_STEP + INTRO_DURATION + 100);
  }, { immediate: true });
  return active;
}
