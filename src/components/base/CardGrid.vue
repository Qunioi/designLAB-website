<template>
  <!-- 卡片網格：欄數依 5 級斷點（超寬 max 欄 · 桌機 4 · 筆電 3 · 平板 2 · 手機 1），間距 --grid-gap。
       不用 @container：平板側欄收成 72px 後，平板的內容區反而比 1024 筆電寬，
       依容器寬度排會讓 1023／1024 兩側的欄數顛倒。
       給 transition 時用 TransitionGroup 包（篩選時卡片淡出、其餘補位）。 -->
  <TransitionGroup v-if="transition" tag="div" :name="transition" class="card-grid" :class="`card-grid--max-${max}`">
    <slot />
  </TransitionGroup>
  <div v-else class="card-grid" :class="`card-grid--max-${max}`">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  // 超寬螢幕（≥1920）最多幾欄：列表頁 5、首頁 4
  max: { type: Number, default: 4 },
  transition: { type: String, default: '' }
});
</script>

<style scoped>
.card-grid {
  position: relative;
  z-index: var(--z-base);
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--grid-gap);
}

@media (min-width: 1920px) {
  .card-grid--max-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}

@media (max-width: 1359px) {
  .card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 1023px) {
  .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .card-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
