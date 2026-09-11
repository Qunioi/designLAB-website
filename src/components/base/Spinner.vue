<template>
  <!-- 進行中狀態的轉圈圖示；顏色跟著 currentColor，大小預設跟文字一樣 -->
  <svg
    class="spinner"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25" />
    <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 0 1 8-8v8H4z" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: '1.1em' }
});
</script>

<style scoped>
.spinner {
  flex-shrink: 0;
  animation: spinner-rotate 0.8s linear infinite;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}
</style>
