<template>
  <button
    type="button"
    class="action-icon-btn"
    :class="variant"
    :aria-label="ariaLabel"
    :title="title"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  title: { type: String, default: '' }
});

defineEmits(['click']);
</script>

<style scoped>
.action-icon-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-meta);
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.action-icon-btn:hover {
  background: transparent;
  border-color: var(--border-color-hover);
  color: var(--text-primary);
}

.action-icon-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .action-icon-btn {
    width: 38px;
    height: var(--control-height-md);
  }
}

.action-icon-btn.edit:hover {
  background: transparent;
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.action-icon-btn.delete:hover {
  background: transparent;
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
