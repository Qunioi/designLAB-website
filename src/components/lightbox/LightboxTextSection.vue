<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <p class="lbs-text">{{ text }}</p>
  </LightboxSection>
</template>

<script setup>
// 格式 1：標題 + 文案。對應示意圖的「資源介紹」「推薦用途」。
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
  font-size: var(--fs-label);
  line-height: var(--lh-relaxed);
  white-space: pre-line;
}
</style>
