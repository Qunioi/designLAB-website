<template>
  <button
    type="button"
    class="prompt-code-box"
    :class="{ copied }"
    :title="copied ? '已複製到剪貼簿' : '點擊可直接複製 Prompt'"
    @click="$emit('copy')"
  >
    <code>{{ prompt }}</code>
    <span class="click-copy-hint">{{ copied ? '已複製到剪貼簿' : '點擊複製 Prompt' }}</span>
  </button>
</template>

<script setup>
defineProps({
  prompt: { type: String, default: '' },
  copied: { type: Boolean, default: false }
});

defineEmits(['copy']);
</script>

<style scoped>
.prompt-code-box {
  position: relative;
  width: 100%;
  text-align: left;
  background: var(--bg-input);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  font-family: var(--font-code);
  font-size: var(--fs-meta);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
  min-height: 65px;
  max-height: 95px;
  overflow-y: auto;
  line-height: var(--lh-normal);
  white-space: pre-wrap;
  cursor: pointer;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  transition: border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
}

.prompt-code-box::-webkit-scrollbar {
  width: 4px;
}

.prompt-code-box::-webkit-scrollbar-thumb {
  background: var(--border-color-hover);
  border-radius: var(--radius-xs);
}

.prompt-code-box:hover,
.prompt-code-box:focus-visible {
  border-color: var(--color-primary);
  background: var(--bg-hover);
}

.prompt-code-box.copied {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.click-copy-hint {
  position: absolute;
  bottom: 0.25rem;
  right: 0.45rem;
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-xs);
  background: var(--surface-raised);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dur-base) var(--ease-standard);
}

.prompt-code-box:hover .click-copy-hint,
.prompt-code-box.copied .click-copy-hint {
  opacity: 1;
}

.prompt-code-box.copied .click-copy-hint {
  background: var(--action-primary);
  color: var(--action-on-primary);
  border-color: var(--color-primary);
  font-weight: var(--fw-semibold);
}
</style>
