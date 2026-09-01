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
  padding: 0.75rem 0.85rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  font-family: var(--font-code);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  min-height: 65px;
  max-height: 95px;
  overflow-y: auto;
  line-height: 1.55;
  white-space: pre-wrap;
  cursor: pointer;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.prompt-code-box::-webkit-scrollbar {
  width: 4px;
}

.prompt-code-box::-webkit-scrollbar-thumb {
  background: var(--border-color-hover);
  border-radius: 4px;
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
  font-size: 0.5875rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.prompt-code-box:hover .click-copy-hint,
.prompt-code-box.copied .click-copy-hint {
  opacity: 1;
}

.prompt-code-box.copied .click-copy-hint {
  background: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
  font-weight: 600;
}
</style>
