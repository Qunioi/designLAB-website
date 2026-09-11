<template>
  <!-- 全站殼層：導覽（nav slot）＋主內容（default slot）＋浮在上面的東西（overlays slot：搜尋、表單、Toast…）。
       側欄寬度 --sidebar-width 依 5 級斷點在 base.css 切換；主內容的外距與最大寬度寫在這裡。 -->
  <div class="app-container" :class="theme">
    <button type="button" class="skip-link" @click="focusMain">跳到主要內容</button>
    <slot name="nav" />
    <main ref="mainRef" id="main-content" class="main-content" tabindex="-1">
      <slot />
    </main>
    <slot name="overlays" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  theme: { type: String, default: '' }
});

const mainRef = ref(null);
// 網站用 #/ 路由，不能用 <a href="#main-content">（會被當成換頁），改成直接移動焦點
const focusMain = () => mainRef.value?.focus();
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--surface-page);
  color: var(--text-primary);
  transition: background-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard);
}

/* 鍵盤使用者按 Tab 第一個會碰到它，可以直接跳過側欄 */
.skip-link {
  position: fixed;
  top: var(--space-3);
  left: var(--space-3);
  z-index: var(--z-toast);
  padding: var(--space-2) var(--space-4);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--action-primary);
  color: var(--action-on-primary);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  transform: translateY(-200%);
  transition: transform var(--dur-fast) var(--ease-standard);
}

.skip-link:focus-visible {
  transform: translateY(0);
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.main-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  max-width: 1720px;
  margin-left: var(--sidebar-width);
  padding: var(--space-container);
}

.main-content:focus {
  outline: none;
}

@media (min-width: 1920px) {
  .main-content {
    padding: var(--space-8);
    margin-left: max(var(--sidebar-width), calc(var(--sidebar-width) + (100% - var(--sidebar-width) - 1720px) / 2));
  }
}

@media (max-width: 1359px) {
  .main-content {
    padding: var(--space-6);
  }
}

@media (max-width: 640px) {
  .main-content {
    margin-left: 0;
    padding: calc(env(safe-area-inset-top, 0px) + 5.5rem) clamp(16px, 4vw, 20px) calc(env(safe-area-inset-bottom, 0px) + 1.5rem);
  }
}
</style>
