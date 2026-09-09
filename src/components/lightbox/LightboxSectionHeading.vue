<template>
  <h4 class="lbs-heading" :style="{ '--lbs-accent': accent }">
    <span class="lbs-icon" v-if="icon" v-html="icon"></span>
    <span>{{ title }}</span>
  </h4>
</template>

<script setup>
// 5 種燈箱右側內容格式共用的「icon + 標題」列。icon 是外部傳進來的
// SVG 字串（跟 Navigation.vue 選單 icon 同一種寫法），accent 是這個
// icon 的顏色（建議直接帶設計系統既有的顏色變數，例如
// var(--color-warning) 橘色、var(--color-secondary) 紫色，才能跟著
// 主題切換一起變色）。標題文字本身固定用主要文字色，不跟著 icon 變色。
defineProps({
  icon: { type: String, default: '' },
  title: { type: String, required: true },
  accent: { type: String, default: 'var(--color-primary)' }
});
</script>

<style scoped>
.lbs-heading {
  /* line-height／color 跟 h1~h6 共用規則一樣，不重複寫 */
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  font-size: var(--fs-body-lg);
  font-weight: var(--fw-bold);
}

.lbs-icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--lbs-accent);
}

.lbs-icon :deep(svg) {
  display: block;
  width: 16px;
  height: 16px;
}
</style>
