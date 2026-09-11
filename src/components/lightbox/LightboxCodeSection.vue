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
        <Icon name="copy" :size="13" v-if="!copied" />
        <Icon name="check" :size="13" :stroke-width="2.5" v-else />
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
import Icon from '../base/Icon.vue';
// content 可以是字串或字串陣列（逐行條列）；複製時多行用換行接起來
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
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  background: var(--surface-raised);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}

/* 平常隱藏，滑入內容框或鍵盤 focus 到複製鈕本身才顯示；複製完成後的
   「已複製」提示也要保持顯示，滑鼠離開才不會看起來像瞬間消失 */
.lbs-code-box:hover .lbs-copy-btn,
.lbs-copy-btn:focus-visible,
.lbs-copy-btn.copied {
  opacity: 1;
}

@media (hover: none), (pointer: coarse) {
  .lbs-copy-btn { opacity: 1; }
}

.lbs-copy-btn:hover {
  background: var(--action-primary);
  border-color: var(--color-primary);
  color: var(--action-on-primary);
}

.lbs-copy-btn.copied {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--action-on-primary);
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
