<template>
  <Transition name="fade">
    <div v-if="media.url" class="fullscreen-image-backdrop" role="dialog" aria-modal="true" aria-label="全螢幕媒體檢視" @click="$emit('close')">
      <button type="button" class="fullscreen-close-btn" @click="$emit('close')" aria-label="關閉全螢幕媒體" title="關閉全螢幕 (ESC)">
        <Icon name="close" :size="22" :stroke-width="2.5" />
      </button>
      <div class="fullscreen-media-content" @click.stop>
        <video v-if="media.isVideo" :src="media.url" controls autoplay class="fullscreen-video-element"></video>
        <img v-else :src="media.url" class="fullscreen-img" alt="全螢幕媒體" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import Icon from './base/Icon.vue';
defineProps({
  media: {
    type: Object,
    default: () => ({ url: '', isVideo: false })
  }
});

defineEmits(['close']);
</script>

<style scoped>
.fullscreen-image-backdrop {
  position: fixed;
  inset: 0;
  background: var(--scrim-media);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-fullscreen);
  padding: var(--space-8);
}

.fullscreen-media-content {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: calc(var(--z-fullscreen) + 5);
}

.fullscreen-video-element,
.fullscreen-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-surface);
}

.fullscreen-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 42px;
  height: var(--control-height-lg);
  border-radius: 50%;
  background: var(--on-media-soft);
  color: var(--on-media);
  border: 1px solid var(--on-media-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: calc(var(--z-fullscreen) + 10);
  transition: background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard);
}

.fullscreen-close-btn:hover {
  background: var(--on-media-border);
}

.fullscreen-close-btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 3px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-base) var(--ease-standard);
}
.fade-leave-active {
  transition-duration: var(--dur-fast); /* 離場比進場快 */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
