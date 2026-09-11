<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <p class="lbs-text">{{ text }}</p>
  </LightboxSection>
</template>

<script setup>
import LightboxSection from './LightboxSection.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' },
  text: { type: String, default: '' }
});
</script>

<style scoped>
.lbs-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--fs-body);
  line-height: var(--lh-relaxed);
  white-space: pre-line;
}
</style>
