<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <div class="lbs-code-box">
      <button
        type="button"
        class="lbs-copy-btn"
        :class="{ copied }"
        :title="copied ? '已複製到剪貼簿' : '複製內容'"
        :aria-label="copied ? '已複製到剪貼簿' : '複製內容'"
        @click="handleCopy"
      >
        <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>{{ copied ? '已複製' : '複製' }}</span>
      </button>
      <ul v-if="lines.length > 1" class="lbs-code-lines">
        <li v-for="(line, index) in lines" :key="`${index}-${line}`">{{ line }}</li>
      </ul>
      <p v-else class="lbs-code-plain">{{ lines[0] }}</p>
    </div>
  </LightboxSection>
</template>

<script setup>
// 格式 4：標題 + 可複製的內容框。對應示意圖的「提示詞」——內容可以
// 是一整段文字，也可以是字串陣列（會逐行顯示成條列）；右上角固定
// 一顆複製按鈕，複製的是完整內容（多行會用換行接起來）。
import { ref, computed } from 'vue';
import LightboxSection from './LightboxSection.vue';
import { copyToClipboard } from '../../utils/clipboard';

const props = defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' },
  content: { type: [String, Array], default: '' }
});

const lines = computed(() => {
  if (Array.isArray(props.content)) return props.content.map(String).filter(Boolean);
  return String(props.content || '').split(/\r?\n/).filter(Boolean);
});

const copied = ref(false);
const handleCopy = async () => {
  const text = lines.value.join('\n');
  if (!await copyToClipboard(text)) return;
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1800);
};
</script>

<style scoped>
.lbs-code-box {
  position: relative;
  padding: var(--space-3) var(--space-4);
  padding-right: 4.2rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.lbs-copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--fs-tiny);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

/* 平常隱藏，滑入內容框或鍵盤 focus 到複製鈕本身才顯示；複製完成後的
   「已複製」提示也要保持顯示，滑鼠離開才不會看起來像瞬間消失 */
.lbs-code-box:hover .lbs-copy-btn,
.lbs-copy-btn:focus-visible,
.lbs-copy-btn.copied {
  opacity: 1;
}

@media (hover: none) {
  .lbs-copy-btn { opacity: 1; }
}

.lbs-copy-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.lbs-copy-btn.copied {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.lbs-code-lines {
  margin: 0;
  padding: 0 0 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lbs-code-lines li {
  color: var(--text-secondary);
  font-size: var(--fs-meta);
  line-height: var(--lh-normal);
}

.lbs-code-plain {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--fs-meta);
  line-height: var(--lh-relaxed);
  white-space: pre-wrap;
}
</style>
