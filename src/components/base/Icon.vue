<template>
  <!-- 全站圖示：<Icon name="close" :size="16" />。裝飾用，一律 aria-hidden；
       需要被報讀的地方請把文字放在按鈕的 aria-label 或旁邊的文字上。
       沒給 size 時不寫 width／height，交給 CSS 決定大小。 -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size ?? undefined"
    :height="size ?? undefined"
    :fill="icon.solid ? 'currentColor' : 'none'"
    :stroke="icon.solid ? undefined : 'currentColor'"
    :stroke-width="icon.solid ? undefined : strokeWidth"
    :stroke-linecap="icon.solid ? undefined : 'round'"
    :stroke-linejoin="icon.solid ? undefined : 'round'"
    aria-hidden="true"
    focusable="false"
    v-html="icon.body"
  ></svg>
</template>

<script setup>
import { computed } from 'vue';
import { ICONS } from './icons';

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: null },
  strokeWidth: { type: [Number, String], default: 2 }
});

const icon = computed(() => {
  const found = ICONS[props.name];
  if (!found && import.meta.env.DEV) console.warn(`[Icon] 找不到圖示「${props.name}」，請在 base/icons.js 加上`);
  return found || { body: '' };
});
</script>
