<template>
  <FileUploader :model-value="modelValue" @update:modelValue="emit('update:modelValue', $event)" accept="image/jpeg,image/png,image/webp,image/gif" :required="required" placeholder="選擇或拖曳圖片檔案" />
</template>

<script setup>
import FileUploader from './FileUploader.vue';
defineProps({ modelValue: { type: String, default: '' }, required: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue']);
</script>
