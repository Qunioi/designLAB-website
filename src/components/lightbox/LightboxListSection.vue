<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <div class="lbs-list">
      <div v-for="(text, index) in items" :key="`${index}-${text}`" class="lbs-list-item">
        <span class="lbs-list-num" :style="{ background: accent }">{{ index + 1 }}</span>
        <span class="lbs-list-text">{{ text }}</span>
      </div>
    </div>
  </LightboxSection>
</template>

<script setup>
// 格式 3：標題 + 編號清單。對應示意圖的「做得好的地方」「工作流程」，
// 每一項前面是一個實心圓圈編號，顏色跟著 accent 走。
import LightboxSection from './LightboxSection.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' },
  items: { type: Array, default: () => [] }
});
</script>

<style scoped>
.lbs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.lbs-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.lbs-list-num {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #fff;
  font-size: var(--fs-tiny);
  font-weight: var(--fw-bold);
}

.lbs-list-text {
  color: var(--text-secondary);
  font-size: var(--fs-meta);
  line-height: var(--lh-normal);
}
</style>
