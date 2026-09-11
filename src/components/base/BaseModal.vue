<template>
  <!-- 全站彈窗外框：遮罩、寬度、背景、陰影、最大高度、進出場、Esc、焦點鎖定與歸還都在這裡。
       內容用 slot 放；需要捲動的內容區套 .base-modal-body，底部按鈕列套 .base-modal-footer
       （兩個 class 定義在 components.css，讓 <form> 包住內容與按鈕的彈窗也能用）。 -->
  <Teleport to="body">
    <Transition name="base-modal" @after-leave="$emit('after-leave')">
      <div
        v-if="open"
        class="base-modal-backdrop"
        :class="[`layer-${layer}`, { 'align-top': align === 'top' }]"
        @pointerdown.self="pointerDownOnBackdrop = true"
        @click.self="handleBackdropClick"
      >
        <div
          ref="panelRef"
          class="base-modal"
          :class="[`base-modal--${size}`, { 'is-fixed-height': fixedHeight }, panelClass]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="hasHeader ? titleId : (labelledby || undefined)"
          :aria-label="!hasHeader && !labelledby ? label : undefined"
          tabindex="-1"
          @keydown="handleKeydown"
        >
          <header v-if="hasHeader" class="base-modal-header">
            <div :id="titleId" class="base-modal-title">
              <slot name="header">{{ title }}</slot>
            </div>
            <CloseButton v-if="showClose" :label="closeLabel" @click="requestClose" />
          </header>
          <slot />
          <footer v-if="$slots.footer" class="base-modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
// 所有開著的彈窗（由下往上）：Esc 只關最上層那一個
const openStack = [];
let uid = 0;
</script>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount, useSlots } from 'vue';
import CloseButton from './CloseButton.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  // sm 440 · md 720 · lg 860 · xl 1040
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg', 'xl'].includes(v)
  },
  title: { type: String, default: '' },
  // 沒有標題列時（燈箱、搜尋），用 labelledby 指向內容裡的標題，或用 label 當報讀名稱
  labelledby: { type: String, default: '' },
  label: { type: String, default: '' },
  closeLabel: { type: String, default: '關閉' },
  showClose: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  align: { type: String, default: 'center' },
  // modal：一般彈窗；stacked：從彈窗裡再開的彈窗；lightbox：燈箱；confirm：確認對話框
  layer: { type: String, default: 'modal' },
  fixedHeight: { type: Boolean, default: false },
  panelClass: { type: [String, Array, Object], default: '' }
});

const emit = defineEmits(['close', 'after-leave']);
const slots = useSlots();

const titleId = `base-modal-title-${++uid}`;
const hasHeader = computed(() => Boolean(props.title || slots.header));
const panelRef = ref(null);
const pointerDownOnBackdrop = ref(false);
let returnFocusTo = null;
const token = Symbol('modal');

const requestClose = () => emit('close');

// 只有從遮罩按下、也在遮罩放開才算點遮罩，避免從彈窗內拖曳選字到外面時誤關
const handleBackdropClick = () => {
  if (props.closeOnBackdrop && pointerDownOnBackdrop.value) requestClose();
  pointerDownOnBackdrop.value = false;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusables = () => [...(panelRef.value?.querySelectorAll(FOCUSABLE) || [])]
  .filter(el => el.offsetParent !== null || el === document.activeElement);

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (props.closeOnEsc && openStack[openStack.length - 1] === token) {
      e.stopPropagation();
      requestClose();
    }
    return;
  }
  if (e.key !== 'Tab') return;
  const list = focusables();
  if (!list.length) { e.preventDefault(); panelRef.value?.focus(); return; }
  const first = list[0];
  const last = list[list.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.value)) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
};

const onOpen = async () => {
  openStack.push(token);
  returnFocusTo = document.activeElement;
  await nextTick();
  const panel = panelRef.value;
  if (!panel || panel.contains(document.activeElement)) return;
  // 有 [data-autofocus] 的欄位就先聚焦它（例如搜尋框），否則聚焦彈窗本身
  const auto = panel.querySelector('[data-autofocus]');
  (auto || panel).focus({ preventScroll: true });
};

const onClose = () => {
  const i = openStack.indexOf(token);
  if (i !== -1) openStack.splice(i, 1);
  const target = returnFocusTo;
  returnFocusTo = null;
  if (target && document.contains(target) && typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
};

watch(() => props.open, (open, was) => {
  if (open && !was) onOpen();
  else if (!open && was) onClose();
}, { immediate: true });

onBeforeUnmount(() => { if (props.open) onClose(); });
</script>

<style scoped>
.base-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--scrim);
  -webkit-backdrop-filter: blur(var(--scrim-blur));
  backdrop-filter: blur(var(--scrim-blur));
}

.base-modal-backdrop.layer-stacked { z-index: var(--z-modal-stacked); }
.base-modal-backdrop.layer-lightbox { z-index: var(--z-lightbox); }
.base-modal-backdrop.layer-confirm { z-index: var(--z-confirm); }

/* 搜尋這類「打開就要輸入」的彈窗靠上，輸入框不會隨結果多寡上下跳 */
.base-modal-backdrop.align-top {
  align-items: flex-start;
  padding-top: 8vh;
}

.base-modal {
  --modal-width: var(--modal-md);
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--modal-width);
  max-height: var(--modal-max-height);
  overflow: hidden;
  background: var(--surface-overlay);
  border: 1px solid var(--border-color);
  border-radius: var(--modal-radius);
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  outline: none;
}

.base-modal--sm { --modal-width: var(--modal-sm); }
.base-modal--lg { --modal-width: var(--modal-lg); }
.base-modal--xl { --modal-width: var(--modal-xl); }

.base-modal.is-fixed-height {
  height: var(--modal-fixed-height);
}

.base-modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--modal-padding);
  border-bottom: 1px solid var(--border-color);
}

.base-modal-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  font-family: var(--font-title);
  font-size: var(--fs-section-title);
  font-weight: var(--fw-bold);
  line-height: var(--lh-heading);
  color: var(--text-primary);
}

/* 離場比進場快 */
.base-modal-enter-active,
.base-modal-enter-active .base-modal {
  transition: opacity var(--dur-base) var(--ease-standard), transform var(--dur-slow) var(--ease-out);
}
.base-modal-leave-active,
.base-modal-leave-active .base-modal {
  transition: opacity var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard);
}
.base-modal-enter-from,
.base-modal-leave-to {
  opacity: 0;
}
.base-modal-enter-from .base-modal,
.base-modal-leave-to .base-modal {
  transform: scale(0.96);
}

@media (max-width: 640px) {
  .base-modal-backdrop,
  .base-modal-backdrop.align-top {
    padding: 0;
  }

  .base-modal,
  .base-modal.is-fixed-height {
    max-width: none;
    height: 100dvh;
    max-height: 100dvh;
    border: 0;
    border-radius: 0;
  }

  /* 小對話框（確認、修改密碼）內容少，維持置中的卡片 */
  .base-modal.base-modal--sm {
    height: auto;
    max-height: calc(100dvh - 2rem);
    margin: var(--space-4);
    border: 1px solid var(--border-color);
    border-radius: var(--modal-radius);
  }
}
</style>
