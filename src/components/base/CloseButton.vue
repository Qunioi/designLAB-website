<template>
  <!-- 彈窗、燈箱、抽屜右上的關閉鈕：固定 40px 圓形、實色底（內容往下捲時也蓋得住） -->
  <IconButton icon="close" :label="label" size="lg" round solid />
</template>

<script setup>
import IconButton from './IconButton.vue';

defineProps({
  label: { type: String, default: '關閉' }
});
</script>
