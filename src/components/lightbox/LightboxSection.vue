<template>
  <section class="lbs-section">
    <LightboxSectionHeading :icon="icon" :title="title" :accent="accent" />
    <div class="lbs-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
// 燈箱右側「一個區塊」的共用外框：icon+標題（見 LightboxSectionHeading）
// 加上區塊之間的分隔線。5 種格式元件（Text/Tag/List/Code/Table）都是
// 包在這層外面，各自只需要實作 <slot> 裡面那段內容本身。
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
