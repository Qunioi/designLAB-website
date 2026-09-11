<template>
  <!-- 頁面上的一個區塊：標題列（16/700＋可選的右側動作）＋ 12px ＋ 內容。
       區塊跟區塊之間的距離由外層的 gap（--space-section）決定，這裡不加外距。 -->
  <section class="section-block" :aria-labelledby="titleId">
    <header class="section-block-header">
      <h3 :id="titleId" class="section-block-title">{{ title }}</h3>
      <slot name="action" />
    </header>
    <slot />
  </section>
</template>

<script>
let uid = 0;
</script>

<script setup>
defineProps({
  title: { type: String, required: true }
});

const titleId = `section-block-title-${++uid}`;
</script>

<style scoped>
.section-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-heading);
  min-width: 0;
}

.section-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.section-block-title {
  margin: 0;
  font-size: var(--fs-section-title);
  font-weight: var(--fw-bold);
  line-height: var(--lh-heading);
  color: var(--text-primary);
}
</style>
