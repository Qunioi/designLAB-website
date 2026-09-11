<template>
  <section class="lbs-section">
    <LightboxSectionHeading :icon="icon" :title="title" :accent="accent" />
    <div class="lbs-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
// 燈箱右側區塊共用外框（標題列＋區塊分隔線），各格式元件只實作 slot 內容
import LightboxSectionHeading from './LightboxSectionHeading.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' }
});
</script>

<style scoped>
.lbs-section {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
}
.lbs-section:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.lbs-body {
  padding-left: 1px;
}
</style>
