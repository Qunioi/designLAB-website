<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <div class="lbs-list">
      <div v-for="(text, index) in items" :key="`${index}-${text}`" class="lbs-list-item">
        <span v-if="marker !== 'none'" class="lbs-list-marker" :style="{ background: accent }">
          <svg v-if="marker === 'check'" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg v-else-if="marker === 'cross'" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="lbs-list-text">{{ text }}</span>
      </div>
    </div>
  </LightboxSection>
</template>

<script setup>
// 格式 3：標題 + 清單。對應示意圖的「做得好的地方」「工作流程」「值得參考」，
// 每一項前面是一個實心圓圈，顏色跟著 accent 走；圓圈裡放編號還是打勾由 marker 決定。
import LightboxSection from './LightboxSection.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' },
  items: { type: Array, default: () => [] },
  // 'number'：1、2、3... 依序編號（適合有先後順序的步驟，例如工作流程）
  // 'check'：全部都是打勾圖示（適合條列式重點，例如「值得參考」「優點」，項目之間沒有順序關係）
  // 'cross'：全部都是叉叉圖示（適合負面條列，例如「缺點」）
  // 'none'：不顯示前面的符號，純文字條列
  marker: { type: String, default: 'number' }
});
</script>

<style scoped>
.lbs-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lbs-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.lbs-list-marker {
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
