<template>
  <h4 class="lbs-heading" :style="{ '--lbs-accent': accent }">
    <span class="lbs-icon" v-if="icon"><Icon :name="icon" :size="18" /></span>
    <span>{{ title }}</span>
  </h4>
</template>

<script setup>
import Icon from '../base/Icon.vue';
// accent 是圖示顏色，用主題色變數（例如 var(--color-warning)）才會跟著主題變色；
// 標題文字固定用主要文字色。
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' }
});
</script>

<style scoped>
.lbs-heading {
  line-height: var(--lh-heading);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  font-size: var(--fs-section-title);
  font-weight: var(--fw-bold);
}

.lbs-icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--lbs-accent);
}

.lbs-icon svg {
  display: block;
}
</style>
