<template>
  <LightboxSection :icon="icon" :title="title" :accent="accent">
    <div class="lbs-tag-row">
      <span v-for="tag in tags" :key="tag" class="lbs-tag">{{ tag }}</span>
    </div>
  </LightboxSection>
</template>

<script setup>
// 格式 2：標題 + 一排標籤。對應示意圖的「適合尋找」「可參考情境」。
// 純資訊展示用，跟頁面上方那排可點擊篩選的 # 標籤是兩回事，這裡預設
// 不做篩選互動；真的需要點擊篩選時，呼叫端可以自己在外面包一層 @click。
import LightboxSection from './LightboxSection.vue';

defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' },
  tags: { type: Array, default: () => [] }
});
</script>

<style scoped>
.lbs-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.lbs-tag {
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-meta);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  white-space: nowrap;
}
</style>
