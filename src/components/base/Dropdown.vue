<template>
  <!-- 下拉面板：按鈕（trigger slot）＋面板（default slot）。
       點外面、按 Esc 會關閉（Esc 會把焦點還給按鈕）；同一時間只會開一個，
       因為點另一個下拉的按鈕就等於點了這個的外面。面板層級固定 --z-dropdown。
       trigger slot 拿到 { open, toggle, triggerProps }：把 triggerProps 綁到按鈕上，
       aria-expanded／aria-controls 就會自動正確。 -->
  <div ref="rootRef" class="dropdown" @keydown.esc="handleEsc">
    <slot name="trigger" :open="isOpen" :toggle="toggle" :trigger-props="triggerProps" />
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :id="panelId"
        class="dropdown-panel"
        :class="[`align-${align}`, { 'dropdown-surface': !plain }, panelClass]"
        :style="width ? { width } : null"
        @click.stop
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script>
let uid = 0;
</script>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  // 可選：v-model:open 由外面控制；不給就自己管
  open: { type: Boolean, default: undefined },
  // 面板對齊按鈕的哪一邊
  align: { type: String, default: 'start' },
  width: { type: String, default: '' },
  // 不要預設的浮起外觀（背景、框線、陰影），由內容自己畫
  plain: { type: Boolean, default: false },
  panelClass: { type: [String, Array, Object], default: '' }
});

const emit = defineEmits(['update:open']);

const rootRef = ref(null);
const inner = ref(false);
const panelId = `dropdown-panel-${++uid}`;
const isOpen = computed(() => (props.open === undefined ? inner.value : props.open));

const setOpen = (value) => {
  inner.value = value;
  emit('update:open', value);
};
const toggle = () => setOpen(!isOpen.value);
const close = () => setOpen(false);

const triggerProps = computed(() => ({
  'aria-expanded': isOpen.value ? 'true' : 'false',
  'aria-controls': panelId,
  'aria-haspopup': 'true'
}));

const handleEsc = (e) => {
  if (!isOpen.value) return;
  e.stopPropagation();
  close();
  rootRef.value?.querySelector('[aria-controls]')?.focus();
};

// 用 pointerdown 判斷「點外面」：比 click 早，拖曳選字到外面放開也不會誤關
const handlePointerDown = (e) => {
  if (isOpen.value && rootRef.value && !rootRef.value.contains(e.target)) close();
};

watch(isOpen, (open) => {
  if (open) document.addEventListener('pointerdown', handlePointerDown, true);
  else document.removeEventListener('pointerdown', handlePointerDown, true);
});

onMounted(() => { if (isOpen.value) document.addEventListener('pointerdown', handlePointerDown, true); });
onBeforeUnmount(() => document.removeEventListener('pointerdown', handlePointerDown, true));

defineExpose({ close, toggle });
</script>

<style scoped>
.dropdown {
  position: relative;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: var(--z-dropdown);
  min-width: 100%;
}

.dropdown-panel.align-end {
  left: auto;
  right: 0;
}

.dropdown-enter-active {
  transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out);
}
.dropdown-leave-active {
  transition: opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
