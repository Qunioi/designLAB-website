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
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7375rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.action-icon-btn.edit:hover {
  background: color-mix(in srgb, var(--color-warning) 14%, var(--bg-hover));
  border-color: color-mix(in srgb, var(--color-warning) 40%, transparent);
  color: var(--color-warning);
}

.action-icon-btn.delete:hover {
  background: color-mix(in srgb, var(--color-error) 14%, var(--bg-hover));
  border-color: color-mix(in srgb, var(--color-error) 40%, transparent);
  color: var(--color-error);
}
</style>
